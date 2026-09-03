# Evermore Memorials MVP

A simple digital memorial product with a bare React Native mobile app, a combined React public/admin web app, and an Express/MongoDB API.

## What is included

- User registration, login, logout, and JWT-protected API access
- Memorial creation with Cloudinary photo upload, five respectful designs, preview, approval status, search, and native sharing
- Admin dashboard, pending/approved/rejected review, editing, approval, rejection, user search, and per-user memorial drill-down
- Public memorial URLs with Facebook, WhatsApp, and copy-link actions
- English, Romanian, Hindi, Simplified Chinese, and Spanish UI translations stored locally
- Daily `node-cron` anniversary matching with a clear delivery seam for Firebase Cloud Messaging
- Essential Helmet, CORS, rate limiting, password hashing, ownership checks, and input validation

## Local setup

Requirements: Node 20+, MongoDB Atlas, Cloudinary, the React Native Android/iOS development prerequisites, and CocoaPods for iOS.

1. Install packages from the repository root: `npm install`.
2. Copy `server/.env.example` to `server/.env` and provide MongoDB, JWT, and Cloudinary values.
3. Copy `web/.env.example` to `web/.env`. The default API URL works for local development.
4. Create the initial administrator with `npm run seed:admin -w server`.
5. Start the API with `npm run dev:server` and the web app with `npm run dev:web`.
6. Start Metro with `npm start -w mobile`, then use `npm run android -w mobile` or install iOS pods and use `npm run ios -w mobile`.

The mobile API URL is set in `mobile/src/api/client.ts`. Android emulators use `10.0.2.2`; iOS simulators use `localhost`. Change this to the deployed API URL for devices or production. Likewise, replace `https://your-domain.com` in the mobile memorial detail screen with the deployed web origin.

## Reminder delivery

The scheduled job is set for daily at 08:00 UTC and selects approved, opted-in memorials whose death month/day matches the current date. Locally, `node-cron` starts with the API server. On Vercel, `server/vercel.json` calls the protected `/api/cron/reminders` endpoint instead. Hobby-plan cron timing can vary within the scheduled hour. It logs each due reminder. FCM sending is intentionally left behind the single seam in `server/src/services/reminderService.ts`: production push requires device-token registration, which is outside the requested endpoint/data model and should be added when Firebase credentials and notification deep-link requirements are available.

## Deploy the API and web app to Vercel

Deploy this monorepo as **two Vercel projects** connected to the same Git repository. This keeps the Express API and Vite frontend independently configurable and deployable.

### 1. Prepare the external services

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Create a MongoDB Atlas database and database user. Because Vercel Functions do not have a fixed outbound IP by default, configure Atlas Network Access so the deployment can connect. Use a strong database password and least-privilege database user.
3. Create a Cloudinary account and collect the cloud name, API key, and API secret.
4. Generate two unrelated random secrets for `JWT_SECRET` and `CRON_SECRET`. For example, run `openssl rand -base64 32` twice.

### 2. Create the backend project

1. In Vercel, select **Add New → Project**, import this repository, and name the project (for example, `evermore-api`).
2. Set **Root Directory** to `server`. Leave the detected Express build settings in place.
3. Add these environment variables for Production, Preview, and Development as appropriate:

   | Variable | Value |
   | --- | --- |
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | Long random secret |
   | `CRON_SECRET` | A different long random secret |
   | `WEB_URL` | Exact frontend origin, such as `https://evermore-web.vercel.app`; comma-separate multiple allowed origins |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |

4. Deploy. Confirm `https://YOUR_API_PROJECT.vercel.app/api/health` returns `{"status":"ok"}`. A successful health response also confirms MongoDB connectivity.
5. Do not add `PORT`; Vercel manages the function runtime.

If the final frontend URL is not known yet, use the frontend project name you intend to create, then update `WEB_URL` after the frontend's first deployment and redeploy the API.

### 3. Create the frontend project

1. Import the same repository again as a second Vercel project (for example, `evermore-web`).
2. Set **Root Directory** to `web`. Vercel should detect Vite; the build command is `npm run build` and the output directory is `dist`.
3. Add `VITE_API_URL=https://YOUR_API_PROJECT.vercel.app/api` to all environments that should use the deployed API.
4. Deploy. The SPA rewrite in `web/vercel.json` makes direct visits to routes such as `/admin/login` and `/memorial/example` work.
5. Return to the backend project's environment variables, set `WEB_URL` to the exact production frontend URL (and any additional comma-separated frontend origins), then redeploy the backend.

### 4. Create the first administrator

Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` local instead of storing them in Vercel. Put the production `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`, run this once from the repository root, then remove the admin password from the file:

```bash
npm run seed:admin -w server
```

### 5. Production checks

1. Register and sign in through the app.
2. Upload a photo to confirm the Cloudinary credentials.
3. Open `/admin/login` directly in a new browser tab to verify the SPA fallback.
4. Approve a memorial and open its public URL.
5. In Vercel, check the backend project's **Cron Jobs** page for the daily `08:00 UTC` reminder invocation.

Every push to the connected branch will redeploy both projects. Environment variable changes only affect new deployments, so redeploy after changing them.

## Verification

Run `npm run typecheck` for all packages and `npm run build` for the server/web production builds plus the mobile TypeScript check.
