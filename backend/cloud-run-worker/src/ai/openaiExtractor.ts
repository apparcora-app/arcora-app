import OpenAI from 'openai';
import { extractionJsonSchema } from './extractionSchema';

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
}

export const extractWithOpenAI = async (text: string, base64Image?: string, mimeType?: string): Promise<AiExtractionResult | null> => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key missing. Skipping AI extraction.");
    return null;
  }
  
  if (!text?.trim() && !base64Image) return null;

  const openai = new OpenAI(); // Instantiated here so dotenv is loaded first!

  try {
    const userContent: any[] = [];
    
    if (text?.trim()) {
      userContent.push({
        type: 'text',
        text: `Here is the OCR text extracted from the document:\n\n---\n${text.substring(0, 8000)}\n---`
      });
    }

    if (base64Image && mimeType?.startsWith('image/')) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Image}`,
          detail: 'high'
        }
      });
      userContent.push({
        type: 'text',
        text: `Please rely HEAVILY on the original image provided above if the OCR text is messy or missing fields.`
      });
    }

    userContent.push({
      type: 'text',
      text: 'Extract the requested fields accurately. NEVER hallucinate fields.'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert document data extraction system. Your task is to extract exact utility bill and invoice data. Combine OCR text and the provided image for the highest accuracy.',
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: extractionJsonSchema as any
      },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed as AiExtractionResult;
  } catch (error) {
    console.error('OpenAI Extraction Error:', error);
    return null;
  }
};
