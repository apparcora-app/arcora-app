import { Timestamp } from 'firebase/firestore';
import type {
  AppSection,
  DetectedDate,
  DetectedDateType,
  DocumentType,
  ExtractedDocumentData,
  UploadDraft,
} from '@/types';

export interface ClassificationResult {
  section: AppSection;
  type: DocumentType;
  title: string;
  classificationConfidence: number;
  tags: string[];
  extractedData: ExtractedDocumentData;
  detectedDates: DetectedDate[];
}

type KeywordRule = {
  id: string;
  section: AppSection;
  type: DocumentType;
  title: string;
  baseConfidence: number;
  keywords: string[];
  negativeKeywords?: string[];
};

const SUBSCRIPTION_BRANDS = [
  'netflix',
  'spotify',
  'amazon prime',
  'prime video',
  'icloud',
  'google one',
  'adobe',
  'canva',
  'chatgpt',
  'youtube premium',
  'disney',
  'disney+',
  'hulu',
  'apple tv',
  'microsoft 365',
  'standard chartered',
  'hbl',
  'ubl',
  'mcb',
  'allied bank',
  'faisal bank',
] as const;

const ELECTRICITY_PROVIDERS = [
  'FESCO',
  'GEPCO',
  'IESCO',
  'LESCO',
  'K-Electric',
  'MEPCO',
  'PESCO',
  'HESCO',
  'SEPCO',
  'QESCO',
  'TESCO',
] as const;

const PROVIDER_ALIASES: Array<{ canonical: string; patterns: string[] }> = [
  {
    canonical: 'PTCL',
    patterns: [
      'ptcl',
      'pakistan telecommunication company limited',
      'pakistan telecommunication',
    ],
  },
  {
    canonical: 'SNGPL',
    patterns: [
      'sngpl',
      'sui northern gas pipelines limited',
      'sui northern gas',
    ],
  },
  {
    canonical: 'SSGC',
    patterns: ['ssgc', 'sui southern gas'],
  },
  {
    canonical: 'K-Electric',
    patterns: ['k-electric', 'kelectric', 'k electric'],
  },
  {
    canonical: 'LESCO',
    patterns: ['lesco'],
  },
  {
    canonical: 'IESCO',
    patterns: ['iesco'],
  },
  {
    canonical: 'FESCO',
    patterns: ['fesco', 'faisalabad electric supply company'],
  },
  {
    canonical: 'GEPCO',
    patterns: ['gepco'],
  },
  {
    canonical: 'Nayatel',
    patterns: ['nayatel'],
  },
  {
    canonical: 'StormFiber',
    patterns: ['stormfiber', 'storm fiber'],
  },
  {
    canonical: 'Allied Bank',
    patterns: ['allied bank'],
  },
  {
    canonical: 'HBL',
    patterns: ['hbl', 'habib bank'],
  },
  {
    canonical: 'UBL',
    patterns: ['ubl', 'united bank'],
  },
  {
    canonical: 'MCB',
    patterns: ['mcb'],
  },
  {
    canonical: 'Bank Alfalah',
    patterns: ['bank alfalah'],
  },
  {
    canonical: 'Meezan Bank',
    patterns: ['meezan bank'],
  },
  {
    canonical: 'Netflix',
    patterns: ['netflix'],
  },
  {
    canonical: 'Spotify',
    patterns: ['spotify'],
  },
  {
    canonical: 'Amazon Prime',
    patterns: ['amazon prime', 'prime video'],
  },
  {
    canonical: 'PG&E',
    patterns: ['pg&e', 'pge', 'pacific gas and electric', 'pacific gas & electric'],
  },
  {
    canonical: 'Silicon Valley Clean Energy',
    patterns: ['silicon valley clean energy', 'svce'],
  },
  {
    canonical: 'Southern California Edison',
    patterns: ['southern california edison', 'sce'],
  },
  {
    canonical: 'Comcast Xfinity',
    patterns: ['comcast', 'xfinity'],
  },
  {
    canonical: 'AT&T',
    patterns: ['at&t', 'at and t'],
  },
  {
    canonical: 'Verizon',
    patterns: ['verizon'],
  },
  {
    canonical: 'T-Mobile',
    patterns: ['t-mobile', 'tmobile'],
  },
  {
    canonical: 'Geico',
    patterns: ['geico', 'government employees insurance'],
  },
  {
    canonical: 'Progressive',
    patterns: ['progressive insurance', 'progressive direct'],
  },
  {
    canonical: 'State Farm',
    patterns: ['state farm'],
  },
  {
    canonical: 'Blue Cross Blue Shield',
    patterns: ['blue cross', 'blue shield', 'bcbs'],
  },
  {
    canonical: 'J.P. Morgan',
    patterns: ['j.p.morgan', 'jp morgan', 'jpmorgan', 'jp morgan securities llc'],
  },
  {
    canonical: 'Chase',
    patterns: ['chase bank', 'chase card', 'jp morgan chase'],
  },
  {
    canonical: 'Bank of America',
    patterns: ['bank of america', 'bofa'],
  },
  {
    canonical: 'Wells Fargo',
    patterns: ['wells fargo'],
  },
  {
    canonical: 'American Express',
    patterns: ['american express', 'amex'],
  },
  {
    canonical: 'Punjab University',
    patterns: ['university of the punjab', 'punjab university'],
  },
  {
    canonical: 'Islamia University Bahawalpur',
    patterns: ['the islamia university of bahawalpur', 'iub'],
  },
  {
    canonical: 'NUST',
    patterns: ['national university of sciences and technology', 'nust'],
  },
  {
    canonical: 'FAST NUCES',
    patterns: ['national university of computer and emerging sciences', 'fast nuces'],
  },
  {
    canonical: 'SSGC',
    patterns: ['ssgc', 'sui southern gas', 'sui southern gas company'],
  },
  {
    canonical: 'MEPCO',
    patterns: ['mepco', 'multan electric power company'],
  },
  {
    canonical: 'PESCO',
    patterns: ['pesco', 'peshawar electric power company'],
  },
  {
    canonical: 'IESCO',
    patterns: ['iesco', 'islamabad electric supply company'],
  },
  {
    canonical: 'SCE',
    patterns: ['sce', 'southern california edison'],
  },
  {
    canonical: 'SDG&E',
    patterns: ['sdg&e', 'sdge', 'san diego gas & electric', 'san diego gas and electric'],
  },
  {
    canonical: 'Con Edison',
    patterns: ['con edison', 'coned', 'consolidated edison'],
  },
  {
    canonical: 'SNGPL',
    patterns: ['sngpl', 'sui northern gas'],
  },
  {
    canonical: 'PG&E',
    patterns: ['pg&e', 'pacific gas and electric'],
  },
  {
    canonical: 'Clear River',
    patterns: ['clear river', 'water department'],
  },
  {
    canonical: 'IRS',
    patterns: ['irs', 'internal revenue service'],
  },
  {
    canonical: 'FBR',
    patterns: ['fbr', 'federal board of revenue'],
  },
];

const keywordGroups: KeywordRule[] = [
  {
    id: 'bill-utility',
    section: 'bills',
    type: 'bill',
    title: 'Utility Bill',
    baseConfidence: 0.9,
    keywords: [
      'bill',
      'invoice',
      'due date',
      'amount due',
      'current charges',
      'current bill',
      'late payment',
      'payment due',
      'meter',
      'meter reading',
      'gas charges',
      'tariff',
      'telephone',
      'internet',
      'broadband',
      'utility',
      'provider',
      'consumer no',
      'customer no',
      'account no',
      'account id',
      'account id/esn',
      'psid',
      'ptcl',
      'telecommunication',
      'sngpl',
      'sui northern gas',
      'fesco',
      'gepco',
      'iesco',
      'lesco',
      'k-electric',
      'electricity consumer bill',
      'payable within due date',
      'payable after due date',
      'amount after due date',
      'account:',
      'due:',
      'amount:',
      'sngpl',
      'pg&e',
      'clear river',
    ],
    negativeKeywords: [
      'passport',
      'identity card',
      'cnic',
      'license',
      'certificate',
      'maintenance certificate',
      'account maintenance certificate',
      '1099',
      'w-2',
      'tax document',
      'year-end messages',
      'netflix',
      'spotify',
      'amazon prime',
    ],
  },
  {
    id: 'subscription',
    section: 'subscriptions',
    type: 'invoice',
    title: 'Subscription Invoice',
    baseConfidence: 0.9,
    keywords: [
      'subscription',
      'renewal',
      'monthly plan',
      'yearly plan',
      'annual plan',
      'membership',
      'next billing',
      'renews on',
      'auto renewal',
      'service period',
      'streaming service',
      'receipt no',
      'payment method',
      'netflix',
      'spotify',
      'prime',
      'amazon prime',
      'prime video',
      'icloud',
      'google one',
      'adobe',
      'canva',
      'chatgpt',
      'youtube premium',
      'disney',
      'disney+',
      'hulu',
      'apple tv',
      'microsoft 365',
    ],
    negativeKeywords: ['utility bill', 'meter reading', 'certificate'],
  },
  {
    id: 'warranty',
    section: 'warranties',
    type: 'warranty',
    title: 'Warranty Document',
    baseConfidence: 0.9,
    keywords: [
      'warranty',
      'serial number',
      'serial no',
      'imei',
      'purchase date',
      'coverage',
      'warranty expires',
      'expires on',
      'warranty period',
      'model no',
      'model number',
      'replacement',
      'service center',
    ],
    negativeKeywords: ['passport', 'identity card'],
  },
  {
    id: 'password-export',
    section: 'passwords',
    type: 'password-export',
    title: 'Password Export',
    baseConfidence: 0.82,
    keywords: [
      'password',
      'vault export',
      'credentials',
      'bitwarden',
      '1password',
      'lastpass',
      'login',
      'username',
      'website',
    ],
  },
  {
    id: 'reminder-note',
    section: 'reminders',
    type: 'reminder-note',
    title: 'Reminder Note',
    baseConfidence: 0.74,
    keywords: [
      'reminder',
      'follow up',
      'deadline',
      'task',
      'appointment',
      'schedule',
      'meeting',
      'visit',
      'submit before',
    ],
  },
  {
    id: 'passport',
    section: 'documents',
    type: 'passport',
    title: 'Passport',
    baseConfidence: 0.94,
    keywords: [
      'passport',
      'passport no',
      'passport number',
      'nationality',
      'date of birth',
      'date of expiry',
      'place of birth',
      'issuing authority',
    ],
  },
  {
    id: 'license-or-id',
    section: 'documents',
    type: 'license',
    title: 'Identity Document',
    baseConfidence: 0.9,
    keywords: [
      'national identity card',
      'identity card',
      'cnic',
      'nic',
      'smart card',
      'driving license',
      'license no',
      'date of birth',
      'father name',
      'gender',
      'sex',
      'card number',
      'id number',
    ],
    negativeKeywords: ['bill amount', 'invoice total'],
  },
  {
    id: 'certificate',
    section: 'documents',
    type: 'contract',
    title: 'Certificate',
    baseConfidence: 0.9,
    keywords: [
      'certificate',
      'maintenance certificate',
      'account maintenance certificate',
      'salary certificate',
      'bank certificate',
      'employment certificate',
      'this is to certify',
      'certify that',
      'hereby certify',
      'account maintenance',
    ],
    negativeKeywords: ['warranty certificate'],
  },
  {
    id: 'insurance',
    section: 'documents',
    type: 'insurance',
    title: 'Insurance Document',
    baseConfidence: 0.88,
    keywords: [
      'insurance',
      'policy number',
      'policy no',
      'insured',
      'premium',
      'sum insured',
      'claim',
      'coverage',
    ],
  },
  {
    id: 'statement',
    section: 'documents',
    type: 'statement',
    title: 'Statement',
    baseConfidence: 0.78,
    keywords: [
      'statement',
      'statement period',
      'opening balance',
      'closing balance',
      'transaction',
      'account statement',
    ],
  },
  {
    id: 'receipt',
    section: 'documents',
    type: 'receipt',
    title: 'Receipt',
    baseConfidence: 0.78,
    keywords: [
      'receipt',
      'payment received',
      'paid amount',
      'thank you for your payment',
      'cash receipt',
      'sale receipt',
    ],
  },
  {
    id: 'invoice',
    section: 'documents',
    type: 'invoice',
    title: 'Invoice',
    baseConfidence: 0.8,
    keywords: [
      'invoice',
      'invoice no',
      'invoice number',
      'bill to',
      'subtotal',
      'tax',
      'total',
    ],
  },
  {
    id: 'general-document',
    section: 'documents',
    type: 'contract',
    title: 'General Document',
    baseConfidence: 0.66,
    keywords: [
      'contract',
      'agreement',
      'document',
      'policy',
      'terms',
      'signed',
      'signature',
    ],
  },
  {
    id: 'tax-us',
    section: 'documents',
    type: 'tax-document',
    title: 'US Tax Document',
    baseConfidence: 0.95,
    keywords: [
      'irs',
      'internal revenue service',
      '1099',
      '1099-int',
      '1099-div',
      '1099-b',
      '1099-misc',
      'consolidated forms 1099',
      'year-end messages',
      'tax package',
      'form 1040',
      'form w-2',
      'w-2 wage and tax',
      'tax return',
      'adjusted gross income',
      'federal income tax',
      'social security tax',
      'employer identification number',
      'ein',
      'ssn',
    ],
  },
  {
    id: 'tax-pk',
    section: 'documents',
    type: 'tax-document',
    title: 'Pakistan Tax Document',
    baseConfidence: 0.95,
    keywords: [
      'fbr',
      'federal board of revenue',
      'income tax return',
      'form 114',
      'wealth statement',
      'cpr',
      'computerized payment receipt',
      'psid',
      'ntn',
      'national tax number',
      'strn',
      'sales tax registration',
      'withholding tax',
    ],
  },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\r/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const cleanTextValue = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const stripExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, '').trim();

