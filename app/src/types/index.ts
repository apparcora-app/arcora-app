import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  settings: UserSettings;
  masterPasswordHash?: string;
}

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
  title: string;
  amount: number;
  currency: string;
  dueDate: Timestamp;
  category: BillCategory;
  status: BillStatus;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  notes?: string;
  attachments?: string[];
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SubscriptionCategory = 'entertainment' | 'work' | 'health' | 'utilities' | 'shopping' | 'other';
export type BillingPeriod = 'monthly' | 'yearly' | 'quarterly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  nextRenewalDate: Timestamp;
  category: SubscriptionCategory;
  cancellationUrl?: string;
  notes?: string;
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Warranty {
  id: string;
  productName: string;
  purchaseDate: Timestamp;
  warrantyDurationMonths: number;
  expirationDate: Timestamp;
  retailer?: string;
  warrantyProvider?: string;
  contactInfo?: string;
  receiptUrl?: string;
  warrantyCardUrl?: string;
  notes?: string;
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DocumentType =
  | 'passport'
  | 'license'
  | 'insurance'
  | 'contract'
  | 'invoice'
  | 'receipt'
  | 'statement'
  | 'bill'
  | 'challan'
  | 'tax-document'
  | 'warranty'
  | 'password-export'
  | 'reminder-note'
  | 'other';

export type DetectedDateType = 'due_date' | 'expiry_date' | 'renewal_date' | 'issue_date' | 'deadline' | 'unknown';

export interface DetectedDate {
  date: Timestamp;
  type: DetectedDateType;
  confidence: number;
  sourceText: string;
  confirmed: boolean;
}

export type AppSection =
  | 'dashboard'
  | 'bills'
  | 'subscriptions'
  | 'warranties'
  | 'documents'
  | 'passwords'
  | 'reminders'
  | 'others';

export type UploadParserStatus = 'pending' | 'parsed' | 'partial' | 'failed';
export type UploadReviewStatus = 'needs_review' | 'reviewed' | 'finalized';

export interface ExtractedBillData {
  providerName?: string;
  invoiceNumber?: string;
  referenceNumber?: string;
  psid?: string;
  billingMonth?: string;
  issueDateText?: string;
  dueDateText?: string;
  amountDue?: number;
  lateAmount?: number; // The surcharge/penalty amount itself
  lateAmountPayable?: number; // Total amount to pay after due date
  accountNumber?: string;
  customerNumber?: string;
  currency?: 'USD' | 'PKR';
}

export interface ExtractedDocumentData {
  summary?: string;
  bill?: ExtractedBillData;
  serialNumber?: string;
  merchantName?: string;
  policyNumber?: string;
  documentNumber?: string;
  dueDateText?: string;
  issueDateText?: string;
  expirationDateText?: string;
  rawFields?: Record<string, string>;
  // For matching
  merchant?: string;
  productName?: string;
  amount?: number;
  invoiceNumber?: string;
  providerName?: string;
  taxInfo?: {
    ssn?: string;
    ein?: string;
    ntn?: string;
    cnic?: string;
  };
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  section: AppSection;
  documentNumber?: string;
  issueDate?: Timestamp;
  expirationDate?: Timestamp;
  fileUrl: string;
  storagePath?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  detectedDates?: DetectedDate[];
  reminderSent: ReminderSentStatus;
  parserStatus?: UploadParserStatus;
  reviewStatus?: UploadReviewStatus;
  classificationConfidence?: number;
  extractedText?: string;
  extractedData?: ExtractedDocumentData;
  tags?: string[];
  sourceKind?: 'manual' | 'upload';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Duplicate Tracking
  duplicateStatus?: 'exact' | 'likely' | 'possible';
  duplicateOfDocumentId?: string;
  supersedesDocumentId?: string;
  replacedByDocumentId?: string;
}

export type PasswordCategory = 'social' | 'finance' | 'work' | 'shopping' | 'entertainment' | 'other';
export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

export interface Password {
  id: string;
  serviceName: string;
  serviceUrl?: string;
  username?: string;
  password: string;
  category: PasswordCategory;
  strength: PasswordStrength;
  lastChanged: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PriorityLevel = 'high' | 'medium' | 'low';
export type ReminderCategory = 'health' | 'finance' | 'personal' | 'work' | 'other';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RelatedItemType = 'bill' | 'subscription' | 'warranty' | 'document';
export type ReminderAutoKind =
  | '30_day_before'
  | '7_day_before'
  | '1_day_before'
  | '3_day_before'
  | 'day_of'
  | '1_day_after'
  | 'overdue';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp;
  priority: PriorityLevel;
  category: ReminderCategory;
  status: ReminderStatus;
  isRecurring: boolean;
  recurrencePattern?: RecurringPattern;
  relatedItemType?: RelatedItemType;
  relatedItemId?: string;
  reminderSent: ReminderSentStatus;
  sourceDocumentId?: string;
  autoGenerated?: boolean;
  autoGeneratedKind?: ReminderAutoKind;
  targetDate?: Timestamp;
  pushSentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NotificationType = 'reminder' | 'alert' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedItemType?: string;
  relatedItemId?: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface NotificationDevice {
  id: string;
  token: string;
  platform: 'web';
  notificationsEnabled: boolean;
  userAgent?: string;
  language?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastSeenAt?: Timestamp | FieldValue;
}

export interface DashboardStats {
  totalDue: number;
  paidThisMonth: number;
  pendingBills: number;
  overdueBills: number;
  monthlySubscriptions: number;
  expiringWarranties: number;
  securityScore: number;
  weakPasswords: number;
  uploadedDocuments: number;
}

export type InsightType = 'spending' | 'saving' | 'alert' | 'info';

export interface DashboardInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  trend?: {
    value: number;
    isGood: boolean;
  };
  actionLabel?: string;
  actionRoute?: AppSection;
}

export interface UpcomingItem {
  id: string;
  type: 'bill' | 'subscription' | 'warranty' | 'document' | 'reminder';
  title: string;
  date: Timestamp;
  amount?: number;
  urgency: 'urgent' | 'soon' | 'future';
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Timestamp;
  type: 'bill' | 'subscription' | 'warranty' | 'document' | 'reminder';
  completed: boolean;
}

export type Theme = 'dark' | 'light';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  dates: DetectedDate[];
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export interface ElectronAPI {
  notifications?: {
    show: (title: string, body: string) => void;
  };
  app?: {
    quit: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  platform?: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export interface BillFormData {
  title: string;
  amount: string;
  dueDate: Date;
  category: BillCategory;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  notes?: string;
}

export interface UploadDraft {
  title: string;
  type: DocumentType;
  section: AppSection;
  classificationConfidence: number;
  parserStatus: UploadParserStatus;
  reviewStatus: UploadReviewStatus;
  extractedText: string;
  extractedData: ExtractedDocumentData;
  detectedDates: DetectedDate[];
  tags: string[];
  suggestedBill?: Partial<Bill>;
}

export interface UploadableDocumentInput {
  file: File;
  draft: UploadDraft;
}
