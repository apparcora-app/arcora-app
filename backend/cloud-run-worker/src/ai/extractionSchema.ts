export const extractionJsonSchema = {
  name: 'ExtractionResult',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      providerName: { type: ['string', 'null'], description: "Utility or service provider, e.g. FESCO, K-Electric, Netflix." },
      billingMonth: { type: ['string', 'null'], description: "Billing month or period, e.g. 'Feb23', 'June 2023'." },
      issueDateText: { type: ['string', 'null'], description: "Exact issue date text, e.g. '25-Feb-2023'." },
      dueDateText: { type: ['string', 'null'], description: "Exact due date text, e.g. '18-Mar-2023'." },
      amountDue: { type: ['number', 'null'], description: "Total amount due within the due date. DO NOT include late charges." },
      lateAmount: { type: ['number', 'null'], description: "Late payment penalty. ONLY the penalty, not the total after due date." },
      lateAmountPayable: { type: ['number', 'null'], description: "Total amount to pay AFTER the due date." },
      confidence: { type: 'number', description: "Confidence score between 0.0 and 1.0." },
      reason: { type: 'string', description: "Short explanation of how values were parsed." }
    },
    required: [
      'providerName', 'billingMonth', 'issueDateText', 'dueDateText',
      'amountDue', 'lateAmount', 'lateAmountPayable', 'confidence', 'reason'
    ],
    additionalProperties: false,
  }
};
