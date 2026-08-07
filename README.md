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

## Production Build

Create an optimized frontend build with:

```bash
npm run build
```

## Developer

**Abdul Ghafoor**  
Email: [abdul.ghafoor@example.com](mailto:abdul.ghafoor@example.com)  
Portfolio: [portfolio.example.com/abdul-ghafoor](https://portfolio.example.com/abdul-ghafoor)
