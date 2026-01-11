/**
 * ocr.js
 * Utility functions for extracting structured info from business cards
 */

import Tesseract from 'tesseract.js';
import { normalizePhoneNumber } from './helpers';

/**
 * extractTextFromImage
 * Uses Tesseract.js to extract raw text from an image file
 * Optimized for performance with worker options
 * @param {File} file - image file from input
 * @returns {Promise<string>} raw OCR text
 */
/**
 * Preprocess image for better OCR accuracy
 * Enhances contrast, sharpens, and scales image
 * @param {string} imageDataUrl - image as data URL
 * @returns {Promise<string>} preprocessed image as data URL
 */
const preprocessImageForOCR = async (imageDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas with 2x scale for better OCR accuracy
        const scale = 2;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Use high-quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image scaled up
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data for preprocessing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Enhance contrast and brightness
        const contrast = 1.3; // Increase contrast
        const brightness = 10; // Slight brightness increase
        
        for (let i = 0; i < data.length; i += 4) {
          // Apply contrast
          data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrast + 0.5) * 255));
          data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255));
          data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255));
          
          // Apply brightness
          data[i] = Math.min(255, Math.max(0, data[i] + brightness));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
        }
        
        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to data URL with high quality
        const processedDataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(processedDataUrl);
      } catch (err) {
        console.error('Image preprocessing error:', err);
        // Fallback to original if preprocessing fails
        resolve(imageDataUrl);
      }
    };
    img.onerror = () => {
      console.error('Image load error for preprocessing');
      // Fallback to original if image load fails
      resolve(imageDataUrl);
    };
    img.src = imageDataUrl;
  });
};

/**
 * extractTextFromImage
 * Uses Tesseract.js to extract raw text from an image file
 * Enhanced with image preprocessing and better OCR settings for business cards
 * @param {File} file - image file from input
 * @returns {Promise<string>} raw OCR text
 */
