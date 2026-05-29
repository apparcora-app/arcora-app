import type { ExtractedBillData, UploadDraft } from '@/types';

export type DraftFieldSource = 'parser' | 'modernbert' | 'backend';

export interface BackendFieldSuggestion {
  id: string;
  field: keyof ExtractedBillData;
  label: string;
  currentValue: string;
  suggestedValue: string;
  rawSuggestedValue: string | number;
  reason: string;
}

interface BackendAssistMergeResult {
  draft: UploadDraft;
  suggestions: BackendFieldSuggestion[];
  appliedFields: string[];
}

const TRUSTED_BILL_PROVIDERS = new Set([
  'SNGPL',
  'SSGC',
  'PTCL',
  'K-Electric',
  'FESCO',
  'LESCO',
  'IESCO',
  'GEPCO',
  'MEPCO',
  'PESCO',
  'HESCO',
]);

const BILL_FIELD_LABELS: Record<keyof ExtractedBillData, string> = {
  providerName: 'Provider / Company',
  invoiceNumber: 'Invoice Number',
  referenceNumber: 'Reference Number',
  psid: 'PSID / Electronic ID',
  billingMonth: 'Billing Month / Period',
  issueDateText: 'Issue Date',
  dueDateText: 'Due Date / Deadline',
  amountDue: 'Amount Due / Total',
  lateAmount: 'Late Surcharge / Penalty',
  lateAmountPayable: 'Payable After Due Date',
  accountNumber: 'Account / Consumer #',
  customerNumber: 'Customer / Student #',
  currency: 'Currency',
};

const BILL_FIELDS = Object.keys(BILL_FIELD_LABELS) as Array<keyof ExtractedBillData>;

const isEmptyValue = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const normalizeString = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const areFieldValuesEqual = (left: unknown, right: unknown) => {
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) === Number(right);
  }

  if (typeof left === 'string' && typeof right === 'string') {
    return normalizeString(left) === normalizeString(right);
  }

  return left === right;
};

const formatSuggestionValue = (value: unknown) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return value.toLocaleString('en-US');
  return String(value);
};

const setFieldSource = (
  rawFields: Record<string, string>,
  fieldPath: string,
  source: DraftFieldSource,
) => {
  rawFields[`source:${fieldPath}`] = source;
};

const markExistingFieldsWithSource = (
  draft: UploadDraft,
  source: DraftFieldSource,
  onlyMissing = true,
): UploadDraft => {
  const rawFields = { ...(draft.extractedData.rawFields ?? {}) };

  const mark = (fieldPath: string, value: unknown) => {
    if (isEmptyValue(value)) return;
    const key = `source:${fieldPath}`;
    if (onlyMissing && rawFields[key]) return;
    rawFields[key] = source;
  };

  mark('title', draft.title);
  mark('section', draft.section);
  mark('type', draft.type);
  mark('summary', draft.extractedData.summary);
  mark('documentNumber', draft.extractedData.documentNumber);
  mark('issueDateText', draft.extractedData.issueDateText);
  mark('dueDateText', draft.extractedData.dueDateText);
  mark('expirationDateText', draft.extractedData.expirationDateText);
  mark('merchantName', draft.extractedData.merchantName);
  mark('policyNumber', draft.extractedData.policyNumber);
  mark('serialNumber', draft.extractedData.serialNumber);

  const bill = draft.extractedData.bill ?? {};
  for (const field of BILL_FIELDS) {
    mark(`bill.${field}`, bill[field]);
  }

  return {
    ...draft,
    extractedData: {
      ...draft.extractedData,
      rawFields,
    },
  };
};

const getWeakBillFields = (draft: UploadDraft) => {
  const weakFields = new Set<keyof ExtractedBillData>();
  const bill = draft.extractedData.bill;

  if (!bill) return weakFields;

  if (
    bill.billingMonth &&
    (bill.billingMonth.length > 18 ||
      /amount|due|current bill|payable|hm\d/i.test(bill.billingMonth))
  ) {
    weakFields.add('billingMonth');
  }

  if (
    bill.amountDue !== undefined &&
    bill.lateAmount !== undefined &&
    bill.lateAmountPayable !== undefined
  ) {
    const reconstructedAmountDue = bill.lateAmountPayable - bill.lateAmount;
    if (Math.abs(reconstructedAmountDue - bill.amountDue) > 1) {
      weakFields.add('amountDue');
    }
  }

  if (
    bill.amountDue !== undefined &&
    bill.lateAmountPayable !== undefined &&
    bill.lateAmountPayable < bill.amountDue
  ) {
    weakFields.add('lateAmountPayable');
  }

  if (
    bill.amountDue !== undefined &&
    bill.lateAmountPayable !== undefined &&
    bill.lateAmount !== undefined
  ) {
    const reconstructedLateAmount = bill.lateAmountPayable - bill.amountDue;
    if (Math.abs(reconstructedLateAmount - bill.lateAmount) > 1) {
      weakFields.add('lateAmount');
    }
  }

  return weakFields;
};