const parseMoney = (raw: string) => {
  const cleaned = raw.replace(/[, ]/g, '');
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
};

const cleanNumericValue = (value?: string) => {
  if (!value) return undefined;
  // Preserve hyphens for account numbers, but strip other non-digit chars
  const cleaned = value.replace(/[^\d-]/g, '').replace(/^-+|-+$/g, '');
  if (!cleaned) return undefined;
  return cleaned;
};

const isLikelyYear = (value: number) => value >= 1900 && value <= 2100;

const findLastLabelIndex = (text: string, label: string) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'ig');
  let lastIndex = -1;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    lastIndex = match.index;
  }

  return lastIndex;
};

const findAmountsInWindow = (windowText: string) => {
  return Array.from(windowText.matchAll(/\b\d[\d,]*(?:\.\d{1,2})?\b/g))
    .map((match) => match[0])
    .map((value) => parseMoney(value))
    .filter((value): value is number => value !== undefined && value < 1000000000); // Filter out > 9 digits (likely identifiers)
};

const maskSensitiveValue = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value.replace(/[^\d]/g, '');
  // Mask 9-digit SSN
  if (cleaned.length === 9) {
    return `XXX-XX-${cleaned.slice(-4)}`;
  }
  // Mask 13-digit CNIC (Pakistan)
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(-1)} (Masked)`;
  }
  return value;
};

const extractAmountByLabels = (text: string, labels: string[], options?: { maxBillAmount?: number }) => {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Improved regex: label + (optionally "by [date]" or other text) + currency + amount
    // Handles: "Total Amount Due by 08/28/2019 $88.14"
    const regex = new RegExp(
      `${escaped}(?:\\s+(?:by|on)\\s+\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4})?[\\s:#-]{0,25}(?:rs\\.?|pkr|usd|eur|€|\\$)?\\s*([\\d,]+(?:\\.\\d{1,2})?)`,
      'i',
    );
    const match = text.match(regex);
    if (match?.[1]) {
      const parsed = parseMoney(match[1]);
      if (parsed !== undefined && (!options?.maxBillAmount || parsed < options.maxBillAmount)) return parsed;
    }

    const labelMatch = new RegExp(escaped, 'i').exec(text);
    if (labelMatch?.index !== undefined) {
      const windowText = text.slice(labelMatch.index, labelMatch.index + 220);
      const amounts = findAmountsInWindow(windowText).filter(
        (value) => !isLikelyYear(value) && (!options?.maxBillAmount || value < options.maxBillAmount),
      );
      if (amounts.length > 0) {
        return amounts[0];
      }
    }
  }

  return undefined;
};

const extractAmountNearLastLabel = (
  text: string,
  labels: string[],
  options?: {
    excludeValues?: number[];
    pick?: 'first' | 'last';
    maxWindow?: number;
    minValue?: number;
    maxValue?: number;
  },
) => {
  const pick = options?.pick ?? 'first';
  const maxWindow = options?.maxWindow ?? 220;
  const excludeValues = options?.excludeValues ?? [];
  const minValue = options?.minValue;
  const maxValue = options?.maxValue;

  for (const label of labels) {
    const index = findLastLabelIndex(text, label);
    if (index >= 0) {
      const windowText = text.slice(index, index + maxWindow);
      const amounts = findAmountsInWindow(windowText).filter(
        (value) =>
          !isLikelyYear(value) &&
          !excludeValues.includes(value) &&
          (minValue === undefined || value >= minValue) &&
          (maxValue === undefined || value <= maxValue),
      );

      if (amounts.length > 0) {
        return pick === 'last' ? amounts[amounts.length - 1] : amounts[0];
      }
    }
  }

  return undefined;
};

const extractFescoAmounts = (
  text: string,
): { amountDue?: number; lateAmount?: number; lateAmountPayable?: number } => {
  const amountCandidates = [
    extractAmountNearLastLabel(text, ['payable within due date', 'payable within due', 'payable within'], {
      pick: 'first',
      maxWindow: 120,
      minValue: 100,
    }),
    extractAmountNearLastLabel(text, ['current bill'], {
      pick: 'first',
      maxWindow: 120,
      minValue: 100,
    }),
  ].filter((value): value is number => value !== undefined);

  const payableAfter = extractAmountNearLastLabel(
    text,
    ['payable after due date', 'payable after due', 'amount after due date'],
    {
      pick: 'first',
      maxWindow: 120,
      minValue: 100,
      excludeValues: amountCandidates,
    },
  );

  const surcharge = extractAmountNearLastLabel(
    text,
    ['l.p.surcharge', 'l.p. surcharge', 'lp surcharge', 'lp. surcharge', 'late pay surcharge'],
    {
      pick: 'first',
      maxWindow: 120,
      minValue: 1,
      maxValue: 100000,
      excludeValues: [...amountCandidates, ...(payableAfter !== undefined ? [payableAfter] : [])],
    },
  );

  const reconstructedWithin =
    payableAfter !== undefined && surcharge !== undefined
      ? payableAfter - surcharge
      : undefined;

  if (
    reconstructedWithin !== undefined &&
    reconstructedWithin > 100 &&
    !isLikelyYear(reconstructedWithin)
  ) {
    amountCandidates.push(reconstructedWithin);
  }

  const amountDue = amountCandidates.length > 0 ? Math.max(...amountCandidates) : undefined;
  const lateAmountPayable =
    payableAfter ??
    (amountDue !== undefined && surcharge !== undefined ? amountDue + surcharge : undefined);
  const lateAmount =
    surcharge ??
    (lateAmountPayable !== undefined && amountDue !== undefined
      ? lateAmountPayable - amountDue
      : undefined);

  return {
    amountDue,
    lateAmount,
    lateAmountPayable,
  };
};

const extractUtilityPrimaryAmount = (text: string) => {
  const footerFirst = extractAmountNearLastLabel(text, ['payable within due date', 'payable within due', 'ouedate'], {
    pick: 'first',
    maxWindow: 180,
  });
  if (footerFirst !== undefined) return footerFirst;

  const summaryFirst = extractAmountNearLastLabel(text, ['amount due', 'amount', 'due', 'grand total', 'total payment'], {
    pick: 'first',
    maxWindow: 180,
  });
  if (summaryFirst !== undefined) return summaryFirst;

  for (const label of [
    'total amount due',
    'total amount',
    'account summary',
    'statement summary',
    'payable within due date',
    'amount due',
    'current bill',
    'current charges',
    'total due',
    'payable',
  ]) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelMatch = new RegExp(escaped, 'i').exec(text);

    if (labelMatch?.index !== undefined) {
      const windowText = text.slice(labelMatch.index, labelMatch.index + 220);
      const amounts = findAmountsInWindow(windowText).filter((value) => !isLikelyYear(value));
      if (amounts.length > 0) return amounts[0];
    }
  }

  return extractAmountByLabels(text, [
    'total amount due',
    'payable within due date',
    'amount due',
    'current bill',
    'current charges',
    'total due',
    'payable',
  ]);
};

