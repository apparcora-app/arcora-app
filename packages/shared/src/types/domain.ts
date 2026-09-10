/**
 * Core Universal Domain Types for Arcora Platform
 */

export interface TimestampLike {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

export type FirestoreDate = TimestampLike | { toDate: () => Date } | Date | string;

export interface UserSettings {
  theme: 'dark' | 'light';
  notifications: NotificationSettings;
  reminderTiming: ReminderTimingSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  billReminders: boolean;
  warrantyAlerts: boolean;
  securityAlerts: boolean;
}

export interface ReminderTimingSettings {
  thirtyDaysBefore: boolean;
  sevenDaysBefore: boolean;
  oneDayBefore: boolean;
  onDueDate: boolean;
}

export interface ReminderSentStatus {
  thirtyDays: boolean;
  sevenDays: boolean;
  oneDay: boolean;
  onDueDate: boolean;
}

export type BillCategory = 'utilities' | 'housing' | 'insurance' | 'credit-card' | 'loan' | 'other';
export type BillStatus = 'paid' | 'pending' | 'overdue';
export type RecurrencePattern = 'monthly' | 'quarterly' | 'yearly';

export interface Bill {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: FirestoreDate;
  category: BillCategory;
  status: BillStatus;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  notes?: string;
  attachments?: string[];
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export type SubscriptionCategory = 'entertainment' | 'work' | 'health' | 'utilities' | 'shopping' | 'other';
export type BillingPeriod = 'monthly' | 'yearly' | 'quarterly';

export interface Subscription {
  id: string;
  userId?: string;
  name: string;
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  nextRenewalDate: FirestoreDate;
  category: SubscriptionCategory;
  cancellationUrl?: string;
  notes?: string;
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface Warranty {
  id: string;
  userId?: string;
  productName: string;
  purchaseDate: FirestoreDate;
  warrantyDurationMonths: number;
  expirationDate: FirestoreDate;
  retailer?: string;
  warrantyProvider?: string;
  contactInfo?: string;
  receiptUrl?: string;
  warrantyCardUrl?: string;
  notes?: string;
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export type DocumentCategory =
  | 'bill'
  | 'receipt'
  | 'warranty'
  | 'id'
  | 'medical'
  | 'tax'
  | 'insurance'
  | 'education'
  | 'employment'
  | 'vehicle'
  | 'property'
  | 'subscription'
  | 'other';

export interface DocumentMetadata {
  id: string;
  userId?: string;
  title: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  tags: string[];
  extractedText?: string;
  ocrConfidence?: number;
  linkedEntityType?: 'bill' | 'subscription' | 'warranty';
  linkedEntityId?: string;
  notes?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface PasswordEntry {
  id: string;
  userId?: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  category: 'personal' | 'work' | 'finance' | 'social' | 'other';
  notes?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface Reminder {
  id: string;
  userId?: string;
  title: string;
  targetDate: FirestoreDate;
  category: 'bill' | 'warranty' | 'subscription' | 'personal' | 'custom';
  entityId?: string;
  status: 'pending' | 'completed' | 'dismissed';
  notes?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface UploadDraft {
  title: string;
  category: DocumentCategory;
  amount?: number;
  currency?: string;
  dueDate?: string;
  extractedDate?: string;
  isRecurring?: boolean;
  confidence: number;
  rawText?: string;
  sourceType?: 'pdf' | 'image';
  suggestedFields?: Record<string, unknown>;
}