export const shouldRequestBackendAssist = (draft: UploadDraft) => {
  if (draft.parserStatus === 'partial' || draft.parserStatus === 'failed') {
    return true;
  }

  if (draft.section !== 'bills') {
    return false;
  }

  const bill = draft.extractedData.bill;
  if (!bill) return false;

  const weakFields = getWeakBillFields(draft);
  const criticalFields: Array<keyof ExtractedBillData> = [
    'providerName',
    'billingMonth',
    'issueDateText',
    'dueDateText',
    'amountDue',
    'lateAmount',
    'lateAmountPayable',
  ];

  return criticalFields.some((field) => isEmptyValue(bill[field]) || weakFields.has(field));
};

export const annotateDraftWithParserProvenance = (draft: UploadDraft) =>
  markExistingFieldsWithSource(draft, 'parser');

export const applyBackendSuggestionToDraft = (
  draft: UploadDraft,
  suggestion: BackendFieldSuggestion,
): UploadDraft => {
  const rawFields = { ...(draft.extractedData.rawFields ?? {}) };
  const bill = { ...(draft.extractedData.bill ?? {}) };

  const currentFieldValue = draft.extractedData.bill?.[suggestion.field];
  const nextValue =
    typeof currentFieldValue === 'number' || typeof suggestion.rawSuggestedValue === 'number'
      ? Number(suggestion.rawSuggestedValue)
      : suggestion.rawSuggestedValue;

  bill[suggestion.field] = nextValue as never;
  setFieldSource(rawFields, `bill.${suggestion.field}`, 'backend');
  rawFields[`backend:applied:${suggestion.field}`] = 'true';

  return {
    ...draft,
    extractedData: {
      ...draft.extractedData,
      bill,
      rawFields,
    },
  };
};

export const mergeBackendAssistIntoDraft = (
  previousDraft: UploadDraft,
  backendResult: UploadDraft,
): BackendAssistMergeResult => {
  let nextDraft = markExistingFieldsWithSource(previousDraft, 'parser');
  const rawFields = { ...(nextDraft.extractedData.rawFields ?? {}) };
  const suggestions: BackendFieldSuggestion[] = [];
  const appliedFields: string[] = [];
  const previousBill = nextDraft.extractedData.bill ?? {};
  const backendBill = backendResult.extractedData.bill ?? {};
  const weakFields = getWeakBillFields(nextDraft);
  const providerName = previousBill.providerName ?? backendBill.providerName;
  const isTrustedProvider = providerName ? TRUSTED_BILL_PROVIDERS.has(providerName) : false;

  if (!nextDraft.extractedData.summary && backendResult.extractedData.summary) {
    nextDraft = {
      ...nextDraft,
      extractedData: {
        ...nextDraft.extractedData,
        summary: backendResult.extractedData.summary,
      },
    };
    setFieldSource(rawFields, 'summary', 'backend');
    appliedFields.push('summary');
  }

  for (const field of BILL_FIELDS) {
    const backendValue = backendBill[field];
    const currentValue = previousBill[field];

    if (isEmptyValue(backendValue)) continue;

    if (isEmptyValue(currentValue)) {
      nextDraft = applyBackendSuggestionToDraft(
        nextDraft,
        {
          id: `bill.${field}`,
          field,
          label: BILL_FIELD_LABELS[field],
          currentValue: '',
          suggestedValue: formatSuggestionValue(backendValue),
          rawSuggestedValue: backendValue as string | number,
          reason: 'backend filled a missing field',
        },
      );
      appliedFields.push(`bill.${field}`);
      continue;
    }

    if (areFieldValuesEqual(currentValue, backendValue)) {
      continue;
    }

    const fieldIsWeak = weakFields.has(field) || previousDraft.parserStatus !== 'parsed';
    if (!fieldIsWeak) {
      rawFields[`backend:ignored:bill.${field}`] = formatSuggestionValue(backendValue);
      if (isTrustedProvider) {
        rawFields[`backend:trusted-kept:bill.${field}`] = formatSuggestionValue(currentValue);
      }
      continue;
    }

    suggestions.push({
      id: `bill.${field}`,
      field,
      label: BILL_FIELD_LABELS[field],
      currentValue: formatSuggestionValue(currentValue),
      suggestedValue: formatSuggestionValue(backendValue),
      rawSuggestedValue: backendValue as string | number,
      reason: 'backend found a different value for a weak or ambiguous field',
    });
  }

  const backendRawFields = backendResult.extractedData.rawFields ?? {};
  Object.entries(backendRawFields).forEach(([key, value]) => {
    if (key.startsWith('backend:') || key.startsWith('source:')) {
      rawFields[key] = value;
    }
  });

  weakFields.forEach((field) => {
    rawFields[`weak:bill.${field}`] = 'true';
  });

  nextDraft = {
    ...nextDraft,
    classificationConfidence: Math.max(
      nextDraft.classificationConfidence,
      backendResult.classificationConfidence,
    ),
    extractedData: {
      ...nextDraft.extractedData,
      rawFields,
    },
    tags: Array.from(new Set([...nextDraft.tags, ...backendResult.tags])),
  };

  return {
    draft: nextDraft,
    suggestions,
    appliedFields,
  };
};
