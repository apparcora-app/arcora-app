import { createUploadDraft } from '../lib/documents/classifier';
import type { UploadDraft } from '../types';

const cleanExtractedText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/—/g, '-')
    .replace(/_/g, ' ')
    .replace(/\bPiston Taecommunicaton\b/gi, 'Pakistan Telecommunication')
    .replace(/\bPiston\b/gi, 'Pakistan')
    .replace(/\bTaecommunicaton\b/gi, 'Telecommunication')
    .replace(/\bTaocommunication\b/gi, 'Telecommunication')
    .replace(/\bTelecommunicaton\b/gi, 'Telecommunication')
    .replace(/\bTelecommurication\b/gi, 'Telecommunication')
    .replace(/\bPTCLSTN\b/gi, 'PTCL STN')
    .replace(/\bPTCLNTN\b/gi, 'PTCL NTN')
    .replace(/\bInvoice#\b/gi, 'Invoice #')
    .replace(/\bReesuid\/esn\b/gi, 'Account ID/ESN')
    .replace(/\bMI\b/gi, 'ID')
    .replace(/\blose Der\b/gi, 'Issue Date')
    .replace(/\bSuita Taso\b/gi, 'PTCL')
    .replace(/\bNetix\b/gi, 'Netflix')
    .replace(/\bNetlix\b/gi, 'Netflix')
    .replace(/\bNetfix\b/gi, 'Netflix')
    .replace(/\bReceiptNo\b/gi, 'Receipt No')
    .replace(/\bAmountDue\b/gi, 'Amount Due')
    .replace(/\bDueDate\b/gi, 'Due Date')
    .replace(/\bBillingMonth\b/gi, 'Billing Month')
    .replace(/\bPaymentMethod\b/gi, 'Payment Method')
    .replace(/\bAccountID\/ESN\b/gi, 'Account ID/ESN')
    .replace(/\bRs\.\s*([0-9])\s*,\s*([0-9]{3})\s*\.\s*([0-9]{2})\b/gi, 'Rs. $1,$2.$3')
    .replace(/\bRs\.\s*([0-9]{1,2})\s*\.\s*([0-9]{2})\b/gi, 'Rs. $1.$2')
    .replace(/\b([A-Z]{2,})\s+#/g, '$1 #')
    .replace(/\n +/g, '\n')
    .trim();
};

export const runDeterministicParser = (text: string, fileName: string): UploadDraft => {
  const cleanedText = cleanExtractedText(text);
  const draft = createUploadDraft(cleanedText, fileName);

  if (!cleanedText.trim()) {
    return {
      ...draft,
      parserStatus: 'partial',
      reviewStatus: 'needs_review',
      extractedData: {
        ...draft.extractedData,
        summary: 'Parser placeholder: no text could be extracted.'
      }
    };
  }

  return {
    ...draft,
    extractedText: cleanedText,
    extractedData: {
      ...draft.extractedData,
      summary: draft.extractedData?.summary || cleanedText.slice(0, 500)
    }
  };
};
