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

The scheduled job runs daily at 08:00 UTC and selects approved, opted-in memorials whose death month/day matches the current date. It logs each due reminder. FCM sending is intentionally left behind the single seam in `server/src/services/reminderService.ts`: production push requires device-token registration, which is outside the requested endpoint/data model and should be added when Firebase credentials and notification deep-link requirements are available.

## Verification

Run `npm run typecheck` for all packages and `npm run build` for the server/web production builds plus the mobile TypeScript check.
