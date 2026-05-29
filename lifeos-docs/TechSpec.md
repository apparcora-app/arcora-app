# Arcora - Technical Specification

## Technology Stack Decision

### Backend: Firebase (Chosen)

**Why Firebase over Supabase:**

| Factor | Firebase | Supabase |
|--------|----------|----------|
| Real-time Sync | Built-in, seamless | Requires additional setup |
| Offline Support | Firestore offline persistence | More complex implementation |
| Auth + DB + Storage | Single SDK, unified | Multiple packages |
| Electron Integration | Better documented | Less community examples |
| Desktop + Web Sync | Automatic with Firestore | Requires custom sync layer |
| Setup Complexity | Simpler for non-technical users | More configuration needed |
| Pricing | Generous free tier | Competitive but complex |

**Firebase Services Used:**
- **Authentication**: Email/password, Google OAuth, password reset
- **Firestore**: NoSQL database with offline persistence
- **Storage**: Document uploads (receipts, warranties, IDs)
- **Cloud Functions**: Reminder notifications (future)
- **Cloud Messaging**: Push notifications (future)

---

## Project Architecture

### Folder Structure
```
/mnt/okcomputer/output/Arcora/
├── electron/                    # Electron desktop app
│   ├── main.ts                 # Main process
│   ├── preload.ts              # Preload script (secure IPC)
│   ├── renderer/               # Renderer process config
│   └── build/                  # Electron build output
├── public/                     # Static assets
│   ├── icons/                  # App icons
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── src/
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── bills/              # Bills module
│   │   ├── subscriptions/      # Subscriptions module
│   │   ├── warranties/         # Warranties module
│   │   ├── documents/          # Documents vault
│   │   ├── passwords/          # Password manager
│   │   ├── reminders/          # Reminders & tasks
│   │   ├── layout/             # Layout components
│   │   └── shared/             # Shared components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useFirestore.ts     # Firestore operations
│   │   ├── useOffline.ts       # Offline detection
│   │   ├── useReminders.ts     # Reminder engine
│   │   ├── useEncryption.ts    # Encryption utilities
│   │   └── useNotifications.ts # Notification system
│   ├── lib/                    # Utility libraries
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── crypto.ts           # Encryption/decryption
│   │   ├── ocr.ts              # OCR date detection
│   │   ├── notifications.ts    # Notification helpers
│   │   └── utils.ts            # General utilities
│   ├── store/                  # State management
│   │   ├── authStore.ts        # Auth state (Zustand)
│   │   ├── dataStore.ts        # App data state
│   │   └── uiStore.ts          # UI state
│   ├── types/                  # TypeScript types
│   │   ├── auth.ts             # Auth types
│   │   ├── models.ts           # Data models
│   │   └── index.ts            # Type exports
│   ├── styles/                 # Global styles
│   │   ├── globals.css         # Global CSS
│   │   ├── animations.css      # Animation utilities
│   │   └── themes.css          # Theme variables
│   ├── workers/                # Web Workers
│   │   └── ocr.worker.ts       # OCR processing
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite types
├── .env.example                # Environment template
├── .env.local                  # Local environment (gitignored)
├── electron-builder.json       # Electron builder config
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── package.json                # Dependencies
└── README.md                   # Documentation
```

---

## Core Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@tanstack/react-query": "^5.8.0",
  "zustand": "^4.4.0",
  "firebase": "^10.7.0",
  "framer-motion": "^10.16.0",
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0",
  "crypto-js": "^4.2.0",
  "tesseract.js": "^5.0.0",
  "pdf-lib": "^1.17.0",
  "file-saver": "^2.0.5",
  "papaparse": "^5.4.0",
  "sonner": "^1.2.0",
  "@radix-ui/react-*": "latest",
  "lucide-react": "^0.294.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### Development Dependencies
```json
{
  "electron": "^28.0.0",
  "electron-builder": "^24.8.0",
  "electron-devtools-installer": "^3.2.0",
  "@types/crypto-js": "^4.2.0",
  "@types/file-saver": "^2.0.7",
  "@types/papaparse": "^5.3.0",
  "@vitejs/plugin-react": "^4.2.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "vite-plugin-pwa": "^0.17.0",
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

---

## Database Schema

### Firestore Collections

#### users/{userId}
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    theme: 'dark' | 'light' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      billReminders: boolean;
      warrantyAlerts: boolean;
      securityAlerts: boolean;
    };
    reminderTiming: {
      oneDayBefore: boolean;
      onDueDate: boolean;
      thirtyDaysBefore: boolean;
      sevenDaysBefore: boolean;
    };
  };
  masterPasswordHash?: string; // For desktop app
}
```

