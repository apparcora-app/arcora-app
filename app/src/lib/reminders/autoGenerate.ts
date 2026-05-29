import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Document,
  UploadDraft,
  Reminder,
  ReminderAutoKind,
  ReminderCategory,
  PriorityLevel,
  RelatedItemType,
  ReminderTimingSettings,
} from '@/types';

type TimestampLike = Timestamp | { seconds: number };

const toDateFromTimestampLike = (value: TimestampLike): Date =>
  value instanceof Timestamp ? value.toDate() : new Date(value.seconds * 1000);

const defaultReminderTimingSettings: ReminderTimingSettings = {
  thirtyDaysBefore: true,
  sevenDaysBefore: true,
  oneDayBefore: true,
  onDueDate: true,
};

interface AutomaticReminderTarget {
  title: string;
  section?: string;
  targetDate: Date;
  sourceDocumentId?: string;
  relatedItemType?: RelatedItemType;
  relatedItemId?: string;
}

const getRelatedItemTypeForSection = (section?: string): RelatedItemType | undefined => {
  if (section === 'bills') return 'bill';
  if (section === 'subscriptions') return 'subscription';
  if (section === 'warranties') return 'warranty';
  if (section === 'documents' || section === 'passports' || section === 'identities') {
    return 'document';
  }

  return undefined;
};

function getReminderTargetLabel(section: string | undefined): string {
  if (section === 'bills') return 'Bill due date';
  if (section === 'subscriptions') return 'Renewal date';
  if (section === 'warranties') return 'Coverage end date';
  if (section === 'documents' || section === 'passports' || section === 'identities') {
    return 'Expiry date';
  }

  return 'Target date';
}

/**
 * Normalizes a raw string to a JS Date. Handles strictly typed formats or falls back.
 */
function attemptParseStringWarning(text?: string): Date | null {
  if (!text) return null;
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d;

  // DD/MM/YYYY or DD-MM-YYYY
  const numMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numMatch) {
    const p1 = Number(numMatch[1]);
    const p2 = Number(numMatch[2]);
    let yr = Number(numMatch[3]);
    if (yr < 100) yr += 2000;
    
    // priority: generic DD/MM
    const fallback = new Date(yr, p2 - 1, p1);
    if (!isNaN(fallback.getTime())) return fallback;
  }
  return null;
}

/**
 * Digs through a Document or Draft to find the absolute most reliable target deadline.
 */
export function resolvePrimaryDeadline(docData: Document | UploadDraft): Date | null {
  // 1. Explicit UI-provided fields (highest priority because user manually set them or confirmed them)
  if ('expirationDate' in docData && docData.expirationDate instanceof Timestamp) {
    return docData.expirationDate.toDate();
  }
  if ('dueDate' in docData && docData.dueDate instanceof Timestamp) {
    return docData.dueDate.toDate();
  }
  // If it's a draft mapped to a suggested bill
  if ('suggestedBill' in docData && docData.suggestedBill?.dueDate instanceof Timestamp) {
    return docData.suggestedBill.dueDate.toDate();
  }

  // 2. High confidence detected machine dates
  let bestDetected: Date | null = null;
  let bestConfidence = -1;

  if (docData.detectedDates && docData.detectedDates.length > 0) {
    for (const d of docData.detectedDates) {
      if (['due_date', 'expiry_date', 'deadline', 'renewal_date'].includes(d.type)) {
        if (d.confirmed) {
          // Absolute highest if user manually confirmed a specific chip
          return toDateFromTimestampLike(d.date);
        }
        if (d.confidence > bestConfidence) {
          bestConfidence = d.confidence;
          bestDetected = toDateFromTimestampLike(d.date);
        }
      }
    }
  }

  if (bestDetected) return bestDetected;

  // 3. Extracted raw text fields as fallback
  const ext = docData.extractedData;
  if (ext) {
    const rawDue = ext.bill?.dueDateText || ext.dueDateText || ext.expirationDateText;
    if (rawDue) {
      const parsed = attemptParseStringWarning(rawDue);
      if (parsed) return parsed;
    }
  }

  return null;
}

/**
 * Builds the array of 4 Reminder payloads (-7, -3, 0, +1 day).
 * Excludes ones that fall strictly prior to 'today' (unless target is past, then returns 'overdue' only).
 */
