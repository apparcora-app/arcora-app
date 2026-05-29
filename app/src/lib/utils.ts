// General utility functions for LifeOS
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';
import { format, differenceInDays, isPast, isToday, isTomorrow, addDays } from 'date-fns';

type TimestampLike =
  | Date
  | Timestamp
  | {
      toDate: () => Date;
    }
  | null
  | undefined;

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const locale = currency === 'PKR' ? 'en-PK' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const toDateValue = (value: TimestampLike): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    try {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Format date for display
 */
export const formatDate = (date: TimestampLike, formatStr: string = 'MMM d, yyyy'): string => {
  const dateObj = toDateValue(date);
  if (!dateObj) return 'N/A';

  return format(dateObj, formatStr);
};

/**
 * Parse a YYYY-MM-DD input value as a local calendar date.
 * This avoids the UTC shift that happens with new Date('YYYY-MM-DD').
 */
export const parseDateInputValue = (value: string): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

/**
 * Format relative time (e.g., "in 3 days", "tomorrow", "today")
 */
export const formatRelativeTime = (date: Date | Timestamp | null | undefined): string => {
  const dateObj = toDateValue(date);
  if (!dateObj) return 'N/A';

  const daysDiff = differenceInDays(dateObj, new Date());

  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (daysDiff < 0) return `${Math.abs(daysDiff)} days ago`;
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Tomorrow';
  if (daysDiff <= 30) return `in ${daysDiff} days`;

  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Get urgency level based on date
 */
export const getUrgency = (date: Date | Timestamp | null | undefined): 'urgent' | 'soon' | 'future' | 'overdue' => {
  const dateObj = toDateValue(date);
  if (!dateObj) return 'future';

  const daysDiff = differenceInDays(dateObj, new Date());

  if (isPast(dateObj) && !isToday(dateObj)) return 'overdue';
  if (daysDiff <= 1) return 'urgent';
  if (daysDiff <= 7) return 'soon';
  return 'future';
};

/**
 * Get color class based on urgency
 */
export const getUrgencyColor = (urgency: 'urgent' | 'soon' | 'future' | 'overdue'): string => {
  switch (urgency) {
    case 'urgent':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'soon':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'overdue':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    default:
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Convert file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get color for category
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    // Bill categories
    utilities: 'text-blue-500 bg-blue-500/10',
    housing: 'text-emerald-500 bg-emerald-500/10',
    insurance: 'text-purple-500 bg-purple-500/10',
    'credit-card': 'text-pink-500 bg-pink-500/10',
    loan: 'text-orange-500 bg-orange-500/10',

    // Subscription categories
    entertainment: 'text-pink-500 bg-pink-500/10',
    work: 'text-blue-500 bg-blue-500/10',
    health: 'text-emerald-500 bg-emerald-500/10',
    shopping: 'text-amber-500 bg-amber-500/10',

    // Password categories
    social: 'text-pink-500 bg-pink-500/10',
    finance: 'text-emerald-500 bg-emerald-500/10',

    // Reminder categories
    personal: 'text-purple-500 bg-purple-500/10',

    // Document types
    passport: 'text-blue-500 bg-blue-500/10',
    license: 'text-amber-500 bg-amber-500/10',
    contract: 'text-indigo-500 bg-indigo-500/10',
    invoice: 'text-cyan-500 bg-cyan-500/10',
    receipt: 'text-teal-500 bg-teal-500/10',

    // Default
    other: 'text-slate-500 bg-slate-500/10',
  };

  return colors[category] || colors.other;
};

/**
 * Get icon name for category
 */
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    utilities: 'Zap',
    housing: 'Home',
    insurance: 'Shield',
    'credit-card': 'CreditCard',
    loan: 'Banknote',
    entertainment: 'Film',
    work: 'Briefcase',
    health: 'Heart',
    shopping: 'ShoppingBag',
    social: 'Users',
    finance: 'DollarSign',
    personal: 'User',
    passport: 'Globe',
    license: 'IdCard',
    contract: 'FileText',
    invoice: 'Receipt',
    receipt: 'Ticket',
    other: 'File',
  };

  return icons[category] || 'File';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by date
 */
export const sortByDate = <T extends { date: Date | Timestamp }>(
  array: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = toDateValue(a.date);
    const dateB = toDateValue(b.date);
    const dateATime = dateA?.getTime() ?? 0;
    const dateBTime = dateB?.getTime() ?? 0;
    return order === 'asc' ? dateATime - dateBTime : dateBTime - dateATime;
  });
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  date: Date | Timestamp,
  startDate: Date,
  endDate: Date
): boolean => {
  const dateObj = toDateValue(date);
  if (!dateObj) return false;

  return dateObj >= startDate && dateObj <= endDate;
};

/**
 * Get dates for next 7 days
 */
export const getNext7Days = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    days.push(addDays(today, i));
  }

  return days;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert to title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Mask sensitive data (show only last N characters)
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) {
    return data;
  }
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  return masked + visible;
};
