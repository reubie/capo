/**
 * cardDetection.js
 * Utility functions for detecting and cropping business cards from images
 * Removes background and extracts only the card area
 * Uses improved algorithm to detect full card boundaries
 * Handles edge cases: small cards, blurry images, distant cards
 */

/**
 * Detect image blur using Laplacian variance
 * Higher variance = sharper image
 * @param {ImageData} imageData - Image data
 * @returns {number} Blur score (higher = sharper)
 */
const detectBlur = (imageData) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Convert to grayscale
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  
  // Calculate Laplacian variance
  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian = 
        -gray[(y - 1) * width + x] +
        -gray[y * width + (x - 1)] +
        4 * gray[idx] +
        -gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + x];
      
      sum += laplacian;
      sumSquared += laplacian * laplacian;
      count++;
    }
  }
  
  const mean = sum / count;
  const variance = (sumSquared / count) - (mean * mean);
  
  return variance;
};

/**
 * Check if card is too small in the image
 * @param {Object} crop - Crop coordinates
 * @param {number} imgWidth - Image width
 * @param {number} imgHeight - Image height
 * @returns {Object} {isTooSmall: boolean, reason: string, minSize: number}
 */
const validateCardSize = (crop, imgWidth, imgHeight) => {
  const minCardWidth = 85; // Minimum business card width in mm
  const minCardHeight = 50; // Minimum business card height in mm
  const minPixelsPerMM = 2; // Minimum pixels per mm for good quality
  
  const minWidthPixels = minCardWidth * minPixelsPerMM; // ~170px
  const minHeightPixels = minCardHeight * minPixelsPerMM; // ~100px
  
  const minImageDimension = Math.min(imgWidth, imgHeight);
  const minSizePercent = 0.15; // At least 15% of smallest dimension
  
  const minSize = Math.max(
    minWidthPixels,
    minHeightPixels,
    minImageDimension * minSizePercent
  );
  
  const cardSize = Math.min(crop.width, crop.height);
  const isTooSmall = cardSize < minSize;
  
  return {
    isTooSmall,
    reason: isTooSmall 
      ? `Card is too small (${Math.round(cardSize)}px). Please move closer. Minimum: ${Math.round(minSize)}px`
      : 'Card size is acceptable',
    minSize,
    actualSize: cardSize
  };
};

/**
 * Detect business card edges using improved algorithm
 * Ensures full card is captured, not just parts
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<{x: number, y: number, width: number, height: number}>} Crop coordinates
 */
