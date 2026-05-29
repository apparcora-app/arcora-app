// Encryption utilities for LifeOS
import CryptoJS from 'crypto-js';

const SALT = import.meta.env.VITE_ENCRYPTION_SALT || 'lifeos-default-salt-change-in-production';

/**
 * Derive encryption key from master password
 */
export const deriveKey = (masterPassword: string): string => {
  return CryptoJS.PBKDF2(masterPassword, SALT, {
    keySize: 256 / 32,
    iterations: 100000,
  }).toString();
};

/**
 * Encrypt text using AES-256
 */
export const encrypt = (text: string, key: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt text using AES-256
 */
export const decrypt = (encryptedText: string, key: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - invalid key or corrupted data');
  }
};

/**
 * Hash password for storage (one-way)
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + SALT).toString();
};

/**
 * Verify password against hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

/**
 * Generate a random encryption key
 */
export const generateKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

/**
 * Mask sensitive data (show only last 4 characters)
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) {
    return data;
  }
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  return masked + visible;
};

/**
 * Calculate password strength
 */
export const calculatePasswordStrength = (password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'fair';
  } else if (score <= 4) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  if (feedback.length === 0) {
    feedback.push('Great password!');
  }

  return { score, strength, feedback };
};

/**
 * Generate a secure random password
 */
export const generatePassword = (options: {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
} = {}): string => {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;

  if (chars === '') {
    chars = lowercase + numbers;
  }

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  // Ensure at least one of each selected type
  let finalPassword = password;
  if (includeUppercase && !/[A-Z]/.test(password)) {
    finalPassword = uppercase[Math.floor(Math.random() * uppercase.length)] + finalPassword.slice(1);
  }
  if (includeLowercase && !/[a-z]/.test(password)) {
    finalPassword = finalPassword.slice(0, 1) + lowercase[Math.floor(Math.random() * lowercase.length)] + finalPassword.slice(2);
  }
  if (includeNumbers && !/\d/.test(password)) {
    finalPassword = finalPassword.slice(0, 2) + numbers[Math.floor(Math.random() * numbers.length)] + finalPassword.slice(3);
  }
  if (includeSymbols && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    finalPassword = finalPassword.slice(0, 3) + symbols[Math.floor(Math.random() * symbols.length)] + finalPassword.slice(4);
  }

  return finalPassword;
};