export function buildAutomaticReminders(
  target: AutomaticReminderTarget,
  settings: ReminderTimingSettings = defaultReminderTimingSettings,
): Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { title, section, targetDate, sourceDocumentId, relatedItemType, relatedItemId } = target;
  const now = new Date();
  
  // Strip times so we strictly compare midnight-to-midnight (user timezone)
  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetAtMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const isBill = section === 'bills';
  const isDoc = section === 'documents' || section === 'passports' || section === 'identities';
  const isSub = section === 'subscriptions';
  const isWar = section === 'warranties';
  const targetLabel = getReminderTargetLabel(section);
  const resolvedRelatedItemType = relatedItemType ?? getRelatedItemTypeForSection(section);

  const category: ReminderCategory = isBill ? 'finance' : isWar ? 'other' : 'personal';
  let verb = isBill ? 'due' : isWar ? 'expires' : isSub ? 'renews' : 'expires';
  // Fallback verb
  if (!isBill && !isDoc && !isSub && !isWar) verb = 'due';

  const safeTitle = title || 'Document';

  // Overdue single reminder if target date was yesterday or earlier
  if (targetAtMidnight.getTime() < todayAtMidnight.getTime()) {
    return [
      {
        title: safeTitle,
        description: `Automatic reminder. ${targetLabel}: ${targetDate.toLocaleDateString()}. This item is already overdue.`,
        dueDate: Timestamp.fromDate(targetAtMidnight), // pin to target date so it stays constant and needsRebuild doesn't trigger daily
        status: 'pending',
        priority: 'high' as PriorityLevel,
        category,
        isRecurring: false,
        sourceDocumentId,
        autoGenerated: true,
        autoGeneratedKind: 'overdue',
        targetDate: Timestamp.fromDate(targetDate),
        relatedItemType: resolvedRelatedItemType,
        relatedItemId,
        reminderSent: {
          thirtyDays: false,
          sevenDays: false,
          oneDay: false,
          onDueDate: false,
        }
      }
    ];
  }

  const candidates: Array<{
    trigger: Date;
    kind: ReminderAutoKind;
    titleSuffix: string;
    priority: PriorityLevel;
  }> = [];

  const pushCandidate = (
    daysBefore: number,
    kind: ReminderAutoKind,
    titleSuffix: string,
    priority: PriorityLevel,
    enabled: boolean,
  ) => {
    if (!enabled) return;

    const trigger = new Date(targetAtMidnight);
    trigger.setDate(trigger.getDate() - daysBefore);

    if (trigger.getTime() < todayAtMidnight.getTime()) return;

    candidates.push({
      trigger,
      kind,
      titleSuffix,
      priority,
    });
  };

  pushCandidate(30, '30_day_before', `${verb} in 30 days`, 'low', settings.thirtyDaysBefore);
  pushCandidate(7, '7_day_before', `${verb} in 7 days`, 'medium', settings.sevenDaysBefore);
  pushCandidate(1, '1_day_before', `${verb} tomorrow`, 'medium', settings.oneDayBefore);
  pushCandidate(0, 'day_of', `${verb} today`, 'high', settings.onDueDate);

  return candidates
    .sort((left, right) => left.trigger.getTime() - right.trigger.getTime())
    .map((candidate) => ({
      title: safeTitle,
      description: `Automatic reminder. ${targetLabel}: ${targetDate.toLocaleDateString()}. Reminder date: ${candidate.trigger.toLocaleDateString()}.`,
      dueDate: Timestamp.fromDate(candidate.trigger),
      status: 'pending',
      priority: candidate.priority,
      category,
      isRecurring: false,
      sourceDocumentId,
      autoGenerated: true,
      autoGeneratedKind: candidate.kind,
      targetDate: Timestamp.fromDate(targetDate),
      relatedItemType: resolvedRelatedItemType,
      relatedItemId,
      reminderSent: {
        thirtyDays: false,
        sevenDays: false,
        oneDay: false,
        onDueDate: false,
      },
    }));
}

/**
 * The orchestrator hooked into dataStore.ts.
 * Checks for existing auto-generated reminders, deletes stale ones (if target diff),
 * creates new ones via Firestore Batched Writes to protect duplicates.
 */