export const detectCardEdges = (img) => {
  return new Promise((resolve) => {
    // Scale down for performance (max 1500px on longest side for better accuracy)
    const maxSize = 1500;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const workWidth = Math.floor(img.width * scale);
    const workHeight = Math.floor(img.height * scale);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = workWidth;
    canvas.height = workHeight;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, workWidth, workHeight);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, workWidth, workHeight);
    const data = imageData.data;
    
    // Convert to grayscale (proper luminance)
    const grayData = new Uint8Array(workWidth * workHeight);
    for (let i = 0; i < data.length; i += 4) {
      grayData[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    
    // Apply Gaussian blur (5x5 kernel) to reduce noise
    const blurred = new Uint8Array(workWidth * workHeight);
    const kernel = [
      1, 4, 6, 4, 1,
      4, 16, 24, 16, 4,
      6, 24, 36, 24, 6,
      4, 16, 24, 16, 4,
      1, 4, 6, 4, 1
    ];
    const kernelSum = 256;
    
    for (let y = 2; y < workHeight - 2; y++) {
      for (let x = 2; x < workWidth - 2; x++) {
        let sum = 0;
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            const idx = (y + ky) * workWidth + (x + kx);
            const kIdx = (ky + 2) * 5 + (kx + 2);
            sum += grayData[idx] * kernel[kIdx];
          }
        }
        blurred[y * workWidth + x] = sum / kernelSum;
      }
    }
    
    // Canny edge detection (simplified)
    const edgeMap = new Uint8Array(workWidth * workHeight);
    const lowThreshold = 50;
    const highThreshold = 150;
    
    // Sobel operator for gradient calculation
    for (let y = 1; y < workHeight - 1; y++) {
      for (let x = 1; x < workWidth - 1; x++) {
        const idx = y * workWidth + x;
        
        // Sobel X
        const gx = 
          -1 * blurred[(y - 1) * workWidth + (x - 1)] +
           1 * blurred[(y - 1) * workWidth + (x + 1)] +
          -2 * blurred[y * workWidth + (x - 1)] +
           2 * blurred[y * workWidth + (x + 1)] +
          -1 * blurred[(y + 1) * workWidth + (x - 1)] +
           1 * blurred[(y + 1) * workWidth + (x + 1)];
        
        // Sobel Y
        const gy = 
          -1 * blurred[(y - 1) * workWidth + (x - 1)] +
          -2 * blurred[(y - 1) * workWidth + x] +
          -1 * blurred[(y - 1) * workWidth + (x + 1)] +
           1 * blurred[(y + 1) * workWidth + (x - 1)] +
           2 * blurred[(y + 1) * workWidth + x] +
           1 * blurred[(y + 1) * workWidth + (x + 1)];
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        // Canny thresholding
        if (magnitude > highThreshold) {
          edgeMap[idx] = 255; // Strong edge
        } else if (magnitude > lowThreshold) {
          edgeMap[idx] = 128; // Weak edge (will be connected to strong edges)
        } else {
          edgeMap[idx] = 0;
        }
      }
    }
    
    // Hysteresis: connect weak edges to strong edges
    for (let y = 1; y < workHeight - 1; y++) {
      for (let x = 1; x < workWidth - 1; x++) {
        const idx = y * workWidth + x;
        if (edgeMap[idx] === 128) {
          // Check if connected to strong edge
          let connected = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nIdx = (y + dy) * workWidth + (x + dx);
              if (edgeMap[nIdx] === 255) {
                connected = true;
                break;
              }
            }
            if (connected) break;
          }
          edgeMap[idx] = connected ? 255 : 0;
        }
      }
    }
    
    // Find contours (connected edge regions)
    const visited = new Uint8Array(workWidth * workHeight);
    const contours = [];
    
    for (let y = 0; y < workHeight; y++) {
      for (let x = 0; x < workWidth; x++) {
        const idx = y * workWidth + x;
        if (edgeMap[idx] === 255 && !visited[idx]) {
          // Flood fill to find connected component
          const contour = [];
          const stack = [[x, y]];
          
          while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const cidx = cy * workWidth + cx;
            
            if (cx < 0 || cx >= workWidth || cy < 0 || cy >= workHeight || 
                visited[cidx] || edgeMap[cidx] !== 255) {
              continue;
            }
            
            visited[cidx] = 1;
            contour.push([cx, cy]);
            
            // 8-connected neighbors
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                stack.push([cx + dx, cy + dy]);
              }
            }
          }
          
          // Only keep substantial contours (filter noise)
          if (contour.length > 100) {
            contours.push(contour);
          }
        }
      }
    }
    
    // Find the largest rectangular contour (likely the card)
    let bestContour = null;
    let bestArea = 0;
    let bestBounds = null;
    
    for (const contour of contours) {
      // Find bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of contour) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      
      const width = maxX - minX;
      const height = maxY - minY;
      const area = width * height;
      
      // Validate it's a reasonable rectangle (business card aspect ratio ~1.4-2.0)
      const aspectRatio = width / height;
      const minSize = Math.min(workWidth, workHeight) * 0.15; // At least 15% of image
      
      // Prefer contours that are more centered in the image (likely the main card)
      const centerX = workWidth / 2;
      const centerY = workHeight / 2;
      const contourCenterX = (minX + maxX) / 2;
      const contourCenterY = (minY + maxY) / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(contourCenterX - centerX, 2) + 
        Math.pow(contourCenterY - centerY, 2)
      );
      const maxDistance = Math.sqrt(workWidth * workWidth + workHeight * workHeight) / 2;
      const centerScore = 1 - (distanceFromCenter / maxDistance); // Higher = more centered
      
      // Combined score: area (70%) + center position (30%)
      const score = (area / (workWidth * workHeight)) * 0.7 + centerScore * 0.3;
      const bestScore = bestArea > 0 ? (bestArea / (workWidth * workHeight)) * 0.7 : 0;
      
      if (score > bestScore && 
          width > minSize && height > minSize &&
          aspectRatio >= 1.2 && aspectRatio <= 2.5) {
        bestArea = area;
        bestContour = contour;
        bestBounds = { minX, minY, maxX, maxY, width, height };
      }
    }
    
    // Scale back to original image dimensions
    const scaleBack = 1 / scale;
    
    if (bestBounds) {
      // Adaptive padding: smaller/distant cards need MORE padding to ensure full capture
      // Calculate card size relative to image to determine how much padding is needed
      const cardSizeRatio = Math.min(
        bestBounds.width / workWidth,
        bestBounds.height / workHeight
      );
      
      // Adaptive padding based on card size:
      // - Very small cards (< 30% of image): 30% padding (most conservative)
      // - Small cards (30-40%): 25% padding
      // - Medium cards (40-50%): 20% padding
      // - Large cards (> 50%): 15% padding
      let paddingPercent = 0.15; // Base padding
      if (cardSizeRatio < 0.3) {
        paddingPercent = 0.30; // Very small/distant cards - maximum padding
      } else if (cardSizeRatio < 0.4) {
        paddingPercent = 0.25; // Small cards - high padding
      } else if (cardSizeRatio < 0.5) {
        paddingPercent = 0.20; // Medium-small cards - moderate-high padding
      }
      
      // Add adaptive padding to ensure full card is captured, especially for small/distant cards
      const paddingX = Math.floor(bestBounds.width * paddingPercent);
      const paddingY = Math.floor(bestBounds.height * paddingPercent);
      
      // Calculate crop coordinates with generous padding
      let cropX = Math.floor((bestBounds.minX - paddingX) * scaleBack);
      let cropY = Math.floor((bestBounds.minY - paddingY) * scaleBack);
      let cropWidth = Math.floor((bestBounds.width + paddingX * 2) * scaleBack);
      let cropHeight = Math.floor((bestBounds.height + paddingY * 2) * scaleBack);
      
      // Calculate card center for centering logic
      const cardCenterX = (bestBounds.minX + bestBounds.maxX) / 2;
      const cardCenterY = (bestBounds.minY + bestBounds.maxY) / 2;
      
      // Ensure crop doesn't go outside image boundaries, but try to maintain centering
      if (cropX < 0) {
        const excess = -cropX;
        cropX = 0;
        // Try to extend on the right side to maintain width if possible
        if (cropX + cropWidth + excess <= img.width) {
          cropWidth += excess;
        }
      }
      if (cropY < 0) {
        const excess = -cropY;
        cropY = 0;
        // Try to extend on the bottom side to maintain height if possible
        if (cropY + cropHeight + excess <= img.height) {
          cropHeight += excess;
        }
      }
      if (cropX + cropWidth > img.width) {
        const excess = (cropX + cropWidth) - img.width;
        cropWidth = img.width - cropX;
        // Try to shift left if possible to maintain width
        if (cropX - excess >= 0) {
          cropX -= excess;
          cropWidth += excess;
        }
      }
      if (cropY + cropHeight > img.height) {
        const excess = (cropY + cropHeight) - img.height;
        cropHeight = img.height - cropY;
        // Try to shift up if possible to maintain height
        if (cropY - excess >= 0) {
          cropY -= excess;
          cropHeight += excess;
        }
      }
      
      // Center the card in the crop area if we have room
      const idealCropX = Math.floor((cardCenterX * scaleBack) - cropWidth / 2);
      const idealCropY = Math.floor((cardCenterY * scaleBack) - cropHeight / 2);
      
      // Adjust to center the card, but only if it doesn't go outside boundaries
      if (idealCropX >= 0 && idealCropX + cropWidth <= img.width) {
        cropX = idealCropX;
      } else if (idealCropX < 0) {
        // If we can't center, at least align to left edge
        cropX = 0;
      }
      
      if (idealCropY >= 0 && idealCropY + cropHeight <= img.height) {
        cropY = idealCropY;
      } else if (idealCropY < 0) {
        // If we can't center, at least align to top edge
        cropY = 0;
      }
      
      // Final boundary check
      cropX = Math.max(0, Math.min(cropX, img.width - cropWidth));
      cropY = Math.max(0, Math.min(cropY, img.height - cropHeight));
      cropWidth = Math.min(cropWidth, img.width - cropX);
      cropHeight = Math.min(cropHeight, img.height - cropY);
      
      // Additional safety: ensure we have minimum padding even after boundary adjustments
      // This is CRITICAL for small/distant cards to prevent cutting off names at the top
      // Calculate card size ratio to determine padding needs
      const finalCardSizeRatio = Math.min(cropWidth / img.width, cropHeight / img.height);
      
      // Adaptive minimum padding based on card size
      // Smaller cards need more padding to ensure full capture (especially top for name)
      let minPaddingPercent = 0.08; // Base 8% padding
      if (finalCardSizeRatio < 0.3) {
        minPaddingPercent = 0.12; // Very small cards: 12% padding (critical for name)
      } else if (finalCardSizeRatio < 0.4) {
        minPaddingPercent = 0.10; // Small cards: 10% padding
      }
      
      const minPaddingX = Math.floor(cropWidth * minPaddingPercent);
      const minPaddingY = Math.floor(cropHeight * minPaddingPercent);
      
      // CRITICAL: Top padding is most important to prevent cutting off name
      // If we're too close to top edge, reduce height to add padding
      if (cropY < minPaddingY && cropHeight > minPaddingY * 3) {
        const reduceBy = minPaddingY - cropY;
        cropHeight = Math.max(cropHeight - reduceBy, cropHeight * 0.88); // Preserve most of height
        cropY = 0;
      }
      
      // Left/right padding
      if (cropX < minPaddingX && cropWidth > minPaddingX * 3) {
        const reduceBy = minPaddingX - cropX;
        cropWidth = Math.max(cropWidth - reduceBy, cropWidth * 0.88);
        cropX = 0;
      }
      if (cropX + cropWidth > img.width - minPaddingX && cropWidth > minPaddingX * 3) {
        const excess = (cropX + cropWidth) - (img.width - minPaddingX);
        cropWidth = Math.max(cropWidth - excess, cropWidth * 0.88);
        cropX = Math.max(0, img.width - cropWidth);
      }
      
      // Bottom padding (less critical than top, but still important)
      if (cropY + cropHeight > img.height - minPaddingY && cropHeight > minPaddingY * 3) {
        const excess = (cropY + cropHeight) - (img.height - minPaddingY);
        cropHeight = Math.max(cropHeight - excess, cropHeight * 0.88);
        cropY = Math.max(0, img.height - cropHeight);
      }
      
      const result = {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      };
      
      resolve(result);
    } else {
      // Fallback: use center region with business card aspect ratio
      // Use larger margin (15%) to ensure we capture the full card
      const margin = 0.15;
      const cardAspect = 1.75; // Standard business card
      let cropWidth = img.width * (1 - 2 * margin);
      let cropHeight = cropWidth / cardAspect;
      
      if (cropHeight > img.height * (1 - 2 * margin)) {
        cropHeight = img.height * (1 - 2 * margin);
        cropWidth = cropHeight * cardAspect;
      }
      
      resolve({
        x: Math.floor((img.width - cropWidth) / 2),
        y: Math.floor((img.height - cropHeight) / 2),
        width: Math.floor(cropWidth),
        height: Math.floor(cropHeight)
      });
    }
  });
};

