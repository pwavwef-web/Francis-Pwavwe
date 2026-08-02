# Pwavwe Studio build site

Pwavwe Studio is the public project-request and portfolio platform for Francis Pwavwe. Its canonical URL is **https://build.pwavwe.com**. The custom domain has already been connected in Firebase Hosting; DNS must be managed outside this repository.

## Architecture

The existing personal site remains the root Vite application. The studio is isolated as a second application so its React router, Firebase SDK use and build output do not alter the personal site.

```text
apps/build/                  React + TypeScript + Vite studio frontend
  public/                    icons, social card, robots, sitemap, project media
  src/data/                  verified case studies and service content
  src/lib/                   Firebase, validation, analytics and CSV helpers
  src/pages/                 public routes, request form and admin dashboard
  src/test/                  unit, rendering and Firestore emulator tests
functions-build/             Firebase callable Functions (codebase: build)
firestore.rules              existing rules plus isolated studio rules
firestore.indexes.json       studio query indexes and temporary-record TTLs
firebase.json                personal + build Hosting targets and Functions
.firebaserc                  project and multisite target mapping
```

The frontend never writes project requests directly to Firestore. It calls `submitBuildRequest`, which validates and normalises the payload, checks App Check in production, applies spam/rate/duplicate controls, creates a public reference, stores consent timestamps, and attempts email after storage. Admin reads and mutations also go through protected callable Functions. The server allowlist defaults to `francis@pwavwe.com`; ordinary Firebase Authentication does not grant access.

## Local setup

Requirements: Node.js 20 or newer, npm, Firebase CLI and Java for the Firestore emulator.

```bash
npm install
npm --prefix apps/build install
npm --prefix functions-build install
```

Copy `apps/build/.env.example` to `apps/build/.env.local` only when overriding the supplied public Firebase web configuration. Copy `functions-build/.env.example` to `functions-build/.env.local` for local Functions settings. Never commit server credentials.

Frontend variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SITE_URL=https://build.pwavwe.com`
- `VITE_ENABLE_ANALYTICS=false|true`
- `VITE_APP_CHECK_SITE_KEY`

Server parameters/secrets:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `SMTP_REPLY_TO`
- `PROJECTS_INBOX`, `PUBLIC_SITE_URL`
- `BUILD_ADMIN_EMAILS`
- `RATE_LIMIT_HASH_SALT`

The committed `functions-build/.env.francis-pwavwe` contains only non-secret production parameters. SMTP credentials and the rate-limit salt remain in Firebase Secret Manager.

Email is provider-independent behind a small transport interface. A missing SMTP host leaves requests fully functional and records email as not configured. A temporary provider failure does not roll back a stored request.

## Commands

```bash
npm run dev:studio
npm run build:studio
npm run preview:studio
npm run lint:studio
npm run typecheck:studio
npm run test:studio
npm run test:studio:rules
npm run build:studio:all
```

Run the full local Firebase suite:

```bash
firebase emulators:start --only hosting:build,functions,firestore,auth
```

Run only local Hosting, as requested:

```bash
firebase emulators:start --only hosting:build
```

## One-time Firebase setup

The repository already maps the target, but this is the canonical one-time command if it must be restored:

```bash
firebase target:apply hosting build buildwithfrancis
```

In Firebase Console:

1. Enable Google as a Firebase Authentication provider and add `build.pwavwe.com` to authorised domains.
2. Register a reCAPTCHA v3 App Check provider for the studio web app, place its site key in `VITE_APP_CHECK_SITE_KEY`, then rebuild. Callable Functions enforce App Check outside the emulator.
3. Set the mandatory rate-limit salt without pasting it into source control:
   `firebase functions:secrets:set RATE_LIMIT_HASH_SALT`.
