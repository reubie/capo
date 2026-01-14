/**
 * Business Card Sharing Utilities
 * Industry-standard methods for sharing business cards
 */

/**
 * Generate vCard (VCF) format - industry standard for contact sharing
 * vCard format can be imported directly into contacts on any device
 * @param {Object} cardData - Business card data
 * @returns {string} vCard formatted string
 */
export function generateVCard(cardData) {
  if (!cardData) return '';

  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

  // Name (required)
  if (cardData.cardOwnerName) {
    // Split name into components for better contact app parsing
    const nameParts = cardData.cardOwnerName.trim().split(/\s+/);
    if (nameParts.length === 1) {
      lines.push(`FN:${nameParts[0]}`);
      lines.push(`N:${nameParts[0]};;;;`);
    } else {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      lines.push(`FN:${cardData.cardOwnerName}`);
      lines.push(`N:${lastName};${firstName};;;`);
    }
  }

  // Organization
  if (cardData.companyName) {
    lines.push(`ORG:${escapeVCardValue(cardData.companyName)}`);
  }

  // Title/Position
  if (cardData.position) {
    lines.push(`TITLE:${escapeVCardValue(cardData.position)}`);
  }

  // Phone numbers
  if (cardData.mobile) {
    const phone = cleanPhoneNumber(cardData.mobile);
    lines.push(`TEL;TYPE=CELL:${phone}`);
  }
  if (cardData.phone && cardData.phone !== cardData.mobile) {
    const phone = cleanPhoneNumber(cardData.phone);
    lines.push(`TEL;TYPE=WORK:${phone}`);
  }

  // Email
  if (cardData.email) {
    lines.push(`EMAIL;TYPE=WORK:${cardData.email}`);
  }

  // Address
  if (cardData.companyAddress) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(cardData.companyAddress)};;;;`);
  }

  // URL (LinkedIn if available)
  if (cardData.linkedIn) {
    const linkedInUrl = cardData.linkedIn.startsWith('http') 
      ? cardData.linkedIn 
      : `https://${cardData.linkedIn}`;
    lines.push(`URL;TYPE=LinkedIn:${linkedInUrl}`);
  }

  // Add note with app information
  lines.push(`NOTE:Shared from JioME App - Business Card`);

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Escape special characters in vCard values
 */
function escapeVCardValue(value) {
  if (!value) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Clean phone number for vCard (remove spaces, keep +)
 */
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\s+/g, '').trim();
}

/**
 * Download vCard file
 * @param {string} vCardContent - vCard formatted string
 * @param {string} filename - Optional filename (default: contact.vcf)
 */
export function downloadVCard(vCardContent, filename = 'contact.vcf') {
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate formatted text for sharing
 * Professional format that's easy to read and understand
 * Includes card image and logo URLs when available
 * @param {Object} cardData - Business card data
 * @param {string} logoUrl - Optional logo URL (default: /images/logo.png)
 * @returns {string} Formatted text
 */
export function generateFormattedText(cardData, logoUrl = '/images/logo.png') {
  if (!cardData) return '';

  const lines = [];
  
  // Header with logo mention
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('📇 BUSINESS CARD');
  if (logoUrl) {
    const fullLogoUrl = logoUrl.startsWith('http') 
      ? logoUrl 
      : `${window.location.origin}${logoUrl}`;
    lines.push(`🖼️ Logo: ${fullLogoUrl}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  // Business Card Image
  if (cardData.cardImageUrl) {
    const cardImageUrl = cardData.cardImageUrl.startsWith('http')
      ? cardData.cardImageUrl
      : `${window.location.origin}${cardData.cardImageUrl}`;
    lines.push(`📷 Business Card Image:`);
    lines.push(`${cardImageUrl}`);
    lines.push('');
  }

  // Name
  if (cardData.cardOwnerName) {
    lines.push(`👤 ${cardData.cardOwnerName}`);
  }

  // Company
  if (cardData.companyName) {
    lines.push(`🏢 ${cardData.companyName}`);
  }

  // Position
  if (cardData.position) {
    lines.push(`💼 ${cardData.position}`);
  }

  lines.push('');

  // Contact Information
  lines.push('📞 CONTACT INFORMATION:');
  
  if (cardData.mobile) {
    lines.push(`   Mobile: ${cardData.mobile}`);
  }
  
  if (cardData.phone && cardData.phone !== cardData.mobile) {
    lines.push(`   Phone: ${cardData.phone}`);
  }
  
  if (cardData.email) {
    lines.push(`   Email: ${cardData.email}`);
  }

  if (cardData.companyAddress) {
    lines.push(`   Address: ${cardData.companyAddress}`);
  }

  if (cardData.linkedIn) {
    const linkedInUrl = cardData.linkedIn.startsWith('http') 
      ? cardData.linkedIn 
      : `https://${cardData.linkedIn}`;
    lines.push(`   LinkedIn: ${linkedInUrl}`);
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('💡 To save this contact:');
  lines.push('   • View the business card image above');
  lines.push('   • Copy the text above');
  lines.push('   • Or download the .vcf file if available');
  lines.push('   • Import into your contacts app');
  lines.push('━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

/**
 * Generate QR code data URL for business card
 * Creates a QR code containing vCard data
 * @param {Object} cardData - Business card data
 * @returns {Promise<string>} Data URL of QR code image
 */
export async function generateBusinessCardQRCode(cardData) {
  if (!cardData) return null;

  try {
    const vCardContent = generateVCard(cardData);
    
    // Use a QR code library if available, otherwise create a simple canvas-based QR
    // For now, we'll use a simple approach with a QR code API or canvas
    // In production, you'd use a library like 'qrcode' or 'qrcode.react'
    
    // Create QR code using a simple canvas approach
    // Note: For production, install 'qrcode' package: npm install qrcode
    // For now, we'll return a data URL that can be used with a QR code library
    
    // If qrcode library is available, use it:
    // const QRCode = await import('qrcode');
    // return await QRCode.toDataURL(vCardContent, { width: 300, margin: 2 });
    
    // Fallback: Return vCard content as text (can be converted to QR later)
    // For now, we'll create a simple visual representation
    return generateSimpleQRCodeVisual(vCardContent);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Generate a simple visual QR code placeholder
 * In production, replace with actual QR code library
 */
function generateSimpleQRCodeVisual(data) {
  // Create a canvas with a simple pattern
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 300, 300);
  
  // Draw a simple pattern (placeholder)
  ctx.fillStyle = '#000000';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('QR Code', 150, 140);
  ctx.fillText('(Install qrcode library)', 150, 160);
  ctx.fillText('for full functionality', 150, 175);
  
  // Draw border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 280, 280);
  
  return canvas.toDataURL('image/png');
}

/**
 * Check if Web Share API is available
 */
export function isWebShareSupported() {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using Web Share API (native sharing)
 * @param {Object} shareData - { title, text, url }
 * @returns {Promise<boolean>} Success status
 */
export async function shareViaWebAPI(shareData) {
  if (!isWebShareSupported()) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      console.error('Web Share API error:', error);
    }
    return false;
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate shareable link (if backend supports it)
 * @param {string} cardId - Business card ID
 * @returns {string} Shareable URL
 */
export function generateShareableLink(cardId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/card/${cardId}`;
}

