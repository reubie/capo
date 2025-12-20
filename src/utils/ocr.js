/**
 * ocr.js
 * Utility functions for extracting structured info from business cards
 */

import Tesseract from 'tesseract.js';

/**
 * extractTextFromImage
 * Uses Tesseract.js to extract raw text from an image file
 * @param {File} file - image file from input
 * @returns {Promise<string>} raw OCR text
 */
export const extractTextFromImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng', {
          logger: (m) => console.log('OCR progress:', m),
        });
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * extractEmail
 */
export const extractEmail = (text) => {
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
};

/**
 * extractPhone
 * Supports 6-12 digit phone numbers
 */
export const extractPhone = (text) => {
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\d{6,12})/g;
  const matches = text.match(phoneRegex);
  if (!matches) return '';
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 12) return m.trim();
  }
  return '';
};

/**
 * extractName
 * Heuristic: line with 2-3 capitalized words
 */
export const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 3) {
      const capitalized = words.every(w => /^[A-Z]/.test(w));
      if (capitalized) return line;
    }
  }
  return '';
};

/**
 * extractCompany
 * Look for uppercase or "PTE LTD", "LLC", "CO"
 */
export const extractCompany = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.toUpperCase() === line && /PTE|LLC|LTD|CORP|CO/i.test(line)) return line;
  }
  return '';
};

/**
 * extractDepartment
 */
export const extractDepartment = (text) => {
  const match = text.match(/(Dept|Department)\s*:\s*(.*)/i);
  return match ? match[2].trim() : '';
};

/**
 * extractPosition
 */
export const extractPosition = (text) => {
  const titles = ['Manager','Director','CEO','CTO','COO','Lead','Engineer','Officer','Supervisor'];
  const lines = text.split('\n').map(l => l.trim());
  for (const line of lines) {
    for (const title of titles) {
      if (line.toLowerCase().includes(title.toLowerCase())) return line;
    }
  }
  return '';
};

/**
 * extractCompanyAddress
 */
export const extractCompanyAddress = (text) => {
  const keywords = ['St','Street','Road','Ave','Lane','Blk','Building','Suite','Floor'];
  const lines = text.split('\n').map(l => l.trim());
  for (const line of lines) {
    for (const kw of keywords) {
      if (line.includes(kw)) return line;
    }
  }
  return '';
};

/**
 * extractCardInfo
 * Combines all OCR extraction into a single object
 * @param {File} file - image file
 * @returns {Promise<Object>} structured card data
 */
export const extractCardInfo = async (file) => {
  const rawText = await extractTextFromImage(file);

  return {
    name: extractName(rawText),
    company: extractCompany(rawText),
    department: extractDepartment(rawText),
    position: extractPosition(rawText),
    phone: extractPhone(rawText),
    mobile: extractPhone(rawText),
    email: extractEmail(rawText),
    address: extractCompanyAddress(rawText),
    rawText,
  };
};
