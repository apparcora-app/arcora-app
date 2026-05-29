// OCR and Date Detection utilities for LifeOS
import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import type { DetectedDate, DetectedDateType } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Set up pdfjs worker using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// Date regex patterns for different formats
const datePatterns = [
  // MM/DD/YYYY, M/D/YYYY
  {
    regex: /\b(0?[1-9]|1[0-2])[/\-.](0?[1-9]|[12]\d|3[01])[/\-.](\d{4})\b/gi,
    parser: (match: RegExpExecArray) => ({
      month: parseInt(match[1], 10) - 1,
      day: parseInt(match[2], 10),
      year: parseInt(match[3], 10),
    }),
  },
  // DD/MM/YYYY, D/M/YYYY
  {
    regex: /\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](\d{4})\b/gi,
    parser: (match: RegExpExecArray) => ({
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[1], 10),
      year: parseInt(match[3], 10),
    }),
  },
  // Month DD, YYYY
  {
    regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[.\s]+(\d{1,2}),?\s+(\d{4})\b/gi,
    parser: (match: RegExpExecArray) => ({
      month: monthNameToNumber(match[1]),
      day: parseInt(match[2], 10),
      year: parseInt(match[3], 10),
    }),
  },
  // DD Month YYYY
  {
    regex: /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{4})\b/gi,
    parser: (match: RegExpExecArray) => ({
      month: monthNameToNumber(match[2]),
      day: parseInt(match[1], 10),
      year: parseInt(match[3], 10),
    }),
  },
  // YYYY-MM-DD (ISO format)
  {
    regex: /\b(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g,
    parser: (match: RegExpExecArray) => ({
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[3], 10),
      year: parseInt(match[1], 10),
    }),
  },
];

// Context keywords for date classification
const contextKeywords: Record<DetectedDateType, string[]> = {
  due_date: ['due', 'due by', 'due date', 'payment due', 'pay by', 'payment date', 'must be paid', 'deadline'],
  expiry_date: ['expires', 'expiration', 'valid until', 'valid thru', 'expiry', 'exp date', 'valid to', 'ends on'],
  renewal_date: ['renew', 'renewal', 'renew by', 'auto-renew', 'renew on', 'subscription renews'],
  issue_date: ['issued', 'date of issue', 'issue date', 'date issued', 'created on'],
  deadline: ['deadline', 'final date', 'last day', 'submission date', 'due by'],
  unknown: [],
};

/**
 * Convert month name to number (0-11)
 */
function monthNameToNumber(monthName: string): number {
  const months: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };
  return months[monthName.toLowerCase()] || 0;
}

/**
 * Extract text from image using Tesseract OCR
 */
export const extractTextFromImage = async (imageFile: File | Blob): Promise<{
  text: string;
  confidence: number;
}> => {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        },
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (pdfFile: File): Promise<{
  text: string;
  confidence: number;
}> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    return {
      text: fullText,
      confidence: 100, // PDF text is usually 100% accurate
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Detect dates from extracted text
 */
export const detectDates = (text: string): DetectedDate[] => {
  const detectedDates: DetectedDate[] = [];
  const foundDates = new Set<string>(); // Track duplicates

  // Process each pattern
  for (const pattern of datePatterns) {
    let match;
    // Reset regex lastIndex
    pattern.regex.lastIndex = 0;

    while ((match = pattern.regex.exec(text)) !== null) {
      try {
        const parsed = pattern.parser(match);
        const date = new Date(parsed.year, parsed.month, parsed.day);

        // Validate date
        if (isNaN(date.getTime())) continue;
        if (date.getDate() !== parsed.day) continue; // Invalid day for month

        // Check for duplicates
        const dateKey = `${parsed.year}-${parsed.month}-${parsed.day}`;
        if (foundDates.has(dateKey)) continue;
        foundDates.add(dateKey);

        // Get surrounding context (50 chars before and after)
        const contextStart = Math.max(0, match.index - 50);
        const contextEnd = Math.min(text.length, match.index + match[0].length + 50);
        const context = text.substring(contextStart, contextEnd).toLowerCase();

        // Classify date type based on context
        const { type, confidence } = classifyDateType(context, date);

        detectedDates.push({
          date: Timestamp.fromDate(date),
          type,
          confidence,
          sourceText: match[0],
          confirmed: false,
        });
      } catch (error) {
        console.warn('Error parsing date:', match[0], error);
      }
    }
  }

  // Sort by confidence (highest first)
  return detectedDates.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Classify date type based on surrounding context
 */
function classifyDateType(context: string, date: Date): {
  type: DetectedDateType;
  confidence: number;
} {
  let bestType: DetectedDateType = 'unknown';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(contextKeywords)) {
    if (type === 'unknown') continue;

    let score = 0;
    for (const keyword of keywords) {
      if (context.includes(keyword.toLowerCase())) {
        score += 1;
        // Higher score for exact phrase matches
        if (context.includes(` ${keyword.toLowerCase()} `)) {
          score += 0.5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestType = type as DetectedDateType;
    }
  }

  // Calculate confidence based on keyword matches and date proximity
  let confidence = Math.min(100, bestScore * 25);

  // Boost confidence for dates in the future (more likely to be due/expiration dates)
  const now = new Date();
  const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > 0 && daysDiff < 365) {
    confidence += 10; // Future dates within a year are more likely relevant
  }

  // Boost confidence for dates that look like month-end (common for bills)
  if (date.getDate() >= 28 && date.getDate() <= 31) {
    confidence += 5;
  }

  return {
    type: bestType,
    confidence: Math.min(100, confidence),
  };
}

/**
 * Process document and extract dates
 */
export const processDocument = async (file: File): Promise<{
  text: string;
  confidence: number;
  dates: DetectedDate[];
}> => {
  // For images, use OCR
  if (file.type.startsWith('image/')) {
    const ocrResult = await extractTextFromImage(file);
    const dates = detectDates(ocrResult.text);

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      dates,
    };
  }

  // For PDFs, extract text directly
  if (file.type === 'application/pdf') {
    const pdfResult = await extractTextFromPDF(file);
    const dates = detectDates(pdfResult.text);

    return {
      text: pdfResult.text,
      confidence: pdfResult.confidence,
      dates,
    };
  }

  return {
    text: '',
    confidence: 0,
    dates: [],
  };
};

/**
 * Format date for display
 */
export const formatDetectedDate = (detectedDate: DetectedDate): string => {
  const date = detectedDate.date.toDate();
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const typeLabels: Record<DetectedDateType, string> = {
    due_date: 'Due Date',
    expiry_date: 'Expiration Date',
    renewal_date: 'Renewal Date',
    issue_date: 'Issue Date',
    deadline: 'Deadline',
    unknown: 'Date',
  };

  return `${typeLabels[detectedDate.type]}: ${formatted}`;
};

/**
 * Get reminder date based on detected date type
 */
export const getReminderDate = (detectedDate: DetectedDate, daysBefore: number): Date => {
  const date = detectedDate.date.toDate();
  const reminderDate = new Date(date);
  reminderDate.setDate(date.getDate() - daysBefore);
  return reminderDate;
};
