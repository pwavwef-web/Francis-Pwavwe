import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { defineBoolean, defineSecret, defineString, defineInt } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import nodemailer from 'nodemailer';
import { generateReference, processSubmission, type NormalizedBuildRequest, type StoredRequest } from './domain.js';

initializeApp();
const db = getFirestore();

const smtpHost = defineString('SMTP_HOST', { default: '' });
const smtpPort = defineInt('SMTP_PORT', { default: 587 });
const smtpSecure = defineBoolean('SMTP_SECURE', { default: false });
const smtpUser = defineSecret('SMTP_USER');
const smtpPass = defineSecret('SMTP_PASS');
const smtpFromName = defineString('SMTP_FROM_NAME', { default: 'Pwavwe Studio' });
const smtpFromEmail = defineString('SMTP_FROM_EMAIL', { default: 'projects@pwavwe.com' });
const smtpReplyTo = defineString('SMTP_REPLY_TO', { default: 'francis@pwavwe.com' });
const projectsInbox = defineString('PROJECTS_INBOX', { default: 'projects@pwavwe.com' });
const publicSiteUrl = defineString('PUBLIC_SITE_URL', { default: 'https://build.pwavwe.com' });
const adminEmails = defineString('BUILD_ADMIN_EMAILS', { default: 'francis@pwavwe.com' });
const rateLimitSalt = defineSecret('RATE_LIMIT_HASH_SALT');

const callableOptions = {
  region: 'us-central1' as const,
  cors: ['https://build.pwavwe.com', 'https://buildwithfrancis.web.app', 'http://localhost:5173', 'http://localhost:5000'],
  enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true',
};

export const submitBuildRequest = onCall({ ...callableOptions, timeoutSeconds: 30, memory: '256MiB', secrets: [smtpUser, smtpPass, rateLimitSalt], maxInstances: 20 }, async (request) => {
  const serialized = JSON.stringify(request.data ?? {});
  if (Buffer.byteLength(serialized, 'utf8') > 25_000) throw new HttpsError('invalid-argument', 'The request is too large.');
  try {
    const smtpConfigured = Boolean(smtpHost.value() && smtpHost.value() !== 'disabled' && smtpUser.value() && smtpPass.value());
    const transporter = smtpConfigured ? nodemailer.createTransport({
      host: smtpHost.value(), port: smtpPort.value(), secure: smtpSecure.value(),
      auth: { user: smtpUser.value(), pass: smtpPass.value() },
    }) : null;
    return await processSubmission(request.data, {
      store: (value) => storeRequest(value, getTemporaryClientKey(request.rawRequest.ip || 'unknown', request.app?.appId || 'no-app')),
      storeMarketingConsent: storeMarketingConsent,
      sendEmail: transporter ? async (message) => { await transporter.sendMail({ ...message, from: `${smtpFromName.value()} <${smtpFromEmail.value()}>`, replyTo: message.replyTo ?? smtpReplyTo.value() }); } : undefined,
      markEmailStatus: async (requestId, status) => { await db.collection('buildRequests').doc(requestId).update({ emailStatus: status, updatedAt: FieldValue.serverTimestamp() }); },
      projectsInbox: projectsInbox.value(),
      publicSiteUrl: publicSiteUrl.value(),
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (isValidationError(error)) throw new HttpsError('invalid-argument', 'Some request details need attention.');
    logger.error('Build request submission failed', { error: error instanceof Error ? error.name : 'unknown' });
    throw new HttpsError('internal', 'The request could not be submitted. Try again shortly.');
  }
});

async function storeRequest(value: NormalizedBuildRequest, clientKey: string): Promise<StoredRequest> {
  const now = Timestamp.now();
  const rateRef = db.collection('_buildRateLimits').doc(clientKey);
  const duplicateKey = hash(`${value.email}|${value.projectSummary.toLowerCase()}`);
  const duplicateRef = db.collection('_buildDuplicateKeys').doc(duplicateKey);
  const requestRef = db.collection('buildRequests').doc();
  let reference = generateReference();
  await db.runTransaction(async (transaction) => {
    const [rateSnapshot, duplicateSnapshot] = await Promise.all([transaction.get(rateRef), transaction.get(duplicateRef)]);
    const cutoff = now.toMillis() - 15 * 60 * 1000;
    const attempts = ((rateSnapshot.data()?.attempts as Timestamp[] | undefined) ?? []).filter((attempt) => attempt.toMillis() > cutoff);
    if (attempts.length >= 3) throw new HttpsError('resource-exhausted', 'Please wait before sending another request.');
    const duplicateCreatedAt = duplicateSnapshot.data()?.createdAt as Timestamp | undefined;
    if (duplicateCreatedAt && now.toMillis() - duplicateCreatedAt.toMillis() < 10 * 60 * 1000) throw new HttpsError('already-exists', 'A similar request was recently received.');
    let referenceRef = db.collection('_buildReferences').doc(reference);
    if ((await transaction.get(referenceRef)).exists) {
      reference = generateReference();
      referenceRef = db.collection('_buildReferences').doc(reference);
      if ((await transaction.get(referenceRef)).exists) throw new HttpsError('aborted', 'Please submit again.');
    }
    transaction.set(rateRef, { attempts: [...attempts, now], expiresAt: Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000) });
    transaction.set(duplicateRef, { createdAt: now, expiresAt: Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000) });
    transaction.set(referenceRef, { requestId: requestRef.id, createdAt: now });
    transaction.set(requestRef, {
      reference,
      name: value.name, email: value.email, phone: value.phone, organisation: value.organisation,
      projectType: value.projectType, projectSummary: value.projectSummary, problemStatement: value.problemStatement,
      targetUsers: value.targetUsers, features: value.features, existingWebsite: value.existingWebsite,
      referenceLinks: value.referenceLinks, budgetRange: value.budgetRange, preferredTimeline: value.preferredTimeline,
      preferredContact: value.preferredContact, discoverySource: value.discoverySource, additionalNotes: value.additionalNotes,
      contactConsent: true, contactConsentTimestamp: now, marketingConsent: value.marketingConsent,
      marketingConsentTimestamp: value.marketingConsent ? now : null,
      status: 'new', priority: 'normal', assignedTo: null, internalTags: [], internalNotes: '',
      proposalUrl: '', driveFolderUrl: '', followUpDate: '', emailStatus: 'pending', createdAt: now, updatedAt: now,
    });
  });
  logger.info('Build request stored', { reference });
  return { requestId: requestRef.id, reference };
}