const extractUtilityLateAmount = (text: string, primaryAmount?: number) => {
  // Common pattern: "After 12/30/2024 Pay $92.98"
  const afterPayMatch = text.match(/after\s+[0-9/-]{6,10}\s+pay[\s:#\-$]*([0-9,]+(?:\.\d{1,2})?)/i);
  if (afterPayMatch?.[1]) {
    const amt = parseMoney(afterPayMatch[1]);
    if (amt !== undefined && amt !== primaryAmount && !isLikelyYear(amt)) {
       return amt;
    }
  }

  const footerFirst = extractAmountNearLastLabel(
    text,
    ['payable after due date', 'amount after due date', 'amount after due'],
    {
      excludeValues: primaryAmount !== undefined ? [primaryAmount] : [],
      pick: 'first',
      maxWindow: 180,
    },
  );
  if (footerFirst !== undefined) return footerFirst;

  for (const label of [
    'payable after due date',
    'amount after due date',
    'amount after due',
    'after due date',
    'after due',
    'late pay surcharge',
    'late payment surcharge',
    'late amount',
  ]) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelMatch = new RegExp(escaped, 'i').exec(text);

    if (labelMatch?.index !== undefined) {
      const windowText = text.slice(labelMatch.index, labelMatch.index + 260);

      const amounts = findAmountsInWindow(windowText).filter((value) => {
        if (isLikelyYear(value)) return false;
        if (primaryAmount !== undefined && value === primaryAmount) return false;
        return true;
      });

      if (amounts.length > 0) {
        return amounts[0];
      }
    }
  }

  const fallback = extractAmountByLabels(text, [
    'payable after due date',
    'amount after due date',
    'amount after due',
    'after due date',
    'late pay surcharge',
    'late payment surcharge',
    'late amount',
  ]);

  if (fallback !== undefined && !isLikelyYear(fallback) && fallback !== primaryAmount) {
    return fallback;
  }

  return undefined;
};

const extractAmount = (text: string) =>
  extractAmountByLabels(text, [
    'total amount due',
    'amount due',
    'current due',
    'current bill',
    'total due',
    'payable within due date',
    'payable',
    'net payable',
    'bill amount',
    'amount payable',
    'total',
    'subtotal',
    'amount',
  ]);

const extractLateAmount = (text: string) =>
  extractAmountByLabels(text, [
    'amount after due date',
    'after due date',
    'after due',
    'late pay surcharge',
    'late payment surcharge',
    'late amount',
    'payment after due',
  ], {
    maxBillAmount: 1000000, // Stricter limit for late amounts to avoid identifiers
  });

const extractField = (text: string, label: string, fallbackLabels: string[] = []) => {
  const labels = [label, ...fallbackLabels];

  for (const candidate of labels) {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const lineRegex = new RegExp(`${escaped}\\s*[:#-]?\\s*([^\\n]{2,100})`, 'i');
    const lineMatch = text.match(lineRegex);
    if (lineMatch?.[1]) {
      const cleaned = cleanTextValue(lineMatch[1]);
      if (cleaned) {
        return cleaned
          .split(/ {2,}/)[0]
          .split(/\s{3,}/)[0]
          .trim();
      }
    }

    const looseRegex = new RegExp(`${escaped}[\\s\\S]{0,50}?([A-Z0-9\\-/ ]{4,60})`, 'i');
    const looseMatch = text.match(looseRegex);
    if (looseMatch?.[1]) {
      const cleaned = cleanTextValue(looseMatch[1]);
      if (cleaned) return cleaned;
    }
  }

  return undefined;
};

const extractFieldNearLabels = (text: string, labels: string[], valueRegex: RegExp, useLast = false) => {
  for (const label of labels) {
    const index = useLast ? findLastLabelIndex(text, label) : text.search(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    if (index >= 0) {
      const windowText = text.slice(index, index + 260);
      const match = windowText.match(valueRegex);
      if (match?.[1]) {
        const cleaned = cleanTextValue(match[1]);
        if (cleaned) return cleaned;
      }
    }
  }

  return undefined;
};

const extractTextByLabels = (text: string, labels: string[], maxLength = 40, useLast = false) => {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const index = useLast ? findLastLabelIndex(text, label) : text.search(new RegExp(escaped, 'i'));

    if (index >= 0) {
      const windowText = text.slice(index, index + 180);

      const lineRegex = new RegExp(`${escaped}\\s*[:#-]?\\s*([^\\n]{2,${maxLength}})`, 'i');
      const lineMatch = windowText.match(lineRegex);
      if (lineMatch?.[1]) {
        const cleaned = cleanTextValue(lineMatch[1]);
        if (cleaned) return cleaned;
      }

      const looseRegex = new RegExp(
        `([A-Za-z]{2,10}\\s+[0-9]{2,4}|[0-9]{1,2}\\s+[A-Za-z]{3,10}\\s+[0-9]{2,4}|[0-9]{1,2}[\\/-][0-9]{1,2}[\\/-][0-9]{2,4}|[A-Z0-9\\- /]{4,${maxLength}})`,
        'i',
      );
      const looseMatch = windowText.match(looseRegex);
      if (looseMatch?.[1]) {
        const cleaned = cleanTextValue(looseMatch[1]);
        if (cleaned) return cleaned;
      }
    }
  }

  return undefined;
};

const extractLikelyDocumentNumber = (text: string) => {
  const patterns = [
    /\b\d{5}-\d{7}-\d\b/,
    /\b[A-Z]{2,6}\d{4,20}\b/,
    /\b[A-Z0-9]{6,20}\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) return match[0];
  }

  return undefined;
};

const extractUtilityAccountNumber = (text: string) => {
  const fromLabels =
    extractField(text, 'account id', [
      'account id/esn',
      'account no',
      'account number',
      'consumer no',
      'consumer id',
      'registration no',
      'registration number',
      'challan no',
      'challan number',
    ]) ?? '';

  // Priority for Pakistani DISCOs (FESCO, MEPCO, etc.)
  if (text.toLowerCase().includes('fesco') || text.toLowerCase().includes('supply company')) {
    // Priority: 1. Consumer ID (10 digits), 2. Reference Number (14 digits)
    const consId = text.match(/\b(1\d{9})\b/); // Often starts with 1
    if (consId) return consId[1];
    const refNum = extractDISCOReferenceNumber(text);
    if (refNum) return refNum;
  }

  if (text.toLowerCase().includes('sui northern') || text.toLowerCase().includes('sngpl')) {
    const sngpl = extractSNGPLAccount(text);
    if (sngpl) return sngpl;
  }

  if (text.toLowerCase().includes('pg&e') || text.toLowerCase().includes('pacific gas')) {
    const pge = extractPGEAccount(text);
    if (pge) return pge;
  }

  const numericFromLabels = cleanNumericValue(fromLabels);
  if (numericFromLabels && numericFromLabels.length >= 6) {
    return numericFromLabels;
  }

  const accountIdRegexes = [
    /account id\/esn[\s:=-]*([0-9]{6,20})/i,
    /account id[\s:=-]*([0-9]{6,20})/i,
    /account no[\s:=-]*([0-9]{6,20})/i,
    /account number[\s:=-]*([0-9]{6,20})/i,
    /consumer no[\s:=-]*([0-9]{6,20})/i,
    /consumer id[\s:=-]*([0-9]{6,20})/i,
  ];

  for (const regex of accountIdRegexes) {
    const match = text.match(regex);
    if (match?.[1]) return match[1];
  }

  const fallbackLongNumbers = text.match(/\b\d{9,20}\b/g) ?? [];
  const candidate = fallbackLongNumbers.find((value) => !/^20\d{2}$/.test(value));
  return candidate;
};

const cleanBillingMonth = (value?: string) => {
  if (!value) return undefined;

  const cleaned = value
    .replace(/^[^A-Za-z0-9]+/, '')
    .replace(/^[a-z]{1,2}\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const match = cleaned.match(
    /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{2,4}\b/i,
  );

  if (match?.[0]) {
    return titleCase(match[0]);
  }

  return cleaned || undefined;
};

const parseDateParts = (raw: string): Date | undefined => {
  const value = raw.replace(/[.,]/g, '/').replace(/\s+/g, ' ').trim();

  const numeric = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    const p1 = Number(numeric[1]);
    const p2 = Number(numeric[2]);
    let year = Number(numeric[3]);

    if (year < 100) year += 2000;

    const d1 = new Date(year, p2 - 1, p1);
    const validDDMM = d1.getFullYear() === year && d1.getMonth() === p2 - 1 && d1.getDate() === p1;

    const d2 = new Date(year, p1 - 1, p2);
    const validMMDD = d2.getFullYear() === year && d2.getMonth() === p1 - 1 && d2.getDate() === p2;

    const region = detectMarketRegion(raw);

    if (region === 'US') {
      if (validMMDD) return d2;
      if (validDDMM) return d1;
    } else if (region === 'PK') {
      if (validDDMM) return d1;
      if (validMMDD) return d2;
    }

    if (validMMDD && !validDDMM) return d2;
    if (validDDMM && !validMMDD) return d1;
    if (validDDMM && validMMDD) return d1; // Default to DD/MM to maintain legacy behavior
  }

  const named1 =
    /\b(\d{1,2})\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{2,4})\b/i;
  const match1 = value.match(named1);

  if (match1) {
    const day = Number(match1[1]);
    let year = Number(match1[3]);
    if (year < 100) year += 2000;

    const monthMap: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };

    const month = monthMap[match1[2].toLowerCase()];
    const date = new Date(year, month, day);

    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // DD-Mon-YYYY or DD-Mon-YY (hyphens instead of spaces — common in Pakistani bills)
  const named2 =
    /\b(\d{1,2})-(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)-(\d{2,4})\b/i;
  const match2 = value.match(named2);

  if (match2) {
    const day = Number(match2[1]);
    let year = Number(match2[3]);
    if (year < 100) year += 2000;

    const monthMap: Record<string, number> = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, sept: 8, september: 8,
      oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
    };

    const month = monthMap[match2[2].toLowerCase()];
    const date = new Date(year, month, day);

    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  return undefined;
};

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const extractDateByLabels = (
  text: string,
  labels: string[],
  type: DetectedDateType,
  confidence: number,
) => {
  const results: DetectedDate[] = [];

  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(
      `${escaped}\\s*[:#-]?\\s*([0-9]{1,2}[\\/\\-][0-9]{1,2}[\\/\\-][0-9]{2,4}|[0-9]{1,2}\\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\\s+[0-9]{2,4})`,
      'i',
    );

    const match = text.match(regex);
    if (match?.[1]) {
      const parsed = parseDateParts(match[1]);
      if (parsed) {
        results.push({
          date: Timestamp.fromDate(parsed),
          type,
          confidence,
          sourceText: match[0],
          confirmed: false,
        });
      }
    }

    const looseRegex = new RegExp(
      `${escaped}[\\s\\S]{0,80}?([0-9]{1,2}[\\/\\-][0-9]{1,2}[\\/\\-][0-9]{2,4}|[0-9]{1,2}\\s+[A-Za-z]{3,10}\\s+[0-9]{2,4})`,
      'i',
    );
    const looseMatch = text.match(looseRegex);
    if (looseMatch?.[1]) {
      const parsed = parseDateParts(looseMatch[1]);
      if (parsed) {
        results.push({
          date: Timestamp.fromDate(parsed),
          type,
          confidence: Math.max(0.7, confidence - 0.08),
          sourceText: looseMatch[0],
          confirmed: false,
        });
      }
    }
  }

  return results;
};

