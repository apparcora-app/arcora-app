# Arcora

Arcora is a premium life admin dashboard for bills, subscriptions, warranties, documents, passwords, reminders, and household records. It is built as a React, TypeScript, Vite, Tailwind CSS, and Firebase app.

## Features

- Dashboard overview for finances, upcoming bills, expiring warranties, security status, and reminders
- Bills and finance tracking with recurring payment support
- Subscription tracking with renewal visibility
- Warranty tracking with document storage
- Document vault for important household records
- Encrypted password manager
- Reminder and task workflows
- OCR-assisted date detection
- Offline-friendly Firebase persistence
- Dark and light theme support

## Tech Stack

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Firebase Auth, Firestore, Storage, Hosting, and optional Analytics
- React Router
- Recharts
- Framer Motion
- Tesseract.js

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Firebase project for production-like usage

### Install

```bash
npm install
```

### Configure Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Fill in the Firebase values from your Firebase project. For local development, leave:

```env
VITE_PUBLIC_SITE_URL=http://localhost:3000
VITE_ENABLE_SOURCEMAPS=false
VITE_ENABLE_FIREBASE_ANALYTICS=false
```

For a production deployment, set `VITE_PUBLIC_SITE_URL` to the public origin for the deployed site. This value is used for canonical URLs, Open Graph URLs, `robots.txt`, and `sitemap.xml`.

Production sourcemaps are disabled by default. Set `VITE_ENABLE_SOURCEMAPS=true` only when you intentionally need sourcemaps for a build.

Firebase Analytics scaffolding is present but disabled by default. Set `VITE_ENABLE_FIREBASE_ANALYTICS=true` only after valid Firebase config is present and Analytics is enabled for the project.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Validate

```bash
npm run lint
tsc -b --noEmit
```

If `tsc` is not available globally, use the local TypeScript binary from `node_modules`.

### Build

```bash
npm run build
```

The build output is written to `dist`.

## Firebase

Firebase rules are tracked in this folder:

- `firestore.rules`
- `storage.rules`

Deploy rules only when intentionally releasing:

```bash
firebase deploy --only firestore:rules,storage
```

Deploy hosting only when intentionally releasing:

```bash
firebase deploy --only hosting
```

## Project Structure

```text
app/
  src/
    components/
    hooks/
    lib/
    services/
    store/
    styles/
    types/
  public/
  scripts/
  firestore.rules
  storage.rules
  vite.config.ts
```

## Security Notes

- Do not commit real secrets or private user values.
- Keep `.env` and `.env.local` out of source control.
- Password data is encrypted client-side before storage.
- Firestore and Storage access are controlled by Firebase security rules.
- Mock/local mode should remain guarded when Firebase config is incomplete.