async function storeMarketingConsent(value: NormalizedBuildRequest, stored: StoredRequest): Promise<void> {
  await db.collection('marketingConsents').add({
    email: value.email, name: value.name, status: 'subscribed', source: 'build_request', sourceReference: stored.reference,
    interests: ['Build Notes'], consentTimestamp: FieldValue.serverTimestamp(), privacyVersion: '2026-07-31',
    unsubscribedAt: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

export const verifyBuildAdmin = onCall(callableOptions, async (request) => ({ authorized: isAdmin(request.auth?.token.email) }));

export const listBuildRequests = onCall(callableOptions, async (request) => {
  requireAdmin(request.auth?.token.email);
  const limit = Math.min(Math.max(Number(request.data?.limit) || 100, 1), 250);
  const snapshot = await db.collection('buildRequests').orderBy('createdAt', 'desc').limit(limit).get();
  return { requests: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })) };
});

export const getBuildRequest = onCall(callableOptions, async (request) => {
  requireAdmin(request.auth?.token.email);
  const requestId = validateDocumentId(request.data?.requestId);
  const document = await db.collection('buildRequests').doc(requestId).get();
  if (!document.exists) throw new HttpsError('not-found', 'Request not found.');
  return { request: { id: document.id, ...document.data() } };
});

export const updateBuildRequest = onCall(callableOptions, async (request) => {
  const actorEmail = requireAdmin(request.auth?.token.email);
  const requestId = validateDocumentId(request.data?.requestId);
  const allowedKeys = ['status', 'priority', 'internalNotes', 'internalTags', 'proposalUrl', 'driveFolderUrl', 'followUpDate'];
  const changes = Object.fromEntries(Object.entries(request.data?.changes ?? {}).filter(([key]) => allowedKeys.includes(key)));
  if (!Object.keys(changes).length) throw new HttpsError('invalid-argument', 'No permitted changes supplied.');
  if (typeof changes.internalNotes === 'string' && changes.internalNotes.length > 5_000) throw new HttpsError('invalid-argument', 'Internal notes are too long.');
  if (Array.isArray(changes.internalTags) && (changes.internalTags.length > 20 || changes.internalTags.some((tag) => typeof tag !== 'string' || tag.length > 40))) throw new HttpsError('invalid-argument', 'Tags are invalid.');
  const documentRef = db.collection('buildRequests').doc(requestId);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(documentRef);
    if (!snapshot.exists) throw new HttpsError('not-found', 'Request not found.');
    const previous = snapshot.data()!;
    transaction.update(documentRef, { ...changes, updatedAt: FieldValue.serverTimestamp() });
    transaction.set(db.collection('buildRequestActivity').doc(), {
      requestId, reference: previous.reference, action: 'request_updated',
      previousValue: auditSafe(previous, changes), newValue: auditSafe(changes, changes),
      actorUid: request.auth!.uid, actorEmail, createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { ok: true };
});

export const deleteBuildRequest = onCall(callableOptions, async (request) => {
  const actorEmail = requireAdmin(request.auth?.token.email);
  const requestId = validateDocumentId(request.data?.requestId);
  const documentRef = db.collection('buildRequests').doc(requestId);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(documentRef);
    if (!snapshot.exists) throw new HttpsError('not-found', 'Request not found.');
    const reference = snapshot.data()!.reference as string;
    if (request.data?.confirmation !== reference) throw new HttpsError('failed-precondition', 'Confirmation did not match.');
    transaction.delete(documentRef);
    transaction.set(db.collection('buildRequestActivity').doc(), { requestId, reference, action: 'request_deleted', previousValue: null, newValue: null, actorUid: request.auth!.uid, actorEmail, createdAt: FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

function isAdmin(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const allowed = adminEmails.value().split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
function requireAdmin(email: unknown): string { if (!isAdmin(email)) throw new HttpsError('permission-denied', 'Admin access required.'); return String(email).toLowerCase(); }
function validateDocumentId(value: unknown): string { if (typeof value !== 'string' || !/^[A-Za-z0-9]{10,30}$/.test(value)) throw new HttpsError('invalid-argument', 'Invalid request identifier.'); return value; }
function getTemporaryClientKey(ip: string, appId: string): string { return hash(`${ip}|${appId}|${rateLimitSalt.value() || 'emulator-only-salt'}`); }
function hash(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function isValidationError(error: unknown): boolean { return Boolean(error && typeof error === 'object' && 'issues' in error); }
function auditSafe(record: Record<string, unknown>, changes: Record<string, unknown>): Record<string, unknown> { return Object.fromEntries(Object.keys(changes).map((key) => [key, key === 'internalNotes' ? '[updated]' : record[key] ?? null])); }
