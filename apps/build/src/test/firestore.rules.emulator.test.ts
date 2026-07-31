import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

let environment: RulesTestEnvironment;

beforeAll(async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  environment = await initializeTestEnvironment({ projectId: 'demo-francis-pwavwe', firestore: { rules: readFileSync(resolve(here, '../../../../firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 } });
  await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'buildRequests/request123456'), { reference: 'PWS-2026-ABC234' }));
});
afterAll(async () => environment.cleanup());

describe('Pwavwe Studio Firestore rules', () => {
  it('denies all public request reads and direct submissions', async () => { const firestore = environment.unauthenticatedContext().firestore(); await assertFails(getDocs(collection(firestore, 'buildRequests'))); await assertFails(setDoc(doc(firestore, 'buildRequests/public123456'), { reference: 'bad' })); });
  it('denies ordinary authenticated users', async () => { const firestore = environment.authenticatedContext('user-1', { email: 'person@example.com' }).firestore(); await assertFails(getDoc(doc(firestore, 'buildRequests/request123456'))); });
  it('permits a trusted custom-claim administrator', async () => { const firestore = environment.authenticatedContext('admin-1', { email: 'francis@pwavwe.com', buildStudioAdmin: true }).firestore(); await assertSucceeds(getDoc(doc(firestore, 'buildRequests/request123456'))); });
  it('keeps marketing consent private', async () => { const firestore = environment.unauthenticatedContext().firestore(); await assertFails(getDocs(collection(firestore, 'marketingConsents'))); });
});