#### users/{userId}/bills/{billId}
```typescript
interface Bill {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: Timestamp;
  category: 'utilities' | 'housing' | 'insurance' | 'credit-card' | 'loan' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  isRecurring: boolean;
  recurrencePattern?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  attachments?: string[]; // Storage paths
  reminderSent: {
    oneDay: boolean;
    onDueDate: boolean;
    thirtyDays: boolean;
    sevenDays: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### users/{userId}/subscriptions/{subscriptionId}
```typescript
interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'quarterly';
  nextRenewalDate: Timestamp;
  category: 'entertainment' | 'work' | 'health' | 'utilities' | 'shopping' | 'other';
  cancellationUrl?: string;
  notes?: string;
  reminderSent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### users/{userId}/warranties/{warrantyId}
```typescript
interface Warranty {
  id: string;
  productName: string;
  purchaseDate: Timestamp;
  warrantyDurationMonths: number;
  expirationDate: Timestamp;
  retailer?: string;
  warrantyProvider?: string;
  contactInfo?: string;
  receiptUrl?: string; // Storage path
  warrantyCardUrl?: string; // Storage path
  notes?: string;
  reminderSent: {
    thirtyDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### users/{userId}/documents/{documentId}
```typescript
interface Document {
  id: string;
  title: string;
  type: 'passport' | 'license' | 'insurance' | 'contract' | 'invoice' | 'receipt' | 'other';
  documentNumber?: string; // Encrypted
  issueDate?: Timestamp;
  expirationDate?: Timestamp;
  fileUrl: string; // Storage path
  fileName: string;
  fileSize: number;
  mimeType: string;
  detectedDates?: DetectedDate[]; // OCR results
  reminderSent: {
    thirtyDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    onDueDate: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface DetectedDate {
  date: Timestamp;
  type: 'due_date' | 'expiry_date' | 'renewal_date' | 'issue_date' | 'deadline' | 'unknown';
  confidence: number; // 0-100
  sourceText: string;
  confirmed: boolean;
}
```

#### users/{userId}/passwords/{passwordId}
```typescript
interface Password {
  id: string;
  serviceName: string;
  serviceUrl?: string;
  username?: string; // Encrypted
  password: string; // AES-256 encrypted
  category: 'social' | 'finance' | 'work' | 'shopping' | 'entertainment' | 'other';
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  lastChanged: Timestamp;
  notes?: string; // Encrypted
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### users/{userId}/reminders/{reminderId}
```typescript
interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp;
  priority: 'high' | 'medium' | 'low';
  category: 'health' | 'finance' | 'personal' | 'work' | 'other';
  status: 'pending' | 'completed' | 'snoozed';
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  relatedItemType?: 'bill' | 'subscription' | 'warranty' | 'document';
  relatedItemId?: string;
  reminderSent: {
    oneDay: boolean;
    onDueDate: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### users/{userId}/notifications/{notificationId}
```typescript
interface Notification {
  id: string;
  type: 'reminder' | 'alert' | 'info';
  title: string;
  message: string;
  relatedItemType?: string;
  relatedItemId?: string;
  read: boolean;
  createdAt: Timestamp;
}
```

---

## Security Architecture

### Encryption Strategy

#### Password Encryption (AES-256-GCM)
```typescript
// Master password derived key
const deriveKey = (masterPassword: string, salt: string): CryptoKey => {
  // PBKDF2 with 100,000 iterations
};

// Encrypt password
const encryptPassword = (password: string, key: CryptoKey): EncryptedData => {
  // AES-256-GCM encryption
  // Returns: { ciphertext, iv, authTag }
};

// Decrypt password
const decryptPassword = (encryptedData: EncryptedData, key: CryptoKey): string => {
  // AES-256-GCM decryption
};
```

#### Document Encryption
- Documents stored in Firebase Storage with user-specific paths
- Download URLs expire after 1 hour
- Sensitive document numbers encrypted in Firestore
- Local encryption key stored in IndexedDB (encrypted with device key)

### Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /bills/{billId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /subscriptions/{subscriptionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /warranties/{warrantyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /documents/{documentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /passwords/{passwordId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /reminders/{reminderId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /notifications/{notificationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Reminder Engine Architecture

### Reminder Check Schedule
```
Every hour (when app is open):
1. Query all items with upcoming dates
2. Check reminder timing preferences
3. Compare with already sent reminders
4. Trigger notifications for due reminders
5. Mark reminders as sent

On app launch:
1. Check all missed reminders while app was closed
2. Show notification summary
3. Update reminder sent status
```

### Notification Types
| Timing | Bills | Subscriptions | Warranties | Documents | Reminders |
|--------|-------|---------------|------------|-----------|-----------|
| 30 days before | - | - | ✓ | ✓ | - |
| 7 days before | - | ✓ | ✓ | ✓ | - |
| 1 day before | ✓ | ✓ | ✓ | ✓ | ✓ |
| On due date | ✓ | ✓ | ✓ | ✓ | ✓ |

### Notification Channels
1. **In-app**: Toast notifications, badge counts
2. **Desktop (Electron)**: Native notifications
3. **PWA**: Web Push notifications (future)
4. **Email**: Firebase Cloud Functions (future)

---

## OCR Date Detection Pipeline

### Process Flow
```
1. Document Upload
   ↓
2. Extract Text (Tesseract.js for images, pdf-lib for PDFs)
   ↓
3. Date Pattern Matching
   - Regex patterns for common date formats
   - Context analysis ("due by", "expires", "renewal")
   ↓
4. Date Classification
   - ML-based classification (future)
   - Rule-based classification (current)
   ↓
5. Confidence Scoring
   - Pattern match strength
   - Context relevance
   - Date proximity to today
   ↓
6. User Confirmation UI
   - Show detected dates
   - Allow editing/correction
   - Confirm before saving
   ↓
7. Save to Database
   - Store confirmed dates
   - Create reminders
```

### Date Patterns Detected
```typescript
const datePatterns = [
  // MM/DD/YYYY, M/D/YY
  /\b(0?[1-9]|1[0-2])[\/\-.](0?[1-9]|[12]\d|3[01])[\/\-.](\d{2}|\d{4})\b/gi,
  // DD/MM/YYYY, D/M/YY
  /\b(0?[1-9]|[12]\d|3[01])[\/\-.](0?[1-9]|1[0-2])[\/\-.](\d{2}|\d{4})\b/gi,
  // Month DD, YYYY
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
  // DD Month YYYY
  /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi,
];

const contextKeywords = {
  due_date: ['due', 'due by', 'due date', 'payment due', 'pay by'],
  expiry_date: ['expires', 'expiration', 'valid until', 'valid thru', 'expiry'],
  renewal_date: ['renew', 'renewal', 'renew by', 'auto-renew'],
  issue_date: ['issued', 'date of issue', 'issue date'],
};
```

---

## Offline Support Architecture

### Firestore Offline Persistence
```typescript
// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';

await enableIndexedDbPersistence(db, {
  forceOwnership: false,
});
```

### Sync Strategy
1. **Read**: Always from cache first, then server
2. **Write**: Queue writes locally, sync when online
3. **Conflict**: Last-write-wins (timestamp-based)
4. **Indicators**: Show sync status in UI

### Offline Indicators
- Network status badge in header
- "Syncing..." indicator during sync
- "Offline mode" banner when disconnected
- Pending changes count in sidebar

---

## Electron Architecture

### Process Structure
```
Main Process (main.ts)
├── Window Management
│   ├── Create main window
│   ├── Handle window events
│   └── Manage window state
├── IPC Handlers
│   ├── notifications:show
│   ├── app:quit
│   ├── window:minimize
│   └── window:maximize
├── Auto-updater
│   ├── Check for updates
│   ├── Download updates
│   └── Install on quit
└── System Tray
    ├── Show/hide window
    ├── Quick actions
    └── Quit app

Renderer Process (React App)
├── Same as web app
├── Additional APIs via preload
│   ├── desktopNotifications
│   ├── autoLauncher
│   └── systemInfo
└── Electron-specific features
    ├── Global shortcuts
    ├── Desktop notifications
    └── File system access

Preload Script (preload.ts)
├── Expose secure APIs
├── Context isolation enabled
└── No direct Node.js access
```

### IPC Communication
```typescript
// preload.ts - Exposed APIs
interface ElectronAPI {
  notifications: {
    show: (title: string, body: string) => void;
  };
  app: {
    quit: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  platform: string;
}

// Usage in React
const showNotification = (title: string, body: string) => {
  if (window.electron) {
    window.electron.notifications.show(title, body);
  } else {
    // Fallback to web notifications
    new Notification(title, { body });
  }
};
```

---

## PWA Configuration

### Manifest
```json
{
  "name": "Arcora - Personal Life Dashboard",
  "short_name": "Arcora",
  "description": "Your unified life management operating system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1a",
  "theme_color": "#3880ff",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

### Service Worker
```typescript
// sw.js - Workbox-generated
// Precache static assets
// Cache-first strategy for images
// Network-first strategy for API calls
// Background sync for offline mutations
```

---

## Build Configuration

### Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        // PWA manifest
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Electron Builder Config
```json
{
  "appId": "com.Arcora.app",
  "productName": "Arcora",
  "directories": {
    "output": "electron-dist"
  },
  "files": [
    "dist/**/*",
    "electron/**/*"
  ],
  "mac": {
    "target": ["dmg", "zip"],
    "category": "public.app-category.productivity"
  },
  "win": {
    "target": ["nsis", "portable"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle Size (gzipped) | < 500KB |
| Animation Frame Rate | 60fps |
| Firestore Read (cached) | < 50ms |
| Firestore Read (network) | < 500ms |
| OCR Processing | < 5s per page |
| Encryption/Decryption | < 100ms |

---

## Environment Variables

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Encryption
VITE_ENCRYPTION_SALT=your_random_salt

# App Configuration
VITE_APP_NAME=Arcora
VITE_APP_VERSION=1.0.0
```
