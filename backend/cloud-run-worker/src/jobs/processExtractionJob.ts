import { extractTextFromPdf } from '../parsers/pdfParser';
import { extractTextFromDocx } from '../parsers/docxParser';
import { extractTextFromImage } from '../parsers/ocrParser';
import { runDeterministicParser } from '../parsers/deterministicParser';
import { orchestrateDocumentExtraction } from '../ai/modelOrchestrator';
import { mergeAiIntoDraft } from '../mappers/uploadDraftMapper';

export const processExtractionDirect = async (
  buffer: Buffer,
  fileName: string,
  fileMimeType: string,
  ocrText?: string,
) => {
  const mime = (fileMimeType || '').toLowerCase();

  let text = ocrText || '';
  if (!text) {
    if (mime === 'application/pdf') {
      text = await extractTextFromPdf(buffer);
      if (text.trim().length < 50) {
        console.log('PDF text content is short; relying on multimodal vision.');
      }
    } else if (mime.includes('wordprocessingml') || mime.endsWith('docx')) {
      text = await extractTextFromDocx(buffer);
    } else if (mime.startsWith('image/') || mime === 'application/octet-stream') {
      text = await extractTextFromImage(buffer);
    } else {
      text = buffer.toString('utf-8');
    }
  }

  let draft = runDeterministicParser(text, fileName);
  const hasMissingKeyFields =
    !draft.extractedData?.bill?.amountDue || !draft.extractedData?.bill?.providerName;
  const shouldUseAiFallback =
    draft.parserStatus === 'partial' ||
    draft.parserStatus === 'failed' ||
    hasMissingKeyFields;

  if (shouldUseAiFallback) {
    const base64Image =
      mime.startsWith('image/') || mime === 'application/octet-stream'
        ? buffer.toString('base64')
        : undefined;

    const safeMime = mime === 'application/octet-stream' ? 'image/jpeg' : mime;

    const aiResponse = await orchestrateDocumentExtraction({
      fileName,
      mimeType: safeMime,
      fileBase64: base64Image,
      ocrText: text,
      preferredModel: 'auto',
    });

    if (aiResponse.success && aiResponse.result) {
      draft = mergeAiIntoDraft(draft, aiResponse.result);
      (draft as any).aiUsed = true;
      (draft as any).aiProvider = aiResponse.modelUsed;
      (draft as any).parserMode = 'ai_enhanced';
      (draft as any).processingTimeMs = aiResponse.processingTimeMs;
    }
  }

  return draft;
};
