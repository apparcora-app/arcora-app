import { z } from 'zod';

export const BillCategorySchema = z.enum([
  'utilities',
  'housing',
  'insurance',
  'credit-card',
  'loan',
  'other',
]);

export const BillStatusSchema = z.enum(['paid', 'pending', 'overdue']);

export const RecurrencePatternSchema = z.enum(['monthly', 'quarterly', 'yearly']);

export const BillSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('USD'),
  dueDate: z.any(),
  category: BillCategorySchema,
  status: BillStatusSchema.default('pending'),
  isRecurring: z.boolean().default(false),
  recurrencePattern: RecurrencePatternSchema.optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  reminderSent: z.object({
    thirtyDays: z.boolean().default(false),
    sevenDays: z.boolean().default(false),
    oneDay: z.boolean().default(false),
    onDueDate: z.boolean().default(false),
  }),
  sourceDocumentId: z.string().optional(),
});

export const SubscriptionCategorySchema = z.enum([
  'entertainment',
  'work',
  'health',
  'utilities',
  'shopping',
  'other',
]);

export const BillingPeriodSchema = z.enum(['monthly', 'yearly', 'quarterly']);

export const SubscriptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  amount: z.number().nonnegative('Amount cannot be negative'),
  currency: z.string().default('USD'),
  billingPeriod: BillingPeriodSchema,
  nextRenewalDate: z.any(),
  category: SubscriptionCategorySchema,
  cancellationUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  reminderSent: z.object({
    thirtyDays: z.boolean().default(false),
    sevenDays: z.boolean().default(false),
    oneDay: z.boolean().default(false),
    onDueDate: z.boolean().default(false),
  }),
  sourceDocumentId: z.string().optional(),
});

export const WarrantySchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  purchaseDate: z.any(),
  warrantyDurationMonths: z.number().int().nonnegative(),
  expirationDate: z.any(),
  retailer: z.string().optional(),
  warrantyProvider: z.string().optional(),
  contactInfo: z.string().optional(),
  receiptUrl: z.string().optional(),
  warrantyCardUrl: z.string().optional(),
  notes: z.string().optional(),
});
