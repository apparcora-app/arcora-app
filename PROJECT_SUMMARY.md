# Arcora (Life OS) — Complete Project Summary

> **Arcora** is a cloud-native, AI-powered Life Administration and Intelligent Document Management web application. It helps users organize, track, and automate personal bills, subscriptions, warranties, identity documents, passwords, and task reminders.

---

## 📌 Project Overview & Metadata

* **Repository**: `https://github.com/apparcora-app/arcora-app`
* **Firebase Project ID**: `arcora-cd7d0`
* **Live Web App**: `https://arcora-cd7d0.web.app`
* **Local Dev Server**: `http://localhost:3000` (`npm run dev` in `app/`)
* **Primary Stack**: React 18, TypeScript, Vite 7, Tailwind CSS, Firebase (Auth, Firestore, Storage, Hosting)

---

## 🏗️ Architecture & Technology Stack

### 1. Frontend Framework & State Management
* **Core**: React 18 + Vite 7 + TypeScript
* **Styling**: Tailwind CSS + Framer Motion (glassmorphic UI, dynamic theme modes)
* **Icons & Visuals**: Lucide React, Canvas Confetti, Recharts
* **State Management**: Zustand Stores
  - `useAuthStore` — User authentication state & Firebase Auth sync
  - `useDataStore` — Firestore real-time subscriptions (`documents`, `bills`, `subscriptions`, `warranties`, `reminders`, `passwords`)
  - `useUIStore` — Theme management (Dark/Light mode) & modal states

### 2. Backend & Cloud Infrastructure
* **Firebase Backend-as-a-Service**:
  - **Firebase Auth**: User registration, login, session persistence
  - **Cloud Firestore**: Real-time NoSQL database with user-isolated security rules (`request.auth.uid == resource.data.userId`)
  - **Firebase Storage**: Secure file storage for document attachments
  - **Firebase Hosting**: Production web deployment
* **Cloud Run Worker (`backend/cloud-run-worker`)**:
  - Node.js Express worker for serverless background document processing and AI extraction jobs.

---

## 🤖 Intelligent Document Processing (IDP) Architecture

Arcora utilizes a **3-Tier Cascading IDP Architecture** designed for speed, privacy, and zero unnecessary API costs:

```
┌─────────────────────────────────────────────────────────────┐
│                    Document Upload                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: Deterministic OCR & Regex Parser (Millisecond speed)│
│ - Tesseract.js / Canvas image pre-processor                │
│ - Parser rules for PTCL, LESCO, FESCO, SNGPL, K-Electric    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 1.5: Local WebGPU Smart Detection (In-browser AI)      │
│ - ModernBERT ONNX NLI model running in Web Worker           │
│ - WebGPU accelerated (CPU/WASM fallback), zero API cost     │
│ - Preloaded via requestIdleCallback on user login           │
│ - Refines document section, type, title, & edge cases       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (If incomplete/low confidence)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 2: Cloud Multimodal AI Fallback (Gemini Flash API)     │
│ - cloud-run-worker prioritizes Gemini 2.0/2.5 Flash API     │
│ - Backup fallback to OpenAI gpt-4o-mini                     │
│ - Extracts structured JSON matching Arcora schema           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Key File Map & Code Organization

```
Life Os - Full Stack App/
├── PROJECT_SUMMARY.md                      # This project overview document
├── firebase.json                           # Firebase Hosting configuration
├── .firebaserc                             # Firebase target project mapping (arcora-cd7d0)
├── app/                                    # Frontend React Application
│   ├── src/
│   │   ├── App.tsx                         # Router setup, auth guards, AI preloader
│   │   ├── components/
│   │   │   ├── upload/UploadDocumentDialog.tsx # Upload modal & smart detection UI
│   │   │   ├── bills/                      # Bills & utility management views
│   │   │   ├── subscriptions/              # Subscription tracker views
│   │   │   ├── warranties/                 # Warranty card management views
│   │   │   ├── documents/                  # Document vault & DocumentThumbnail component
│   │   │   ├── passwords/                  # Secure password export manager
│   │   │   ├── reminders/                  # Task & deadline reminder manager
│   │   │   ├── dashboard/                  # Central analytics & recent files cockpit
│   │   │   └── marketing/                  # Public landing pages
│   │   ├── lib/
│   │   │   └── documents/
│   │   │       ├── classifier.ts           # Rules-based OCR classification engine
│   │   │       ├── parser.ts               # OCR text extraction & cleaning pipeline
│   │   │       ├── modernBertAssist.ts     # Smart Detection AI integration bridge
│   │   │       ├── duplicates.ts           # Duplicate document detection logic
│   │   │       └── backendAssist.ts        # Cloud AI fallback merge logic
│   │   ├── services/
│   │   │   ├── localClassifier.ts          # Singleton manager for local WebGPU worker
│   │   │   ├── classifier.worker.ts        # Web Worker running ModernBERT ONNX pipeline
│   │   │   └── extractionService.ts        # Backend Cloud Run extraction API client
│   │   └── store/
│   │       ├── authStore.ts                # Auth Zustand store
│   │       ├── dataStore.ts                # Main Firestore sync Zustand store
│   │       └── uiStore.ts                  # UI theme & layout Zustand store
└── backend/
    └── cloud-run-worker/                   # Node.js backend worker service
        ├── src/
        │   ├── ai/
        │   │   ├── geminiExtractor.ts      # Gemini 2.0 Flash SDK extractor
        │   │   └── openaiExtractor.ts      # OpenAI GPT-4o-mini extractor fallback
        │   └── jobs/
        │       └── processExtractionJob.ts # Job orchestration router
        └── .env                            # API keys (GEMINI_API_KEY, FIREBASE_PROJECT_ID)
```

---

## 📋 Main Product Functional Sections

1. **Bills & Finance (`/bills`)**:
   - Manages utility bills (Electricity, Gas, Internet, Water), invoice numbers, PSID / reference numbers, due dates, late payment surcharges.
2. **Subscriptions (`/subscriptions`)**:
   - Manages recurring subscriptions (Netflix, Spotify, SaaS, Mobile Postpaid), renewal frequencies, monthly costs.
3. **Warranties (`/warranties`)**:
   - Stores warranty claims, purchase receipts, warranty provider contacts, expiry warnings.
4. **Documents (`/documents`)**:
   - Vault for official documents: National Identity Cards (CNIC), Passports, Driving Licenses, Tax Returns (1099/NTN), Bank Statements, Contracts.
5. **Passwords (`/passwords`)**:
   - Vault for account credentials, service logins, security notes.
6. **Reminders (`/reminders`)**:
   - Custom reminders, recurring interval engines, push notification integration.

---

## ⚡ Development & Deployment Workflows

### Run Frontend Locally
```bash
cd app
npm run dev
```

### Build & Deploy to Firebase Hosting
```bash
cd app
npm run build
cd ..
npx -y firebase-tools@latest deploy --only hosting
```

### Git Workflow
```bash
git add .
git commit -m "feat/fix: description"
git push origin main
```
