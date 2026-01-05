/**
 * ocr.js
 * Utility functions for extracting structured info from business cards
 */

import Tesseract from 'tesseract.js';

/**
 * extractTextFromImage
 * Uses Tesseract.js to extract raw text from an image file
 * Optimized for performance with worker options
 * @param {File} file - image file from input
 * @returns {Promise<string>} raw OCR text
 */
export const extractTextFromImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Optimize Tesseract.js performance
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng', {
          logger: (m) => {
            // Only log important messages to reduce console spam
            if (m.status === 'recognizing text' && m.progress === 1) {
              console.log('OCR completed');
            }
          },
          // Performance optimizations
          workerOptions: {
            // Reduce memory usage
            cacheMethod: 'none',
          },
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
 * Supports various phone formats including dots, dashes, spaces
 * Returns the first valid phone number found (excluding mobile)
 */
export const extractPhone = (text) => {
  // More flexible phone regex that handles dots, dashes, spaces, parentheses
  const phoneRegex = /(\+?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){4,}\d{1,4}/g;
  const matches = text.match(phoneRegex);
  if (!matches || matches.length === 0) return '';
  
  // Filter valid phone numbers (6+ digits)
  const validPhones = [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 15) {
      // Skip if it looks like a date or time
      if (!/^\d{4}$/.test(m.trim()) && !/^\d{1,2}[:.]\d{2}/.test(m.trim())) {
        validPhones.push(m.trim());
      }
    }
  }
  
  // Return first phone (usually the main/office number)
  if (validPhones.length > 0) {
    return validPhones[0];
  }
  
  return '';
};

/**
 * extractMobile
 * Extracts mobile phone number (usually the second phone or one with "Mobile" label)
 */
export const extractMobile = (text) => {
  // Look for "Mobile" or "Cell" label first
  const mobileLabelRegex = /(Mobile|Cell|Mob|Mobile Phone)\s*[:\-]?\s*(\+?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){4,}\d{1,4}/i;
  const mobileMatch = text.match(mobileLabelRegex);
  if (mobileMatch) {
    // Extract the phone number part
    const phoneRegex = /(\+?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){4,}\d{1,4}/;
    const phoneMatch = mobileMatch[0].match(phoneRegex);
    if (phoneMatch) {
      const digits = phoneMatch[0].replace(/\D/g, '');
      if (digits.length >= 6 && digits.length <= 15) {
        return phoneMatch[0].trim();
      }
    }
  }
  
  // If no mobile label, extract all phones and return the second one
  const phoneRegex = /(\+?\d{1,4}[-.\s()]?)?(\d{1,4}[-.\s()]?){4,}\d{1,4}/g;
  const matches = text.match(phoneRegex);
  if (!matches || matches.length < 2) return '';
  
  // Filter valid phone numbers
  const validPhones = [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 6 && digits.length <= 15) {
      if (!/^\d{4}$/.test(m.trim()) && !/^\d{1,2}[:.]\d{2}/.test(m.trim())) {
        validPhones.push(m.trim());
      }
    }
  }
  
  // Return second phone if available
  if (validPhones.length >= 2) {
    return validPhones[1];
  }
  
  return '';
};

/**
 * extractName
 * Improved heuristic: prioritizes finding names that appear with companies on same line
 * Handles cases where name and company are on the same line (most common OCR scenario)
 */