4. If email is required, set `SMTP_USER` and `SMTP_PASS` as Functions secrets and provide the non-secret SMTP parameters during deployment. Use `Pwavwe Studio <projects@pwavwe.com>` only after the domain is authorised with the provider.
5. The callable admin allowlist defaults to `francis@pwavwe.com`. To permit direct trusted Firestore tooling, set a `buildStudioAdmin: true` custom claim using a separately reviewed Admin SDK script; the web dashboard itself does not require direct Firestore access.
6. Configure Firestore TTL policies from `firestore.indexes.json` if the CLI reports that TTL activation needs Console confirmation.

The custom domain `build.pwavwe.com` is already connected in Firebase Console and must not be reconfigured in application code. The DNS CNAME is managed separately.

## Deployment

Build and deploy only the new Hosting site:

```bash
firebase deploy --only hosting:build
```

Deploy the studio backend and its security configuration without redeploying unrelated applications:

```bash
npm run deploy:studio:backend
```

Deploy the already-built studio from the root convenience script:

```bash
npm run deploy:studio
```

Preview channel example:

```bash
firebase hosting:channel:deploy studio-preview --only build --expires 7d
```

## Editing packages, contact and payment (no build knowledge needed)

Two plain-text files drive the public pricing, contact and payment content. Edit them, then rebuild and deploy.

- `apps/build/src/data/packages.ts` — the three fixed packages (name, `priceFrom`, tagline, `includes` list, `bestFor`). Prices are shown after the word "from".
- `apps/build/src/data/studio.ts` — contact and payment details in one place:
  - `whatsappNumber` — international format, digits only (e.g. Ghana `0557535673` → `233557535673`). Empty string hides WhatsApp everywhere.
  - `paystackUrl` — the Paystack deposit link. While empty, the Paystack button stays hidden and Mobile Money is shown instead.
  - `momo` — Mobile Money `number`, `name` and optional `network` label. Empty `number` hides the Mobile Money block.
  - `deposit` — the deposit terms string shown across the site.

Each contact/payment element only appears once its value is set, so partial configuration never produces a broken link or empty box.

## Data model

- `buildRequests`: project requests and internal lead-management fields
- `marketingConsents`: separate optional Build Notes consent records
- `buildRequestActivity`: audit trail for admin changes and deletion
- `_buildRateLimits`: temporary hashed submission-rate records
- `_buildDuplicateKeys`: temporary duplicate-request signals
- `_buildReferences`: collision protection for public references

The public cannot read, list, create, update or delete any of these collections. Request submission occurs with the Admin SDK inside a callable Function. Internal notes never appear in public responses or CSV exports.

## App Check and emulator behaviour

The browser initialises App Check only when `VITE_APP_CHECK_SITE_KEY` is present. Deployed callable Functions require a valid App Check token. When `FUNCTIONS_EMULATOR=true`, enforcement is disabled so local development works with the Emulator Suite. Use Firebase App Check debug tokens only on trusted development devices.

## Performance and accessibility

Routes are lazy-loaded, Firebase is split into its own production chunk, project media is lazy-loaded and the static shell avoids large animation libraries. The interface supports 320px widths, keyboard navigation, visible focus, labelled validation, live status messages and reduced-motion preferences. The external Google font request is a graceful enhancement; system fallbacks keep the site usable if it is unavailable.

## Troubleshooting

- **Request submission fails locally:** run the Functions emulator and use the Vite URL from `npm run dev:studio`.
- **Production requests fail immediately:** confirm the App Check provider, site key, authorised domain and deployed Functions region.
- **Admin access denied:** confirm Google sign-in is enabled and the signed-in email is present in `BUILD_ADMIN_EMAILS`.
- **Email delayed:** the request remains stored. Verify the SMTP secrets, sender-domain authorisation and provider logs.
- **A clean URL shows 404:** deploy the `build` target so the SPA rewrite in `firebase.json` is active.
- **Firestore tests cannot start:** install Java and ensure ports 8080 and 9150 are free.

## Legal-content review

The privacy and terms pages intentionally mark their effective date and formal business details as editable. They do not claim independent legal verification. Replace the business address/registration placeholders when applicable and have the text reviewed for the studio's final operating structure.
