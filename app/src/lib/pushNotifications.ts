import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';
import { app, db } from '@/lib/firebase';
import { showToast } from '@/lib/notifications';
import type { NotificationDevice } from '@/types';

const DEVICE_ID_KEY = 'arcora_push_device_id';
const TOKEN_KEY = 'arcora_push_token';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingPromise: Promise<Messaging | null> | null = null;

const hasPushPrerequisites = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(VAPID_KEY) &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

const getStoredDeviceId = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(DEVICE_ID_KEY);
};

const getOrCreateDeviceId = () => {
  if (typeof window === 'undefined') return null;

  const existing = getStoredDeviceId();
  if (existing) return existing;

  const nextId = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, nextId);
  return nextId;
};

const getDeviceDocRef = (userId: string, deviceId: string) =>
  doc(db, 'users', userId, 'notificationDevices', deviceId);

const getMessagingInstance = async () => {
  if (!hasPushPrerequisites()) return null;

  if (!messagingPromise) {
    messagingPromise = (async () => {
      const supported = await isSupported();
      return supported ? getMessaging(app) : null;
    })();
  }

  return messagingPromise;
};

export const supportsPushNotifications = async () => {
  if (!hasPushPrerequisites()) return false;
  return isSupported();
};

export const registerArcoraServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/service-worker.js');
};

export const disablePushDevice = async (userId: string) => {
  const deviceId = getStoredDeviceId();
  if (!deviceId) return;

  try {
    await deleteDoc(getDeviceDocRef(userId, deviceId));
  } catch {
    // Ignore missing-device cleanup issues.
  }

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

export const syncPushDevice = async (userId: string) => {
  if (!userId) return { registered: false, reason: 'missing-user' as const };

  const supported = await supportsPushNotifications();
  if (!supported) {
    await disablePushDevice(userId);
    return { registered: false, reason: 'unsupported' as const };
  }

  if (Notification.permission !== 'granted') {
    await disablePushDevice(userId);
    return { registered: false, reason: 'permission-blocked' as const };
  }

  const [messaging, registration] = await Promise.all([
    getMessagingInstance(),
    registerArcoraServiceWorker(),
  ]);

  if (!messaging || !registration) {
    return { registered: false, reason: 'messaging-unavailable' as const };
  }

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    await disablePushDevice(userId);
    return { registered: false, reason: 'missing-token' as const };
  }

  const deviceId = getOrCreateDeviceId();
  if (!deviceId) {
    return { registered: false, reason: 'missing-device' as const };
  }

  const devicePayload: NotificationDevice = {
    id: deviceId,
    token,
    platform: 'web',
    notificationsEnabled: true,
    userAgent: navigator.userAgent,
    language: navigator.language,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  };

  await setDoc(getDeviceDocRef(userId, deviceId), devicePayload, { merge: true });
  window.localStorage.setItem(TOKEN_KEY, token);

  return { registered: true as const };
};

export const subscribeToForegroundPush = async (
  onForegroundMessage: (payload: MessagePayload) => void,
): Promise<Unsubscribe> => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, onForegroundMessage);
};

export const showForegroundPushToast = (payload: MessagePayload) => {
  const title = payload.notification?.title || payload.data?.title || 'Arcora notification';
  const description =
    payload.notification?.body ||
    payload.data?.body ||
    'Open Arcora to review the latest reminder.';

  showToast({
    title,
    description,
    type: 'info',
    duration: 6000,
  });
};
