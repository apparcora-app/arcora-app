import { z } from 'zod';

export const AiExtractionResultSchema = z.object({
  providerName: z.string().nullable().default(null),
  billingMonth: z.string().nullable().default(null),
  issueDateText: z.string().nullable().default(null),
  dueDateText: z.string().nullable().default(null),
  amountDue: z.number().nullable().default(null),
  lateAmount: z.number().nullable().default(null),
  lateAmountPayable: z.number().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.5),
  reason: z.string().default(''),
  suggestedCategory: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

/**
 * Standard OpenAI Structured Output JSON Schema definition
 */
export const openAiExtractionJsonSchema = {
  name: 'ExtractionResult',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      providerName: {
        type: ['string', 'null'],
        description: 'Utility or service provider, e.g. FESCO, K-Electric, Netflix, Verizon.',
      },
      billingMonth: {
        type: ['string', 'null'],
        description: "Billing month or period, e.g. 'Feb23', 'June 2024'.",
      },
      issueDateText: {
        type: ['string', 'null'],
        description: "Exact issue date text, e.g. '25-Feb-2024'.",
      },
      dueDateText: {
        type: ['string', 'null'],
        description: "Exact due date text, e.g. '18-Mar-2024'.",
      },
      amountDue: {
        type: ['number', 'null'],
        description: 'Total amount due within the due date. DO NOT include late charges.',
      },
      lateAmount: {
        type: ['number', 'null'],
        description: 'Late payment penalty ONLY, not the total after due date.',
      },
      lateAmountPayable: {
        type: ['number', 'null'],
        description: 'Total amount to pay AFTER the due date including late penalty.',
      },
      confidence: {
        type: 'number',
        description: 'Confidence score between 0.0 and 1.0.',
      },
      reason: {
        type: 'string',
        description: 'Short explanation of how values were parsed.',
      },
    },
    required: [
      'providerName',
      'billingMonth',
      'issueDateText',
      'dueDateText',
      'amountDue',
      'lateAmount',
      'lateAmountPayable',
      'confidence',
      'reason',
    ],
    additionalProperties: false,
  },
};