/**
 * Crop image to specified region with white background
 * Similar to Apple's document scanner - only the card, rest is white
 * Ensures card is centered with space around it
 * @param {HTMLImageElement|string} imageSource - Image element or data URL
 * @param {Object} crop - Crop coordinates {x, y, width, height}
 * @returns {Promise<string>} Cropped image as data URL
 */
export const cropImage = (imageSource, crop) => {
  return new Promise((resolve, reject) => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    
    const loadImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Business card standard aspect ratio: ~1.75:1 (3.5" x 2")
      // Use standard output size for consistency
      const standardWidth = 1200;
      const standardHeight = Math.round(standardWidth / 1.75); // ~686px
      
      canvas.width = standardWidth;
      canvas.height = standardHeight;
      
      // Fill with white background (like Apple's scanner)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, standardWidth, standardHeight);
      
      // Calculate scaling to fit the cropped region into standard size
      // Leave 8% margin on all sides for generous spacing around the card
      // This ensures the card is fully visible with space around it
      const margin = 0.08;
      const availableWidth = standardWidth * (1 - 2 * margin);
      const availableHeight = standardHeight * (1 - 2 * margin);
      
      const scaleX = availableWidth / crop.width;
      const scaleY = availableHeight / crop.height;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio, fit within margins
      
      // Calculate centered position with generous margins
      // This ensures the card is centered with space around all edges
      const scaledWidth = crop.width * scale;
      const scaledHeight = crop.height * scale;
      const offsetX = (standardWidth - scaledWidth) / 2; // Center horizontally
      const offsetY = (standardHeight - scaledHeight) / 2; // Center vertically
      
      // Draw only the cropped card portion on white background, centered with space around
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height, // Source: crop region
        offsetX, offsetY, scaledWidth, scaledHeight // Destination: centered on white with margins
      );
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    
    if (typeof imageSource === 'string') {
      img.onload = loadImage;
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSource;
    } else {
      loadImage();
    }
  });
};

