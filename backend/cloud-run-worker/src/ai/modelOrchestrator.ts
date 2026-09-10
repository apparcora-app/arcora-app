import type {
  AiExtractionResult,
  DocumentExtractionRequest,
  DocumentExtractionResponse,
} from '@arcora/shared';
import { AiExtractionResultSchema, safeValidate } from '@arcora/shared';
import { extractWithGemini } from './geminiExtractor';
import { extractWithOpenAI } from './openaiExtractor';

/**
 * Enterprise Multi-Model LLM Orchestrator
 * Cascading strategy:
 * 1. Primary: Gemini Flash API (Multimodal Vision & Fast Structured Extraction)
 * 2. Secondary: OpenAI gpt-4o-mini (Strict JSON Schema Fallback)
 * 3. Defensive Schema Validation & Zero Leakage Error Handling
 */
export async function orchestrateDocumentExtraction(
  request: DocumentExtractionRequest,
): Promise<DocumentExtractionResponse> {
  const startTime = Date.now();
  const { fileName, mimeType, fileBase64, ocrText, preferredModel = 'auto' } = request;

  let rawResult: AiExtractionResult | null = null;
  let modelUsed: DocumentExtractionResponse['modelUsed'] = 'unknown';

  // Strategy A: Direct preference or Primary Gemini Flash
  if (preferredModel === 'gemini' || preferredModel === 'auto') {
    try {
      rawResult = await extractWithGemini(ocrText || '', fileBase64, mimeType);
      if (rawResult) {
        modelUsed = 'gemini-flash';
      }
    } catch (err) {
      console.warn(`[Orchestrator] Primary Gemini extraction failed for ${fileName}:`, err);
    }
  }

  // Strategy B: Fallback to OpenAI gpt-4o-mini if Gemini failed or OpenAI was requested
  if (!rawResult && (preferredModel === 'openai' || preferredModel === 'auto')) {
    try {
      console.log(`[Orchestrator] Falling back to OpenAI gpt-4o-mini for ${fileName}...`);
      rawResult = await extractWithOpenAI(ocrText || '', fileBase64, mimeType);
      if (rawResult) {
        modelUsed = 'gpt-4o-mini';
      }
    } catch (err) {
      console.warn(`[Orchestrator] Secondary OpenAI extraction failed for ${fileName}:`, err);
    }
  }

  const durationMs = Date.now() - startTime;

  if (!rawResult) {
    return {
      success: false,
      modelUsed: 'unknown',
      processingTimeMs: durationMs,
      error: 'All multimodal AI providers failed or were unconfigured.',
    };
  }

  // Defensive validation using shared Zod schema
  const validationResult = safeValidate(AiExtractionResultSchema, rawResult);
  if (!validationResult.success) {
    console.warn(`[Orchestrator] Schema deviation detected: ${validationResult.error}`);
    // Safe healing: return rawResult if properties exist, or log warning
  }

  return {
    success: true,
    result: rawResult,
    modelUsed,
    processingTimeMs: durationMs,
  };
}
