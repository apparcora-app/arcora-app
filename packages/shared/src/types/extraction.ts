/**
 * Multi-Model LLM Document Extraction Contracts
 */

export interface AiExtractionResult {
  providerName: string | null;
  billingMonth: string | null;
  issueDateText: string | null;
  dueDateText: string | null;
  amountDue: number | null;
  lateAmount: number | null;
  lateAmountPayable: number | null;
  confidence: number;
  reason: string;
  suggestedCategory?: string;
  isRecurring?: boolean;
}

export interface DocumentExtractionRequest {
  fileName: string;
  mimeType: string;
  fileBase64?: string;
  ocrText?: string;
  preferredModel?: 'gemini' | 'openai' | 'auto';
}

export interface DocumentExtractionResponse {
  success: boolean;
  result?: AiExtractionResult;
  modelUsed: 'gemini-flash' | 'gpt-4o-mini' | 'local-modernbert' | 'regex-ocr' | 'unknown';
  processingTimeMs: number;
  error?: string;
}
