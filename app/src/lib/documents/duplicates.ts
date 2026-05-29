import type { Document, UploadDraft } from '@/types';

export interface DuplicateMatch {
  existingDocumentId: string;
  confidence: 'exact' | 'likely' | 'possible';
  reasons: string[];
  existingDoc: Document;
}

/**
 * Normalizes strings tightly for comparison (lowercasing, trim, removing special chars except alphanumeric).
 */
const norm = (str?: string | null) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || '';

export function detectDuplicateDocument(
  draft: UploadDraft,
  allDocuments: Document[]
): DuplicateMatch | null {
  // Only compare against active documents in the same section
  const candidates = allDocuments.filter(
    (doc) => doc.section === draft.section && !doc.replacedByDocumentId
  );

  let bestMatch: DuplicateMatch | null = null;
  let highestScore = 0;

  for (const doc of candidates) {
    const { score, reasons } = scoreDocumentMatch(draft, doc);

    // Calculate confidence based on section and score thresholds
    let confidence: 'exact' | 'likely' | 'possible' | 'none' = 'none';

    if (draft.section === 'bills') {
      if (score >= 4) confidence = 'exact';
      else if (score === 3) confidence = 'likely';
      else if (score === 2) confidence = 'possible';
    } else if (['passports', 'ids', 'documents'].includes(draft.section) && draft.type.match(/passport|license|id/i)) {
      if (score >= 2) confidence = 'exact'; // Usually document number + expiry is enough
      else if (score === 1) confidence = 'possible';
    } else if (draft.section === 'warranties') {
      if (score >= 3) confidence = 'exact';
      else if (score === 2) confidence = 'likely';
      else if (score === 1) confidence = 'possible';
    } else {
      // General docs / subscriptions / others
      if (score >= 3) confidence = 'exact';
      else if (score === 2) confidence = 'likely';
    }

    if (confidence !== 'none' && score > highestScore) {
      highestScore = score;
      bestMatch = {
        existingDocumentId: doc.id,
        confidence,
        reasons,
        existingDoc: doc,
      };
    }
  }

  return bestMatch;
}

function scoreDocumentMatch(draft: UploadDraft, existing: Document): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const draftData = draft.extractedData;
  const oldData = existing.extractedData || {};

  // 1. BILL MATCHING
  if (draft.section === 'bills') {
    const dBill = draftData.bill || {};
    const oBill = oldData.bill || {};

    if (norm(dBill.providerName) === norm(oBill.providerName) && dBill.providerName) {
      score += 1;
      reasons.push('Same provider/company');
    }
    if (norm(dBill.accountNumber) === norm(oBill.accountNumber) && dBill.accountNumber) {
      score += 2; // Account number is a strong signal
      reasons.push('Same account number');
    }
    if (norm(dBill.billingMonth) === norm(oBill.billingMonth) && dBill.billingMonth && dBill.billingMonth.length > 2) {
      score += 2;
      reasons.push('Same billing month');
    }
    if (dBill.amountDue === oBill.amountDue && dBill.amountDue !== undefined) {
      score += 1;
      reasons.push('Same due amount');
    }
    if (norm(dBill.dueDateText) === norm(oBill.dueDateText) && dBill.dueDateText) {
      score += 1;
      reasons.push('Same due date');
    }
    if (norm(dBill.invoiceNumber) === norm(oBill.invoiceNumber) && dBill.invoiceNumber) {
      score += 2;
      reasons.push('Same invoice number');
    }
  } 

  // 2. ID / PASSPORT MATCHING
  else if (draft.type.match(/passport|license|id/i)) {
    if (norm(draftData.documentNumber) === norm(oldData.documentNumber) && draftData.documentNumber) {
      score += 2;
      reasons.push('Same Document Number ID');
    }
    if (norm(draftData.expirationDateText) === norm(oldData.expirationDateText) && draftData.expirationDateText) {
      score += 1;
      reasons.push('Same Expiry Date');
    }
    if (norm(draft.type) === norm(existing.type)) {
      score += 0.5;
    }
  }

  // 3. WARRANTY MATCHING
  else if (draft.section === 'warranties') {
    if (norm(draftData.serialNumber) === norm(oldData.serialNumber) && draftData.serialNumber) {
      score += 3; // Serial numbers are practically deterministic
      reasons.push('Same Serial Number');
    }
    if (norm(draftData.merchant) === norm(oldData.merchant) && draftData.merchant) {
      score += 1;
      reasons.push('Same Merchant/Brand');
    }
    if (norm(draftData.productName) === norm(oldData.productName) && draftData.productName) {
      score += 1;
      reasons.push('Same Product Name');
    }
  }

  // 4. SUBSCRIPTION / STATEMENT / INVOICE FALLBACK
  else {
    if (norm(draftData.providerName) === norm(oldData.providerName) && draftData.providerName) {
      score += 1;
      reasons.push('Same Provider');
    }
    if (norm(draftData.invoiceNumber) === norm(oldData.invoiceNumber) && draftData.invoiceNumber) {
      score += 2;
      reasons.push('Same Invoice ID / Reference Number');
    }
    if (draftData.amount === oldData.amount && draftData.amount !== undefined) {
      score += 1;
      reasons.push('Same Amount');
    }
    
    // Check if any extracted target dates align exactly between detected dates if they exist
    const draftDates = draft.detectedDates?.map(d => norm(String(d.date))) || [];
    const oldDates = existing.detectedDates?.map(d => norm(String(d.date))) || [];
    const sharedDates = draftDates.filter(value => oldDates.includes(value));
    
    if (sharedDates.length > 0) {
      score += 1;
      reasons.push('Same Extracted Date Timelines');
    }
  }

  return { score, reasons };
}