const dedupeDetectedDates = (dates: DetectedDate[]) => {
  const seen = new Set<string>();
  return dates.filter((item) => {
    const key = `${item.type}_${item.date.toMillis()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const detectDates = (text: string): DetectedDate[] => {
  const detected: DetectedDate[] = [
    ...extractDateByLabels(text, ['due date', 'payment due', 'pay before'], 'due_date', 0.92),
    ...extractDateByLabels(text, ['expiry date', 'date of expiry', 'valid until', 'expires on'], 'expiry_date', 0.9),
    ...extractDateByLabels(text, ['issue date', 'date of issue', 'issued on', 'bill date', 'statement date'], 'issue_date', 0.86),
    ...extractDateByLabels(text, ['renewal date', 'renews on', 'next billing date', 'next renewal'], 'renewal_date', 0.9),
    ...extractDateByLabels(text, ['deadline', 'submit before'], 'deadline', 0.82),
  ];

  return dedupeDetectedDates(detected);
};

const findBestDateText = (dates: DetectedDate[], type: DetectedDateType) => {
  const match = dates.find((item) => item.type === type);
  if (!match) return undefined;
  return formatDate(match.date.toDate());
};

const extractUtilityDateText = (text: string, labels: string[], useLast = false) => {
  const directText = extractTextByLabels(text, labels, 40, useLast);
  const parsedDirect = directText ? parseDateParts(directText) : undefined;
  if (parsedDirect) return formatDate(parsedDirect);

  for (const label of labels) {
    const index = useLast ? findLastLabelIndex(text, label) : text.search(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    if (index >= 0) {
      const windowText = text.slice(index, index + 140);
      const match = windowText.match(/([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,10}\s+[0-9]{2,4})/i);
      if (match?.[1]) {
        const parsed = parseDateParts(match[1]);
        if (parsed) return formatDate(parsed);
      }
    }
  }

  return undefined;
};

const extractAllNumericDates = (text: string) => {
  return Array.from(
    text.matchAll(
      /\b([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|\d{1,2}\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+[0-9]{2,4})\b/gi,
    ),
  )
    .map((match) => match[1])
    .map((value) => parseDateParts(value))
    .filter((value): value is Date => value !== undefined);
};

const extractValueBeforeNextLabel = (
  text: string,
  startLabel: string,
  nextLabels: string[],
  maxChars: number = 240,
): string | undefined => {
  const toLabelRegex = (label: string) => {
    const tokens = label
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return tokens.join('\\s+');
  };

  const startRegex = toLabelRegex(startLabel);
  const startIndex = text.search(new RegExp(startRegex, 'i'));
  if (startIndex < 0) return undefined;

  let endIndex = startIndex + maxChars;
  for (const nextLabel of nextLabels) {
    const nextRegex = toLabelRegex(nextLabel);
    const relativeIndex = text.slice(startIndex + 1).search(new RegExp(nextRegex, 'i'));
    if (relativeIndex >= 0) {
      endIndex = Math.min(endIndex, startIndex + 1 + relativeIndex);
    }
  }

  const segment = text.slice(startIndex, endIndex);
  return cleanTextValue(segment);
};

const isAllZeroNumericString = (value: string) => /^0+$/.test(value);

const extractFescoTopRowField = (text: string, fieldLabel: string, nextLabels: string[]) => {
  return extractValueBeforeNextLabel(text, fieldLabel, nextLabels, 220);
};

const extractFescoBillMonthFromTop = (text: string): string | undefined => {
  const headerText = text.slice(0, 2400);
  const footerStartIdx = text.search(/BILL\s+MONTH\s+DUE\s+DATE/i);
  const footerText = footerStartIdx >= 0 ? text.slice(footerStartIdx) : text.slice(-1400);

  // Infer billing month as 1 month before due month (common FESCO cycle).
  // We try to extract due month/year from the due-date column labels.
  const dueHeaderSeg =
    extractValueBeforeNextLabel(headerText, 'OUT DATE', ['REFERENCE NO', 'REFERENCE NUMBER', 'CONSUMER', 'PAYABLE WITHIN', 'PAYABLE AFTER'], 360) ??
    extractValueBeforeNextLabel(headerText, 'DUE DATE', ['REFERENCE NO', 'REFERENCE NUMBER', 'CONSUMER', 'PAYABLE WITHIN', 'PAYABLE AFTER'], 360);

  // Footer is OCR-noisy; pick year from the month+year token if possible (e.g. "TEMAR 24").
  const footerMonthYearAll = Array.from(
    footerText.matchAll(
      /\b([A-Za-z]{2,12})\s*(\d{2})\b/gi,
    ),
  );
  const footerMarMatch = footerMonthYearAll
    .slice()
    .reverse()
    .find((m) => /mar/i.test(m[1] ?? '') || /temar/i.test(m[1] ?? ''));
  const footerLastMonthYear = footerMonthYearAll[footerMonthYearAll.length - 1];
  const year2FromFooter =
    footerMarMatch?.[2] ??
    footerLastMonthYear?.[2];

  const dueMonthTokenMatch = dueHeaderSeg?.match(
    /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i,
  );
  const dueMonthToken = dueMonthTokenMatch?.[1];

  // If footer year exists, use it; otherwise fall back to header parsed year (may be OCR-noisy).
  const dueYear2 = year2FromFooter ?? dueHeaderSeg?.match(/\b(\d{2,4})\b/)?.[1]?.slice(-2);
  if (!dueYear2 || !dueMonthToken) return undefined;

  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const dueMonthIdx = monthMap[dueMonthToken.toLowerCase()];
  const billingMonthIdx = (dueMonthIdx + 11) % 12; // due - 1 month
  const billingYearFull = 2000 + Number(dueYear2);

  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][billingMonthIdx];
  return `${monthShort} ${billingYearFull.toString().slice(-2)}`;
};

const extractDateFromFescoSegment = (segment: string): string | undefined => {
  const match = segment.match(
    /\b([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+[0-9]{2,4})\b/i,
  );
  if (!match?.[1]) return undefined;
  const parsed = parseDateParts(match[1]);
  return parsed ? formatDate(parsed) : undefined;
};

const extractFescoIssueDate = (text: string, dueDateText?: string): string | undefined => {
  const headerText = text.slice(0, 2400);
  const dueParsed = dueDateText ? parseDateParts(dueDateText) : undefined;

  // Prefer reconstructing issue date based on due-date cycle.
  if (dueParsed) {
    const dueYear2 = dueParsed.getFullYear().toString().slice(-2);
    const issueMonthIdx = (dueParsed.getMonth() + 11) % 12; // due month - 1

    // OCR often fuses "DD FEB YY" into a 6-digit token like 267824.
    // We'll scan the header area between issue-date column label and due-date column label.
    // Stop at body labels (CONSUM*/REFERENCE) so we don't cut off at the column header row.
    const issueSeg =
      extractValueBeforeNextLabel(headerText, 'ISSUL DATE', ['CONSUM', 'REFERENCE', 'PAYABLE'], 900) ??
      extractValueBeforeNextLabel(headerText, 'ISSUE DATE', ['CONSUM', 'REFERENCE', 'PAYABLE'], 900) ??
      extractValueBeforeNextLabel(headerText, 'DATE OF ISSUE', ['CONSUM', 'REFERENCE', 'PAYABLE'], 900);

    if (issueSeg) {
      const sixDigitTokens = issueSeg.match(/\b\d{6}\b/g) ?? [];
      const candidates: Array<{ issue: Date; diffDays: number }> = [];

      for (const tok of sixDigitTokens) {
        const baseDay = Number(tok.slice(0, 2));
        const year2 = tok.slice(4, 6);
        if (year2 !== dueYear2) continue;

        // OCR sometimes misreads the day digit (e.g. 28 -> 26). When the due-cycle window matches,
        // we allow a small +2 adjustment and pick the closest date to dueDate.
        const possibleDays = [baseDay, baseDay + 2, baseDay - 2].filter((d) => d >= 1 && d <= 31);
        for (const day of possibleDays) {
          const issue = new Date(2000 + Number(year2), issueMonthIdx, day);
          const diffDays = Math.floor((dueParsed.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 1 && diffDays <= 45) {
            candidates.push({ issue, diffDays });
          }
        }
      }

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.diffDays - b.diffDays); // closest (smallest diff) to due date
        return formatDate(candidates[0].issue);
      }
    }

    // If no 6-digit tokens, fall back to any parseable date in the expected month/year window.
    const candidates = extractAllNumericDates(headerText).filter(
      (d) => d.getFullYear() === dueParsed.getFullYear() && d.getMonth() === issueMonthIdx,
    );

    const withDiff = candidates
      .map((d) => ({
        date: d,
        diffDays: Math.floor((dueParsed.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .filter((x) => x.diffDays >= 1 && x.diffDays <= 45)
      .sort((a, b) => Math.abs(a.diffDays) - Math.abs(b.diffDays));

    if (withDiff.length > 0) return formatDate(withDiff[0].date);
  }

  // Generic fallback (kept for robustness if due-date couldn't be extracted).
  const segment =
    extractFescoTopRowField(headerText, 'ISSUE DATE', ['DUE DATE']) ??
    extractFescoTopRowField(headerText, 'DATE OF ISSUE', ['DUE DATE']) ??
    extractFescoTopRowField(headerText, 'ISSUL DATE', ['DUE DATE']);

  const labeled = segment ? extractDateFromFescoSegment(segment) : undefined;
  if (labeled) return labeled;

  const candidates = extractAllNumericDates(headerText);
  if (candidates.length === 0) return undefined;

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return formatDate(candidates[0]);
};

const extractFescoDueDate = (text: string): string | undefined => {
  const headerText = text.slice(0, 2400);
  const footerStartIdx = text.search(/BILL\s+MONTH\s+DUE\s+DATE/i);
  const footerText = footerStartIdx >= 0 ? text.slice(footerStartIdx) : text.slice(-1400);

  // Header due usually contains full "DD MMM YY" but OCR may misread YY (e.g. 28 instead of 24).
  const dueHeaderSeg =
    extractValueBeforeNextLabel(
      headerText,
      'OUT DATE',
      ['REFERENCE NO', 'REFERENCE NUMBER', 'CONSUMER', 'PAYABLE WITHIN', 'PAYABLE AFTER'],
      360,
    ) ?? extractValueBeforeNextLabel(headerText, 'DUE DATE', ['PAYABLE', 'REFERENCE NO', 'CONSUMER'], 360);

  const dueHeaderMatches = Array.from(
    dueHeaderSeg?.matchAll(
      /\b(\d{1,2})\s*(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\w*\s*(\d{2,4})\b/gi,
    ) ?? [],
  );

  // Footer due-year is often clearer (e.g. "TEMAR 24").
  const footerMonthYearAll = Array.from(
    footerText.matchAll(
      /\b([A-Za-z]{2,12})\s*(\d{2})\b/gi,
    ),
  );
  // Prefer MAR/TEMAR token year, otherwise fall back to the last month-year occurrence.
  const footerMarMatch = footerMonthYearAll
    .slice()
    .reverse()
    .find((m) => /mar/i.test(m[1] ?? ''));
  const footerLastMonthYear = footerMonthYearAll[footerMonthYearAll.length - 1];
  const year2FromFooter = footerMarMatch?.[2] ?? footerLastMonthYear?.[2];

  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  // Choose the last date match inside the due column segment (avoid connection date).
  const dueHeaderMatch = dueHeaderMatches.length > 0 ? dueHeaderMatches[dueHeaderMatches.length - 1] : undefined;

  if (dueHeaderMatch) {
    const day = Number(dueHeaderMatch[1]);
    const monthToken = dueHeaderMatch[2].toLowerCase();
    const yearRaw = dueHeaderMatch[3];
    const year2FromHeader = yearRaw.length === 4 ? yearRaw.slice(-2) : yearRaw;
    const dueYearFull = 2000 + Number(year2FromFooter ?? year2FromHeader);
    const dueMonthIdx = monthMap[monthToken];

    const due = new Date(dueYearFull, dueMonthIdx, day);
    if (due.getFullYear() === dueYearFull && due.getMonth() === dueMonthIdx && due.getDate() === day) {
      return formatDate(due);
    }
  }

  // If we can't parse from the due column, fall back to generic date detection
  // but clamp to the most likely year (footer year if available).
  const candidates = extractAllNumericDates(text);
  if (candidates.length === 0) return undefined;

  if (year2FromFooter) {
    const dueYearFull = 2000 + Number(year2FromFooter);
    const yearFiltered = candidates.filter((d) => d.getFullYear() === dueYearFull);
    if (yearFiltered.length > 0) {
      yearFiltered.sort((a, b) => b.getTime() - a.getTime());
      return formatDate(yearFiltered[0]);
    }
  }

  candidates.sort((a, b) => b.getTime() - a.getTime());
  return formatDate(candidates[0]);
};

const extractFescoReferenceNumber = (text: string): string | undefined => {
  const referenceIdx = text.search(/reference/i);
  const windowText = referenceIdx >= 0 ? text.slice(referenceIdx, referenceIdx + 500) : text;

  // 1) Ideal spaced form: 18 13444 1374001 R
  const spaced = windowText.match(/(\d{1,2})\s+(\d{5,6})\s+(\d{6,10})\s*R\b/i);
  if (spaced) {
    // Prefer the correct "18 ..." form; OCR sometimes loses the leading digit and produces "8 ...".
    if (spaced[1].length >= 2) return `${spaced[1]} ${spaced[2]} ${spaced[3]} R`;
  }

  // 2) OCR merged form: 1813444 1374001 R
  const merged = windowText.match(/\b(\d{7})\s+(\d{7})\s*R\b/i);
  if (merged) {
    const first7 = merged[1];
    const third = merged[2];
    // Split 7-digit into 2-digit + 5-digit: 1813444 -> 18 + 13444
    return `${first7.slice(0, 2)} ${first7.slice(2)} ${third} R`;
  }

  // 3) Sometimes R is present but separators are noisy; try a weaker merged match.
  const mergedWeaker = windowText.match(/\b(\d{7,8})\s+(\d{7})\s*R\b/i);
  if (mergedWeaker) {
    const first = mergedWeaker[1];
    const third = mergedWeaker[2];
    if (first.length === 7) return `${first.slice(0, 2)} ${first.slice(2)} ${third} R`;
  }

  return undefined;
};

const pickBestNonZeroNumericCandidate = (candidates: string[]): string | undefined => {
  const valid = candidates.filter((c) => c.length >= 6 && c.length <= 20 && !isAllZeroNumericString(c));
  if (valid.length === 0) return undefined;

  valid.sort((a, b) => {
    const aNonZero = a.replace(/0/g, '').length;
    const bNonZero = b.replace(/0/g, '').length;
    if (b.length !== a.length) return b.length - a.length;
    return bNonZero - aNonZero;
  });

  return valid[0];
};

const extractFescoConsumerId = (text: string): string | undefined => {
  // Prefer digits near the CONSUMER label variants (OCR often turns ID/NO into 1D/10).
  const matches = Array.from(
    text.matchAll(/CONSUM\w*\s*(?:ID|1D|10|NO)?\s*[^0-9]{0,80}(\d{8,15})/gi),
  ).map((m) => m[1]);

  const nonZero = matches.filter((c) => !isAllZeroNumericString(c));
  const bestNearConsumer = pickBestNonZeroNumericCandidate(nonZero);
  if (bestNearConsumer) {
    // OCR sometimes truncates the last digit, so we may have both a 9-digit and a 10-digit variant.
    // If they share the first 8 digits, prefer: (9-digit) + (last digit from 10-digit).
    const c9 = pickBestNonZeroNumericCandidate(nonZero.filter((c) => c.length === 9));
    const c10 = pickBestNonZeroNumericCandidate(nonZero.filter((c) => c.length === 10));
    if (c9 && c10 && c9.slice(0, 8) === c10.slice(0, 8)) {
      return `${c9}${c10.slice(-1)}`;
    }
    return bestNearConsumer;
  }

  // Fallback: use old A/C number only if it is not all zeros.
  const oldSegment =
    extractValueBeforeNextLabel(text, 'OLD A/C NUMBER', ['REFERENCE NO', 'PAYABLE WITHIN DUE DATE', 'PAYABLE AFTER DUE DATE']) ??
    extractValueBeforeNextLabel(text, 'OLD A/C NO', ['REFERENCE NO', 'PAYABLE WITHIN DUE DATE', 'PAYABLE AFTER DUE DATE']);

  if (oldSegment) {
    const oldMatches = oldSegment.match(/\d{8,15}/g) ?? [];
    return pickBestNonZeroNumericCandidate(oldMatches);
  }

  return undefined;
};

const extractPtclReferenceNumber = (text: string): string | undefined => {
  // PTCL bills often show a top-right "INVOICE" line with a short reference like 0992-386570.
  const invoiceIdx = text.search(/invoice\s*/i);
  const windowText = invoiceIdx >= 0 ? text.slice(invoiceIdx, invoiceIdx + 300) : text;

  const ref = windowText.match(/\b\d{4}-\d{6}\b/);
  if (ref?.[0]) return ref[0];

  return undefined;
};

const extractPtclPsid = (text: string): string | undefined => {
  // Example: "Virtual Identity No 99900020"
  const m = text.match(/virtual\s*identity\s*no?\s*[:#-]?\s*[^0-9]{0,20}([0-9]{6,15})/i);
  return m?.[1];
};

const extractPtclCustomerNumber = (text: string): string | undefined => {
  const m = text.match(/customer\s*(?:ntn\/stn\/cnic|ntn|stn|cnic)\s*[:#-]?\s*([0-9]{6,20})/i);
  return m?.[1];
};

// ── K-Electric specific extractors ──────────────────────────────────────────

/** KE Account Number: 13-digit number labelled "Account Number" (e.g. 0400005266678) */
const extractKEAccountNumber = (text: string): string | undefined => {
  const patterns = [
    /account\s+number[\s\S]{0,80}?(\b0\d{12}\b)/i,
    /account\s+number[\s\S]{0,80}?(\b\d{10,13}\b)/i,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1] && !isAllZeroNumericString(m[1])) return m[1];
  }
  // Known KE prefix: 0400XXXXXXXXX
  const kePrefix = text.match(/\b(0400\d{9})\b/);
  return kePrefix?.[1];
};

/** KE Invoice Number: 12-digit number after "Invoice Number" label or "Payment ID" */
const extractKEInvoiceNumber = (text: string): string | undefined => {
  const byLabel = text.match(/invoice\s+number[\s\S]{0,80}?(\b\d{12}\b)/i);
  if (byLabel?.[1]) return byLabel[1];
  // "Payment ID:" or OCR misread "Payment 10:" at the top of the bill
  const byPayment = text.match(/payment\s+(?:id|10|1d)\s*[:]?\s*(\d{12})/i);
  return byPayment?.[1];
};

/** KE Consumer Number: extract only the alphanumeric code before " | Contract" */
const extractKEConsumerNumber = (text: string): string | undefined => {
  // Matches "Consumer No.: LABT9879 | Contract No" → captures "LABT9879"
  const m = text.match(/consumer\s*no\.?\s*[.:#]?\s*([A-Z0-9]{4,20})(?:\s*[|]|\s+contract|\s*$)/i);
  return m?.[1];
};

/** KE Billing Month: "Bill Month May-2023" or "Bill Month\nMay-2023"
 *  Falls back to scanning the invoice-header line for "MMM-YYYY" tokens,
 *  but excludes short-year tokens (Jun-23) which belong to the due date. */
const extractKEBillingMonth = (text: string): string | undefined => {
  const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
  // 1) Prefer an explicit "Bill Month" label
  const byLabel = text.match(new RegExp(`bill\\s+month[\\s\\S]{0,60}?((?:${MONTHS})[-\\s]\\d{4})`, 'i'));
  if (byLabel?.[1]) return byLabel[1].replace(/\s+/, '-');
  // 2) Scan for full-year "May-2023" tokens (4-digit year, [- ] avoids cross-line matches)
  const fullYear = text.match(new RegExp(`\\b((?:${MONTHS})[- ]\\d{4})\\b`, 'i'));
  if (fullYear?.[1]) return fullYear[1].replace(/\s+/, '-');
  return undefined;
};

/** KE Issue Date: look for "Issue Date" label, or fall back to the bare
 *  date that appears on the same line as the invoice number header row.
 *  KE OCR often produces: "420015331480 29-May-2023 May-2023" with no label. */
const extractKEIssueDate = (text: string): string | undefined => {
  // 1) Explicit label
  const byLabel = extractUtilityDateText(text, ['issue date', 'bill date'], false);
  if (byLabel) return byLabel;
  // 2) Invoice-header line: find the invoice number then grab the first date after it
  const invoiceLineMatch = text.match(/\b(\d{12})\s+(\d{1,2}[-/][A-Za-z]{3,9}[-/]\d{2,4})/i);
  if (invoiceLineMatch?.[2]) {
    const parsed = parseDateParts(invoiceLineMatch[2]);
    if (parsed) return formatDate(parsed);
  }
  return undefined;
};

/** KE Due Date: handles "12th June 2023" (ordinal suffix) and footer "12-Jun-23".
 *  KE bills split the due date across lines ("12th\nJune\n2023"), so we collapse
 *  up to ~80 chars of whitespace/newlines near the last "due date" label. */
const extractKEDueDate = (text: string): string | undefined => {
  const lastDueDateIdx = findLastLabelIndex(text, 'due date');
  if (lastDueDateIdx >= 0) {
    // Grab a 400-char window, collapse newlines so split dates become parseable
    const rawWindow = text.slice(lastDueDateIdx, lastDueDateIdx + 400);
    // Strip ordinal suffixes then collapse whitespace runs
    const cleaned = rawWindow
      .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
      .replace(/\n+/g, ' ');
    const match = cleaned.match(
      /\b(\d{1,2}[-/][A-Za-z]{3,9}[-/]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/i,
    );
    if (match?.[1]) {
      const parsed = parseDateParts(match[1]);
      if (parsed) return formatDate(parsed);
    }
  }
  return undefined;
};

/**
 * KE Amounts: extract both "within due date" and "after due date" amounts.
 * The KE bill footer shows "Rs. 2,524  Rs. 2,732" on one line — that is the
 * most reliable source. Falls back to label-based extraction.
 */
const extractKEAmounts = (text: string): { amountDue?: number; lateAmount?: number } => {
  // Strategy 1: footer line with two Rs. amounts (within due | after due)
  const twoAmountMatches = Array.from(
    text.matchAll(/rs\.?\s*([\d,]+(?:\.\d{1,2})?)\s+rs\.?\s*([\d,]+(?:\.\d{1,2})?)/gi),
  );
  for (const match of [...twoAmountMatches].reverse()) {
    const a1 = parseMoney(match[1]);
    const a2 = parseMoney(match[2]);
    if (a1 && a2 && a1 > 500 && a2 > 500 && a2 > a1) {
      return { amountDue: a1, lateAmount: a2 };
    }
  }

  // Strategy 2: "Amount Payable" label (skip if "save" is nearby)
  let amountDue: number | undefined;
  const amtPayableAll = Array.from(text.matchAll(/amount\s+payable(?!\s+after)/gi));
  for (const match of amtPayableAll) {
    const idx = match.index ?? 0;
    const segment = text.slice(idx, idx + 250);
    if (/\bsave\b/i.test(segment)) continue;
    const amounts = findAmountsInWindow(segment).filter((v) => v > 500 && !isLikelyYear(v));
    if (amounts.length > 0) { amountDue = amounts[0]; break; }
  }

  // Strategy 3: "Amount Payable after Due Date" label
  let lateAmount: number | undefined;
  const lateIdx = findLastLabelIndex(text, 'amount payable after due date');
  if (lateIdx >= 0) {
    const segment = text.slice(lateIdx, lateIdx + 200);
    const amounts = findAmountsInWindow(segment).filter((v) => v > 500 && !isLikelyYear(v));
    if (amounts.length > 0) lateAmount = amounts[0];
  }

  return { amountDue, lateAmount };
};

const guessUtilityIssueDate = (text: string, preferEarliest = true) => {
  const direct = extractUtilityDateText(text, ['issue date', 'date of issue', 'issued on', 'issue date.', 'bill date', 'statement date']);
  if (direct) return direct;

  const candidates = extractAllNumericDates(text).sort((a, b) => a.getTime() - b.getTime());
  if (candidates.length === 0) return undefined;

  return preferEarliest ? formatDate(candidates[0]) : formatDate(candidates[candidates.length - 1]);
};

const guessUtilityDueDate = (text: string, issueDateText?: string) => {
  const footerDirect = extractUtilityDateText(text, ['due date', 'payment due', 'pay before'], true);
  if (footerDirect) return footerDirect;

  const direct = extractUtilityDateText(text, ['due date', 'payment due', 'pay before']);
  if (direct) return direct;

  const candidates = extractAllNumericDates(text).sort((a, b) => a.getTime() - b.getTime());
  if (candidates.length === 0) return undefined;

  if (!issueDateText) {
    return formatDate(candidates[candidates.length - 1]);
  }

  const issueDate = parseDateParts(issueDateText);
  if (!issueDate) {
    return formatDate(candidates[candidates.length - 1]);
  }

  const laterDates = candidates
    .filter((date) => date.getTime() > issueDate.getTime())
    .map((date) => ({
      date,
      diffDays: Math.floor((date.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter((item) => item.diffDays >= 1 && item.diffDays <= 45)
    .sort((a, b) => a.diffDays - b.diffDays);

  if (laterDates.length > 0) {
    return formatDate(laterDates[0].date);
  }

  return undefined;
};

// ── SSGC specific extractors (Gas - Pakistan) ────────────────────────────────

const extractSSGCConsumerNumber = (text: string): string | undefined => {
  // 10-digit consumer number, ignore dashes/spaces
  const cleanedText = text.replace(/[-\s]/g, '');
  const m = cleanedText.match(/\b(\d{10})\b/);
  if (m) {
    return m[1];
  }
  return undefined;
};

const extractSNGPLAccount = (text: string): string | undefined => {
  // 11-digit account ID
  const cleanedText = text.replace(/[-\s]/g, '');
  const m = cleanedText.match(/\b(\d{11})\b/);
  return m?.[1];
};

const extractPGEAccount = (text: string): string | undefined => {
  // 10 digits followed by - and 1 digit
  const m = text.match(/\b(\d{10}-\d{1})\b/);
  return m?.[1];
};

// ── DISCO specific extractors (MEPCO, PESCO, GEPCO, IESCO, LESCO - Pakistan) ──

const extractDISCOReferenceNumber = (text: string): string | undefined => {
  // 14-digit reference number
  const m = text.slice(0, 5000).match(/\b(\d{14})\b/);
  if (m) return m[1];
  // Spaced: 01 12345 1234567
  const spaced = text.match(/\b(\d{2})\s+(\d{5})\s+(\d{7})\b/);
  if (spaced) return `${spaced[1]}${spaced[2]}${spaced[3]}`;
  return undefined;
};

// ── US Utility specific extractors (SCE, SDG&E, ConEd) ───────────────────────

const extractUSUtilityAccount = (text: string, provider?: string): string | undefined => {
  const cleanedText = text.replace(/[-\s]/g, '');
  if (provider === 'SCE') {
    // 3-prefix-12-digits or 8-prefix-10-digits
    const sceMatch = cleanedText.match(/\b([4-7]\d{11}|8\d{9})\b/);
    return sceMatch?.[1];
  }
  if (provider === 'SDG&E') {
    // 11 digits
    const sdgeMatch = cleanedText.match(/\b(\d{11})\b/);
    return sdgeMatch?.[1];
  }
  if (provider === 'Con Edison') {
    // 15 digits
    const conEdMatch = cleanedText.match(/\b(\d{15})\b/);
    return conEdMatch?.[1];
  }
  return undefined;
};

// ── Tax Document extractors (US & PK) ───────────────────────────────────────

const extractTaxID = (text: string, type: 'SSN' | 'EIN' | 'NTN' | 'CNIC'): string | undefined => {
  // Use a window near labels for better accuracy
  const label = type === 'SSN' ? 'ssn' : type === 'EIN' ? 'ein' : type === 'NTN' ? 'ntn' : 'cnic';
  // Try case-insensitive specific labels
  const found = extractField(text, type, [label, type.toLowerCase(), 'id number', 'registration no']);
  if (found) {
    if (type === 'SSN' || type === 'EIN') return maskSensitiveValue(found);
    return found;
  }

  if (type === 'SSN' || type === 'EIN') {
    const m = text.match(/([0-9]{3}-[0-9]{2}-[0-9]{4}|[0-9]{2}-[0-9]{7})/);
    return maskSensitiveValue(m?.[1]);
  }
  if (type === 'NTN') {
    const m = text.match(/\b(\d{7}-\d)\b/);
    return m?.[1];
  }
  if (type === 'CNIC') {
    const m = text.match(/\b(\d{5}-\d{7}-\d)\b/);
    return m?.[1];
  }
  return undefined;
};

const detectMarketRegion = (text: string): 'US' | 'PK' | 'UNKNOWN' => {
  const haystack = normalize(text);
  
  // Specific Pakistani identifiers & providers
  if (
    /pkr|rs\.?|cnic|psid|sngpl|ssgc|fesco|mepco|pesco|lesco|iesco|gepco|hesco|k-electric|electric\s*supply\s*company|nayatel|stormfiber|challan|form\s*114|ntn|strn|federal\s*board\s*of\s*revenue|punjab\s*university|bahawalpur|faisalabad|multan|lahore|karachi|islamabad|peshawar|quetta|abbottabad|gujranwala/i.test(
      haystack,
    )
  ) {
    return 'PK';
  }
  
  // Specific US identifiers & providers
  if (
    /\$|usd|ssn|ein|zip\s*code|state\s*of|comcast|xfinity|geico|progressive|chase\s*bank|bank\s*of\s*america|wells\s*fargo|silicon\s*valley|internal\s*revenue\s*service|form\s*1040|w-2/i.test(
      haystack,
    )
  ) {
    return 'US';
  }
  
  return 'UNKNOWN';
};

const detectCurrency = (text: string, region: 'US' | 'PK' | 'UNKNOWN'): 'USD' | 'PKR' => {
  const haystack = normalize(text);
  if (region === 'US') return 'USD';
  if (region === 'PK') return 'PKR';
  if (haystack.includes('$')) return 'USD';
  if (haystack.includes('rs.') || haystack.includes('pkr')) return 'PKR';
  return 'USD'; // Default
};

const findCanonicalProvider = (text: string) => {
  const haystack = normalize(text);

  for (const alias of PROVIDER_ALIASES) {
    if (
      alias.patterns.some((pattern) => {
        const norm = normalize(pattern);
        if (norm.length <= 4) {
          const regex = new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
          return regex.test(haystack);
        }
        return haystack.includes(norm);
      })
    ) {
      return alias.canonical;
    }
  }

  return undefined;
};

const findProviderName = (text: string, lines: string[]) => {
  const canonical = findCanonicalProvider(text);
  if (canonical) return canonical;

  const providerFields = [
    extractField(text, 'provider', ['company', 'vendor', 'issued by', 'service provider', 'bank', 'merchant']),
  ].filter(Boolean);

  if (providerFields[0]) {
    const value = providerFields[0].replace(/^[-\s]+/, '');
    if (/limited$/i.test(value) && value.split(' ').length <= 2) {
      return undefined;
    }
    return value;
  }

  const firstStrongLine = lines.find(
    (line) =>
      line.length > 3 &&
      line.length < 80 &&
      /[a-z]/i.test(line) &&
      !/invoice|statement|receipt|date|amount|due|certificate|receipt no|payment method|service period|total/i.test(line) &&
      !/^\d/.test(line) &&
      !/^([A-Za-z])\1+$/.test(line.trim()) &&
      !/limited$/i.test(line.trim()),
  );

  if (!firstStrongLine) return undefined;

  const cleaned = cleanTextValue(firstStrongLine);
  if (!cleaned) return undefined;
  if (/limited$/i.test(cleaned) && cleaned.split(' ').length <= 2) return undefined;

  return cleaned.replace(/^[-\s]+/, '');
};

const buildTags = (...values: Array<string | undefined>) =>
  Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => normalize(value as string).replace(/\s+/g, '-')),
    ),
  );

const scoreRule = (haystack: string, rule: KeywordRule) => {
  let score = 0;

  for (const keyword of rule.keywords) {
    const norm = normalize(keyword);
    if (norm.length <= 4) {
      const regex = new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(haystack)) score += 1;
    } else {
      if (haystack.includes(norm)) score += 1;
    }
  }

  for (const negative of rule.negativeKeywords ?? []) {
    const norm = normalize(negative);
    if (norm.length <= 4) {
      const regex = new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(haystack)) score -= 1;
    } else {
      if (haystack.includes(norm)) score -= 1;
    }
  }

  return score;
};

const chooseBestRule = (haystack: string) => {
  const scored = keywordGroups
    .map((rule) => ({
      ...rule,
      score: scoreRule(haystack, rule),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0];
};

const deriveFallbackSectionAndType = (text: string, fileName: string) => {
  const haystack = normalize(`${fileName} ${text}`);

  if (
    /\b\d{5}-\d{7}-\d\b/.test(haystack) ||
    /national identity card|cnic|identity card/.test(haystack)
  ) {
    return { section: 'documents' as AppSection, type: 'license' as DocumentType, confidence: 0.82 };
  }

  if (/passport/.test(haystack)) {
    return { section: 'documents' as AppSection, type: 'passport' as DocumentType, confidence: 0.85 };
  }

  if (/certificate|account maintenance certificate|this is to certify|certify that/.test(haystack)) {
    return { section: 'documents' as AppSection, type: 'contract' as DocumentType, confidence: 0.84 };
  }

  if (/warranty|serial number|imei/.test(haystack)) {
    return { section: 'warranties' as AppSection, type: 'warranty' as DocumentType, confidence: 0.82 };
  }

  if (
    SUBSCRIPTION_BRANDS.some((brand) => {
      const norm = normalize(brand);
      if (norm.length <= 4) {
        return new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(haystack);
      }
      return haystack.includes(norm);
    })
  ) {
    return { section: 'subscriptions' as AppSection, type: 'invoice' as DocumentType, confidence: 0.88 };
  }

  if (
    /amount due|due date|bill|consumer no|psid|account id|account id\/esn|ptcl|telecommunication|sngpl|sui northern gas|k-electric|lesco|iesco|fesco|gepco|ssgc|nayatel|stormfiber/.test(
      haystack,
    )
  ) {
    return { section: 'bills' as AppSection, type: 'bill' as DocumentType, confidence: 0.84 };
  }

  return { section: 'others' as AppSection, type: 'other' as DocumentType, confidence: 0.35 };
};

const cleanTitleCandidate = (value: string) => {
  return value
    .replace(/[_=]+/g, ' ')
    .replace(/[^\w\s&/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isBadTitleCandidate = (value: string) => {
  const cleaned = cleanTitleCandidate(value);
  if (!cleaned) return true;
  if (cleaned.length < 4 || cleaned.length > 70) return true;
  if (/^total\b/i.test(cleaned)) return true;
  if (/^vat\b/i.test(cleaned)) return true;
  if (/^subtotal\b/i.test(cleaned)) return true;
  if (/^amount\b/i.test(cleaned)) return true;
  if (/^limited\b/i.test(cleaned)) return true;
  if (/receipt no|payment method|service period|vat|subtotal/i.test(cleaned)) return true;
  if (/^\d+([ .,-]\d+)*$/.test(cleaned)) return true;

  const letters = (cleaned.match(/[a-z]/gi) || []).length;
  const digits = (cleaned.match(/\d/g) || []).length;
  if (digits > letters) return true;

  return false;
};

const looksLikeStrongTitleLine = (line: string) => {
  const cleaned = cleanTitleCandidate(line);
  if (isBadTitleCandidate(cleaned)) return false;
  if (/mrs\.|mr\.|ms\.|account no|customer no|reference|ref #|date|amount due/i.test(cleaned)) {
    return false;
  }

  return (
    /certificate|statement|invoice|receipt|passport|license|identity|policy|document|agreement|contract|bill/i.test(cleaned) ||
    cleaned === cleaned.toUpperCase()
  );
};

const findDocumentTitleFromLines = (text: string) => {
  const lines = toLines(text).slice(0, 14);

  for (const line of lines) {
    const cleaned = cleanTitleCandidate(line);

    if (
      /account maintenance certificate/i.test(cleaned) ||
      /maintenance certificate/i.test(cleaned) ||
      /salary certificate/i.test(cleaned) ||
      /bank certificate/i.test(cleaned) ||
      /employment certificate/i.test(cleaned)
    ) {
      return titleCase(cleaned);
    }
  }

  for (const line of lines) {
    const cleaned = cleanTitleCandidate(line);
    if (looksLikeStrongTitleLine(cleaned)) {
      return titleCase(cleaned);
    }
  }

  return undefined;
};

const deriveSubscriptionTitle = (text: string, providerName?: string) => {
  const hasReceipt = /receipt|receipt no/i.test(text);
  const hasInvoice = /invoice|invoice no|invoice number/i.test(text);

  if (providerName) {
    if (hasReceipt && hasInvoice) return `${providerName} Subscription Invoice`;
    if (hasReceipt) return `${providerName} Receipt`;
    if (hasInvoice) return `${providerName} Subscription Invoice`;
    return `${providerName} Subscription`;
  }

  if (hasReceipt) return 'Subscription Receipt';
  if (hasInvoice) return 'Subscription Invoice';
  return 'Uploaded Subscription Document';
};

const isUsTaxPacketText = (text: string) =>
  /\b1099(?:-[a-z]+)?\b|consolidated\s+\d{4}\s+forms?\s+1099|year-end messages|tax package|tax document/i.test(
    text,
  );

const guessTitle = (
  section: AppSection,
  type: DocumentType,
  text: string,
  fileName: string,
  extractedData: ExtractedDocumentData,
) => {
  const lines = toLines(text);
  const provider = findProviderName(text, lines);
  const baseFileName = stripExtension(fileName);
  const detectedDocTitle = findDocumentTitleFromLines(text);
  const hasCertificateTitle =
    !!detectedDocTitle &&
    /account maintenance certificate|maintenance certificate|salary certificate|bank certificate|employment certificate|certificate/i.test(
      detectedDocTitle,
    );

  if (hasCertificateTitle) {
    return detectedDocTitle;
  }

  if (section === 'subscriptions') {
    return deriveSubscriptionTitle(text, provider);
  }

  if (
    type === 'tax-document' &&
    detectedDocTitle &&
    /1099|w-2|1040|tax/i.test(detectedDocTitle)
  ) {
    if (/\b1099\b/i.test(detectedDocTitle) && provider) {
      return `${provider} 1099 Tax Packet`;
    }
    return detectedDocTitle;
  }

  if (type === 'tax-document' && isUsTaxPacketText(text)) {
    if (provider) return `${provider} 1099 Tax Packet`;
    return '1099 Tax Packet';
  }

  if (section === 'bills' || type === 'challan') {
    const isChallan = type === 'challan';
    const datePart =
      extractedData.bill?.billingMonth ||
      extractedData.bill?.issueDateText ||
      extractedData.issueDateText;
    const suffix = isChallan ? 'Challan' : 'Bill';
    if (provider) return datePart ? `${provider} ${suffix} - ${datePart}` : `${provider} ${suffix}`;
    return datePart ? `Uploaded ${suffix} - ${datePart}` : `Uploaded ${suffix}`;
  }

  if (type === 'tax-document') {
    const datePart = extractedData.issueDateText || extractedData.expirationDateText;
    if (provider)
      return datePart ? `${provider} Tax Document - ${datePart}` : `${provider} Tax Document`;
    return datePart ? `Tax Document - ${datePart}` : 'Tax Document';
  }

  if (section === 'warranties') {
    const brandOrMerchant = extractedData.merchantName || provider;
    if (brandOrMerchant) return `${brandOrMerchant} Warranty`;
    return 'Uploaded Warranty Document';
  }

  if (
    detectedDocTitle &&
    !isBadTitleCandidate(detectedDocTitle) &&
    (
      /certificate|statement|invoice|receipt|passport|license|identity|policy|agreement|contract/i.test(detectedDocTitle) ||
      section === 'documents'
    )
  ) {
    return detectedDocTitle;
  }


  if (type === 'passport') return 'Passport Document';

  if (type === 'license') {
    if (/national identity card|cnic|identity card/i.test(text)) return 'National Identity Card';
    if (/driving license/i.test(text)) return 'Driving License';
    return 'Identity Document';
  }

  if (type === 'insurance') return 'Insurance Document';
  if (type === 'statement') return provider ? `${provider} Statement` : 'Account Statement';
  if (type === 'receipt') return provider ? `${provider} Receipt` : 'Payment Receipt';
  if (type === 'invoice') return provider ? `${provider} Invoice` : 'Invoice';
  if (section === 'passwords') return 'Password Export';
  if (section === 'reminders') return 'Reminder Note';
  if (section === 'documents' && /certificate/i.test(text)) return 'Certificate Document';
  if (section === 'documents') return 'Uploaded Document';

  return baseFileName || 'Uploaded File';
};

const formatSummaryAmount = (amount?: number, currency?: string) => {
  if (amount === undefined) return undefined;
  const formatted = amount.toLocaleString('en-US');
  return currency ? `${currency} ${formatted}` : formatted;
};

const finalizeSummary = (parts: Array<string | undefined>) => {
  const cleaned = parts
    .map((part) => cleanTextValue(part))
    .filter((part): part is string => !!part);

  if (cleaned.length === 0) return undefined;
  return `${cleaned.join('. ')}.`;
};

const buildFallbackSummaryFromText = (text: string) => {
  const lines = toLines(text)
    .map((line) => cleanTitleCandidate(line))
    .filter((line) => !isBadTitleCandidate(line))
    .filter((line) => !/^reference|^date of issue|^issue date|^due date|^bill month|^account no/i.test(line));

  if (lines.length === 0) return undefined;
  return cleanTextValue(lines.slice(0, 2).join('. '));
};

const buildSummary = (
  section: AppSection,
  type: DocumentType,
  title: string,
  text: string,
  extractedData: ExtractedDocumentData,
  providerName?: string,
) => {
  const provider = providerName || extractedData.bill?.providerName || extractedData.merchantName;
  const bill = extractedData.bill;

  if (section === 'bills' && bill) {
    return finalizeSummary([
      provider
        ? bill.billingMonth
          ? `${provider} bill for ${bill.billingMonth}`
          : `${provider} bill`
        : title,
      bill.dueDateText ? `Due ${bill.dueDateText}` : undefined,
      bill.amountDue !== undefined ? `Amount due ${formatSummaryAmount(bill.amountDue, bill.currency)}` : undefined,
      bill.lateAmountPayable !== undefined
        ? `After due date ${formatSummaryAmount(bill.lateAmountPayable, bill.currency)}`
        : undefined,
    ]);
  }

  if (/certificate/i.test(`${title} ${text}`)) {
    const holder =
      extractField(text, 'name of account holder(s) / sole', [
        'name of account holder',
        'name of account holders',
        'account holder',
      ]) ??
      extractField(text, 'name of account holder', ['account holder']);

    const humanHolder =
      holder && holder === holder.toUpperCase()
        ? titleCase(holder.toLowerCase())
        : holder;

    return finalizeSummary([
      provider
        ? humanHolder
          ? `${title} from ${provider} for ${humanHolder}`
          : `${title} from ${provider}`
        : humanHolder
          ? `${title} for ${humanHolder}`
          : title,
      extractedData.issueDateText ? `Issued on ${extractedData.issueDateText}` : undefined,
      extractedData.documentNumber ? `Ref: ${extractedData.documentNumber}` : undefined,
    ]);
  }

  if (section === 'subscriptions') {
    return finalizeSummary([
      provider ? `${title} from ${provider}` : title,
      extractedData.issueDateText ? `Issued on ${extractedData.issueDateText}` : undefined,
      extractedData.amount !== undefined ? `Amount ${formatSummaryAmount(extractedData.amount, bill?.currency)}` : undefined,
    ]);
  }

  if (type === 'tax-document') {
    return finalizeSummary([
      title,
      extractedData.issueDateText ? `Issued on ${extractedData.issueDateText}` : undefined,
      buildFallbackSummaryFromText(text),
    ]);
  }

  if (type === 'passport' || type === 'license' || type === 'insurance' || type === 'statement') {
    return finalizeSummary([
      title,
      extractedData.issueDateText ? `Issued on ${extractedData.issueDateText}` : undefined,
      extractedData.expirationDateText ? `Expires on ${extractedData.expirationDateText}` : undefined,
      extractedData.documentNumber ? `Document #: ${extractedData.documentNumber}` : undefined,
      extractedData.policyNumber ? `Policy #: ${extractedData.policyNumber}` : undefined,
    ]);
  }

  return finalizeSummary([
    title,
    extractedData.issueDateText ? `Issued on ${extractedData.issueDateText}` : undefined,
    extractedData.dueDateText ? `Due ${extractedData.dueDateText}` : undefined,
    extractedData.documentNumber ? `Ref: ${extractedData.documentNumber}` : undefined,
    buildFallbackSummaryFromText(text),
  ]);
};

