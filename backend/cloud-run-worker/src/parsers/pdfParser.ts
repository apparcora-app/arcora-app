import { PDFParse } from 'pdf-parse';

export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
};
