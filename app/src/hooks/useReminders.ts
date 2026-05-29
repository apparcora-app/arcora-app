// Reminder Engine Hook
import { useEffect, useRef, useCallback } from 'react';
import { differenceInDays, startOfDay } from 'date-fns';
import { useDataStore } from '@/store/dataStore';
import { defaultSettings, useAuthStore } from '@/store/authStore';
import { showToast, showDesktopNotification } from '@/lib/notifications';
import type { Bill, Subscription, Warranty, Document, Reminder, ReminderSentStatus } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReminderCheck {
  item: Bill | Subscription | Warranty | Document | Reminder;
  type: 'bill' | 'subscription' | 'warranty' | 'document' | 'reminder';
  title: string;
  date: Timestamp;
  daysUntil: number;
  reminderType: 'oneDay' | 'onDueDate' | 'sevenDays' | 'thirtyDays';
  dedupeKey: string;
}

const REMINDER_DEDUPE_WINDOW_MS = 15000;
const REMINDER_DEDUPE_STORAGE_KEY = 'arcora_recent_reminder_triggers_v1';
const REMINDER_DEDUPE_LOCK_NAME = 'arcora-reminder-dedupe';

const pruneReminderTriggerMap = (triggers: Map<string, number>, now = Date.now()) => {
  triggers.forEach((timestamp, key) => {
    if (now - timestamp >= REMINDER_DEDUPE_WINDOW_MS) {
      triggers.delete(key);
    }
  });

  return triggers;
};

const loadStoredReminderTriggers = () => {
  if (typeof window === 'undefined') {
    return new Map<string, number>();
  }

  try {
    const rawValue = window.localStorage.getItem(REMINDER_DEDUPE_STORAGE_KEY);
    if (!rawValue) {
      return new Map<string, number>();
    }

    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
    const triggers = new Map<string, number>();

    Object.entries(parsedValue).forEach(([key, value]) => {
      if (typeof value === 'number') {
        triggers.set(key, value);
      }
    });

    return pruneReminderTriggerMap(triggers);
  } catch {
    return new Map<string, number>();
  }
};

const persistReminderTriggers = (triggers: Map<string, number>) => {
  if (typeof window === 'undefined') return;

  try {
    const activeTriggers = pruneReminderTriggerMap(new Map(triggers));

    if (activeTriggers.size === 0) {
      window.localStorage.removeItem(REMINDER_DEDUPE_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      REMINDER_DEDUPE_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(activeTriggers)),
    );
  } catch {
    // Ignore storage sync issues and keep the in-memory fallback.
  }
};

const withReminderTriggerLock = async <T,>(work: () => Promise<T>): Promise<T> => {
  const lockManager =
    typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks : undefined;

  if (!lockManager) {
    return work();
  }

  return lockManager.request(REMINDER_DEDUPE_LOCK_NAME, () => work());
};

