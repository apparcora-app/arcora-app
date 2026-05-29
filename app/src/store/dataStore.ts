import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { calculatePasswordStrength, decrypt, encrypt } from '@/lib/crypto';
import { resolvePrimaryDeadline, syncDocumentReminders, syncItemReminders } from '@/lib/reminders/autoGenerate';
import { fireSimpleConfetti, fireStepConfetti } from '@/lib/animations/confetti';
import { showToast } from '@/lib/notifications';
import { useAuthStore } from './authStore';
import type {
  AppSection,
  Bill,
  DashboardInsight,
  DashboardStats,
  Document,
  Notification,
  Password,
  PasswordStrength,
  RelatedItemType,
  Reminder,
  ReminderSentStatus,
  ReminderTimingSettings,
  Subscription,
  UpcomingItem,
  UploadDraft,
  Warranty,
} from '@/types';

interface DataState {
  bills: Bill[];
  subscriptions: Subscription[];
  warranties: Warranty[];
  documents: Document[];
  activeDocuments: Document[];
  reminders: Reminder[];
  notifications: Notification[];
  passwords: Password[];
  isLoading: Record<string, boolean>;
  resetData: () => void;

  fetchBills: () => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBill: (id: string, data: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;

  fetchSubscriptions: () => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  fetchWarranties: () => Promise<void>;
  addWarranty: (warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWarranty: (id: string, data: Partial<Warranty>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;

  fetchDocuments: () => Promise<void>;
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>, file: File) => Promise<void>;
  uploadDocumentFromDraft: (file: File | null, draft: UploadDraft, options?: { mergeIntoId?: string; supersedesId?: string }) => Promise<void>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentsBySection: (section: AppSection) => Document[];

  fetchPasswords: () => Promise<void>;
  addPassword: (password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>, masterKey: string) => Promise<void>;
  updatePassword: (id: string, data: Partial<Password>, masterKey: string) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  getDecryptedPassword: (password: Password, masterKey: string) => string;

  fetchReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;

  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  getDashboardStats: () => DashboardStats;
  getDashboardInsights: () => DashboardInsight[];
  getUpcomingItems: (days: number) => UpcomingItem[];
  getExpiringWarranties: (days: number) => Warranty[];
  getOverdueBills: () => Bill[];
  getPendingReminders: () => Reminder[];

  subscribeToData: () => () => void;
}

const getUserId = () => useAuthStore.getState().user?.uid;

const getReminderTimingSettings = (): ReminderTimingSettings =>
  useAuthStore.getState().user?.settings?.reminderTiming ?? {
    thirtyDaysBefore: true,
    sevenDaysBefore: true,
    oneDayBefore: true,
    onDueDate: true,
  };

const defaultReminderSent: ReminderSentStatus = {
  thirtyDays: false,
  sevenDays: false,
  oneDay: false,
  onDueDate: false,
};

const firestoreSyncWarnings = new Set<string>();

const passwordStrengthValues: PasswordStrength[] = ['weak', 'fair', 'strong', 'very-strong'];

const getRandomDocumentStoragePath = (userId: string, file: File) => {
  const extensionMatch = file.name.match(/\.([A-Za-z0-9]{1,12})$/);
  const extension = extensionMatch ? `.${extensionMatch[1].toLowerCase()}` : '';
  return `users/${userId}/documents/${crypto.randomUUID()}${extension}`;
};

const isPasswordStrength = (value: unknown): value is PasswordStrength =>
  typeof value === 'string' && passwordStrengthValues.includes(value as PasswordStrength);

const normalizePasswordStrength = (value: unknown): PasswordStrength => {
  if (isPasswordStrength(value)) {
    return value;
  }

  if (isPlainObject(value) && isPasswordStrength(value.strength)) {
    return value.strength;
  }

  return 'weak';
};

const getPasswordStrength = (password: string): PasswordStrength =>
  calculatePasswordStrength(password).strength;

const normalizePasswordRecord = (password: Password): Password => ({
  ...password,
  strength: normalizePasswordStrength(password.strength),
});

const repairMalformedPasswordStrengthRecords = (userId: string, passwords: Password[]) => {
  const malformedPasswords = passwords.filter(
    (password) => password.strength !== normalizePasswordStrength(password.strength),
  );

  if (malformedPasswords.length === 0) {
    return;
  }

  void Promise.allSettled(
    malformedPasswords.map((password) =>
      updateDoc(doc(db, 'users', userId, 'passwords', password.id), {
        strength: normalizePasswordStrength(password.strength),
      }),
    ),
  ).catch((error) => {
    console.warn('Unable to repair malformed password strength records.', error);
  });
};

const setLoadingState = (
  set: (fn: (state: DataState) => Partial<DataState>) => void,
  key: string,
  value: boolean,
) => {
  set((state) => ({
    isLoading: {
      ...state.isLoading,
      [key]: value,
    },
  }));
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

type DocumentWritePayload = Omit<Document, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

const stripUndefinedDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, entry]) => {
        const cleanedEntry = stripUndefinedDeep(entry);
        return cleanedEntry === undefined ? [] : [[key, cleanedEntry]];
      }),
    ) as T;
  }

  return value;
};

const getAutoReminderGroupKey = (reminder: Reminder) => {
  if (reminder.sourceDocumentId) {
    return `document:${reminder.sourceDocumentId}`;
  }

  if (reminder.relatedItemType && reminder.relatedItemId) {
    return `${reminder.relatedItemType}:${reminder.relatedItemId}`;
  }

  return null;
};