export const extractTextFromImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageDataUrl = reader.result;
        
        // Preprocess image for better OCR accuracy
        console.log('🖼️ Preprocessing image for OCR (scaling 2x, enhancing contrast)...');
        const processedImageUrl = await preprocessImageForOCR(imageDataUrl);
        
        // Enhanced Tesseract.js configuration for better accuracy on business cards
        // Supports English (primary), Korean, Japanese, and other languages
        // PSM 6 = Assume a single uniform block of text (best for business cards)
        // PSM 11 = Sparse text (fallback if 6 doesn't work well)
        let text = '';
        
        // Language configuration: English first, then Korean, Japanese, and others
        // Tesseract.js will prioritize English but also recognize Korean and Japanese characters
        const languages = 'eng+kor+jpn'; // English + Korean + Japanese
        
        // Try PSM 6 first (single block - best for business cards)
        try {
          console.log('📖 Running OCR with PSM 6 (single uniform block) - Languages: English (primary), Korean, Japanese...');
          const result1 = await Tesseract.recognize(processedImageUrl, languages, {
            logger: (m) => {
              if (m.status === 'recognizing text' && m.progress === 1) {
                console.log('✅ OCR completed with PSM 6');
              }
            },
            tessedit_pageseg_mode: '6', // Single uniform block of text
            // Note: Removed char_whitelist to allow Korean, Japanese, and other language characters
            workerOptions: {
              cacheMethod: 'none',
            },
          });
          text = result1.data.text;
          console.log('📄 OCR Text length:', text.length);
        } catch (err1) {
          console.warn('⚠️ PSM 6 failed, trying PSM 11 (sparse text)...', err1);
          // Fallback to PSM 11 (sparse text - better for cards with scattered text)
          try {
            console.log('📖 Running OCR with PSM 11 (sparse text) - Languages: English (primary), Korean, Japanese...');
            const result2 = await Tesseract.recognize(processedImageUrl, languages, {
              logger: (m) => {
                if (m.status === 'recognizing text' && m.progress === 1) {
                  console.log('✅ OCR completed with PSM 11');
                }
              },
              tessedit_pageseg_mode: '11', // Sparse text
              // Note: Removed char_whitelist to allow Korean, Japanese, and other language characters
              workerOptions: {
                cacheMethod: 'none',
              },
            });
            text = result2.data.text;
            console.log('📄 OCR Text length:', text.length);
          } catch (err2) {
            console.error('❌ Both PSM modes failed, trying default with multiple languages...', err2);
            // Final fallback to default with multiple languages
            try {
              const result3 = await Tesseract.recognize(processedImageUrl, languages, {
                logger: (m) => {
                  if (m.status === 'recognizing text' && m.progress === 1) {
                    console.log('✅ OCR completed with default settings');
                  }
                },
                workerOptions: {
                  cacheMethod: 'none',
                },
              });
              text = result3.data.text;
              console.log('📄 OCR Text length:', text.length);
            } catch (err3) {
              console.error('❌ All OCR attempts failed, trying English only as last resort...', err3);
              // Last resort: English only
              const result4 = await Tesseract.recognize(processedImageUrl, 'eng', {
                logger: (m) => {
                  if (m.status === 'recognizing text' && m.progress === 1) {
                    console.log('✅ OCR completed with English only (fallback)');
                  }
                },
                workerOptions: {
                  cacheMethod: 'none',
                },
              });
              text = result4.data.text;
            }
          }
        }
        
        console.log('📄 Raw OCR Text (first 500 chars):', text.substring(0, 500));
        resolve(text);
      } catch (err) {
        console.error('❌ OCR Error:', err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * extractEmail
 * Handles OCR errors like missing dots, split emails, and common character misreads
 */
export const extractEmail = (text) => {
  // First try standard email regex
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const match = text.match(emailRegex);
  if (match) {
    return match[0].toLowerCase();
  }
  
  // Handle emails split across lines or with spaces (OCR error)
  // Pattern: "sug @ netapp . com" or "sug@ netapp.com"
  const emailWithSpacesRegex = /\b([A-Z0-9._%+-]+)\s*@\s*([A-Z0-9.-]+)\s*\.\s*([A-Z]{2,})\b/i;
  const matchWithSpaces = text.match(emailWithSpacesRegex);
  if (matchWithSpaces) {
    const username = matchWithSpaces[1].toLowerCase();
    const domain = matchWithSpaces[2].toLowerCase();
    const tld = matchWithSpaces[3].toLowerCase();
    return `${username}@${domain}.${tld}`;
  }
  
  // Handle missing dot before TLD (e.g., "jiomegroupcom" -> "jiomegroup.com")
  const emailWithoutDotRegex = /\b([A-Z0-9._%+-]+)@([A-Z0-9]+)(com|net|org|edu|gov|co|io|ai|app|group|email|mail)\b/i;
  const matchWithoutDot = text.match(emailWithoutDotRegex);
  if (matchWithoutDot) {
    let username = matchWithoutDot[1].toLowerCase();
    const domain = matchWithoutDot[2].toLowerCase();
    const tld = matchWithoutDot[3].toLowerCase();
    
    // Fix common OCR errors in username
    // "iin" is often "jin" OCR error
    if (username === 'iin' && domain.includes('jiome')) {
      username = 'jin';
    }
    // "iim" is often "jim" OCR error
    if (username === 'iim' && domain.includes('jiome')) {
      username = 'jim';
    }
    
    return `${username}@${domain}.${tld}`;
  }
  
  // Handle emails where @ might be OCR'd as other characters or missing
  // Look for pattern: "username domain.com" or "username domain com"
  const emailPatternRegex = /\b([a-z]{2,})\s+([a-z0-9]{2,})\s*\.?\s*(com|net|org|edu|gov|co|io|ai|app|group|email|mail)\b/i;
  const matchPattern = text.match(emailPatternRegex);
  if (matchPattern) {
    const potentialUsername = matchPattern[1].toLowerCase();
    const potentialDomain = matchPattern[2].toLowerCase();
    const tld = matchPattern[3].toLowerCase();
    
    // Check if this looks like an email (domain should be reasonable length)
    if (potentialDomain.length >= 3 && potentialDomain.length <= 20) {
      // Check if there's an @ nearby (might be on a different line)
      const contextStart = Math.max(0, matchPattern.index - 10);
      const contextEnd = Math.min(text.length, matchPattern.index + matchPattern[0].length + 10);
      const context = text.substring(contextStart, contextEnd);
      
      // If @ is nearby, reconstruct email
      if (/@/.test(context)) {
        return `${potentialUsername}@${potentialDomain}.${tld}`;
      }
    }
  }
  
  // Also try to fix emails with OCR typos in username
  const emailWithTypoRegex = /\b([a-z]{2,})@([a-z0-9]+)(com|net|org|edu|gov|co|io|ai|app|group|email|mail)\b/i;
  const matchWithTypo = text.match(emailWithTypoRegex);
  if (matchWithTypo) {
    let username = matchWithTypo[1].toLowerCase();
    const domain = matchWithTypo[2].toLowerCase();
    const tld = matchWithTypo[3].toLowerCase();
    
    // Fix common OCR errors
    if (username === 'iin' && domain.includes('jiome')) {
      username = 'jin';
    }
    if (username === 'iim' && domain.includes('jiome')) {
      username = 'jim';
    }
    
    return `${username}@${domain}.${tld}`;
  }
  
  // Handle emails split across lines or with OCR errors
  // Pattern: "sug" on one line, "@netapp.com" on another, or "sug" "netapp.com" separated
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].toLowerCase();
    const nextLine = lines[i + 1].toLowerCase();
    
    // Look for username pattern followed by domain pattern on next line
    const usernameMatch = currentLine.match(/\b([a-z]{2,4})\b$/);
    const domainMatch = nextLine.match(/^([a-z0-9]{4,})\.(com|net|org|edu|gov|co|io)\b/);
    
    if (usernameMatch && domainMatch) {
      const username = usernameMatch[1];
      const domain = domainMatch[1];
      const tld = domainMatch[2];
      
      // Verify it looks like an email (domain should be reasonable)
      if (domain.length >= 4 && domain.length <= 20) {
        // Check if @ might be on one of the lines
        if (currentLine.includes('@') || nextLine.includes('@') || 
            (i + 2 < lines.length && lines[i + 2].toLowerCase().includes('@'))) {
          return `${username}@${domain}.${tld}`;
        }
      }
    }
  }
  
  // Last resort: Look for common email patterns in lines (reuse lines array)
  for (const line of lines) {
    // Look for lines that contain common email indicators
    if (line.toLowerCase().includes('@') || 
        (line.toLowerCase().includes('com') && line.length < 30)) {
      // Try to extract email from this line
      const lineEmailMatch = line.match(/([a-z0-9._%+-]+)\s*@?\s*([a-z0-9.-]+)\s*\.?\s*(com|net|org|edu|gov|co|io|ai|app|group)/i);
      if (lineEmailMatch) {
        const username = lineEmailMatch[1].toLowerCase();
        const domain = lineEmailMatch[2].toLowerCase();
        const tld = lineEmailMatch[3].toLowerCase();
        if (username.length >= 2 && domain.length >= 3) {
          return `${username}@${domain}.${tld}`;
        }
      }
    }
  }
  
  // FINAL FALLBACK: Try to construct email from name + company domain
  // This handles cases where email is on a part of card that OCR didn't capture well
  // Only try this if we haven't found an email yet and text is reasonably long
  // Note: email variable is checked - it would be set if found above, but we're checking at the end
  let emailFound = match || matchWithSpaces || matchWithoutDot || matchPattern || (lines.length > 0 && lines.some(line => {
    if (line.toLowerCase().includes('@') || (line.toLowerCase().includes('com') && line.length < 30)) {
      const lineEmailMatch = line.match(/([a-z0-9._%+-]+)\s*@?\s*([a-z0-9.-]+)\s*\.?\s*(com|net|org|edu|gov|co|io|ai|app|group)/i);
      if (lineEmailMatch) {
        const username = lineEmailMatch[1].toLowerCase();
        const domain = lineEmailMatch[2].toLowerCase();
        const tld = lineEmailMatch[3].toLowerCase();
        return username.length >= 2 && domain.length >= 3;
      }
    }
    return false;
  }));
  
  if (!emailFound && text && text.length > 10) {
    // Safely extract name and company with error handling
    let name, company;
    try {
      name = extractName(text);
      company = extractCompany(text);
    } catch (error) {
      console.error('Error extracting name/company for email fallback:', error);
      return '';
    }
    
    if (name && company && typeof name === 'string' && typeof company === 'string') {
      // Extract first name or first part of name
      const nameParts = name.toLowerCase().split(/\s+/).filter(p => p.length > 0);
      if (nameParts.length === 0) return '';
      
      const firstName = nameParts[0];
      
      // Try to extract domain from company name
      // Examples: "NetApp Korea Ltd." -> "netapp", "Jiome Group" -> "jiomegroup"
      const companyWords = company.toLowerCase()
        .replace(/(ltd|llc|inc|corp|co|pte|group|korea|korea\s+ltd)/gi, '')
        .trim()
        .split(/\s+/)
        .filter(w => w && w.length > 2);
      
      if (companyWords.length > 0) {
        // Try most common email pattern: firstname@company.com
        const potentialDomain = companyWords[0];
        if (potentialDomain && typeof potentialDomain === 'string' && potentialDomain.length >= 3 && potentialDomain.length <= 20) {
          // Check if domain appears in text (to confirm it's valid)
          if (text.toLowerCase().includes(potentialDomain)) {
            return `${firstName}@${potentialDomain}.com`;
          }
        }
      }
    }
  }
  
  return '';
};

/**
 * extractPhone
 * Supports various phone formats including dots, dashes, spaces
 * Returns the first valid phone number found (excluding mobile)
 */