export const classifyUploadedDocument = (text: string, fileName: string): ClassificationResult => {
  const normalizedText = normalize(text);
  const haystack = normalize(`${fileName} ${text}`);
  const lines = toLines(text);
  const detectedDates = detectDates(text);
  const detectedDocTitle = findDocumentTitleFromLines(text);
  const isCertificateLike =
    /account maintenance certificate|maintenance certificate|salary certificate|bank certificate|employment certificate|this is to certify|certify that|hereby certify/.test(
      normalizedText,
    ) ||
    !!detectedDocTitle &&
      /account maintenance certificate|maintenance certificate|salary certificate|bank certificate|employment certificate|certificate/i.test(
        detectedDocTitle,
      );
  const isUsTaxPacket =
    /\b1099(?:-[a-z]+)?\b|consolidated\s+\d{4}\s+forms?\s+1099|year-end messages|tax package/i.test(
      normalizedText,
    ) ||
    (!!detectedDocTitle && /\b1099\b|tax/i.test(detectedDocTitle));

  const bestRule = chooseBestRule(haystack);
  const fallback = deriveFallbackSectionAndType(text, fileName);

  let section: AppSection =
    bestRule && bestRule.score > 0 ? bestRule.section : fallback.section;

  let type: DocumentType =
    bestRule && bestRule.score > 0 ? bestRule.type : fallback.type;

  let rawConfidence =
    bestRule && bestRule.score > 0
      ? Math.min(0.98, bestRule.baseConfidence + bestRule.score * 0.015)
      : fallback.confidence;

  const providerName = findProviderName(text, lines);

  if (
    isCertificateLike
  ) {
    section = 'documents';
    type = 'contract';
    rawConfidence = Math.max(rawConfidence, 0.94);
  } else if (isUsTaxPacket) {
    section = 'documents';
    type = 'tax-document';
    rawConfidence = Math.max(rawConfidence, 0.97);
  } else if (providerName && SUBSCRIPTION_BRANDS.includes(normalize(providerName) as (typeof SUBSCRIPTION_BRANDS)[number])) {
    section = 'subscriptions';
    type = 'invoice';
    rawConfidence = Math.max(rawConfidence, 0.9);
  }

  if (
    providerName &&
    ['PTCL', 'SNGPL', 'SSGC', 'K-Electric', 'LESCO', 'IESCO', 'FESCO', 'GEPCO', 'MEPCO', 'PESCO', 'HESCO', 'SCE', 'SDG&E', 'Con Edison', 'PG&E', 'Clear River', 'Nayatel', 'StormFiber'].includes(providerName)
  ) {
    section = 'bills';
    type = 'bill';
    rawConfidence = Math.max(rawConfidence, 0.96);
  }

  const marketRegion = detectMarketRegion(text);
  const currency = detectCurrency(text, marketRegion);

  const prioritizeFooter = providerName ? ELECTRICITY_PROVIDERS.includes(providerName as (typeof ELECTRICITY_PROVIDERS)[number]) : false;
  const isFescoBill = section === 'bills' && providerName === 'FESCO';
  const isPtclBill = section === 'bills' && providerName === 'PTCL';
  const isKEBill = section === 'bills' && providerName === 'K-Electric';
  const isSsgcBill = section === 'bills' && providerName === 'SSGC';
  const isDiscoBill =
    section === 'bills' &&
    providerName &&
    ELECTRICITY_PROVIDERS.includes(providerName as (typeof ELECTRICITY_PROVIDERS)[number]);

  const invoiceNumber = isKEBill
    ? (extractKEInvoiceNumber(text) ??
        extractField(text, 'invoice number', ['invoice no', 'invoice #']) ??
        extractFieldNearLabels(text, ['invoice number', 'invoice no', 'invoice #', 'bill id', 'bill no'], /([A-Z0-9-]{6,40})/i, prioritizeFooter))
    : (extractField(text, 'invoice number', ['invoice no', 'invoice #']) ||
        extractFieldNearLabels(text, ['invoice number', 'invoice no', 'invoice #', 'bill id', 'bill no'], /([A-Z0-9-]{6,40})/i, prioritizeFooter));

  const referenceNumber =
    isFescoBill
      ? extractFescoReferenceNumber(text) ??
        (extractFieldNearLabels(
          text,
          ['reference no', 'reference number', 'ref no'],
          /([A-Z0-9 -]{8,50})/i,
          prioritizeFooter,
        ) ||
          extractField(text, 'reference number', ['reference no', 'ref no', 'reference #']))
      : (extractFieldNearLabels(
          text,
          ['reference no', 'reference number', 'ref no'],
          /([A-Z0-9 -]{8,50})/i,
          prioritizeFooter,
        ) ||
          extractField(text, 'reference number', ['reference no', 'ref no', 'reference #']));

  const finalReferenceNumber = isPtclBill
    ? referenceNumber ?? extractPtclReferenceNumber(text)
    : isDiscoBill && !isFescoBill
      ? extractDISCOReferenceNumber(text) ?? referenceNumber
      : referenceNumber;

  // KE bills do not have a PSID field
  const psid = isKEBill
    ? undefined
    : (extractField(text, 'psid', ['virtual identity']) ||
        extractFieldNearLabels(text, ['psid', 'virtual identity'], /([0-9]{8,30})/i, prioritizeFooter));

  const finalPsid = isKEBill ? undefined : isPtclBill ? psid ?? extractPtclPsid(text) : psid;

  const accountNumber =
    section === 'bills'
      ? isKEBill
        ? extractKEAccountNumber(text) ?? extractUtilityAccountNumber(text)
        : isFescoBill
          ? extractFescoConsumerId(text) ?? extractUtilityAccountNumber(text)
          : isSsgcBill
            ? extractSSGCConsumerNumber(text) ?? extractUtilityAccountNumber(text)
            : marketRegion === 'US'
              ? extractUSUtilityAccount(text, providerName) ?? extractUtilityAccountNumber(text)
              : extractUtilityAccountNumber(text)
      : extractField(text, 'account number', ['account no', 'account id/esn', 'account id']);

  const customerNumber = isKEBill
    ? (extractKEConsumerNumber(text) ??
        extractField(text, 'customer number', ['customer no', 'consumer no']) ??
        extractFieldNearLabels(text, ['customer number', 'customer no', 'consumer no', 'consumer id'], /([0-9A-Z-]{6,40})/i, false))
    : isSsgcBill
      ? extractSSGCConsumerNumber(text) ?? extractField(text, 'customer number', ['customer no', 'consumer no'])
      : (extractField(text, 'customer number', ['customer no', 'consumer no']) ||
          extractFieldNearLabels(text, ['customer number', 'customer no', 'consumer no', 'consumer id'], /([0-9A-Z-]{6,40})/i, false));

  const finalCustomerNumber = isPtclBill ? customerNumber ?? extractPtclCustomerNumber(text) : customerNumber;

  const policyNumber = extractField(text, 'policy number', ['policy no']);
  const serialNumber = extractField(text, 'serial number', ['serial no', 'imei', 'model no']);

  // Use a mutable variable for documentNumber so we can override it for special cases (e.g. certificates)
  let documentNumber:
    | string
    | undefined =
    extractField(text, 'document number', [
      'document no',
      'card number',
      'id number',
      'passport number',
      'passport no',
      'license no',
      'reference #',
      'receipt no',
    ]) || extractLikelyDocumentNumber(text);

  const keAmounts = isKEBill ? extractKEAmounts(text) : undefined;
  const fescoAmounts = isFescoBill ? extractFescoAmounts(text) : undefined;

  const amountDue = isKEBill
    ? (keAmounts?.amountDue ?? extractUtilityPrimaryAmount(text))
    : isFescoBill
      ? (fescoAmounts?.amountDue ?? extractUtilityPrimaryAmount(text))
      : section === 'bills'
        ? extractUtilityPrimaryAmount(text)
        : section === 'subscriptions' || type === 'invoice' || type === 'receipt'
          ? extractAmount(text)
          : undefined;

  const lateAmountTotal = isKEBill
    ? (keAmounts?.lateAmount ?? extractUtilityLateAmount(text, amountDue))
    : isFescoBill
      ? (fescoAmounts?.lateAmountPayable ?? extractUtilityLateAmount(text, amountDue))
      : section === 'bills'
        ? extractUtilityLateAmount(text, amountDue)
        : extractLateAmount(text);

  const surcharge =
    isFescoBill
      ? fescoAmounts?.lateAmount
      : extractAmountNearLastLabel(text, ['l.p.surcharge', 'l.p. surcharge', 'lp surcharge', 'lp. surcharge'], {
          excludeValues: amountDue !== undefined ? [amountDue] : [],
          pick: 'first',
          maxWindow: 120,
          maxValue: 5000,
        }) ??
        extractAmountByLabels(text, ['l.p.surcharge', 'l.p. surcharge', 'late pay surcharge', 'penalty'], {
          maxBillAmount: 5000,
        });

  const utilityBillingMonth =
    section === 'bills'
      ? isKEBill
        ? (extractKEBillingMonth(text) ??
            cleanBillingMonth(extractTextByLabels(text, ['bill month', 'billing month', 'billing period', 'month'], 30, prioritizeFooter)))
        : isFescoBill
          ? (extractFescoBillMonthFromTop(text) ??
              cleanBillingMonth(extractTextByLabels(text, ['bill month', 'billing month', 'billing period', 'month'], 30, prioritizeFooter)))
          : cleanBillingMonth(
              extractTextByLabels(text, ['bill month', 'billing month', 'billing period', 'month', 'statement period'], 30, prioritizeFooter),
            )
      : undefined;

  const ssn = marketRegion === 'US' ? extractTaxID(text, 'SSN') : undefined;
  const ein = marketRegion === 'US' ? extractTaxID(text, 'EIN') : undefined;
  const ntn = marketRegion === 'PK' ? extractTaxID(text, 'NTN') : undefined;
  const cnic = marketRegion === 'PK' ? extractTaxID(text, 'CNIC') : undefined;

  let issueDateText: string | undefined;
  let dueDateText: string | undefined;

  if (section === 'bills' && isFescoBill) {
    const fescoDueDateText = extractFescoDueDate(text);
    const fescoIssueDateText = extractFescoIssueDate(text, fescoDueDateText);
    const finalDueDateText = fescoDueDateText ?? extractFescoDueDate(text);

    issueDateText = fescoIssueDateText ?? findBestDateText(detectedDates, 'issue_date');
    dueDateText = finalDueDateText ?? findBestDateText(detectedDates, 'due_date');
  } else if (section === 'bills' && isKEBill) {
    issueDateText = extractKEIssueDate(text) ?? findBestDateText(detectedDates, 'issue_date');
    dueDateText = extractKEDueDate(text) ?? findBestDateText(detectedDates, 'due_date');
  } else {
    const utilityIssueDateText =
      section === 'bills'
        ? (prioritizeFooter
            ? extractUtilityDateText(text, ['issue date', 'bill date'], false)
            : guessUtilityIssueDate(text))
        : undefined;

    issueDateText = utilityIssueDateText || findBestDateText(detectedDates, 'issue_date');

    const utilityDueDateText =
      section === 'bills'
        ? guessUtilityDueDate(text, issueDateText)
        : undefined;

    dueDateText = utilityDueDateText || findBestDateText(detectedDates, 'due_date');
  }
  const expirationDateText = findBestDateText(detectedDates, 'expiry_date');

  // ---------------------------------------------------------------------------
  // Certificate-specific extraction: override documentNumber and issueDateText
  // If the document is classified as a certificate (documents section and text contains 'certificate'),
  // attempt to extract the reference number and the date of issue explicitly. The generic
  // documentNumber extraction doesn't always pick up reference numbers (e.g. 'Reference #: WA140...'),
  // and the generic date detection may miss 'Date of issue' labels. We use extractField to
  // find these fields and override documentNumber and issueDateText if found. We parse the
  // date using parseDateParts when possible to get a standardized YYYY-MM-DD string.
  if (section === 'documents' && /certificate/i.test(normalizedText)) {
    const certRef = extractField(text, 'reference', [
      'reference #',
      'reference no',
      'reference number',
    ]);
    if (certRef) {
      documentNumber = certRef;
    }
    const certIssue = extractField(text, 'date of issue', [
      'issue date',
      'issued on',
    ]);
    if (certIssue) {
      const parsedCertDate = parseDateParts(certIssue);
      issueDateText = parsedCertDate ? formatDate(parsedCertDate) : certIssue;
    }
  }

  const extractedData: ExtractedDocumentData = {
    bill:
      section === 'bills'
        ? {
            providerName,
            invoiceNumber,
            referenceNumber: finalReferenceNumber,
            psid: finalPsid,
            billingMonth: utilityBillingMonth,
            issueDateText,
            dueDateText,
            amountDue,
            lateAmount: surcharge || (lateAmountTotal && amountDue ? lateAmountTotal - amountDue : undefined),
            lateAmountPayable: lateAmountTotal,
            accountNumber,
            customerNumber: finalCustomerNumber,
            currency,
          }
        : undefined,
    serialNumber,
    merchantName: providerName,
    policyNumber,
    documentNumber,
    dueDateText,
    issueDateText,
    expirationDateText,
    taxInfo: {
      ssn,
      ein,
      ntn,
      cnic,
    },
    rawFields: {
      providerName: providerName ?? '',
      invoiceNumber: invoiceNumber ?? '',
      referenceNumber: finalReferenceNumber ?? '',
      psid: finalPsid ?? '',
      accountNumber: accountNumber ?? '',
      customerNumber: finalCustomerNumber ?? '',
      policyNumber: policyNumber ?? '',
      serialNumber: serialNumber ?? '',
      documentNumber: documentNumber ?? '',
      dueDateText: dueDateText ?? '',
      issueDateText: issueDateText ?? '',
      expirationDateText: expirationDateText ?? '',
      detectedTitle: findDocumentTitleFromLines(text) ?? '',
      extractedAmount: amountDue?.toString() ?? '',
      extractedLateAmount:
        (surcharge || (lateAmountTotal && amountDue ? lateAmountTotal - amountDue : undefined))?.toString() ?? '',
      billingMonth: utilityBillingMonth ?? '',
      currency,
      marketRegion,
    },
  };

  const title = guessTitle(section, type, text, fileName, extractedData);
  extractedData.summary = buildSummary(section, type, title, text, extractedData, providerName);

  const tags = buildTags(
    section,
    type,
    providerName,
    amountDue ? 'has-amount' : undefined,
    dueDateText ? 'has-due-date' : undefined,
    expirationDateText ? 'has-expiry-date' : undefined,
    normalizedText.includes('cnic') || normalizedText.includes('identity card') ? 'identity-document' : undefined,
    SUBSCRIPTION_BRANDS.some((brand) => {
      const norm = normalize(brand);
      if (norm.length <= 4) {
        return new RegExp(`\\b${norm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(normalizedText);
      }
      return normalizedText.includes(norm);
    }) ? 'subscription-brand' : undefined,
  );

  return {
    section,
    type,
    title,
    classificationConfidence: rawConfidence,
    tags,
    extractedData,
    detectedDates,
  };
};

export const createUploadDraft = (text: string, fileName: string): UploadDraft => {
  const classification = classifyUploadedDocument(text, fileName);

  const dueDate = classification.detectedDates.find((item) => item.type === 'due_date')?.date;

  return {
    title: classification.title,
    type: classification.type,
    section: classification.section,
    classificationConfidence: classification.classificationConfidence,
    parserStatus: text.trim() ? 'parsed' : 'partial',
    reviewStatus: 'needs_review',
    extractedText: text,
    extractedData: classification.extractedData,
    detectedDates: classification.detectedDates,
    tags: classification.tags,
    suggestedBill:
      classification.section === 'bills'
        ? {
            title: classification.title,
            category: 'utilities',
            amount: classification.extractedData.bill?.amountDue,
            currency: classification.extractedData.bill?.currency ?? 'USD',
            status: 'pending',
            isRecurring: false,
            dueDate,
          }
        : undefined,
  };
};
