import { GoogleGenAI, Type } from '@google/genai';
import type { AiExtractionResult } from './openaiExtractor';

export const extractWithGemini = async (text: string, base64Image?: string, mimeType?: string): Promise<AiExtractionResult | null> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!text?.trim() && !base64Image) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents: any[] = [];

    if (text?.trim()) {
      contents.push(`Here is the OCR text extracted from the document:\n\n---\n${text.substring(0, 8000)}\n---`);
    }

    if (base64Image && mimeType?.startsWith('image/')) {
      contents.push({
        inlineData: {
          mimeType: mimeType === 'application/octet-stream' ? 'image/jpeg' : mimeType,
          data: base64Image
        }
      });
      contents.push('Please rely HEAVILY on the original image provided above if the OCR text is messy or missing fields.');
    }

    contents.push('You are an expert document data extraction system. Your task is to extract exact utility bill and invoice data. Combine OCR text and the provided image for high accuracy. NEVER hallucinate fields.');

    // Using gemini-flash-latest
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            providerName: { type: Type.STRING, nullable: true },
            billingMonth: { type: Type.STRING, nullable: true },
            issueDateText: { type: Type.STRING, nullable: true },
            dueDateText: { type: Type.STRING, nullable: true },
            amountDue: { type: Type.NUMBER, nullable: true },
            lateAmount: { type: Type.NUMBER, nullable: true },
            lateAmountPayable: { type: Type.NUMBER, nullable: true },
            confidence: { type: Type.NUMBER, description: 'Confidence between 0 and 1' },
            reason: { type: Type.STRING, description: 'Explanation of extraction rationale' }
          },
          required: ['confidence', 'reason']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) return null;

    const parsed = JSON.parse(responseText);
    return parsed as AiExtractionResult;
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    return null;
  }
};