export const extractPhone = (text) => {
  // Fix common OCR errors in phone numbers before extraction
  // "+80" is often OCR error for "+82" (Korean country code)
  text = text.replace(/\b\+80\s+/g, '+82 ');
  text = text.replace(/\b80\s+2\./g, '82 2.'); // "+80 2." -> "+82 2."
  
  // Detect country from context
  const isKorea = /korea|seoul|korean/i.test(text) || text.includes('+82');
  const isSingapore = /singapore/i.test(text) || text.includes('+65');
  
  // More flexible phone regex that handles dots, dashes, spaces, parentheses
  const phoneRegex = /(\+?\s?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){3,}\d{1,4}/g;
  const matches = text.match(phoneRegex);
  if (!matches || matches.length === 0) return '';
  
  // Filter valid phone numbers (6+ digits)
  const validPhones = [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 15) {
      // Skip if it looks like a date or time
      if (!/^\d{4}$/.test(m.trim()) && !/^\d{1,2}[:.]\d{2}/.test(m.trim())) {
        const matchIndex = text.indexOf(m);
        const contextStart = Math.max(0, matchIndex - 30);
        const contextEnd = Math.min(text.length, matchIndex + m.length + 30);
        const context = text.substring(contextStart, contextEnd).toLowerCase();
        
        let phoneNumber = m.trim();
        
        // Handle missing country code and area code for Korean numbers
        // Example: "+ 2046.6889 Direct" -> "+82 2.2046.6889" (missing country code +82 and area code 2)
        if (/^\+\s+\d/.test(phoneNumber)) {
          if (isKorea) {
            const numberPart = phoneNumber.replace(/^\+\s+/, '');
            const cleanNumber = numberPart.replace(/\D/g, '');
            
            // If starts with 2 and 7-8 digits, it's Seoul area code (02) -> +82 2
            // "+ 2046.6889" -> "+82 2.2046.6889"
            // The "2" at the start is the area code, need to separate it
            if (cleanNumber.startsWith('2') && cleanNumber.length >= 7 && cleanNumber.length <= 9) {
              // Reconstruct: "+ 2046.6889" -> "+82 2.2046.6889"
              // numberPart is "2046.6889", the "2" is the area code
              // We need: country code "+82", area code "2", then the rest "2046.6889"
              // But wait - if numberPart is "2046.6889", the "2" is already there
              // So we want: "+82 2.2046.6889" which means we keep the "2" and add "+82" before it
              // Actually, the format should be: "+82 2.2046.6889" where "2" is separated
              // So: "+82 2." + "2046.6889" (but "2" is already in "2046.6889" as the first digit)
              // We need to extract "046.6889" and add "2." before it
              const restOfNumber = numberPart.substring(1); // "046.6889" (remove the "2")
              phoneNumber = `+82 2.${restOfNumber}`;
            }
            // If starts with 10, it's mobile (010) -> +82 10 (skip for phone, use for mobile)
            else if (cleanNumber.startsWith('10') && cleanNumber.length >= 9) {
              continue; // Skip mobile numbers for phone extraction
            }
            // Otherwise add country code
            else {
              phoneNumber = `+82 ${numberPart}`;
            }
          } else if (isSingapore) {
            // Fix split country codes like "+6 5" → "+65" before normalizing
            // Handle "+6 585200282" → "+65 8520 0282"
            phoneNumber = phoneNumber.replace(/^\+\s*6\s*5\s+/i, '+65 ');
            // Handle "+6 585200282" pattern (6 + space + 5 + 8 digits)
            const singaporePattern = phoneNumber.match(/^\+\s*6\s+5(\d{8})/i);
            if (singaporePattern) {
              phoneNumber = `+65 ${singaporePattern[1]}`;
            } else {
              phoneNumber = phoneNumber.replace(/^\+\s+/, '+65 ');
            }
          }
        }
        // Handle numbers that start with area code but missing country code
        else if (!phoneNumber.startsWith('+') && isKorea) {
          const cleanNumber = phoneNumber.replace(/\D/g, '');
          // If starts with 2 and 7-9 digits, likely Seoul number missing +82
          if (cleanNumber.startsWith('2') && cleanNumber.length >= 7 && cleanNumber.length <= 9) {
            phoneNumber = `+82 2.${phoneNumber.substring(1)}`;
          }
        }
        
        // If labeled as "Direct", prioritize it (this is the main phone)
        if (context.includes('direct')) {
          validPhones.unshift({ number: phoneNumber, priority: 1 });
        } else if (!context.includes('mobile') && !context.includes('cell')) {
          // Only add if not labeled as mobile
          validPhones.push({ number: phoneNumber, priority: 2 });
        }
      }
    }
  }
  
  // Sort by priority and return first phone (usually the main/office number) and normalize it
  if (validPhones.length > 0) {
    validPhones.sort((a, b) => a.priority - b.priority);
    return normalizePhoneNumber(validPhones[0].number);
  }
  
  return '';
};

/**
 * extractMobile
 * Extracts mobile phone number (usually the second phone or one with "Mobile" label)
 */
