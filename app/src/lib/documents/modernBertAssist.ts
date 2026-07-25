import type { AppSection, DocumentType, UploadDraft } from '@/types';

export interface LocalAiClassificationResult {
  label: string;
  confidence: number;
  all_scores?: Record<string, number>;
}

export interface ModernBertAssistSuggestion {
  section: AppSection;
  type: DocumentType;
  title: string;
  confidence: number;
  secondaryConfidence: number;
  shouldApply: boolean;
  reason: string;
  sourceLabel: string;
}

export const MODERN_BERT_LABELS = [
  'electricity bill',
  'gas bill',
  'internet bill',
  'mobile postpaid bill',
  'subscription invoice',
  'warranty card',
  'account maintenance certificate',
  'salary slip',
  'bank statement',
  'identity document',
  'tax document',
  'receipt',
  'invoice',
  'personal note',
  'general document',
] as const;

const labelMap: Record<(typeof MODERN_BERT_LABELS)[number], { section: AppSection; type: DocumentType; title: string }> = {
  'electricity bill': { section: 'bills', type: 'bill', title: 'Electricity Bill' },
  'gas bill': { section: 'bills', type: 'bill', title: 'Gas Bill' },
  'internet bill': { section: 'bills', type: 'bill', title: 'Internet Bill' },
  'mobile postpaid bill': { section: 'subscriptions', type: 'invoice', title: 'Mobile Postpaid Bill' },
  'subscription invoice': { section: 'subscriptions', type: 'invoice', title: 'Subscription Invoice' },
  'warranty card': { section: 'warranties', type: 'warranty', title: 'Warranty Document' },
  'account maintenance certificate': { section: 'documents', type: 'contract', title: 'Account Maintenance Certificate' },
  'salary slip': { section: 'documents', type: 'contract', title: 'Salary Slip' },
  'bank statement': { section: 'documents', type: 'statement', title: 'Bank Statement' },
  'identity document': { section: 'documents', type: 'license', title: 'Identity Document' },
  'tax document': { section: 'documents', type: 'tax-document', title: 'Tax Document' },
  receipt: { section: 'documents', type: 'receipt', title: 'Receipt' },
  invoice: { section: 'documents', type: 'invoice', title: 'Invoice' },
  'personal note': { section: 'reminders', type: 'reminder-note', title: 'Personal Note' },
  'general document': { section: 'documents', type: 'contract', title: 'General Document' },
};

const genericSections = new Set<AppSection>(['others', 'documents']);
const genericTypes = new Set<DocumentType>(['other', 'contract', 'invoice', 'receipt', 'statement', 'reminder-note']);
const genericTitles = new Set([
  'General Document',
  'Utility Bill',
  'Subscription Invoice',
  'Warranty Document',
  'Identity Document',
  'Invoice',
  'Receipt',
  'Statement',
  'Reminder Note',
  'Personal Note',
]);

const getTopTwoScores = (scores?: Record<string, number>) => {
  if (!scores) return { top: 0, second: 0 };
  const ordered = Object.values(scores).sort((a, b) => b - a);
  return { top: ordered[0] ?? 0, second: ordered[1] ?? 0 };
};

export const getModernBertAssistSuggestion = (
  result: LocalAiClassificationResult | null,
  draft: UploadDraft,
): ModernBertAssistSuggestion | null => {
  if (!result) return null;

  const mapping = labelMap[result.label as keyof typeof labelMap];
  if (!mapping) return null;

  const { top, second } = getTopTwoScores(result.all_scores);
  const gap = top - second;
  const currentIsGeneric =
    genericSections.has(draft.section) ||
    genericTypes.has(draft.type) ||
    genericTitles.has(draft.title) ||
    draft.classificationConfidence < 0.86;

  const shouldApply =
    result.confidence >= 0.72 &&
    gap >= 0.08 &&
    (
      currentIsGeneric ||
      (
        draft.section === mapping.section &&
        draft.type !== mapping.type &&
        result.confidence >= 0.8
      )
    );

  return {
    ...mapping,
    confidence: result.confidence,
    secondaryConfidence: second,
    shouldApply,
    reason: shouldApply
      ? currentIsGeneric
        ? 'modernbert refined a weak or generic classification'
        : 'modernbert suggested a more specific type inside the same section'
      : 'modernbert confidence was not strong enough to adjust the parser result',
    sourceLabel: result.label,
  };
};

export const applyModernBertAssistToDraft = (
  draft: UploadDraft,
  suggestion: ModernBertAssistSuggestion | null,
): UploadDraft => {
  if (!suggestion) return draft;

  const nextRawFields = {
    ...(draft.extractedData.rawFields ?? {}),
    modernBertLabel: suggestion.sourceLabel,
    modernBertConfidence: suggestion.confidence.toFixed(3),
    modernBertApplied: suggestion.shouldApply ? 'true' : 'false',
    modernBertReason: suggestion.reason,
  };

  const withMetadata: UploadDraft = {
    ...draft,
    extractedData: {
      ...draft.extractedData,
      rawFields: nextRawFields,
    },
    tags: Array.from(
      new Set([
        ...draft.tags,
        'modernbert-reviewed',
        suggestion.shouldApply ? 'modernbert-assisted' : 'modernbert-kept-parser',
      ]),
    ),
  };

  if (!suggestion.shouldApply) return withMetadata;

  // If the section changed (e.g. subscriptions → documents), the title and
  // summary from the old classification are almost certainly wrong.
  // Always override title when the section changes, not just for generic titles.
  const sectionChanged = draft.section !== suggestion.section;
  const shouldOverrideTitle = sectionChanged || genericTitles.has(draft.title);

  // Clear the summary when the section changes so stale text (e.g. "UBL
  // Subscription from UBL.") doesn't show under an identity document.
  const clearedSummary = sectionChanged
    ? `Detected as ${suggestion.title}. Review fields above and save.`
    : (withMetadata.extractedData.summary ?? '');

  return {
    ...withMetadata,
    title: shouldOverrideTitle ? suggestion.title : draft.title,
    section: suggestion.section,
    type: suggestion.type,
    classificationConfidence: Math.max(
      draft.classificationConfidence,
      Math.min(0.98, suggestion.confidence * 0.94),
    ),
    suggestedBill:
      suggestion.section === 'bills'
        ? {
            ...withMetadata.suggestedBill,
            title: shouldOverrideTitle ? suggestion.title : draft.title,
          }
        : withMetadata.suggestedBill,
    extractedData: {
      ...withMetadata.extractedData,
      summary: clearedSummary,
      rawFields: {
        ...nextRawFields,
        'source:section': 'modernbert',
        'source:type': 'modernbert',
        ...(shouldOverrideTitle ? { 'source:title': 'modernbert' } : {}),
        ...(sectionChanged ? { 'source:summary': 'modernbert-cleared' } : {}),
      },
    },
  };
};
