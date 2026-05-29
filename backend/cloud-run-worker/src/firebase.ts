import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export { admin };
export const adminDb = admin.firestore();
export const adminStorage = admin.storage().bucket();
export const adminMessaging = admin.messaging();