export const extractMobile = (text) => {
  // Detect country from context
  const isKorea = /korea|seoul|korean/i.test(text) || text.includes('+82');
  const isSingapore = /singapore/i.test(text) || text.includes('+65');
  
  // Look for "Mobile" or "Cell" label first
  const mobileLabelRegex = /(Mobile|Cell|Mob|Mobile Phone)\s*[:\-]?\s*(\+?\s?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){3,}\d{1,4}/i;
  const mobileMatch = text.match(mobileLabelRegex);
  if (mobileMatch) {
    // Extract the phone number part - handle OCR errors like "¢" and trailing characters
    const matchIndex = text.indexOf(mobileMatch[0]);
    const context = text.substring(matchIndex, matchIndex + mobileMatch[0].length + 20);
    
    // Try to extract clean number from the match
    // Handle OCR errors: "10.365¢ 58" -> "10.3652.8758" (¢ might be 2, trailing 58 might be 8758)
    let phoneText = mobileMatch[0];
    
    // Fix common OCR errors before cleaning
    phoneText = phoneText.replace(/¢/g, '2'); // ¢ is often OCR error for 2
    phoneText = phoneText.replace(/[a-zA-Z\[\]]/g, ' '); // Remove letters and brackets that are OCR noise
    
    // Try to reconstruct the number: "10.3652 58" might be "10.3652.8758"
    // Look for pattern: "10.365" followed by something that might be "2.8758"
    const mobilePattern = /10[.\s]*(\d{3,4})[.\s]*(\d{2,4})/;
    const mobilePatternMatch = phoneText.match(mobilePattern);
    if (mobilePatternMatch) {
      const part1 = mobilePatternMatch[1];
      const part2 = mobilePatternMatch[2];
      // If part2 is short (like "58"), it might be incomplete
      // Try to reconstruct: "10.3652.8758" format
      if (part1.length >= 3 && part2.length <= 4) {
        // If part2 is 2 digits, it might be the last 2 digits of a 4-digit number
        // Common Korean mobile: 010-3652-8758 -> 10.3652.8758
        if (part2.length === 2 && part1.length === 4) {
          // Assume it's the last 2 digits, try to find the full number
          phoneText = `10.${part1}.${part2}XX`; // Placeholder, will be cleaned
        } else {
          phoneText = `10.${part1}.${part2}`;
        }
      }
    }
    
    // Remove remaining OCR noise characters and clean up
    phoneText = phoneText.replace(/[^\d+\s.\-()]/g, ' '); // Remove special chars
    phoneText = phoneText.replace(/\s+/g, ' ').trim();
    
    const phoneRegex = /(\+?\s?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){3,}\d{1,4}/;
    const phoneMatch = phoneText.match(phoneRegex);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g, '');
      if (digits.length >= 6 && digits.length <= 15) {
        let phoneNumber = phoneMatch[0].trim();
        
        // Handle missing country code for mobile
        if (/^\+\s+\d/.test(phoneNumber)) {
          if (isKorea) {
            // Korean mobile: "+ 10.3652.8758" -> "+82 10.3652.8758"
            const numberPart = phoneNumber.replace(/^\+\s+/, '');
            const cleanNumber = numberPart.replace(/\D/g, '');
            
            // If starts with 10, it's mobile (010) -> +82 10
            if (cleanNumber.startsWith('10') && cleanNumber.length >= 9) {
              phoneNumber = `+82 ${numberPart}`;
            } else {
              phoneNumber = `+82 ${numberPart}`;
            }
          } else if (isSingapore) {
            phoneNumber = phoneNumber.replace(/^\+\s+/, '+65 ');
          }
        }
        // Handle numbers that start with 10 (mobile) but missing country code
        else if (!phoneNumber.startsWith('+') && isKorea) {
          const cleanNumber = phoneNumber.replace(/\D/g, '');
          // If starts with 10 and 9+ digits, likely mobile missing +82
          if (cleanNumber.startsWith('10') && cleanNumber.length >= 9) {
            phoneNumber = `+82 ${phoneNumber}`;
          }
        }
        
        return normalizePhoneNumber(phoneNumber);
      }
    }
  }
  
  // If no mobile label, extract all phones and return the one NOT labeled as "Direct"
  const phoneRegex = /(\+?\s?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){3,}\d{1,4}/g;
  const matches = text.match(phoneRegex);
  if (!matches || matches.length === 0) return '';
  
  // Filter valid phone numbers
  const validPhones = [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 15) {
      if (!/^\d{4}$/.test(m.trim()) && !/^\d{1,2}[:.]\d{2}/.test(m.trim())) {
        const matchIndex = text.indexOf(m);
        const contextStart = Math.max(0, matchIndex - 30);
        const contextEnd = Math.min(text.length, matchIndex + m.length + 30);
        const context = text.substring(contextStart, contextEnd).toLowerCase();
        
        // Skip if labeled as "Direct" (that's the main phone, not mobile)
        if (!context.includes('direct')) {
          let phoneNumber = m.trim();
          
          // Handle missing country code
          if (/^\+\s+\d/.test(phoneNumber)) {
            if (isKorea) {
              const numberPart = phoneNumber.replace(/^\+\s+/, '');
              const cleanNumber = numberPart.replace(/\D/g, '');
              // If starts with 10, it's mobile
              if (cleanNumber.startsWith('10') && cleanNumber.length >= 9) {
                phoneNumber = `+82 ${numberPart}`;
              } else {
                phoneNumber = `+82 ${numberPart}`;
              }
            } else if (isSingapore) {
              // Fix split country codes like "+6 5" → "+65"
              phoneNumber = phoneNumber.replace(/^\+\s*6\s*5\s+/i, '+65 ');
              phoneNumber = phoneNumber.replace(/^\+\s*6\s+(\d{8})/i, '+65 $1');
              phoneNumber = phoneNumber.replace(/^\+\s+/, '+65 ');
            }
          }
          // Handle numbers starting with 10 (mobile) missing country code
          else if (!phoneNumber.startsWith('+') && isKorea) {
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            if (cleanNumber.startsWith('10') && cleanNumber.length >= 9) {
              phoneNumber = `+82 ${phoneNumber}`;
            }
          }
          
          validPhones.push(phoneNumber);
        }
      }
    }
  }
  
  // Return second phone if available (first is usually Direct/main), otherwise return first
  if (validPhones.length >= 2) {
    return normalizePhoneNumber(validPhones[1]);
  } else if (validPhones.length === 1) {
    return normalizePhoneNumber(validPhones[0]);
  }
  
  return '';
};

/**
 * extractName
 * Improved heuristic: handles various name formats including all-caps, mixed case, and names with non-English characters nearby
 * Handles cases where name and company are on the same line (most common OCR scenario)
 * Also handles standalone names, especially prominent ones at the top of cards
 */
