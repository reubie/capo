/**
 * imageCompression.js
 * Utility functions for compressing images before sending to backend
 */

/**
 * Compress image file using Canvas API
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1920)
 * @param {number} options.maxHeight - Maximum height (default: 1920)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 1)
 * @returns {Promise<string>} Compressed image as data URL
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.8,
      maxSizeMB = 1
    } = options;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality settings
        let currentQuality = quality;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const sizeMB = blob.size / (1024 * 1024);

              // If still too large, reduce quality and try again
              if (sizeMB > maxSizeMB && currentQuality > 0.1) {
                currentQuality -= 0.1;
                tryCompress();
              } else {
                // Convert blob to data URL
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };

        tryCompress();
      };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = e.target.result;
  };

  reader.onerror = reject;
  reader.readAsDataURL(file);
});
};

/**
 * Compress image specifically for business cards
 * Optimized for business card dimensions and file size
 * @param {File} file - Image file to compress
 * @returns {Promise<string>} Compressed image as data URL
 */
export const compressBusinessCardImage = (file) => {
  return compressImage(file, {
    maxWidth: 1200,  // Optimized for business cards (reduced from 1600)
    maxHeight: 800,  // Optimized for business cards (reduced from 1000)
    quality: 0.7,    // Slightly lower quality for better compression (reduced from 0.75)
    maxSizeMB: 0.3   // Target: under 300KB (reduced from 500KB) - base64 will be ~400KB
  });
};

