import type { UploadDraft } from '../types';
import type { AiExtractionResult } from '../ai/openaiExtractor';

export const mergeAiIntoDraft = (draft: UploadDraft, aiResult: AiExtractionResult): UploadDraft => {
  const merged = { ...draft };
  merged.extractedData = { ...draft.extractedData };
  merged.extractedData.bill = { ...draft.extractedData.bill };
  merged.extractedData.rawFields = { ...(draft.extractedData.rawFields ?? {}) };

  const bill = merged.extractedData.bill;
  const rawFields = merged.extractedData.rawFields;

  if (aiResult.providerName && !bill.providerName) bill.providerName = aiResult.providerName;
  if (aiResult.billingMonth && !bill.billingMonth) bill.billingMonth = aiResult.billingMonth;
  if (aiResult.issueDateText && !bill.issueDateText) bill.issueDateText = aiResult.issueDateText;
  if (aiResult.dueDateText && !bill.dueDateText) bill.dueDateText = aiResult.dueDateText;
  if (aiResult.amountDue != null && bill.amountDue == null) bill.amountDue = aiResult.amountDue;
  if (aiResult.lateAmount != null && bill.lateAmount == null) bill.lateAmount = aiResult.lateAmount;
  if (aiResult.lateAmountPayable != null && bill.lateAmountPayable == null) bill.lateAmountPayable = aiResult.lateAmountPayable;
  
  merged.extractedData.summary = `${draft.extractedData.summary || ''}\n\n[AI Extraction Context: ${aiResult.reason}]`.trim();
  merged.classificationConfidence = Math.max(draft.classificationConfidence, aiResult.confidence);
  rawFields['backend:aiUsed'] = 'true';
  rawFields['backend:confidence'] = aiResult.confidence.toFixed(3);
  rawFields['backend:reason'] = aiResult.reason;

  return merged;
};