export const extractName = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Address keywords to exclude
  const addressKeywords = /(Tower|Building|St|Street|Road|Ave|Avenue|Lane|Blk|Block|Suite|Floor|Tower|Plaza|Center|Centre|Park|Drive|Dr|Way|Boulevard|Blvd|Daero|Dong|Gu|Seoul)/i;
  // Company suffixes to exclude
  const companySuffixes = /(PTE|LLC|LTD|CORP|CO|INC|INCORPORATED|LIMITED|LLP|GMBH|AG|BV|NV)/i;
  
  // FIRST PASS (PRIORITY): Handle case where name and company are on same line (e.g., "Sug LIM NetApp Korea Ltd.")
  // This is the most common OCR scenario and should be checked first
  for (const line of lines) {
    if (companySuffixes.test(line) && !addressKeywords.test(line) && !/^\d+/.test(line)) {
      const words = line.split(/\s+/).filter(w => w.length > 0);
      
      // If line has 4+ words and contains company suffix, might be "Name Name Company Ltd"
      if (words.length >= 4) {
        // Check if first 2 words look like a name (both short words, one might be all caps)
        const firstTwo = words.slice(0, 2);
        const firstTwoText = firstTwo.join(' ');
        
        // Check if first 2 words look like a name pattern (e.g., "Sug LIM")
        // Both words should start with capital, be reasonably short, and not contain special chars
        const looksLikeName = firstTwo.length === 2 &&
                              firstTwo.every(w => w.length >= 2 && w.length <= 8 && /^[A-Z]/.test(w)) &&
                              !companySuffixes.test(firstTwoText) &&
                              !addressKeywords.test(firstTwoText) &&
                              !/@/.test(firstTwoText) &&
                              !/^\d/.test(firstTwoText) &&
                              !/,/.test(firstTwoText);
        
        if (looksLikeName) {
          // Extract just the name part (first 2 words)
          return firstTwoText;
        }
      }
    }
  }
  
  // SECOND PASS: Look for standalone lines with 2-3 words (typical name format like "Sug LIM")
  // Only check lines that appear early in the text (first 10 lines) to avoid OCR noise
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    // Prefer lines with exactly 2-3 words
    if (words.length >= 2 && words.length <= 3) {
      // Check if first word starts with capital letter
      if (/^[A-Z]/.test(words[0])) {
        // Skip lines that contain address keywords
        if (addressKeywords.test(line)) {
          continue;
        }
        
        // Skip lines that contain company suffixes
        if (companySuffixes.test(line)) {
          continue;
        }
        
        // Skip lines that look like addresses (contain numbers, especially at start)
        if (/^\d+/.test(line) || (/\d{3,}/.test(line) && addressKeywords.test(line))) {
          continue;
        }
        
        // Skip lines that look like email or phone
        if (/@/.test(line) || /^\+?\d/.test(line)) {
          continue;
        }
        
        // Skip lines that contain common address patterns
        if (/,/.test(line) && /\d/.test(line)) {
          continue;
        }
        
        // Skip very short words (likely OCR noise)
        if (words.some(w => w.length === 1)) {
          continue;
        }
        
        // This looks like a name - return it
        return line;
      }
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
  const companySuffixes = /(PTE|LLC|LTD|CORP|CO|INC|INCORPORATED|LIMITED|LLP|GMBH|AG|S\.?A\.?|BV|NV)/i;
  
  // Address keywords to exclude
  const addressKeywords = /(Tower|Building|St|Street|Road|Ave|Avenue|Lane|Blk|Block|Suite|Floor|Tower|Plaza|Center|Centre|Park|Drive|Dr|Way|Boulevard|Blvd|Daero|Dong|Gu|Seoul)/i;
  
  for (const line of lines) {
    // Skip if line starts with a number (likely address)
    if (/^\d+\s/.test(line)) {
      continue;
    }
    
    // Check if line contains company suffix
    if (companySuffixes.test(line)) {
      // If line contains address keywords, skip it
      if (addressKeywords.test(line)) {
        continue;
      }
      
      const suffixMatch = line.match(companySuffixes);
      if (suffixMatch) {
        const suffixIndex = line.indexOf(suffixMatch[0]);
        const beforeSuffix = line.substring(0, suffixIndex).trim();
        const beforeWords = beforeSuffix.split(/\s+/);
        const suffixPart = line.substring(suffixIndex).trim();
        
        // If line has 4+ words before suffix, likely "Name Name Company Ltd" pattern (e.g., "Sug LIM NetApp Korea Ltd")
        // Extract words from after the name part (skip first 2 words which are likely the name)
        if (beforeWords.length >= 4) {
          // Check if first 2 words look like a name
          const firstTwo = beforeWords.slice(0, 2);
          const looksLikeName = firstTwo.every(w => w.length <= 6 && /^[A-Z]/.test(w));
          
          if (looksLikeName) {
            // Skip first 2 words (the name), take the rest (the company part)
            const companyWords = beforeWords.slice(2);
            return companyWords.join(' ') + ' ' + suffixPart;
          } else {
            // Not sure, take last 2-3 words before the suffix
            const companyWords = beforeWords.slice(-(Math.min(3, beforeWords.length - 1)));
            return companyWords.join(' ') + ' ' + suffixPart;
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
            return beforeWords[2] + ' ' + suffixPart;
          }
        }
        
        // Default: return the whole line
        return line;
      }
    }
    
    // Check for all uppercase lines (might be company names) - but be more careful
    if (line.length > 3 && line.toUpperCase() === line && /^[A-Z\s]+$/.test(line)) {
      // Skip if it looks like an address
      if (!/\d{4,}/.test(line) && !addressKeywords.test(line)) {
        // Make sure it doesn't look like a personal name (2-3 short words all caps)
        const words = line.split(/\s+/);
        if (!(words.length === 2 && words.every(w => w.length <= 6))) {
          return line;
        }
      }
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
    'President', 'Vice President', 'VP', 'Head', 'Chief', 'Senior', 'Junior', 'Principal'
  ];
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
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
          return cleaned;
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

  return {
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
};
