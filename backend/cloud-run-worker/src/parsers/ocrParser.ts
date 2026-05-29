import { createWorker } from 'tesseract.js';

export const extractTextFromImage = async (buffer: Buffer): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: 3 as any, // PSM.AUTO
    });
    
    // tesseract.js can accept a buffer directly in Node.js
    const result = await worker.recognize(buffer);
    await worker.terminate();
    
    return result.data.text || '';
  } catch (error) {
    console.error('Error running OCR:', error);
    return '';
  }
};