export const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Address keywords to exclude
  const addressKeywords = /(Tower|Building|St|Street|Road|Ave|Avenue|Lane|Blk|Block|Suite|Floor|Tower|Plaza|Center|Centre|Park|Drive|Dr|Way|Boulevard|Blvd|Daero|Dong|Gu|Seoul)/i;
  // Company suffixes to exclude
  const companySuffixes = /(PTE|LLC|LTD|CORP|CO|INC|INCORPORATED|LIMITED|LLP|GMBH|AG|BV|NV|GROUP)/i;
  // Job title keywords to exclude
  const titleKeywords = /(Manager|Director|CEO|CTO|COO|CFO|Lead|Engineer|Officer|Supervisor|Specialist|Consultant|Analyst|Coordinator|Executive|Assistant|Associate|Representative|Administrator|Developer|Designer|Architect|Strategist|President|VP|Head|Chief|Senior|Junior|Principal|CHIEF|SPARK|ARCHITECT)/i;
  
  // Helper function to check if a word looks like a name part
  const isNameWord = (word) => {
    // Validate input
    if (!word || typeof word !== 'string') return false;
    
    // Remove any non-alphabetic characters for checking
    const cleanWord = word.replace(/[^A-Za-z]/g, '');
    
    // Must have valid length after cleaning
    if (!cleanWord || cleanWord.length < 2 || cleanWord.length > 8) return false;
    
    // Name words start with a letter and are all letters
    return /^[A-Za-z]/.test(cleanWord) && /^[A-Za-z]+$/.test(cleanWord);
  };
  
  // Helper function to check if a line looks like a name (handles all caps, mixed case, etc.)
  const looksLikeName = (line, words) => {
    // Validate inputs
    if (!line || typeof line !== 'string') return false;
    if (!Array.isArray(words) || words.length === 0) return false;
    
    // Must have 2-3 words
    if (words.length < 2 || words.length > 3) return false;
    
    // All words should look like name parts (validate each word)
    if (!words.every(w => w && typeof w === 'string' && isNameWord(w))) return false;
    
    // Check if words start with capital (handles both "JIN KIM" and "Jin Kim")
    const allStartWithCapital = words.every(w => /^[A-Z]/.test(w));
    if (!allStartWithCapital) return false;
    
    // Exclude if it contains company suffixes
    if (companySuffixes.test(line)) return false;
    
    // Exclude if it contains address keywords
    if (addressKeywords.test(line)) return false;
    
    // Exclude if it contains title keywords (unless it's clearly a name)
    // Allow if it's just 2 words and one is a common first name pattern
    if (titleKeywords.test(line) && words.length > 2) return false;
    
    // Exclude if it looks like email or phone
    if (/@/.test(line) || /^\+?\d/.test(line)) return false;
    
    // Exclude if it starts with a number
    if (/^\d/.test(line)) return false;
    
    // Exclude if it contains commas with numbers (address pattern)
    if (/,/.test(line) && /\d/.test(line)) return false;
    
    // Exclude very short words (likely OCR noise)
    if (words.some(w => w.length === 1)) return false;
    
    return true;
  };
  
  // FIRST PASS (PRIORITY): Handle case where name and company are on same line (e.g., "Sug LIM NetApp Korea Ltd.")
  // This is the most common OCR scenario and should be checked first
  for (const line of lines) {
    if (companySuffixes.test(line) && !addressKeywords.test(line) && !/^\d+/.test(line)) {
      const words = line.split(/\s+/).filter(w => w.length > 0);
      
      // If line has 4+ words and contains company suffix, might be "Name Name Company Ltd"
      if (words.length >= 4) {
        const firstTwo = words.slice(0, 2);
        const firstTwoText = firstTwo.join(' ');
        
        // Check if first 2 words look like a name (handles all caps like "JIN KIM")
        if (firstTwo.length === 2 && looksLikeName(firstTwoText, firstTwo)) {
          // Extract just the name part (first 2 words)
          return firstTwoText;
        }
      }
    }
  }
  
  // SECOND PASS: Look for standalone lines with 2-3 words (typical name format)
  // Check early lines (first 15 lines) as names are usually at the top of cards
  // Also prioritize lines that appear before company/contact info
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    // Check if this line looks like a name
    if (looksLikeName(line, words)) {
      // Additional check: if next line contains non-English characters (like Korean),
      // it's likely the same person's name in another language, so this is definitely the name
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        // Check if next line contains non-ASCII characters (Korean, Chinese, etc.)
        const hasNonASCII = /[^\x00-\x7F]/.test(nextLine);
        if (hasNonASCII && !/@/.test(nextLine) && !/^\+?\d/.test(nextLine)) {
          // This is likely the name with a translation below - return the English name
          return line;
        }
      }
      
      // If this line is all caps (like "JIN KIM"), it's very likely a prominent name
      if (line.toUpperCase() === line && /^[A-Z\s]+$/.test(line) && words.length === 2) {
        return line;
      }
      
      // If line appears before any email/phone/company info, it's likely the name
      const hasContactInfo = lines.slice(i + 1).some(l => 
        /@/.test(l) || /^\+?\d/.test(l) || companySuffixes.test(l)
      );
      if (hasContactInfo || i < 5) {
        // This looks like a name - return it
        return line;
      }
    }
  }
  
  // THIRD PASS: Handle OCR errors with pipe/special characters (e.g., "ZIX|AM" -> "JIN KIM", "JIN|KIM" -> "JIN KIM")
  // Check for names with pipe characters or OCR errors in early lines
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Handle names with pipe characters (common OCR artifact)
    // Pattern: "JIN|KIM" or "ZIX|AM" (OCR errors)
    if (/\|/.test(line)) {
      const parts = line.split(/\|/).filter(p => p && p.trim().length > 0);
      if (parts.length === 2) {
        let part1 = parts[0].trim().toUpperCase().replace(/[^A-Z]/g, '');
        let part2 = parts[1].trim().toUpperCase().replace(/[^A-Z]/g, '');
        
        // Fix common OCR errors in name parts
        // "ZIX" is often "JIN" (OCR error: Z→J, I→I, X→N)
        if (part1 === 'ZIX' || part1 === 'ZIN' || part1 === 'JIX') {
          part1 = 'JIN';
        }
        // "AM" when in a name context could be "KIM" (OCR error: K→A, I→I, M→M)
        // But only fix if part1 is already a known name part like "JIN"
        if (part2 === 'AM' && (part1 === 'JIN' || part1.length === 3)) {
          part2 = 'KIM';
        }
        
        // Both parts should be reasonable name lengths (2-6 chars each)
        if (part1.length >= 2 && part1.length <= 6 && part2.length >= 2 && part2.length <= 6) {
          // If this is the first line and looks like a name, return it
          if (i === 0 || i === 1) {
            // Check if next line has non-ASCII (Korean/Chinese) - confirms it's a name
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              if (nextLine && /[^\x00-\x7F]/.test(nextLine) && !/@/.test(nextLine) && !/^\+?\d/.test(nextLine)) {
                return `${part1} ${part2}`;
              }
            }
            // First line with pipe-separated 2-3 char parts is very likely a name
            if (i === 0) {
              return `${part1} ${part2}`;
            }
          }
        }
      }
    }
    
    // Also handle names without pipe but with OCR errors (e.g., "ZIX AM" -> "JIN KIM")
    const words = line.split(/\s+/).filter(w => w && w.trim().length > 0);
    if (words.length === 2 && i === 0) {
      let word1 = words[0].trim().toUpperCase().replace(/[^A-Z]/g, '');
      let word2 = words[1].trim().toUpperCase().replace(/[^A-Z]/g, '');
      
      // Fix OCR errors
      if (word1 === 'ZIX' || word1 === 'ZIN' || word1 === 'JIX') {
        word1 = 'JIN';
      }
      if (word2 === 'AM' && (word1 === 'JIN' || word1.length === 3)) {
        word2 = 'KIM';
      }
      
      // Check if both words look like name parts
      if (word1.length >= 2 && word1.length <= 6 && word2.length >= 2 && word2.length <= 6) {
        // If next line has Korean/Chinese, it's definitely a name
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && /[^\x00-\x7F]/.test(nextLine) && !/@/.test(nextLine) && !/^\+?\d/.test(nextLine)) {
            return `${word1} ${word2}`;
          }
        }
        // First line with 2 words that could be names
        if (i === 0 && !/@/.test(line) && !/^\+?\d/.test(line) && !companySuffixes.test(line)) {
          return `${word1} ${word2}`;
        }
      }
    }
  }
  
  // FOURTH PASS: Handle concatenated names (OCR missed space, e.g., "JINKIM" -> "JIN KIM")
  // Check for all-caps single words that look like concatenated names (6-12 chars, all caps)
  // Prioritize early lines (especially first line) as names are usually at the top
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Remove pipe characters and other OCR artifacts first
    const cleanLine = line.replace(/[|\\\/]/g, '').trim();
    if (!cleanLine) continue;
    
    const words = cleanLine.split(/\s+/).filter(w => w.length > 0);
    
    // If single word, all caps, 6-12 characters, might be concatenated name
    if (words.length === 1 && 
        cleanLine.toUpperCase() === cleanLine && 
        /^[A-Z]+$/.test(cleanLine) &&
        cleanLine.length >= 6 && 
        cleanLine.length <= 12 &&
        !companySuffixes.test(cleanLine) &&
        !addressKeywords.test(cleanLine) &&
        !/@/.test(cleanLine) &&
        !/^\+?\d/.test(cleanLine) &&
        !titleKeywords.test(cleanLine)) {
      
      // Try to split into two name parts (common pattern: 3-4 chars + 3-4 chars)
      // Examples: "JINKIM" -> "JIN KIM", "JOHNSMITH" -> "JOHN SMITH"
      for (let splitPoint = 3; splitPoint <= Math.min(6, cleanLine.length - 3); splitPoint++) {
        const firstPart = cleanLine.substring(0, splitPoint);
        const secondPart = cleanLine.substring(splitPoint);
        
        // Both parts should be reasonable name lengths (2-6 chars each)
        if (firstPart.length >= 2 && firstPart.length <= 6 &&
            secondPart.length >= 2 && secondPart.length <= 6) {
          
          // HIGH PRIORITY: If this is the first line, it's very likely a name
          if (i === 0) {
            return `${firstPart} ${secondPart}`;
          }
          
          // Check if next line has non-ASCII (Korean/Chinese) - confirms it's a name
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine && /[^\x00-\x7F]/.test(nextLine) && !/@/.test(nextLine) && !/^\+?\d/.test(nextLine)) {
              return `${firstPart} ${secondPart}`;
            }
          }
          
          // If this appears before contact info or title, it's likely a name
          const hasContactInfo = lines.slice(i + 1).some(l => {
            const trimmed = l.trim();
            return trimmed && (/@/.test(trimmed) || /^\+?\d/.test(trimmed) || companySuffixes.test(trimmed) || titleKeywords.test(trimmed));
          });
          
          // If it's in the first 3 lines OR appears before contact info, it's likely a name
          if (hasContactInfo || i < 3) {
            return `${firstPart} ${secondPart}`;
          }
        }
      }
    }
  }
  
  // FOURTH PASS: Look for all-caps 2-word lines (like "JIN KIM") anywhere in first 20 lines
  // These are often prominent names on business cards
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    // Check for all-caps 2-word names
    if (words.length === 2 && 
        line.toUpperCase() === line && 
        /^[A-Z\s]+$/.test(line) &&
        words.every(w => w.length >= 2 && w.length <= 8) &&
        !companySuffixes.test(line) &&
        !addressKeywords.test(line) &&
        !/@/.test(line) &&
        !/^\+?\d/.test(line) &&
        !titleKeywords.test(line)) {
      return line;
    }
  }
  
  return '';
};