const removeRelatedAutoReminders = async (
  userId: string,
  relatedItemType: RelatedItemType,
  relatedItemId: string,
) => {
  const remindersSnapshot = await getDocs(
    query(
      collection(db, 'users', userId, 'reminders'),
      where('relatedItemType', '==', relatedItemType),
      where('relatedItemId', '==', relatedItemId),
      where('autoGenerated', '==', true),
    ),
  );

  if (remindersSnapshot.empty) {
    return;
  }

  const reminderIds = remindersSnapshot.docs.map((reminderDoc) => reminderDoc.id);

  await Promise.allSettled(remindersSnapshot.docs.map((reminderDoc) => deleteDoc(reminderDoc.ref)));
  await removeNotificationsForReminderIds(userId, reminderIds);
};

const removeNotificationsForReminderIds = async (userId: string, reminderIds: string[]) => {
  if (reminderIds.length === 0) {
    return;
  }

  const reminderIdSet = new Set(reminderIds);
  const notificationsSnapshot = await getDocs(collection(db, 'users', userId, 'notifications'));
  const notificationDocsToDelete = notificationsSnapshot.docs.filter((notificationDoc) => {
    const notification = notificationDoc.data() as Partial<Notification>;
    return (
      notification.relatedItemType === 'reminder' &&
      typeof notification.relatedItemId === 'string' &&
      reminderIdSet.has(notification.relatedItemId)
    );
  });

  if (notificationDocsToDelete.length === 0) {
    return;
  }

  await Promise.allSettled(notificationDocsToDelete.map((notificationDoc) => deleteDoc(notificationDoc.ref)));
};

const removeNotificationsForItem = async (
  userId: string,
  relatedItemType: Notification['relatedItemType'],
  relatedItemId: string,
) => {
  const notificationsSnapshot = await getDocs(collection(db, 'users', userId, 'notifications'));
  const notificationDocsToDelete = notificationsSnapshot.docs.filter((notificationDoc) => {
    const notification = notificationDoc.data() as Partial<Notification>;
    return (
      notification.relatedItemType === relatedItemType &&
      notification.relatedItemId === relatedItemId
    );
  });

  if (notificationDocsToDelete.length === 0) {
    return;
  }

  await Promise.allSettled(notificationDocsToDelete.map((notificationDoc) => deleteDoc(notificationDoc.ref)));
};

const removeSourceDocumentAutoReminders = async (userId: string, sourceDocumentId: string) => {
  const remindersSnapshot = await getDocs(
    query(
      collection(db, 'users', userId, 'reminders'),
      where('sourceDocumentId', '==', sourceDocumentId),
      where('autoGenerated', '==', true),
    ),
  );

  if (remindersSnapshot.empty) {
    return;
  }

  const reminderIds = remindersSnapshot.docs.map((reminderDoc) => reminderDoc.id);

  await Promise.allSettled(remindersSnapshot.docs.map((reminderDoc) => deleteDoc(reminderDoc.ref)));
  await removeNotificationsForReminderIds(userId, reminderIds);
};

const filterVisibleReminders = (reminders: Reminder[]) => {
  const visibleReminderIds = new Set<string>();
  const autoReminderGroups = new Map<string, Reminder[]>();
  const now = Date.now();

  reminders.forEach((reminder) => {
    if (!reminder.autoGenerated) {
      visibleReminderIds.add(reminder.id);
      return;
    }

    const groupKey = getAutoReminderGroupKey(reminder);
    if (!groupKey) {
      visibleReminderIds.add(reminder.id);
      return;
    }

    const group = autoReminderGroups.get(groupKey) ?? [];
    group.push(reminder);
    autoReminderGroups.set(groupKey, group);
  });

  autoReminderGroups.forEach((group) => {
    const sorted = [...group].sort(
      (left, right) => left.dueDate.toDate().getTime() - right.dueDate.toDate().getTime(),
    );
    const futurePending = sorted.filter(
      (reminder) =>
        reminder.status === 'pending' &&
        reminder.dueDate.toDate().getTime() >= now &&
        !reminder.pushSentAt,
    );
    const overduePending = [...sorted]
      .reverse()
      .find((reminder) => reminder.status === 'pending' && !reminder.pushSentAt);

    const nextActionable =
      futurePending[0] ??
      overduePending ??
      sorted.find((reminder) => reminder.status === 'pending') ??
      sorted[sorted.length - 1];

    if (nextActionable) {
      visibleReminderIds.add(nextActionable.id);
    }
  });

  return reminders.filter((reminder) => visibleReminderIds.has(reminder.id));
};

const getNotificationTimestamp = (notification: Notification) => {
  const createdAt = notification.createdAt;
  if (createdAt && typeof createdAt === 'object' && 'toMillis' in createdAt) {
    try {
      return createdAt.toMillis();
    } catch {
      return 0;
    }
  }

  return 0;
};

