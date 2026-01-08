/**
 * Generate a basic business card image from card data
 * Creates a simple, professional-looking business card using Canvas API
 * @param {Object} cardData - Business card data object
 * @param {string} cardData.cardOwnerName - Full name
 * @param {string} cardData.companyName - Company name
 * @param {string} cardData.position - Job position/title
 * @param {string} cardData.email - Email address
 * @param {string} cardData.phone - Phone number
 * @param {string} cardData.mobile - Mobile number
 * @param {string} cardData.companyAddress - Company address
 * @returns {Promise<string>} Data URL of the generated business card image
 */
export function generateBusinessCard(cardData) {
  return new Promise((resolve, reject) => {
    try {
      // Card dimensions (standard business card: 3.5" x 2" at 300 DPI)
      const width = 1050; // 3.5" * 300 DPI
      const height = 600;  // 2" * 300 DPI
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Background - gradient from cream to white
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FFFCED'); // brand.background
      gradient.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle border
      ctx.strokeStyle = '#55231E'; // brand.brown
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      
      // Top accent bar
      ctx.fillStyle = '#F38218'; // brand.orange
      ctx.fillRect(0, 0, width, 60);
      
      // Text styling
      const padding = 40;
      let yPosition = padding + 40;
      
      // Name (largest, bold)
      if (cardData.cardOwnerName) {
        ctx.fillStyle = '#55231E'; // brand.brown
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const name = cardData.cardOwnerName.toUpperCase();
        ctx.fillText(name, padding, yPosition);
        yPosition += 70;
      }
      
      // Position/Title
      if (cardData.position) {
        ctx.fillStyle = '#F38218'; // brand.orange
        ctx.font = '28px Arial, sans-serif';
        ctx.fillText(cardData.position, padding, yPosition);
        yPosition += 50;
      }
      
      // Company Name
      if (cardData.companyName) {
        ctx.fillStyle = '#8D6E63'; // brand.textSecondary
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText(cardData.companyName, padding, yPosition);
        yPosition += 60;
      }
      
      // Divider line
      ctx.strokeStyle = '#D4C4B0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, yPosition);
      ctx.lineTo(width - padding, yPosition);
      ctx.stroke();
      yPosition += 40;
      
      // Contact Information (smaller font)
      ctx.font = '22px Arial, sans-serif';
      ctx.fillStyle = '#55231E'; // brand.brown
      
      // Email
      if (cardData.email) {
        ctx.fillText(`Email: ${cardData.email}`, padding, yPosition);
        yPosition += 40;
      }
      
      // Phone (prioritize mobile over phone)
      const phoneNumber = cardData.mobile || cardData.phone;
      if (phoneNumber) {
        ctx.fillText(`Phone: ${phoneNumber}`, padding, yPosition);
        yPosition += 40;
      }
      
      // Address (if space allows)
      if (cardData.companyAddress && yPosition < height - 60) {
        // Truncate if too long
        let address = cardData.companyAddress;
        const maxWidth = width - (padding * 2);
        const metrics = ctx.measureText(address);
        if (metrics.width > maxWidth) {
          // Try to fit on one line, otherwise truncate
          while (ctx.measureText(address + '...').width > maxWidth && address.length > 0) {
            address = address.slice(0, -1);
          }
          address = address + '...';
        }
        ctx.fillText(`Address: ${address}`, padding, yPosition);
      }
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      resolve(dataUrl);
    } catch (error) {
      console.error('Error generating business card:', error);
      reject(error);
    }
  });
}

/**
 * Generate business card and convert to File object
 * @param {Object} cardData - Business card data
 * @param {string} filename - Optional filename (default: 'business-card.png')
 * @returns {Promise<File>} File object of the generated card
 */
export async function generateBusinessCardFile(cardData, filename = 'business-card.png') {
  const dataUrl = await generateBusinessCard(cardData);
  
  // Convert data URL to Blob, then to File
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: 'image/png' });
}