const loadExistingAutoReminders = async (
  userId: string,
  sourceDocumentId?: string,
  relatedItemType?: RelatedItemType,
  relatedItemId?: string,
) => {
  if (!sourceDocumentId && !(relatedItemType && relatedItemId)) {
    return [] as Reminder[];
  }

  const remindersRef = collection(db, 'users', userId, 'reminders');
  const snapshot = sourceDocumentId
    ? await getDocs(
        query(
          remindersRef,
          where('sourceDocumentId', '==', sourceDocumentId),
          where('autoGenerated', '==', true),
        ),
      )
    : await getDocs(
        query(
          remindersRef,
          where('relatedItemType', '==', relatedItemType),
          where('relatedItemId', '==', relatedItemId),
          where('autoGenerated', '==', true),
        ),
      );

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Reminder);
};

const syncAutomaticReminders = async (
  userId: string,
  target: Omit<AutomaticReminderTarget, 'targetDate'> & { targetDate: Date | null },
  settings: ReminderTimingSettings = defaultReminderTimingSettings,
) => {
  if (!userId) return;

  const { sourceDocumentId, relatedItemType, relatedItemId, targetDate } = target;
  const remindersRef = collection(db, 'users', userId, 'reminders');
  const existingReminders = await loadExistingAutoReminders(
    userId,
    sourceDocumentId,
    relatedItemType,
    relatedItemId,
  );

  if (!targetDate) {
    if (existingReminders.length === 0) return;

    const cleanupBatch = writeBatch(db);
    existingReminders.forEach((reminder) => {
      cleanupBatch.delete(doc(db, 'users', userId, 'reminders', reminder.id));
    });
    await cleanupBatch.commit();
    return;
  }

  const generatedList = buildAutomaticReminders(
    {
      ...target,
      targetDate,
    },
    settings,
  );

  const generatedByKind = new Map(
    generatedList.map((item) => [item.autoGeneratedKind as ReminderAutoKind, item]),
  );

  const needsRebuild =
    existingReminders.length !== generatedList.length ||
    existingReminders.some((reminder) => {
      if (!reminder.autoGeneratedKind || !reminder.targetDate) {
        return true;
      }

      const generated = generatedByKind.get(reminder.autoGeneratedKind);
      if (!generated) {
        return true;
      }

      return (
        reminder.title !== generated.title ||
        reminder.description !== generated.description ||
        reminder.priority !== generated.priority ||
        reminder.dueDate.seconds !== generated.dueDate.seconds ||
        reminder.targetDate.seconds !== generated.targetDate?.seconds ||
        reminder.relatedItemType !== generated.relatedItemType ||
        reminder.relatedItemId !== generated.relatedItemId
      );
    });

  if (!needsRebuild) {
    return;
  }

  const batch = writeBatch(db);

  existingReminders.forEach((reminder) => {
    batch.delete(doc(db, 'users', userId, 'reminders', reminder.id));
  });

  generatedList.forEach((payload) => {
    const reminderRef = doc(remindersRef);
    batch.set(reminderRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export async function syncDocumentReminders(
  userId: string,
  documentId: string,
  docData: Document | UploadDraft,
  settings: ReminderTimingSettings = defaultReminderTimingSettings,
): Promise<void> {
  if (!userId || !documentId) return;

  await syncAutomaticReminders(
    userId,
    {
      title: docData.title,
      section: docData.section,
      targetDate: resolvePrimaryDeadline(docData),
      sourceDocumentId: documentId,
      relatedItemType: getRelatedItemTypeForSection(docData.section),
      relatedItemId: documentId,
    },
    settings,
  );
}

export async function syncItemReminders(
  userId: string,
  itemId: string,
  itemType: RelatedItemType,
  title: string,
  section: string | undefined,
  targetDate: Date | null,
  settings: ReminderTimingSettings = defaultReminderTimingSettings,
): Promise<void> {
  if (!userId || !itemId) return;

  await syncAutomaticReminders(
    userId,
    {
      title,
      section,
      targetDate,
      relatedItemType: itemType,
      relatedItemId: itemId,
    },
    settings,
  );
}