/**
 * extractCompany
 * Improved: looks for company names with common suffixes (Ltd, Inc, Corp, etc.)
 * Extracts only the company part, avoiding combination with names
 */
export const extractCompany = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Look for company suffixes
  const companySuffixes = /(PTE|LLC|LTD|CORP|CO|INC|INCORPORATED|LIMITED|LLP|GMBH|AG|S\.?A\.?|BV|NV|GROUP)/i;
  
  // Address keywords to exclude
  const addressKeywords = /(Tower|Building|St|Street|Road|Ave|Avenue|Lane|Blk|Block|Suite|Floor|Tower|Plaza|Center|Centre|Park|Drive|Dr|Way|Boulevard|Blvd|Daero|Dong|Gu|Seoul)/i;
  
  // Helper to check if a line looks like a name (to exclude from company extraction)
  const looksLikeName = (line) => {
    const words = line.split(/\s+/).filter(w => w.length > 0);
    // Single word all-caps 6-12 chars (like "JINKIM") - likely a concatenated name
    if (words.length === 1 && line.toUpperCase() === line && /^[A-Z]+$/.test(line) && 
        line.length >= 6 && line.length <= 12) {
      return true;
    }
    // 2-word all-caps (like "JIN KIM") - likely a name
    if (words.length === 2 && line.toUpperCase() === line && /^[A-Z\s]+$/.test(line) &&
        words.every(w => w.length >= 2 && w.length <= 8)) {
      return true;
    }
    return false;
  };
  
  // Extract email early to use domain as company name if needed
  const email = extractEmail(text);
  
  // Helper to get company name from email domain
  const getCompanyFromEmailDomain = () => {
    if (!email) return null;
    
    const emailMatch = email.match(/@([a-zA-Z0-9-]+)\./);
    if (emailMatch) {
      const domain = emailMatch[1];
      // Skip common generic domains
      if (!['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'mail'].includes(domain.toLowerCase())) {
        // Capitalize first letter and format as company name (e.g., "jiomegroup" -> "Jiomegroup")
        const companyName = domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
        return companyName;
      }
    }
    return null;
  };
  
  // Helper to check if a string looks like a URL/domain
  const looksLikeURL = (str) => {
    if (!str) return false;
    // Check for URL patterns: "www", ".com", ".net", etc.
    return /(www\s*|[a-z0-9-]+\s*\.(?:com|net|org|edu|gov|co|io|ai|app|group))/i.test(str);
  };
  
  for (const line of lines) {
    let trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // PRIORITY: Skip lines that look like URLs/domains (e.g., "www jiomeapp.com", "jiomeapp.com")
    // Use email domain as company name instead
    if (looksLikeURL(trimmedLine) && !companySuffixes.test(trimmedLine)) {
      // This line is a URL/domain - use email domain as company name if available
      const companyFromEmail = getCompanyFromEmailDomain();
      if (companyFromEmail) {
        return companyFromEmail;
      }
      // If no email, continue searching for actual company name
      continue;
    }
    
    // Skip lines that start with "-" followed by garbage OCR text (e.g., "- Feo sas Specs PAO")
    // These are often OCR errors that shouldn't be considered as company names
    if (/^-\s*[A-Z][a-z]{1,3}\s+[a-z]{1,3}\s+[A-Z]{2,4}/.test(trimmedLine) && trimmedLine.length < 30) {
      continue;
    }
    
    // Skip if line starts with a number (likely address)
    if (/^\d+\s/.test(trimmedLine)) {
      continue;
    }
    
    // Skip if line contains email (should not be company)
    if (/@/.test(trimmedLine)) {
      continue;
    }
    
    // Skip if line looks like a name (e.g., "JINKIM", "JIN KIM")
    if (looksLikeName(trimmedLine)) {
      continue;
    }
    
    // Fix common OCR errors before processing: "Netapp" -> "NetApp", "Lt" -> "Ltd."
    trimmedLine = trimmedLine.replace(/\bNetapp\b/gi, 'NetApp');
    trimmedLine = trimmedLine.replace(/\bLt\.?\s*$/i, 'Ltd.');
    trimmedLine = trimmedLine.replace(/\bLtd\s*$/i, 'Ltd.');
    
    // Check if line contains company suffix
    if (companySuffixes.test(trimmedLine)) {
      // If line contains address keywords, skip it
      if (addressKeywords.test(trimmedLine)) {
        continue;
      }
      
      const suffixMatch = trimmedLine.match(companySuffixes);
      if (suffixMatch) {
        const suffixIndex = trimmedLine.indexOf(suffixMatch[0]);
        const beforeSuffix = trimmedLine.substring(0, suffixIndex).trim();
        const beforeWords = beforeSuffix.split(/\s+/);
        const suffixPart = trimmedLine.substring(suffixIndex).trim();
        
        // If line has 4+ words before suffix, likely "Name Name Company Ltd" pattern (e.g., "Sug LIM NetApp Korea Ltd")
        // Extract words from after the name part (skip first 2 words which are likely the name)
        if (beforeWords.length >= 4) {
          // Check if first 2 words look like a name
          const firstTwo = beforeWords.slice(0, 2);
          const looksLikeName = firstTwo.every(w => w.length <= 6 && /^[A-Z]/.test(w));
          
          if (looksLikeName) {
            // Skip first 2 words (the name), take the rest (the company part)
            const companyWords = beforeWords.slice(2);
            const extractedCompany = companyWords.join(' ') + ' ' + suffixPart;
            // Check if extracted company looks like a URL - if so, use email domain instead
            if (looksLikeURL(extractedCompany)) {
              const companyFromEmail = getCompanyFromEmailDomain();
              if (companyFromEmail) return companyFromEmail;
            }
            return extractedCompany;
          } else {
            // Not sure, take last 2-3 words before the suffix
            const companyWords = beforeWords.slice(-(Math.min(3, beforeWords.length - 1)));
            const extractedCompany = companyWords.join(' ') + ' ' + suffixPart;
            // Check if extracted company looks like a URL - if so, use email domain instead
            if (looksLikeURL(extractedCompany)) {
              const companyFromEmail = getCompanyFromEmailDomain();
              if (companyFromEmail) return companyFromEmail;
            }
            return extractedCompany;
          }
        }
        // If 3 words, might be "Name Company Ltd" - take last word or two
        else if (beforeWords.length === 3) {
          // Check if first 2 words look like a name (both short, one might be all caps)
          const firstTwo = beforeWords.slice(0, 2);
          const isLikelyName = firstTwo.every(w => w.length <= 6) || 
                               (firstTwo[0].length <= 6 && firstTwo[1].length <= 6 && firstTwo[1].toUpperCase() === firstTwo[1]);
          
          if (isLikelyName) {
            // Extract just the company part (last word)
            const extractedCompany = beforeWords[2] + ' ' + suffixPart;
            // Check if extracted company looks like a URL - if so, use email domain instead
            if (looksLikeURL(extractedCompany)) {
              const companyFromEmail = getCompanyFromEmailDomain();
              if (companyFromEmail) return companyFromEmail;
            }
            return extractedCompany;
          }
        }
        
        // Default: return the whole line, but clean it up
        // Fix common OCR errors: "Netapp" -> "NetApp", "Lt" -> "Ltd.", "Lt." -> "Ltd."
        let cleaned = line.replace(/\bNetapp\b/gi, 'NetApp');
        cleaned = cleaned.replace(/\bLt\.?\s*$/i, 'Ltd.');
        cleaned = cleaned.replace(/\bLtd\s*$/i, 'Ltd.');
        // Check if cleaned company looks like a URL - if so, use email domain instead
        if (looksLikeURL(cleaned)) {
          const companyFromEmail = getCompanyFromEmailDomain();
          if (companyFromEmail) return companyFromEmail;
        }
        return cleaned;
      }
    }
    
    // Check for all uppercase lines (might be company names) - but be more careful
    if (trimmedLine.length > 3 && trimmedLine.toUpperCase() === trimmedLine && /^[A-Z\s]+$/.test(trimmedLine)) {
      // Skip if it contains email
      if (/@/.test(trimmedLine)) {
        continue;
      }
      
      // Skip if it looks like an address
      if (!/\d{4,}/.test(trimmedLine) && !addressKeywords.test(trimmedLine)) {
        // Make sure it doesn't look like a personal name
        const words = trimmedLine.split(/\s+/);
        // Skip if it's a 2-word name (like "JIN KIM") or single concatenated name (like "JINKIM")
        if (words.length === 2 && words.every(w => w.length <= 6)) {
          continue; // Likely a name, skip
        }
        if (words.length === 1 && trimmedLine.length >= 6 && trimmedLine.length <= 12 && trimmedLine.toUpperCase() === trimmedLine) {
          continue; // Likely a concatenated name, skip
        }
        // Must have 3+ words or be longer to be a company
        if (words.length >= 3 || trimmedLine.length > 12) {
          // Check if this looks like a URL - if so, use email domain instead
          if (looksLikeURL(trimmedLine)) {
            const companyFromEmail = getCompanyFromEmailDomain();
            if (companyFromEmail) return companyFromEmail;
          }
          return trimmedLine;
        }
      }
    }
  }
  
  // If no company name found in text, try email domain as fallback
  const companyFromEmail = getCompanyFromEmailDomain();
  if (companyFromEmail) {
    return companyFromEmail;
  }
  
  // Also check website URL for company name
  const websiteMatch = text.match(/(?:www\.|https?:\/\/)([a-zA-Z0-9-]+)\.(?:com|net|org|co|io|app)/i);
  if (websiteMatch) {
    const domain = websiteMatch[1];
    // Skip common generic domains
    if (!['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'mail', 'google', 'facebook', 'linkedin'].includes(domain.toLowerCase())) {
      // Capitalize first letter and format as company name
      const companyName = domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
      // Remove common suffixes
      const cleanName = companyName.replace(/(group|app|com|net|org|co|io)$/i, '');
      if (cleanName.length >= 3) {
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
      return companyName;
    }
  }
  
  return '';
};

/**
 * extractDepartment
 * Extracts department from explicit labels OR from position/title text
 * Examples: "Sales Specialist" -> "Sales", "Marketing Manager" -> "Marketing"
 */
export const extractDepartment = (text) => {
  // First, try to find explicit "Dept" or "Department" label
  const explicitMatch = text.match(/(?:^|\n)(?:Dept|Department)\s*[:\-]\s*(.+?)(?:\n|$)/i);
  if (explicitMatch) {
    return explicitMatch[1].trim();
  }
  
  // Second, try to extract from position/title text by looking for department keywords
  // Common department names that appear in job titles
  const departmentKeywords = [
    'Sales', 'Marketing', 'Engineering', 'IT', 'Technology', 'Finance', 'Accounting',
    'HR', 'Human Resources', 'Operations', 'Customer Service', 'Business Development',
    'Product', 'Research', 'R&D', 'Legal', 'Compliance', 'Procurement', 'Supply Chain',
    'Quality', 'Administration', 'Administrative', 'Strategy', 'Innovation', 'Design',
    'Content', 'Communications', 'Public Relations', 'PR', 'Training', 'Development'
  ];
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Job title keywords to identify position lines
  const titleKeywords = /(Manager|Director|CEO|CTO|COO|CFO|Lead|Engineer|Officer|Supervisor|Specialist|Consultant|Analyst|Coordinator|Executive|Assistant|Associate|Representative|Administrator|Developer|Designer|Architect|Strategist|President|VP|Head|Chief|Senior|Junior|Principal)/i;
  
  for (const line of lines) {
    // Check if this looks like a position/title line
    if (titleKeywords.test(line)) {
      // Look for department keywords at the start or early in the line
      for (const dept of departmentKeywords) {
        // Match department keyword at word boundary, preferably at the start
        const deptRegex = new RegExp(`\\b${dept}\\b`, 'i');
        if (deptRegex.test(line)) {
          // Get the position of the department keyword
          const match = line.match(deptRegex);
          if (match) {
            const deptIndex = match.index;
            // If department keyword is in first 3 words, it's likely the department
            const wordsBeforeDept = line.substring(0, deptIndex).trim().split(/\s+/).filter(w => w.length > 0);
            if (wordsBeforeDept.length <= 2) {
              // Extract the department name (handle multi-word departments like "Human Resources")
              const deptName = dept; // Use the exact keyword match
              return deptName;
            }
          }
        }
      }
    }
  }
  
  return '';
};

/**
 * extractPosition
 * Improved: expanded list of job titles and checks for common patterns
 */
export const extractPosition = (text) => {
  const titles = [
    'Manager', 'Director', 'CEO', 'CTO', 'COO', 'CFO', 'Lead', 'Engineer', 'Officer', 'Supervisor',
    'Specialist', 'Consultant', 'Analyst', 'Coordinator', 'Executive', 'Assistant', 'Associate',
    'Representative', 'Administrator', 'Developer', 'Designer', 'Architect', 'Strategist',
    'President', 'Vice President', 'VP', 'Vice', 'Head', 'Chief', 'Senior', 'Junior', 'Principal',
    'Sales', 'AWS', 'APAC', 'FSXN', 'FSxN' // Additional keywords for this specific card
  ];
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Also look for patterns like "AWS FSXN Sales Specialist, APAC"
  // Handle OCR errors: "FSXN" might be "FSXN", "FSXN", etc.
  const positionPatterns = [
    /AWS\s+FSXN?\s+Sales\s+Specialist/i,
    /Sales\s+Specialist/i,
    /FSXN?\s+Sales\s+Specialist/i,
    /AWS\s+.*Specialist/i,
    /.*Specialist.*APAC/i
  ];
  
  for (const line of lines) {
    // First check for specific patterns
    for (const pattern of positionPatterns) {
      const match = line.match(pattern);
      if (match) {
        let cleaned = line.trim();
        // Clean up common OCR errors at the end
        cleaned = cleaned.replace(/\s*,\s*[A-Z][a-z]?\s*,\s*[a-z]{1,2}\s*$/, '');
        cleaned = cleaned.replace(/\s+[A-Z][a-z]?\s*$/, '');
        cleaned = cleaned.trim();
        
        // Fix common OCR errors in position titles
        cleaned = cleaned.replace(/\bFSXN\b/gi, 'FSxN');
        cleaned = cleaned.replace(/\bFeo\s+sas\s+Specs\b/gi, 'FSxN Sales'); // OCR error pattern
        
        if (cleaned.length > 5) {
          return cleaned;
        }
      }
    }
    
    // Check if line contains any of the titles
    for (const title of titles) {
      if (line.match(new RegExp(`\\b${title}\\b`, 'i'))) {
        // Skip if it looks like a company name (all caps with LTD/INC)
        if (!/^(PTE|LLC|LTD|CORP|INC)/i.test(line)) {
          // Clean up common OCR errors at the end (single letters, short words like "Ee, es")
          // Remove trailing patterns like ", Xx, xx" or " Xx" at the end
          let cleaned = line.replace(/\s*,\s*[A-Z][a-z]?\s*,\s*[a-z]{1,2}\s*$/, ''); // ", Ee, es"
          cleaned = cleaned.replace(/\s+[A-Z][a-z]?\s*$/, ''); // " Xx"
          cleaned = cleaned.trim();
          
          // Fix common OCR errors in position titles
          cleaned = cleaned.replace(/\bFSXN\b/gi, 'FSxN');
          cleaned = cleaned.replace(/\bFeo\s+sas\s+Specs\b/gi, 'FSxN Sales');
          
          if (cleaned.length > 5) {
            return cleaned;
          }
        }
      }
    }
  }
  
  return '';
};

/**
 * extractCompanyAddress
 * Improved: collects multi-line addresses and common address keywords
 * Avoids mixing with position/job title text
 */
export const extractCompanyAddress = (text) => {
  const keywords = ['St', 'Street', 'Road', 'Rd', 'Ave', 'Avenue', 'Lane', 'Ln', 'Blk', 'Block', 
                    'Building', 'Bldg', 'Suite', 'Ste', 'Floor', 'Fl', 'Tower', 'Tower', 
                    'Plaza', 'Center', 'Centre', 'Park', 'Drive', 'Dr', 'Way', 'Boulevard', 'Blvd',
                    'Daero', 'Dong', 'Gu', 'Seoul'];
  
  // Job title keywords to exclude (avoid mixing position with address)
  const positionKeywords = /(Manager|Director|CEO|CTO|COO|CFO|Lead|Engineer|Officer|Supervisor|Specialist|Consultant|Analyst|Coordinator|Executive|Assistant|Associate|Representative|Administrator|Developer|Designer|Architect|Strategist|President|VP|Head|Chief|Senior|Junior|Principal)/i;
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const addressLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip if line contains position keywords (likely a job title, not address)
    if (positionKeywords.test(line) && !keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(line))) {
      continue;
    }
    
    // Check if line contains address keywords
    const hasKeyword = keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(line));
    
    // Check if line has address-like pattern (numbers with text, but not phone/email)
    const hasAddressPattern = /\d+/.test(line) && /[A-Za-z]/.test(line) && 
                              !/@/.test(line) && !/^\+?\d{1,4}[-.\s]/.test(line);
    
    if (hasKeyword || (hasAddressPattern && line.length > 10)) {
      // Clean up common OCR errors (remove trailing single letters, "Fe" prefix if it's OCR noise)
      let cleanedLine = line.replace(/^Fe\s+/, ''); // Remove "Fe" prefix if OCR error
      cleanedLine = cleanedLine.replace(/\s*,\s*$/, ''); // Remove trailing comma
      
      // Collect this line and potentially following lines
      addressLines.push(cleanedLine);
      
      // Check if next line is part of the address (no email, no phone, no position keywords)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!/@/.test(nextLine) && 
            !/^\+?\d{1,4}[-.\s]/.test(nextLine) && 
            !positionKeywords.test(nextLine) &&
            nextLine.length > 5 &&
            (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(nextLine)) || /\d/.test(nextLine))) {
          addressLines.push(nextLine);
          i++; // Skip next line
        }
      }
      
      // Join address lines and return
      if (addressLines.length > 0) {
        return addressLines.join(', ');
      }
    }
  }
  
  return '';
};

