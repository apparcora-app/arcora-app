import { extractTextFromPdf } from '../parsers/pdfParser';
import { extractTextFromDocx } from '../parsers/docxParser';
import { extractTextFromImage } from '../parsers/ocrParser';
import { runDeterministicParser } from '../parsers/deterministicParser';
import { extractWithOpenAI } from '../ai/openaiExtractor';
import { mergeAiIntoDraft } from '../mappers/uploadDraftMapper';

export const processExtractionDirect = async (buffer: Buffer, fileName: string, fileMimeType: string) => {
  const mime = (fileMimeType || '').toLowerCase();
  
  let text = '';
  if (mime === 'application/pdf') {
    text = await extractTextFromPdf(buffer);
    if (text.trim().length < 50) {
      // In the future, PDF-to-Image conversion could be added here for OCR fallback
      console.log('PDF text content is too short, but OCR fallback for PDF is not implemented yet.');
    }
  } else if (mime.includes('wordprocessingml') || mime.endsWith('docx')) {
    text = await extractTextFromDocx(buffer);
  } else if (mime.startsWith('image/') || mime === 'application/octet-stream') {
    // Sometimes image uploads misreport as application/octet-stream
    text = await extractTextFromImage(buffer);
  } else {
    text = buffer.toString('utf-8');
  }

  let draft = runDeterministicParser(text, fileName);
  const shouldUseAiFallback = draft.parserStatus === 'partial' || draft.parserStatus === 'failed';

  if (shouldUseAiFallback) {
    const base64Image = mime.startsWith('image/') || mime === 'application/octet-stream' 
      ? buffer.toString('base64') 
      : undefined;
      
    // Default to image/jpeg if octet-stream so OpenAI accepts it
    const safeMime = mime === 'application/octet-stream' ? 'image/jpeg' : mime;
    const aiResult = await extractWithOpenAI(text, base64Image, safeMime);
    if (aiResult) {
      draft = mergeAiIntoDraft(draft, aiResult);
      (draft as any).aiUsed = true;
      (draft as any).parserMode = 'ai_enhanced';
    }
  }

  return draft;
};