/**
 * Auto-detect and crop business card from image
 * Handles edge cases: small cards, blurry images, detection failures
 * @param {File|string} imageSource - Image file or data URL
 * @returns {Promise<{croppedDataUrl: string, crop: Object, warnings: Array, quality: Object}>} Result with quality info
 */
export const autoCropBusinessCard = async (imageSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const warnings = [];
    const quality = {
      blurScore: 0,
      isBlurry: false,
      isTooSmall: false,
      detectionConfidence: 'low'
    };
    
    img.onload = async () => {
      try {
        // Step 1: Check image quality (blur detection)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.min(img.width, 800); // Scale down for blur check
        canvas.height = Math.min(img.height, 800);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurScore = detectBlur(imageData);
        quality.blurScore = blurScore;
        
        // Threshold for blur detection (lower = more blurry)
        // Typical sharp images: > 100, blurry: < 50
        const blurThreshold = 50;
        if (blurScore < blurThreshold) {
          quality.isBlurry = true;
          warnings.push({
            type: 'blur',
            message: 'Image appears blurry. Please ensure the card is in focus and try again.',
            severity: 'warning'
          });
        }
        
        // Step 2: Detect card edges
        const crop = await detectCardEdges(img);
        
        // Step 3: Validate card size
        const sizeValidation = validateCardSize(crop, img.width, img.height);
        quality.isTooSmall = sizeValidation.isTooSmall;
        
        if (sizeValidation.isTooSmall) {
          warnings.push({
            type: 'size',
            message: sizeValidation.reason,
            severity: 'error',
            suggestion: 'Please move closer to the card or ensure the card fills more of the frame.'
          });
          
          // Try to use a larger crop area if card is too small
          const margin = 0.05; // Smaller margin to capture more
          const cardAspect = 1.75;
          let cropWidth = img.width * (1 - 2 * margin);
          let cropHeight = cropWidth / cardAspect;
          
          if (cropHeight > img.height * (1 - 2 * margin)) {
            cropHeight = img.height * (1 - 2 * margin);
            cropWidth = cropHeight * cardAspect;
          }
          
          // Use center crop as fallback
          crop.x = Math.floor((img.width - cropWidth) / 2);
          crop.y = Math.floor((img.height - cropHeight) / 2);
          crop.width = Math.floor(cropWidth);
          crop.height = Math.floor(cropHeight);
          
          quality.detectionConfidence = 'low';
          } else {
          // Validate detected crop is reasonable and not too close to edges
          const minCropSize = Math.min(img.width, img.height) * 0.2; // At least 20%
          const edgeMargin = Math.min(img.width, img.height) * 0.05; // 5% from edges
          
          if (crop.width < minCropSize || crop.height < minCropSize ||
              crop.x < edgeMargin || crop.y < edgeMargin ||
              crop.x + crop.width > img.width - edgeMargin ||
              crop.y + crop.height > img.height - edgeMargin) {
            // Detected region is too small or too close to edges, use conservative center crop
            const margin = 0.15; // Increased margin to ensure full card
            const cardAspect = 1.75;
            let cropWidth = img.width * (1 - 2 * margin);
            let cropHeight = cropWidth / cardAspect;
            
            if (cropHeight > img.height * (1 - 2 * margin)) {
              cropHeight = img.height * (1 - 2 * margin);
              cropWidth = cropHeight * cardAspect;
            }
            
            crop.x = Math.floor((img.width - cropWidth) / 2);
            crop.y = Math.floor((img.height - cropHeight) / 2);
            crop.width = Math.floor(cropWidth);
            crop.height = Math.floor(cropHeight);
            
            quality.detectionConfidence = 'medium';
            warnings.push({
              type: 'detection',
              message: 'Card detection was uncertain. Using conservative center crop to ensure full card is captured.',
              severity: 'info'
            });
          } else {
            quality.detectionConfidence = 'high';
          }
        }
        
        // Step 4: Crop the image
        const croppedDataUrl = await cropImage(img, crop);
        
        resolve({
          croppedDataUrl,
          crop,
          warnings,
          quality
        });
      } catch (error) {
        console.error('Auto-crop error:', error);
        
        // Fallback: return original image centered on white
        const canvas = document.createElement('canvas');
        const standardWidth = 1200;
        const standardHeight = Math.round(standardWidth / 1.75);
        canvas.width = standardWidth;
        canvas.height = standardHeight;
        const ctx = canvas.getContext('2d');
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, standardWidth, standardHeight);
        
        // Center and scale image
        const scale = Math.min(
          (standardWidth * 0.9) / img.width,
          (standardHeight * 0.9) / img.height
        );
        const x = (standardWidth - img.width * scale) / 2;
        const y = (standardHeight - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        warnings.push({
          type: 'error',
          message: 'Automatic card detection failed. Using full image.',
          severity: 'error',
          suggestion: 'Please ensure the card is clearly visible and well-lit, then try again.'
        });
        
        resolve({
          croppedDataUrl: canvas.toDataURL('image/jpeg', 0.92),
          crop: { x: 0, y: 0, width: img.width, height: img.height },
          warnings,
          quality: {
            ...quality,
            detectionConfidence: 'low'
          }
        });
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
};

/**
 * Convert data URL to File object
 * @param {string} dataUrl - Data URL
 * @param {string} filename - Filename
 * @returns {File} File object
 */
export const dataURLtoFile = (dataUrl, filename = 'cropped-card.jpg') => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