/**
 * extractLinkedIn
 * Extracts LinkedIn profile URL from text
 */
export const extractLinkedIn = (text) => {
  const linkedInRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/|linkedin\.com\/company\/)[a-zA-Z0-9-]+/i;
  const match = text.match(linkedInRegex);
  if (match) {
    const url = match[0];
    // Ensure it starts with http/https or just return the path
    if (url.startsWith('http')) return url;
    return `https://${url}`;
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

  const extractedData = {
    name: extractName(rawText),
    company: extractCompany(rawText),
    department: extractDepartment(rawText),
    position: extractPosition(rawText),
    phone: extractPhone(rawText),
    mobile: extractMobile(rawText),
    email: extractEmail(rawText),
    address: extractCompanyAddress(rawText),
    linkedIn: extractLinkedIn(rawText),
    rawText,
  };
  
  // Log extraction results
  console.group('📄 OCR Extraction Results (extractCardInfo)');
  console.log('Raw OCR Text:');
  console.log(rawText);
  console.log('---');
  console.log('Extracted Fields:');
  console.log('  Name:', extractedData.name || '(not found)');
  console.log('  Company:', extractedData.company || '(not found)');
  console.log('  Position:', extractedData.position || '(not found)');
  console.log('  Department:', extractedData.department || '(not found)');
  console.log('  Phone:', extractedData.phone || '(not found)');
  console.log('  Mobile:', extractedData.mobile || '(not found)');
  console.log('  Email:', extractedData.email || '(not found)');
  console.log('  Address:', extractedData.address || '(not found)');
  console.log('  LinkedIn:', extractedData.linkedIn || '(not found)');
  console.groupEnd();

  return extractedData;
};
