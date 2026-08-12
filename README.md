# Memory Card — Digital Memorial

Memory Card is a full-stack digital memorial application for creating meaningful, lasting online tributes to loved ones. Each memorial can preserve a biography, life dates, epitaph, photograph link, headstone design, guestbook messages, QR code, and shareable public page.

## Purpose

The project gives families and communities a respectful place to remember a life, share stories, and collect messages of comfort. It also supports privacy controls, annual remembrance reminders, and easy social sharing so a memorial can be revisited whenever it matters most.

## Features

- Secure registration and login with JWT access and refresh tokens
- Private dashboard for creating and managing Memory Cards
- Public memorial pages with QR code downloads and social sharing
- Searchable public memories by name and life dates
- Guestbook tributes with owner moderation
- Headstone design gallery
- Annual SMS reminder support through Twilio
- English and Spanish language support

### Admin Panel

Administrators have a protected workspace at `/admin` with the following capabilities:

- **User management:** search users, update account details and roles, and suspend or reactivate accounts
- **Content moderation:** review reported guestbook tributes and memorial media; approve, clear, hide, or remove items
- **Headstone design library:** add designs using an image URL or an uploaded image, organize them with categories, tags, and sort order, and archive or restore designs
- **Reminder monitoring:** review upcoming scheduled reminders and the delivery history for pending, sent, and failed reminders

Suspended users are prevented from signing in and from using authenticated API endpoints. The reminder monitor records delivery status when the scheduled reminder job runs.

## Tech Stack

- Frontend: React, React Router, react-i18next
- Backend: Node.js, Express, Mongoose, MongoDB
- Supporting services: JWT, bcrypt, QRCode, node-cron, Twilio

## Project Structure

```text
digital-memorial/
├── src/                 # React frontend
├── public/
├── backend/             # Express + MongoDB REST API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Configure the backend

Copy the backend environment template and update its values:

```bash
cd backend
cp .env.example .env
```

At minimum, set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `backend/.env`. Twilio values are optional unless SMS reminders are needed.

To allow browser access from a deployed frontend, add its origin to `CORS_ORIGINS` as a comma-separated list. Localhost and ngrok development URLs are accepted automatically.

### 1a. Configure an administrator

Add one or more administrator email addresses to `backend/.env` before registering those accounts:

```env
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

Restart the backend after changing environment variables. When an account is registered with one of these email addresses, it receives the `admin` role automatically.

For an existing user, update the role once in MongoDB, then have that user sign out and sign back in:

```javascript
use memory-card
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Use the name of your database instead of `memory-card` if your `MONGODB_URI` uses a different database.

### 2. Start the backend

Open a terminal in the project folder and run:

```bash
cd backend
npm install
npm start
```

The API starts at [http://localhost:5000](http://localhost:5000). Its health endpoint is available at [http://localhost:5000/api/health](http://localhost:5000/api/health).

To add the sample headstone designs:

```bash
cd backend
npm run seed:designs
```

### 3. Start the frontend

In a second terminal, from the project root, run:

```bash
npm install
npm start
```

The frontend starts at [http://localhost:3000](http://localhost:3000). By default it connects to `http://localhost:5000/api`.

To use a different API address, create a root `.env.local` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Accessing the Admin Panel

1. Configure `ADMIN_EMAILS` in `backend/.env`, then restart the backend.
2. Register a new account using one of the configured email addresses, or promote an existing account using the MongoDB command above.
3. Sign in again with that account so the session receives the updated role.
4. Open [http://localhost:3000/admin](http://localhost:3000/admin), or select **Admin** in the site navigation.

The `/admin` route and all `/api/admin` endpoints are restricted to accounts with the `admin` role. Non-admin users are redirected to their dashboard.

## Production Build

Create an optimized frontend build with:

```bash
npm run build
```

## Developer

**Abdul Ghafoor**  
[Write an Email](mailto:abdulghafoor1525@gmail.com)  
[Linked Profile](https://www.linkedin.com/in/jam-abdul-ghafoor/)  
[Checkout Portfolio](https://abdulghafoor.vercel.app/)
