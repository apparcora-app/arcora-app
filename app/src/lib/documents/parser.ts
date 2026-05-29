import type { UploadDraft } from '@/types';
import { createUploadDraft } from './classifier';

const readTextFile = async (file: File) => {
  try {
    return await file.text();
  } catch {
    return '';
  }
};

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

const isBrowserImageProcessable = () =>
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof HTMLCanvasElement !== 'undefined';

const preprocessImageForOcr = async (file: File): Promise<File> => {
  if (!isBrowserImageProcessable() || !file.type.startsWith('image/')) {
    return file;
  }

  try {
    const imageUrl = URL.createObjectURL(file);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = imageUrl;
    });

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(img.width * scale));
    canvas.height = Math.max(1, Math.floor(img.height * scale));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(imageUrl);
      return file;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let gray = r * 0.299 + g * 0.587 + b * 0.114;

      gray = gray > 180 ? 255 : gray < 110 ? 0 : gray;

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), 'image/png'),
    );

    URL.revokeObjectURL(imageUrl);

    if (!blob) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-ocr.png', {
      type: 'image/png',
    });
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    return file;
  }
};

const runImageOcr = async (file: File) => {
  try {
    const processedFile = await preprocessImageForOcr(file);

    const { createWorker, PSM } = await import('tesseract.js');
    const worker = await createWorker('eng');

    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: PSM.AUTO,
      user_defined_dpi: '300',
    });

    const result = await worker.recognize(processedFile);
    await worker.terminate();

    return cleanExtractedText(result.data.text || '');
  } catch (error) {
    console.error('OCR failed:', error);
    return '';
  }
};

const parsePdfOrDocFallback = async (file: File) => {
  const lowerName = file.name.toLowerCase();

  if (
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.json')
  ) {
    return cleanExtractedText(await readTextFile(file));
  }

  return '';
};

export const parseDocumentFileToDraft = async (file: File): Promise<UploadDraft> => {
  const mime = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  let text = '';

  if (mime.startsWith('image/')) {
    text = await runImageOcr(file);
  } else if (
    mime === 'application/pdf' ||
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.csv')
  ) {
    text = await parsePdfOrDocFallback(file);
  }

  const cleanedText = cleanExtractedText(text);
  const draft = createUploadDraft(cleanedText, file.name);

  if (!cleanedText.trim()) {
    return {
      ...draft,
      parserStatus: 'partial',
      reviewStatus: 'needs_review',
      extractedData: {
        ...draft.extractedData,
        summary:
          'Parser placeholder: file uploaded successfully, but richer OCR/document parsing for this format still needs backend or specialized parser integration.',
      },
    };
  }

  return {
    ...draft,
    extractedText: cleanedText,
    extractedData: {
      ...draft.extractedData,
      summary: cleanExtractedText(draft.extractedData.summary ?? cleanedText.slice(0, 500)),
    },
  };
};