const dedupeNotifications = (notifications: Notification[]) => {
  const sorted = [...notifications].sort(
    (left, right) => getNotificationTimestamp(right) - getNotificationTimestamp(left),
  );
  const seen = new Set<string>();

  return sorted.filter((notification) => {
    const signature = [
      notification.type,
      notification.title.trim(),
      notification.message.trim(),
      notification.relatedItemType ?? '',
      notification.relatedItemId ?? '',
    ].join('::');

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
};

const reminderRepairInFlight = new Set<string>();
const reminderRepairAttempted = new Set<string>();

const hasLinkedAutoReminder = (
  reminders: Reminder[],
  relatedItemType: RelatedItemType,
  relatedItemId: string,
  sourceDocumentId?: string,
) =>
  reminders.some((reminder) => {
    if (!reminder.autoGenerated) {
      return false;
    }

    if (sourceDocumentId && reminder.sourceDocumentId === sourceDocumentId) {
      return true;
    }

    return (
      reminder.relatedItemType === relatedItemType &&
      reminder.relatedItemId === relatedItemId
    );
  });

const ensureMissingBillReminderRepairs = (
  userId: string,
  documents: Document[],
  reminders: Reminder[],
) => {
  documents.forEach((document) => {
    if (document.section !== 'bills') return;
    if (!resolvePrimaryDeadline(document)) return;

    const hasAutoReminder = hasLinkedAutoReminder(reminders, 'bill', document.id, document.id);
    const repairKey = `${userId}:document:${document.id}`;

    if (
      hasAutoReminder ||
      reminderRepairInFlight.has(repairKey) ||
      reminderRepairAttempted.has(repairKey)
    ) {
      return;
    }

    reminderRepairInFlight.add(repairKey);
    reminderRepairAttempted.add(repairKey);

    void syncDocumentReminders(userId, document.id, document, getReminderTimingSettings())
      .catch((error) => {
        console.warn('Unable to repair missing auto reminder for bill upload.', error);
      })
      .finally(() => {
        reminderRepairInFlight.delete(repairKey);
      });
  });
};

const ensureMissingItemReminderRepairs = (
  userId: string,
  reminders: Reminder[],
  items: Array<{
    id: string;
    title: string;
    sourceDocumentId?: string;
    relatedItemType: RelatedItemType;
    section: string;
    targetDate: Timestamp;
    isActive?: boolean;
  }>,
) => {
  items.forEach((item) => {
    if (item.sourceDocumentId || item.isActive === false) return;

    const repairKey = `${userId}:${item.relatedItemType}:${item.id}`;
    if (
      hasLinkedAutoReminder(reminders, item.relatedItemType, item.id) ||
      reminderRepairInFlight.has(repairKey) ||
      reminderRepairAttempted.has(repairKey)
    ) {
      return;
    }

    reminderRepairInFlight.add(repairKey);
    reminderRepairAttempted.add(repairKey);

    void syncItemReminders(
      userId,
      item.id,
      item.relatedItemType,
      item.title,
      item.section,
      item.targetDate.toDate(),
      getReminderTimingSettings(),
    )
      .catch((error) => {
        console.warn(`Unable to repair missing auto reminder for ${item.relatedItemType}.`, error);
      })
      .finally(() => {
        reminderRepairInFlight.delete(repairKey);
      });
  });
};

const fetchCollection = async <T>(userId: string, name: string, sortField?: string) => {
  const collectionRef = collection(db, 'users', userId, name);
  const snapshot = sortField
    ? await getDocs(query(collectionRef, orderBy(sortField, 'asc')))
    : await getDocs(collectionRef);

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
};

const reportFirestoreSyncError = (resource: string, error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    if (!firestoreSyncWarnings.has(code)) {
      firestoreSyncWarnings.add(code);
      showToast({
        title: 'Cloud sync permission denied',
        description:
          'Firestore denied access to your data. Deploy the Firebase rules in app/firestore.rules, then refresh.',
        type: 'warning',
        duration: 7000,
      });
    }

    console.warn(`Firestore sync blocked for ${resource}.`, error);
    return;
  }

  console.error(`Firestore sync failed for ${resource}.`, error);
};

const createEmptyDataState = (): Pick<
  DataState,
  | 'bills'
  | 'subscriptions'
  | 'warranties'
  | 'documents'
  | 'activeDocuments'
  | 'reminders'
  | 'notifications'
  | 'passwords'
  | 'isLoading'
> => ({
  bills: [],
  subscriptions: [],
  warranties: [],
  documents: [],
  activeDocuments: [],
  reminders: [],
  notifications: [],
  passwords: [],
  isLoading: {},
});

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...createEmptyDataState(),

      resetData: () => set(createEmptyDataState()),

      fetchBills: async () => {
        const userId = getUserId();
        if (!userId) return;

        setLoadingState(set, 'bills', true);

        try {
          const bills = await fetchCollection<Bill>(userId, 'bills', 'dueDate');
          set({ bills });
          ensureMissingItemReminderRepairs(
            userId,
            get().reminders,
            bills.map((bill) => ({
              id: bill.id,
              title: bill.title,
              sourceDocumentId: bill.sourceDocumentId,
              relatedItemType: 'bill',
              section: 'bills',
              targetDate: bill.dueDate,
              isActive: bill.status !== 'paid',
            })),
          );
        } finally {
          setLoadingState(set, 'bills', false);
        }
      },

      addBill: async (bill) => {
        const userId = getUserId();
        if (!userId) return;

        const billRef = await addDoc(collection(db, 'users', userId, 'bills'), stripUndefinedDeep({
          ...bill,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));

        if (!bill.sourceDocumentId && bill.status !== 'paid') {
          try {
            await syncItemReminders(
              userId,
              billRef.id,
              'bill',
              bill.title,
              'bills',
              bill.dueDate.toDate(),
              getReminderTimingSettings(),
            );
          } catch (error) {
            console.warn('Bill saved but automatic reminders were not created.', error);
          }
        }

        await Promise.all([get().fetchBills(), get().fetchReminders()]);
        fireSimpleConfetti();
      },

      updateBill: async (id, data) => {
        const userId = getUserId();
        if (!userId) return;

        const existingBill = get().bills.find((bill) => bill.id === id);

        await updateDoc(doc(db, 'users', userId, 'bills', id), stripUndefinedDeep({
          ...data,
          updatedAt: serverTimestamp(),
        }));

        if (existingBill) {
          const mergedBill = { ...existingBill, ...data } as Bill;

          if (mergedBill.sourceDocumentId) {
            if (mergedBill.status === 'paid') {
              await removeSourceDocumentAutoReminders(userId, mergedBill.sourceDocumentId);
              await removeNotificationsForItem(userId, 'bill', id);
            }
          } else if (mergedBill.status === 'paid') {
            await removeRelatedAutoReminders(userId, 'bill', id);
            await removeNotificationsForItem(userId, 'bill', id);
          } else {
            try {
              await syncItemReminders(
                userId,
                id,
                'bill',
                mergedBill.title,
                'bills',
                mergedBill.dueDate.toDate(),
                getReminderTimingSettings(),
              );
            } catch (error) {
              console.warn('Bill updated but automatic reminders were not synced.', error);
            }
          }
        }

        await Promise.all([get().fetchBills(), get().fetchReminders()]);
      },

      deleteBill: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        const existingBill = get().bills.find((bill) => bill.id === id);
        if (!existingBill?.sourceDocumentId) {
          await removeRelatedAutoReminders(userId, 'bill', id);
        }

        await deleteDoc(doc(db, 'users', userId, 'bills', id));
        await removeNotificationsForItem(userId, 'bill', id);
        await Promise.all([get().fetchBills(), get().fetchReminders()]);
      },

      markBillAsPaid: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        const existingBill = get().bills.find((bill) => bill.id === id);

        await updateDoc(doc(db, 'users', userId, 'bills', id), {
          status: 'paid',
          updatedAt: serverTimestamp(),
        });

        if (existingBill?.sourceDocumentId) {
          await removeSourceDocumentAutoReminders(userId, existingBill.sourceDocumentId);
        } else {
          await removeRelatedAutoReminders(userId, 'bill', id);
        }

        await removeNotificationsForItem(userId, 'bill', id);
        await Promise.all([get().fetchBills(), get().fetchReminders()]);
        fireStepConfetti();
      },

      fetchSubscriptions: async () => {
        const userId = getUserId();
        if (!userId) return;

        setLoadingState(set, 'subscriptions', true);

        try {
          const subscriptions = await fetchCollection<Subscription>(
            userId,
            'subscriptions',
            'nextRenewalDate',
          );
          set({ subscriptions });
          ensureMissingItemReminderRepairs(
            userId,
            get().reminders,
            subscriptions.map((subscription) => ({
              id: subscription.id,
              title: subscription.name,
              sourceDocumentId: subscription.sourceDocumentId,
              relatedItemType: 'subscription',
              section: 'subscriptions',
              targetDate: subscription.nextRenewalDate,
            })),
          );
        } finally {
          setLoadingState(set, 'subscriptions', false);
        }
      },

      addSubscription: async (subscription) => {
        const userId = getUserId();
        if (!userId) return;

        const subscriptionRef = await addDoc(collection(db, 'users', userId, 'subscriptions'), stripUndefinedDeep({
          ...subscription,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));

        if (!subscription.sourceDocumentId) {
          try {
            await syncItemReminders(
              userId,
              subscriptionRef.id,
              'subscription',
              subscription.name,
              'subscriptions',
              subscription.nextRenewalDate.toDate(),
              getReminderTimingSettings(),
            );
          } catch (error) {
            console.warn('Subscription saved but automatic reminders were not created.', error);
          }
        }

        await Promise.all([get().fetchSubscriptions(), get().fetchReminders()]);
        fireSimpleConfetti();
      },

      updateSubscription: async (id, data) => {
        const userId = getUserId();
        if (!userId) return;

        const existingSubscription = get().subscriptions.find((subscription) => subscription.id === id);

        await updateDoc(doc(db, 'users', userId, 'subscriptions', id), stripUndefinedDeep({
          ...data,
          updatedAt: serverTimestamp(),
        }));

        if (existingSubscription && !existingSubscription.sourceDocumentId) {
          const mergedSubscription = { ...existingSubscription, ...data } as Subscription;

          try {
            await syncItemReminders(
              userId,
              id,
              'subscription',
              mergedSubscription.name,
              'subscriptions',
              mergedSubscription.nextRenewalDate.toDate(),
              getReminderTimingSettings(),
            );
          } catch (error) {
            console.warn('Subscription updated but automatic reminders were not synced.', error);
          }
        }

        await Promise.all([get().fetchSubscriptions(), get().fetchReminders()]);
      },

      deleteSubscription: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await removeRelatedAutoReminders(userId, 'subscription', id);
        await deleteDoc(doc(db, 'users', userId, 'subscriptions', id));
        await Promise.all([get().fetchSubscriptions(), get().fetchReminders()]);
      },

      fetchWarranties: async () => {
        const userId = getUserId();
        if (!userId) return;

        setLoadingState(set, 'warranties', true);

        try {
          const warranties = await fetchCollection<Warranty>(userId, 'warranties', 'expirationDate');
          set({ warranties });
          ensureMissingItemReminderRepairs(
            userId,
            get().reminders,
            warranties.map((warranty) => ({
              id: warranty.id,
              title: warranty.productName,
              sourceDocumentId: warranty.sourceDocumentId,
              relatedItemType: 'warranty',
              section: 'warranties',
              targetDate: warranty.expirationDate,
            })),
          );
        } finally {
          setLoadingState(set, 'warranties', false);
        }
      },

      addWarranty: async (warranty) => {
        const userId = getUserId();
        if (!userId) return;

        const warrantyRef = await addDoc(collection(db, 'users', userId, 'warranties'), stripUndefinedDeep({
          ...warranty,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));

        if (!warranty.sourceDocumentId) {
          try {
            await syncItemReminders(
              userId,
              warrantyRef.id,
              'warranty',
              warranty.productName,
              'warranties',
              warranty.expirationDate.toDate(),
              getReminderTimingSettings(),
            );
          } catch (error) {
            console.warn('Warranty saved but automatic reminders were not created.', error);
          }
        }

        await Promise.all([get().fetchWarranties(), get().fetchReminders()]);
        fireSimpleConfetti();
      },

      updateWarranty: async (id, data) => {
        const userId = getUserId();
        if (!userId) return;

        const existingWarranty = get().warranties.find((warranty) => warranty.id === id);

        await updateDoc(doc(db, 'users', userId, 'warranties', id), stripUndefinedDeep({
          ...data,
          updatedAt: serverTimestamp(),
        }));

        if (existingWarranty && !existingWarranty.sourceDocumentId) {
          const mergedWarranty = { ...existingWarranty, ...data } as Warranty;

          try {
            await syncItemReminders(
              userId,
              id,
              'warranty',
              mergedWarranty.productName,
              'warranties',
              mergedWarranty.expirationDate.toDate(),
              getReminderTimingSettings(),
            );
          } catch (error) {
            console.warn('Warranty updated but automatic reminders were not synced.', error);
          }
        }

        await Promise.all([get().fetchWarranties(), get().fetchReminders()]);
      },

      deleteWarranty: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await removeRelatedAutoReminders(userId, 'warranty', id);
        await deleteDoc(doc(db, 'users', userId, 'warranties', id));
        await Promise.all([get().fetchWarranties(), get().fetchReminders()]);
      },

      fetchDocuments: async () => {
        const userId = getUserId();
        if (!userId) return;

        setLoadingState(set, 'documents', true);

        try {
          const snapshot = await getDocs(
            query(collection(db, 'users', userId, 'documents'), orderBy('createdAt', 'desc')),
          );

          const documents = snapshot.docs.map(
            (item) => ({ id: item.id, ...item.data() }) as Document,
          );

          set({ 
            documents,
            activeDocuments: documents.filter(d => !d.replacedByDocumentId)
          });

          ensureMissingBillReminderRepairs(userId, documents, get().reminders);
        } finally {
          setLoadingState(set, 'documents', false);
        }
      },

      addDocument: async (document, file) => {
        const userId = getUserId();
        if (!userId) return;

        const storagePath = getRandomDocumentStoragePath(userId, file);
        const fileRef = ref(storage, storagePath);
        await uploadBytes(fileRef, file, { contentType: file.type });
        const fileUrl = await getDownloadURL(fileRef);

        const payload = stripUndefinedDeep<DocumentWritePayload>({
          ...document,
          fileUrl,
          storagePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          section: document.section ?? 'documents',
          sourceKind: document.sourceKind ?? 'manual',
          parserStatus: document.parserStatus ?? 'partial',
          reviewStatus: document.reviewStatus ?? 'reviewed',
          reminderSent: document.reminderSent ?? defaultReminderSent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const docRef = await addDoc(collection(db, 'users', userId, 'documents'), payload);

        let reminderSyncFailed = false;

        try {
          await syncDocumentReminders(
            userId,
            docRef.id,
            { id: docRef.id, ...payload } as Document,
            getReminderTimingSettings(),
          );
        } catch (error) {
          reminderSyncFailed = true;
          console.warn('Document saved but reminder sync failed.', error);
        }

        await Promise.allSettled([get().fetchDocuments(), get().fetchReminders()]);

        if (reminderSyncFailed) {
          showToast({
            title: 'Document saved with follow-up needed',
            description: 'Automatic reminders were not created yet.',
            type: 'warning',
            duration: 7000,
          });
        }

        fireSimpleConfetti();
      },

      uploadDocumentFromDraft: async (file, draft, options) => {
        const userId = getUserId();
        if (!userId) return;

        let fileUrl = '';
        let storagePath = '';
        let fileName = '';
        let fileSize = 0;
        let mimeType = '';

        if (options?.mergeIntoId) {
          // Merge behavior: we discard the file and just update the existing document
          // with the stronger OCR values, maintaining its original file.
          const docRef = doc(db, 'users', userId, 'documents', options.mergeIntoId);
          await updateDoc(docRef, stripUndefinedDeep({
            extractedData: draft.extractedData,
            extractedText: draft.extractedText,
            detectedDates: draft.detectedDates,
            classificationConfidence: Math.max(draft.classificationConfidence, 0.5), // bump confidence
            updatedAt: serverTimestamp(),
          }));
          
          await Promise.all([get().fetchDocuments()]);
          return;
        }

        if (file) {
          storagePath = getRandomDocumentStoragePath(userId, file);
          const fileRef = ref(storage, storagePath);
          await uploadBytes(fileRef, file, { contentType: file.type });
          fileUrl = await getDownloadURL(fileRef);
          fileName = file.name;
          fileSize = file.size;
          mimeType = file.type;
        }

        const payload = stripUndefinedDeep<DocumentWritePayload>({
          title: draft.title,
          type: draft.type,
          section: draft.section,
          fileUrl,
          storagePath,
          fileName,
          fileSize,
          mimeType,
          reminderSent: defaultReminderSent,
          parserStatus: draft.parserStatus,
          reviewStatus: draft.reviewStatus,
          classificationConfidence: draft.classificationConfidence,
          extractedText: draft.extractedText,
          extractedData: draft.extractedData,
          detectedDates: draft.detectedDates,
          tags: draft.tags,
          sourceKind: 'upload',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (options?.supersedesId) {
          payload.supersedesDocumentId = options.supersedesId;
          payload.duplicateStatus = 'exact';
        }

        const docRef = await addDoc(collection(db, 'users', userId, 'documents'), payload);
        const postSaveWarnings: string[] = [];

        if (options?.supersedesId) {
          // Update the superseded document to link it to this new one
          const oldDocRef = doc(db, 'users', userId, 'documents', options.supersedesId);
          await updateDoc(oldDocRef, { replacedByDocumentId: docRef.id });
        }

        try {
          await syncDocumentReminders(userId, docRef.id, draft, getReminderTimingSettings());
        } catch (error) {
          console.warn('Document saved but reminder sync failed.', error);
          postSaveWarnings.push('Automatic reminders were not created yet.');
        }

        if (draft.section === 'bills' && draft.extractedData.bill?.amountDue) {
          const resolvedDueDate =
            resolvePrimaryDeadline(draft) ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          try {
            await addDoc(collection(db, 'users', userId, 'bills'), stripUndefinedDeep({
              title: draft.title,
              amount: draft.extractedData.bill.amountDue,
              currency: 'USD',
              dueDate: Timestamp.fromDate(resolvedDueDate),
              category: 'utilities',
              status: 'pending',
              isRecurring: false,
              notes: draft.extractedData.summary,
              reminderSent: defaultReminderSent,
              sourceDocumentId: docRef.id,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }));
          } catch (error) {
            console.warn('Document saved but mirrored bill creation failed.', error);
            postSaveWarnings.push('The matching bill record was not created automatically.');
          }
        }

        await Promise.allSettled([get().fetchDocuments(), get().fetchBills(), get().fetchReminders()]);

        if (postSaveWarnings.length > 0) {
          showToast({
            title: 'Document saved with follow-up needed',
            description: postSaveWarnings.join(' '),
            type: 'warning',
            duration: 7000,
          });
        }
        
        if (options?.mergeIntoId || options?.supersedesId) {
          fireStepConfetti();
        } else {
          fireSimpleConfetti();
        }
      },

      updateDocument: async (id, data) => {
        const userId = getUserId();
        if (!userId) return;

        await updateDoc(doc(db, 'users', userId, 'documents', id), stripUndefinedDeep({
          ...data,
          updatedAt: serverTimestamp(),
        }));

        const existing = get().documents.find((d) => d.id === id);
        if (existing) {
          const merged = { ...existing, ...data } as Document;
          await syncDocumentReminders(userId, id, merged, getReminderTimingSettings());
        }

        await Promise.all([get().fetchDocuments(), get().fetchReminders()]);
      },

      deleteDocument: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        const documentRef = doc(db, 'users', userId, 'documents', id);
        const documentSnap = await getDoc(documentRef);

        if (documentSnap.exists()) {
          const record = documentSnap.data() as Document;

          const storageReference = record.storagePath || record.fileUrl;

          if (storageReference) {
            try {
              await deleteObject(ref(storage, storageReference));
            } catch {
              // ignore storage cleanup failures
            }
          }
        }

        const relatedRemindersSnapshot = await getDocs(
          query(collection(db, 'users', userId, 'reminders'), where('sourceDocumentId', '==', id)),
        );
        const relatedBillsSnapshot = await getDocs(
          query(collection(db, 'users', userId, 'bills'), where('sourceDocumentId', '==', id)),
        );

        await Promise.allSettled([
          ...relatedRemindersSnapshot.docs.map((reminderDoc) => deleteDoc(reminderDoc.ref)),
          ...relatedBillsSnapshot.docs.map((billDoc) => deleteDoc(billDoc.ref)),
        ]);

        await deleteDoc(documentRef);
        await Promise.allSettled([get().fetchDocuments(), get().fetchBills(), get().fetchReminders()]);
      },

      fetchPasswords: async () => {
        const userId = getUserId();
        if (!userId) return;

        const fetchedPasswords = await fetchCollection<Password>(userId, 'passwords', 'updatedAt');
        const passwords = fetchedPasswords.map(normalizePasswordRecord);
        repairMalformedPasswordStrengthRecords(userId, fetchedPasswords);

        set({ passwords });
      },

      addPassword: async (password, masterKey) => {
        const userId = getUserId();
        if (!userId) return;

        const encryptedPassword = encrypt(password.password, masterKey);

        await addDoc(collection(db, 'users', userId, 'passwords'), stripUndefinedDeep({
          ...password,
          password: encryptedPassword,
          strength: getPasswordStrength(password.password),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));

        await get().fetchPasswords();
      },

      updatePassword: async (id, data, masterKey) => {
        const userId = getUserId();
        if (!userId) return;

        const updatedData = stripUndefinedDeep({
          ...data,
          password: data.password ? encrypt(data.password, masterKey) : data.password,
          strength: data.password
            ? getPasswordStrength(data.password)
            : data.strength === undefined
              ? undefined
              : normalizePasswordStrength(data.strength),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, 'users', userId, 'passwords', id), updatedData);
        await get().fetchPasswords();
      },

      deletePassword: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await deleteDoc(doc(db, 'users', userId, 'passwords', id));
        await get().fetchPasswords();
      },

      getDecryptedPassword: (password, masterKey) => decrypt(password.password, masterKey),

      fetchReminders: async () => {
        const userId = getUserId();
        if (!userId) return;

        const reminders = await fetchCollection<Reminder>(userId, 'reminders', 'dueDate');
        set({ reminders: filterVisibleReminders(reminders) });
      },

      addReminder: async (reminder) => {
        const userId = getUserId();
        if (!userId) return;

        await addDoc(collection(db, 'users', userId, 'reminders'), stripUndefinedDeep({
          ...reminder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));

        await get().fetchReminders();
      },

      updateReminder: async (id, data) => {
        const userId = getUserId();
        if (!userId) return;

        await updateDoc(doc(db, 'users', userId, 'reminders', id), stripUndefinedDeep({
          ...data,
          updatedAt: serverTimestamp(),
        }));

        await get().fetchReminders();
      },

      deleteReminder: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        const existingReminder = get().reminders.find((item) => item.id === id);
        const deletedReminderIds = new Set<string>();

        if (existingReminder?.autoGenerated && existingReminder.sourceDocumentId) {
          const relatedAutoRemindersSnapshot = await getDocs(
            query(
              collection(db, 'users', userId, 'reminders'),
              where('sourceDocumentId', '==', existingReminder.sourceDocumentId),
              where('autoGenerated', '==', true),
            ),
          );

          relatedAutoRemindersSnapshot.docs.forEach((reminderDoc) => {
            deletedReminderIds.add(reminderDoc.id);
          });
          await Promise.allSettled(
            relatedAutoRemindersSnapshot.docs.map((reminderDoc) => deleteDoc(reminderDoc.ref)),
          );
        } else if (
          existingReminder?.autoGenerated &&
          existingReminder.relatedItemType &&
          existingReminder.relatedItemId
        ) {
          await removeRelatedAutoReminders(
            userId,
            existingReminder.relatedItemType,
            existingReminder.relatedItemId,
          );
        } else {
          deletedReminderIds.add(id);
          await deleteDoc(doc(db, 'users', userId, 'reminders', id));
        }

        if (deletedReminderIds.size > 0) {
          await removeNotificationsForReminderIds(userId, [...deletedReminderIds]);
        }

        await get().fetchReminders();
      },

      completeReminder: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await updateDoc(doc(db, 'users', userId, 'reminders', id), {
          status: 'completed',
          updatedAt: serverTimestamp(),
        });

        await get().fetchReminders();
      },

      fetchNotifications: async () => {
        const userId = getUserId();
        if (!userId) return;

        const notifications = await fetchCollection<Notification>(userId, 'notifications', 'createdAt');
        set({ notifications: dedupeNotifications(notifications.reverse()) });
      },

      markNotificationAsRead: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await updateDoc(doc(db, 'users', userId, 'notifications', id), { read: true });
        await get().fetchNotifications();
      },

      deleteNotification: async (id) => {
        const userId = getUserId();
        if (!userId) return;

        await deleteDoc(doc(db, 'users', userId, 'notifications', id));
        await get().fetchNotifications();
      },

      clearAllNotifications: async () => {
        const userId = getUserId();
        if (!userId) return;

        const snapshot = await getDocs(collection(db, 'users', userId, 'notifications'));
        await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
        await get().fetchNotifications();
      },

      getDashboardStats: () => {
        const { bills, subscriptions, warranties, passwords, documents } = get();
        const now = new Date();
        const warrantyExpiryWindow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const totalDue = bills
          .filter((bill) => bill.status !== 'paid')
          .reduce((total, bill) => total + bill.amount, 0);

        const paidThisMonth = bills
          .filter((bill) => bill.status === 'paid')
          .reduce((total, bill) => total + bill.amount, 0);

        const monthlySubscriptions = subscriptions.reduce((total, item) => {
          if (item.billingPeriod === 'monthly') return total + item.amount;
          if (item.billingPeriod === 'yearly') return total + item.amount / 12;
          if (item.billingPeriod === 'quarterly') return total + item.amount / 3;
          return total;
        }, 0);

        return {
          totalDue,
          paidThisMonth,
          pendingBills: bills.filter((bill) => bill.status === 'pending').length,
          overdueBills: bills.filter((bill) => bill.status === 'overdue').length,
          monthlySubscriptions,
          expiringWarranties: warranties.filter((item) => {
            const expirationDate = item.expirationDate.toDate();
            return expirationDate >= now && expirationDate <= warrantyExpiryWindow;
          }).length,
          securityScore:
            passwords.length === 0
              ? 100
              : Math.round(
                  (passwords.filter((item) => item.strength !== 'weak').length /
                    passwords.length) *
                    100,
                ),
          weakPasswords: passwords.filter((item) => item.strength === 'weak').length,
          uploadedDocuments: documents.filter((item) => item.sourceKind === 'upload').length,
        };
      },

      getDashboardInsights: () => {
        const { bills, subscriptions, warranties, documents } = get();
        const insights: DashboardInsight[] = [];

        // 1. Subscription Spending Trend (MoM approximation using createdAt)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        const currentSubTotal = subscriptions.reduce((total, s) => {
          const monthlyAmount = s.billingPeriod === 'yearly' ? s.amount / 12 : 
                              s.billingPeriod === 'quarterly' ? s.amount / 3 : s.amount;
          return total + monthlyAmount;
        }, 0);

        const newSubsLast30Days = subscriptions.filter(s => s.createdAt?.toDate() > thirtyDaysAgo);
        const newSubMonthlyIncrease = newSubsLast30Days.reduce((total, s) => {
          const monthlyAmount = s.billingPeriod === 'yearly' ? s.amount / 12 : 
                              s.billingPeriod === 'quarterly' ? s.amount / 3 : s.amount;
          return total + monthlyAmount;
        }, 0);

        if (newSubMonthlyIncrease > 0) {
          const percentage = Math.round((newSubMonthlyIncrease / (currentSubTotal || 1)) * 100);
          insights.push({
            id: 'sub-spending',
            type: 'spending',
            title: 'Subscription Spending Up',
            description: `Monthly costs increased by approx. ${percentage}% due to ${newSubsLast30Days.length} new addition(s).`,
            trend: { value: percentage, isGood: false },
            actionLabel: 'Manage Subs',
            actionRoute: 'subscriptions'
          });
        }

        // 2. Critical Alerts: Overdue Bills
        const overdue = bills.filter(b => b.status === 'overdue');
        if (overdue.length > 0) {
          insights.push({
            id: 'overdue-bills',
            type: 'alert',
            title: 'Overdue Bills Detected',
            description: `You have ${overdue.length} overdue bill(s) requiring immediate attention.`,
            actionLabel: 'Pay Now',
            actionRoute: 'bills'
          });
        }

        // 3. Proactive: Expiring Warranties
        const expiringWarranties = warranties.filter(w => {
          const diff = w.expirationDate.toDate().getTime() - new Date().getTime();
          const days = diff / (1000 * 60 * 60 * 24);
          return days > 0 && days <= 30;
        });

        if (expiringWarranties.length > 0) {
          insights.push({
            id: 'expiring-warranties',
            type: 'alert',
            title: 'Warranties Expiring Soon',
            description: `${expiringWarranties.length} item(s) will lose coverage within the next 30 days.`,
            actionLabel: 'Check Coverage',
            actionRoute: 'warranties'
          });
        }

        // 4. Savings/Cleanup: Massive unreviewed documents
        const unreviewed = documents.filter(d => d.reviewStatus === 'needs_review');
        if (unreviewed.length > 5) {
          insights.push({
            id: 'cleanup-docs',
            type: 'info',
            title: 'Document Cleanup',
            description: `You have ${unreviewed.length} uploads pending review. Finish them to keep your vault organized.`,
            actionLabel: 'Review Vault',
            actionRoute: 'documents'
          });
        }

        return insights;
      },

      getUpcomingItems: (days) => {
        const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const items: UpcomingItem[] = [];

        get().bills.forEach((bill) => {
          if (bill.dueDate.toDate() <= end && bill.status !== 'paid') {
            items.push({
              id: bill.id,
              type: 'bill',
              title: bill.title,
              date: bill.dueDate,
              amount: bill.amount,
              urgency: 'soon',
            });
          }
        });

        get().subscriptions.forEach((subscription) => {
          if (subscription.nextRenewalDate.toDate() <= end) {
            items.push({
              id: subscription.id,
              type: 'subscription',
              title: subscription.name,
              date: subscription.nextRenewalDate,
              amount: subscription.amount,
              urgency: 'future',
            });
          }
        });

        get().warranties.forEach((warranty) => {
          if (warranty.expirationDate.toDate() <= end) {
            items.push({
              id: warranty.id,
              type: 'warranty',
              title: warranty.productName,
              date: warranty.expirationDate,
              urgency: 'soon',
            });
          }
        });

        get().documents.forEach((document) => {
          if (document.expirationDate && document.expirationDate.toDate() <= end) {
            items.push({
              id: document.id,
              type: 'document',
              title: document.title,
              date: document.expirationDate,
              urgency: 'future',
            });
          }
        });

        get().reminders.forEach((reminder) => {
          if (reminder.status === 'pending' && reminder.dueDate.toDate() <= end) {
            items.push({
              id: reminder.id,
              type: 'reminder',
              title: reminder.title,
              date: reminder.dueDate,
              urgency: 'soon',
            });
          }
        });

        return items
          .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())
          .slice(0, 10);
      },

      getExpiringWarranties: (days) => {
        const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return get().warranties.filter((item) => item.expirationDate.toDate() <= end);
      },

      getOverdueBills: () => get().bills.filter((bill) => bill.status === 'overdue'),

      getDocumentsBySection: (section) => {
        return get().activeDocuments.filter((doc) => doc.section === section);
      },

      getPendingReminders: () => get().reminders.filter((item) => item.status === 'pending'),

      subscribeToData: () => {
        const userId = getUserId();
        if (!userId) return () => {};

        const unsubscribers = [
          onSnapshot(
            query(collection(db, 'users', userId, 'bills'), orderBy('dueDate', 'asc')),
            (snapshot) => {
              const bills = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Bill);
              set({ bills });
              ensureMissingItemReminderRepairs(
                userId,
                get().reminders,
                bills.map((bill) => ({
                  id: bill.id,
                  title: bill.title,
                  sourceDocumentId: bill.sourceDocumentId,
                  relatedItemType: 'bill',
                  section: 'bills',
                  targetDate: bill.dueDate,
                  isActive: bill.status !== 'paid',
                })),
              );
            },
            (error) => reportFirestoreSyncError('bills', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'subscriptions'), orderBy('nextRenewalDate', 'asc')),
            (snapshot) => {
              const subscriptions = snapshot.docs.map(
                (item) => ({ id: item.id, ...item.data() }) as Subscription,
              );
              set({
                subscriptions,
              });
              ensureMissingItemReminderRepairs(
                userId,
                get().reminders,
                subscriptions.map((subscription) => ({
                  id: subscription.id,
                  title: subscription.name,
                  sourceDocumentId: subscription.sourceDocumentId,
                  relatedItemType: 'subscription',
                  section: 'subscriptions',
                  targetDate: subscription.nextRenewalDate,
                })),
              );
            },
            (error) => reportFirestoreSyncError('subscriptions', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'warranties'), orderBy('expirationDate', 'asc')),
            (snapshot) => {
              const warranties = snapshot.docs.map(
                (item) => ({ id: item.id, ...item.data() }) as Warranty,
              );
              set({
                warranties,
              });
              ensureMissingItemReminderRepairs(
                userId,
                get().reminders,
                warranties.map((warranty) => ({
                  id: warranty.id,
                  title: warranty.productName,
                  sourceDocumentId: warranty.sourceDocumentId,
                  relatedItemType: 'warranty',
                  section: 'warranties',
                  targetDate: warranty.expirationDate,
                })),
              );
            },
            (error) => reportFirestoreSyncError('warranties', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'documents'), orderBy('createdAt', 'desc')),
            (snapshot) => {
              const docs = snapshot.docs.map(
                (item) => ({ id: item.id, ...item.data() }) as Document,
              );
              set({
                documents: docs,
                activeDocuments: docs.filter((d) => !d.replacedByDocumentId),
                reminders: filterVisibleReminders(get().reminders),
              });
              ensureMissingBillReminderRepairs(userId, docs, get().reminders);
            },
            (error) => reportFirestoreSyncError('documents', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'passwords'), orderBy('updatedAt', 'desc')),
            (snapshot) => {
              const fetchedPasswords = snapshot.docs.map(
                (item) => ({ id: item.id, ...item.data() }) as Password,
              );

              repairMalformedPasswordStrengthRecords(userId, fetchedPasswords);

              set({
                passwords: fetchedPasswords.map(normalizePasswordRecord),
              });
            },
            (error) => reportFirestoreSyncError('passwords', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'reminders'), orderBy('dueDate', 'asc')),
            (snapshot) => {
              const reminders = snapshot.docs.map(
                (item) => ({ id: item.id, ...item.data() }) as Reminder,
              );
              set({
                reminders: filterVisibleReminders(reminders),
              });
            },
            (error) => reportFirestoreSyncError('reminders', error),
          ),
          onSnapshot(
            query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc')),
            (snapshot) => {
              set({
                notifications: dedupeNotifications(
                  snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Notification),
                ),
              });
            },
            (error) => reportFirestoreSyncError('notifications', error),
          ),
        ];

        return () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      },
    }),
    {
      name: 'arcora-data-storage',
      partialize: () => ({}),
    },
  ),
);