export const useReminderEngine = () => {
  const bills = useDataStore((state) => state.bills);
  const subscriptions = useDataStore((state) => state.subscriptions);
  const warranties = useDataStore((state) => state.warranties);
  const documents = useDataStore((state) => state.documents);
  const reminders = useDataStore((state) => state.reminders);
  const deleteReminder = useDataStore((state) => state.deleteReminder);
  const user = useAuthStore((state) => state.user);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recentlyTriggeredRef = useRef<Map<string, number>>(new Map());
  const staleReminderCleanupRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncRecentlyTriggered = () => {
      recentlyTriggeredRef.current = loadStoredReminderTriggers();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === REMINDER_DEDUPE_STORAGE_KEY) {
        syncRecentlyTriggered();
      }
    };

    syncRecentlyTriggered();
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const normalizeReminderSent = useCallback((value: unknown): ReminderSentStatus => {
    if (value && typeof value === 'object') {
      const reminderSent = value as Partial<ReminderSentStatus>;
      return {
        thirtyDays: !!reminderSent.thirtyDays,
        sevenDays: !!reminderSent.sevenDays,
        oneDay: !!reminderSent.oneDay,
        onDueDate: !!reminderSent.onDueDate,
      };
    }

    if (value === true) {
      return {
        thirtyDays: true,
        sevenDays: true,
        oneDay: true,
        onDueDate: true,
      };
    }

    return {
      thirtyDays: false,
      sevenDays: false,
      oneDay: false,
      onDueDate: false,
    };
  }, []);

  const getReminderSettings = useCallback(() => {
    return user?.settings?.reminderTiming || {
      oneDayBefore: true,
      onDueDate: true,
      sevenDaysBefore: true,
      thirtyDaysBefore: true,
    };
  }, [user]);

  const getNotificationSettings = useCallback(() => {
    return user?.settings?.notifications ?? defaultSettings.notifications;
  }, [user]);

  const isNotificationTypeEnabled = useCallback(
    (itemType: ReminderCheck['type']) => {
      const settings = getNotificationSettings();

      if (itemType === 'bill' || itemType === 'subscription') {
        return settings.billReminders;
      }

      if (itemType === 'warranty' || itemType === 'document') {
        return settings.warrantyAlerts;
      }

      return true;
    },
    [getNotificationSettings],
  );

  const getReminderWindowType = useCallback(
    (
      item: Bill | Subscription | Warranty | Document | Reminder,
      itemType: ReminderCheck['type'],
      daysUntil: number,
    ): ReminderCheck['reminderType'] | null => {
      if (itemType === 'reminder') {
        const reminder = item as Reminder;

        if (reminder.autoGenerated) {
          return daysUntil <= 0 ? 'onDueDate' : null;
        }
      }

      if (daysUntil <= 0) return 'onDueDate';
      if (daysUntil <= 1) return 'oneDay';
      if (daysUntil <= 7) return 'sevenDays';
      if (daysUntil <= 30) return 'thirtyDays';

      return null;
    },
    [],
  );

  const shouldSendReminder = useCallback((
    item: Bill | Subscription | Warranty | Document | Reminder,
    itemType: ReminderCheck['type'],
    reminderType: 'oneDay' | 'onDueDate' | 'sevenDays' | 'thirtyDays'
  ): boolean => {
    if (!isNotificationTypeEnabled(itemType)) {
      return false;
    }

    const settings = getReminderSettings();

    // Check if this reminder type is enabled
    if (reminderType === 'oneDay' && !settings.oneDayBefore) return false;
    if (reminderType === 'onDueDate' && !settings.onDueDate) return false;
    if (reminderType === 'sevenDays' && !settings.sevenDaysBefore) return false;
    if (reminderType === 'thirtyDays' && !settings.thirtyDaysBefore) return false;

    // Check if already sent
    if ('reminderSent' in item) {
      const reminderSent = normalizeReminderSent(item.reminderSent);
      if (reminderType === 'oneDay' && reminderSent.oneDay) return false;
      if (reminderType === 'onDueDate' && reminderSent.onDueDate) return false;
      if (reminderType === 'sevenDays' && reminderSent.sevenDays) return false;
      if (reminderType === 'thirtyDays' && reminderSent.thirtyDays) return false;
    }

    return true;
  }, [getReminderSettings, isNotificationTypeEnabled, normalizeReminderSent]);

  const hasAutoReminderForItem = useCallback(
    (
      itemType: 'bill' | 'subscription' | 'warranty' | 'document',
      itemId: string,
      sourceDocumentId?: string,
    ) => {
      return reminders.some((reminder) => {
        if (!reminder.autoGenerated) {
          return false;
        }

        if (sourceDocumentId && reminder.sourceDocumentId === sourceDocumentId) {
          return true;
        }

        return reminder.relatedItemType === itemType && reminder.relatedItemId === itemId;
      });
    },
    [reminders],
  );

  const shouldCleanPaidBillAutoReminder = useCallback(
    (reminder: Reminder) => {
      if (!reminder.autoGenerated || reminder.relatedItemType !== 'bill') {
        return false;
      }

      const relatedBill =
        (reminder.relatedItemId
          ? bills.find((bill) => bill.id === reminder.relatedItemId)
          : null) ??
        (reminder.sourceDocumentId
          ? bills.find((bill) => bill.sourceDocumentId === reminder.sourceDocumentId)
          : null);

      return relatedBill?.status === 'paid';
    },
    [bills],
  );

  const cleanupStaleAutoReminder = useCallback(
    async (reminderId: string) => {
      if (staleReminderCleanupRef.current.has(reminderId)) {
        return;
      }

      staleReminderCleanupRef.current.add(reminderId);

      try {
        await deleteReminder(reminderId);
      } catch (error) {
        console.warn('Unable to clean up a stale auto-generated reminder.', error);
      } finally {
        staleReminderCleanupRef.current.delete(reminderId);
      }
    },
    [deleteReminder],
  );

  const markReminderAsSent = useCallback(async (
    item: Bill | Subscription | Warranty | Document | Reminder,
    itemType: string,
    reminderType: 'oneDay' | 'onDueDate' | 'sevenDays' | 'thirtyDays'
  ) => {
    if (!user) return;

    try {
      const collectionMap: Record<string, string> = {
        bill: 'bills',
        subscription: 'subscriptions',
        warranty: 'warranties',
        document: 'documents',
        reminder: 'reminders',
      };

      const collection = collectionMap[itemType];
      if (!collection) return;

      const reminderSent = normalizeReminderSent(item.reminderSent);

      await updateDoc(doc(db, 'users', user.uid, collection, item.id), {
        reminderSent: {
          ...reminderSent,
          [reminderType]: true,
        },
        ...(itemType === 'reminder' ? { pushSentAt: serverTimestamp() } : {}),
      });
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

      if (errorCode === 'not-found' || errorCode === 'firestore/not-found') {
        return;
      }

      console.error('Error marking reminder as sent:', error);
    }
  }, [normalizeReminderSent, user]);

  const createHeaderNotification = useCallback(async (
    check: ReminderCheck,
    title: string,
    message: string,
  ) => {
    if (!user) return;

    const notificationId =
      check.type === 'reminder'
        ? `push_${check.item.id}_${check.date.seconds}`
        : [
            'reminder',
            check.type,
            check.item.id,
            check.reminderType,
            check.date.seconds,
          ].join('_');

    await setDoc(doc(db, 'users', user.uid, 'notifications', notificationId), {
      type: 'reminder',
      title,
      message,
      relatedItemType: check.type,
      relatedItemId: check.item.id,
      read: false,
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const buildReminderDedupeKey = useCallback(
    (
      item: Bill | Subscription | Warranty | Document | Reminder,
      type: ReminderCheck['type'],
      reminderType: ReminderCheck['reminderType'],
      date: Timestamp,
    ) => {
      return [user?.uid ?? 'anon', type, item.id, reminderType, date.seconds].join('_');
    },
    [user?.uid],
  );

  const hasRecentlyTriggered = useCallback((key: string) => {
    const now = Date.now();
    pruneReminderTriggerMap(recentlyTriggeredRef.current, now);

    const inMemoryTimestamp = recentlyTriggeredRef.current.get(key);
    if (inMemoryTimestamp) {
      return now - inMemoryTimestamp < REMINDER_DEDUPE_WINDOW_MS;
    }

    const storedTriggers = loadStoredReminderTriggers();
    const storedTimestamp = storedTriggers.get(key);
    if (!storedTimestamp) {
      persistReminderTriggers(storedTriggers);
      return false;
    }

    recentlyTriggeredRef.current.set(key, storedTimestamp);
    persistReminderTriggers(storedTriggers);
    return now - storedTimestamp < REMINDER_DEDUPE_WINDOW_MS;
  }, []);

  const markAsRecentlyTriggered = useCallback((key: string) => {
    const now = Date.now();
    pruneReminderTriggerMap(recentlyTriggeredRef.current, now);
    recentlyTriggeredRef.current.set(key, now);

    const storedTriggers = loadStoredReminderTriggers();
    storedTriggers.set(key, now);
    persistReminderTriggers(storedTriggers);
  }, []);

  const clearRecentlyTriggered = useCallback((key: string) => {
    recentlyTriggeredRef.current.delete(key);

    const storedTriggers = loadStoredReminderTriggers();
    if (storedTriggers.delete(key)) {
      persistReminderTriggers(storedTriggers);
    }
  }, []);

  const reserveRecentlyTriggered = useCallback(
    async (key: string) =>
      withReminderTriggerLock(async () => {
        if (hasRecentlyTriggered(key)) {
          return false;
        }

        markAsRecentlyTriggered(key);
        return true;
      }),
    [hasRecentlyTriggered, markAsRecentlyTriggered],
  );

  const sendReminderNotification = useCallback(async (check: ReminderCheck) => {
    const { item, type, title, date, daysUntil, reminderType, dedupeKey } = check;

    const notificationTitle = title;
    let notificationBody = '';
    const formattedDate = date.toDate().toLocaleDateString();
    const pushEnabled = getNotificationSettings().push;

    const buildTimingNotificationBody = (targetDateText: string) => {
      switch (reminderType) {
        case 'thirtyDays':
          return daysUntil < 30
            ? `Target date is ${targetDateText}. This is the earliest remaining heads-up before it gets closer.`
            : `Target date is ${targetDateText}. This is your 30-day heads-up.`;
        case 'sevenDays':
          return daysUntil < 7
            ? `Target date is ${targetDateText}. This item is now within the next week.`
            : `Target date is ${targetDateText}. This item is due in 7 days.`;
        case 'oneDay':
          return `Target date is ${targetDateText}. This item is due tomorrow.`;
        case 'onDueDate':
        default:
          return daysUntil < 0
            ? `Target date was ${targetDateText}. This item is now overdue.`
            : `Target date is ${targetDateText}. This item is due today.`;
      }
    };

    const reserved = await reserveRecentlyTriggered(dedupeKey);
    if (!reserved) {
      return;
    }

    try {
      if (type === 'reminder') {
        const reminder = item as Reminder;
        const targetDateText = reminder.targetDate?.toDate().toLocaleDateString() ?? formattedDate;

        if (reminder.autoGenerated) {
          notificationBody =
            reminder.description?.trim() ||
            (reminder.targetDate
              ? `Target date: ${targetDateText}. Reminder date: ${formattedDate}.`
              : `Reminder date: ${formattedDate}.`);
        } else {
          notificationBody = buildTimingNotificationBody(targetDateText);

          if (reminder.description?.trim()) {
            notificationBody = `${notificationBody} ${reminder.description.trim()}`.trim();
          }
        }
      } else {
        notificationBody = buildTimingNotificationBody(formattedDate);
      }

      // Show in-app toast
      showToast({
        title: notificationTitle,
        description: notificationBody,
        type: reminderType === 'onDueDate' ? 'warning' : 'info',
        duration: 6000,
      });

      if (pushEnabled) {
        showDesktopNotification({
          title: notificationTitle,
          body: notificationBody,
          tag: dedupeKey,
        });
      }

      await createHeaderNotification(check, notificationTitle, notificationBody);

      // Mark as sent
      await markReminderAsSent(item, type, reminderType);
    } catch (error) {
      clearRecentlyTriggered(dedupeKey);
      throw error;
    }
  }, [
    clearRecentlyTriggered,
    createHeaderNotification,
    getNotificationSettings,
    markReminderAsSent,
    reserveRecentlyTriggered,
  ]);

  const queueReminderCheck = useCallback((
    checks: ReminderCheck[],
    item: Bill | Subscription | Warranty | Document | Reminder,
    type: ReminderCheck['type'],
    title: string,
    date: Timestamp,
    daysUntil: number,
  ) => {
    const reminderType = getReminderWindowType(item, type, daysUntil);
    if (!reminderType) return;
    if (!shouldSendReminder(item, type, reminderType)) return;

    const dedupeKey = buildReminderDedupeKey(item, type, reminderType, date);
    if (hasRecentlyTriggered(dedupeKey)) return;

    checks.push({
      item,
      type,
      title,
      date,
      daysUntil,
      reminderType,
      dedupeKey,
    });
  }, [buildReminderDedupeKey, getReminderWindowType, hasRecentlyTriggered, shouldSendReminder]);

  const checkReminders = useCallback(() => {
    if (!user) return;

    const now = new Date();
    const today = startOfDay(now);
    const checks: ReminderCheck[] = [];
    const staleReminderIds: string[] = [];

    // Check bills
    bills.filter((b) => b.status !== 'paid').forEach((bill) => {
      if (hasAutoReminderForItem('bill', bill.id, bill.sourceDocumentId)) {
        return;
      }

      const dueDate = startOfDay(bill.dueDate.toDate());
      const daysUntil = differenceInDays(dueDate, today);
      queueReminderCheck(checks, bill, 'bill', bill.title, bill.dueDate, daysUntil);
    });

    // Check subscriptions
    subscriptions.forEach((sub) => {
      if (hasAutoReminderForItem('subscription', sub.id, sub.sourceDocumentId)) {
        return;
      }

      const renewalDate = startOfDay(sub.nextRenewalDate.toDate());
      const daysUntil = differenceInDays(renewalDate, today);
      queueReminderCheck(checks, sub, 'subscription', sub.name, sub.nextRenewalDate, daysUntil);
    });

    // Check warranties
    warranties.forEach((warranty) => {
      if (hasAutoReminderForItem('warranty', warranty.id, warranty.sourceDocumentId)) {
        return;
      }

      const expDate = startOfDay(warranty.expirationDate.toDate());
      const daysUntil = differenceInDays(expDate, today);
      queueReminderCheck(checks, warranty, 'warranty', warranty.productName, warranty.expirationDate, daysUntil);
    });

    // Check documents
    documents.filter((d) => d.expirationDate).forEach((doc) => {
      if (hasAutoReminderForItem('document', doc.id, doc.id)) {
        return;
      }

      const expDate = startOfDay(doc.expirationDate!.toDate());
      const daysUntil = differenceInDays(expDate, today);
      queueReminderCheck(checks, doc, 'document', doc.title, doc.expirationDate!, daysUntil);
    });

    // Check reminders
    reminders.filter((r) => r.status === 'pending').forEach((reminder) => {
      if (shouldCleanPaidBillAutoReminder(reminder)) {
        staleReminderIds.push(reminder.id);
        return;
      }

      const dueDate = startOfDay(reminder.dueDate.toDate());
      const daysUntil = differenceInDays(dueDate, today);
      queueReminderCheck(checks, reminder, 'reminder', reminder.title, reminder.dueDate, daysUntil);
    });

    staleReminderIds.forEach((reminderId) => {
      void cleanupStaleAutoReminder(reminderId);
    });

    // Send notifications
    checks.forEach((check) => {
      void sendReminderNotification(check);
    });

    return checks.length;
  }, [
    bills,
    subscriptions,
    warranties,
    documents,
    reminders,
    user,
    cleanupStaleAutoReminder,
    hasAutoReminderForItem,
    queueReminderCheck,
    sendReminderNotification,
    shouldCleanPaidBillAutoReminder,
  ]);

  const checkRemindersRef = useRef(checkReminders);

  useEffect(() => {
    checkRemindersRef.current = checkReminders;
  }, [checkReminders]);

  const userId = user?.uid;

  // Debounce checks while Firebase snapshots settle.
  useEffect(() => {
    if (!user) return;

    const timeoutId = globalThis.setTimeout(() => {
      checkRemindersRef.current();
    }, 750);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [user, checkReminders]);

  // Set up reminder checking interval.
  useEffect(() => {
    if (!userId) return;

    checkIntervalRef.current = setInterval(() => {
      checkRemindersRef.current();
    }, 60 * 60 * 1000); // 1 hour

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [userId]);

  // Check when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkReminders]);

  return {
    checkReminders,
  };
};

export default useReminderEngine;
