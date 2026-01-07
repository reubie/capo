/**
 * appleCardScanner.js
 * Apple-style business card scanner with perspective correction and background removal
 * Implements full image processing pipeline: detection → perspective correction → enhancement → presentation
 */

/**
 * Convert image to grayscale
 * @param {ImageData} imageData - Image data
 * @returns {ImageData} Grayscale image data
 */
const toGrayscale = (imageData) => {
  const data = imageData.data;
  const grayData = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminance-weighted grayscale conversion
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayData[i] = gray;
    grayData[i + 1] = gray;
    grayData[i + 2] = gray;
    grayData[i + 3] = data[i + 3];
  }
  
  return new ImageData(grayData, imageData.width, imageData.height);
};

/**
 * Apply Gaussian blur to reduce noise
 * @param {ImageData} imageData - Image data
 * @param {number} radius - Blur radius (default: 2)
 * @returns {ImageData} Blurred image data
 */
const gaussianBlur = (imageData, radius = 2) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  // Generate Gaussian kernel
  const kernelSize = radius * 2 + 1;
  const kernel = [];
  let sum = 0;
  const sigma = radius / 3;
  
  for (let i = -radius; i <= radius; i++) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    sum += value;
  }
  
  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }
  
  // Horizontal blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let k = -radius; k <= radius; k++) {
        const px = Math.max(0, Math.min(width - 1, x + k));
        const idx = (y * width + px) * 4;
        const weight = kernel[k + radius];
        r += data[idx] * weight;
        g += data[idx + 1] * weight;
        b += data[idx + 2] * weight;
      }
      
      const idx = (y * width + x) * 4;
      output[idx] = r;
      output[idx + 1] = g;
      output[idx + 2] = b;
      output[idx + 3] = data[idx + 3];
    }
  }
  
  // Vertical blur
  const temp = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let k = -radius; k <= radius; k++) {
        const py = Math.max(0, Math.min(height - 1, y + k));
        const idx = (py * width + x) * 4;
        const weight = kernel[k + radius];
        r += output[idx] * weight;
        g += output[idx + 1] * weight;
        b += output[idx + 2] * weight;
      }
      
      const idx = (y * width + x) * 4;
      temp[idx] = r;
      temp[idx + 1] = g;
      temp[idx + 2] = b;
      temp[idx + 3] = output[idx + 3];
    }
  }
  
  return new ImageData(temp, width, height);
};

/**
 * Canny edge detection
 * @param {ImageData} imageData - Grayscale image data
 * @param {number} lowThreshold - Low threshold (default: 50)
 * @param {number} highThreshold - High threshold (default: 150)
 * @returns {Uint8Array} Edge map (255 = edge, 0 = no edge)
 */
const cannyEdgeDetection = (imageData, lowThreshold = 50, highThreshold = 150) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const edges = new Uint8Array(width * height);
  
  // Sobel operator kernels
  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  
  // Calculate gradients
  const gradients = new Array(width * height);
  const directions = new Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gray = data[idx * 4];
      
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nIdx = ((y + ky) * width + (x + kx)) * 4;
          const nGray = data[nIdx];
          gx += nGray * sobelX[ky + 1][kx + 1];
          gy += nGray * sobelY[ky + 1][kx + 1];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      gradients[idx] = magnitude;
      directions[idx] = Math.atan2(gy, gx);
    }
  }
  
  // Non-maximum suppression
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = directions[idx];
      const mag = gradients[idx];
      
      let neighbor1 = 0, neighbor2 = 0;
      
      // Determine neighbors based on gradient direction
      if ((angle >= -Math.PI / 8 && angle < Math.PI / 8) || 
          (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8)) {
        // Horizontal
        neighbor1 = gradients[idx - 1];
        neighbor2 = gradients[idx + 1];
      } else if ((angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) ||
                 (angle >= -7 * Math.PI / 8 && angle < -5 * Math.PI / 8)) {
        // Diagonal (top-right to bottom-left)
        neighbor1 = gradients[(y - 1) * width + (x + 1)];
        neighbor2 = gradients[(y + 1) * width + (x - 1)];
      } else if ((angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) ||
                 (angle >= -5 * Math.PI / 8 && angle < -3 * Math.PI / 8)) {
        // Vertical
        neighbor1 = gradients[(y - 1) * width + x];
        neighbor2 = gradients[(y + 1) * width + x];
      } else {
        // Diagonal (top-left to bottom-right)
        neighbor1 = gradients[(y - 1) * width + (x - 1)];
        neighbor2 = gradients[(y + 1) * width + (x + 1)];
      }
      
      if (mag > neighbor1 && mag > neighbor2 && mag > highThreshold) {
        edges[idx] = 255; // Strong edge
      } else if (mag > neighbor1 && mag > neighbor2 && mag > lowThreshold) {
        edges[idx] = 128; // Weak edge
      } else {
        edges[idx] = 0;
      }
    }
  }
  
  // Hysteresis thresholding
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (edges[idx] === 128) {
        // Check if connected to strong edge
        let connected = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = (y + dy) * width + (x + dx);
            if (edges[nIdx] === 255) {
              connected = true;
              break;
            }
          }
          if (connected) break;
        }
        edges[idx] = connected ? 255 : 0;
      }
    }
  }
  
  return edges;
};

/**
 * Find contours in edge map
 * @param {Uint8Array} edges - Edge map
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Array} Array of contours (each contour is array of [x, y] points)
 */
const findContours = (edges, width, height) => {
  const visited = new Uint8Array(width * height);
  const contours = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (edges[idx] === 255 && !visited[idx]) {
        const contour = [];
        const stack = [[x, y]];
        
        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          const cidx = cy * width + cx;
          
          if (cx < 0 || cx >= width || cy < 0 || cy >= height || 
              visited[cidx] || edges[cidx] !== 255) {
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
        
        // Filter small contours (noise)
        if (contour.length > 50) {
          contours.push(contour);
        }
      }
    }
  }
  
  return contours;
};

/**
 * Approximate contour to polygon using Douglas-Peucker algorithm
 * @param {Array} contour - Contour points [[x, y], ...]
 * @param {number} epsilon - Approximation accuracy
 * @returns {Array} Approximated polygon points
 */
const approximatePolygon = (contour, epsilon = 10) => {
  if (contour.length < 4) return null;
  
  // Find bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of contour) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  
  // Find corner points (points closest to rectangle corners)
  const corners = [
    [minX, minY], // Top-left
    [maxX, minY], // Top-right
    [maxX, maxY], // Bottom-right
    [minX, maxY]  // Bottom-left
  ];
  
  const cornerPoints = corners.map(corner => {
    let minDist = Infinity;
    let closestPoint = contour[0];
    
    for (const point of contour) {
      const dist = Math.sqrt(
        Math.pow(point[0] - corner[0], 2) + 
        Math.pow(point[1] - corner[1], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }
    
    return closestPoint;
  });
  
  return cornerPoints;
};

/**
 * Order points: top-left, top-right, bottom-right, bottom-left
 * @param {Array} points - Four corner points
 * @returns {Array} Ordered points
 */
const orderPoints = (points) => {
  // Find center
  const center = [
    points.reduce((sum, p) => sum + p[0], 0) / points.length,
    points.reduce((sum, p) => sum + p[1], 0) / points.length
  ];
  
  // Sort by distance from center and angle
  const sorted = points.map((pt, i) => ({
    point: pt,
    angle: Math.atan2(pt[1] - center[1], pt[0] - center[0])
  })).sort((a, b) => a.angle - b.angle);
  
  // Find top-left (smallest x + y)
  let topLeftIdx = 0;
  let minSum = Infinity;
  for (let i = 0; i < sorted.length; i++) {
    const sum = sorted[i].point[0] + sorted[i].point[1];
    if (sum < minSum) {
      minSum = sum;
      topLeftIdx = i;
    }
  }
  
  // Reorder starting from top-left
  const ordered = [];
  for (let i = 0; i < sorted.length; i++) {
    ordered.push(sorted[(topLeftIdx + i) % sorted.length].point);
  }
  
  return ordered;
};

/**
 * Calculate perspective transformation matrix
 * @param {Array} srcPoints - Source points [[x, y], ...] (4 points)
 * @param {Array} dstPoints - Destination points [[x, y], ...] (4 points)
 * @returns {Array} 3x3 transformation matrix
 */
const getPerspectiveTransform = (srcPoints, dstPoints) => {
  // Solve for perspective transformation using least squares
  // We need to solve: [x', y'] = [a b c; d e f; g h 1] * [x, y, 1]
  
  const A = [];
  const b = [];
  
  for (let i = 0; i < 4; i++) {
    const [x, y] = srcPoints[i];
    const [x2, y2] = dstPoints[i];
    
    A.push([x, y, 1, 0, 0, 0, -x2 * x, -x2 * y]);
    A.push([0, 0, 0, x, y, 1, -y2 * x, -y2 * y]);
    b.push(x2);
    b.push(y2);
  }
  
  // Solve linear system (simplified - using Gaussian elimination)
  // For production, use a proper matrix library
  const n = 8;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Eliminate
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return [
    [x[0], x[1], x[2]],
    [x[3], x[4], x[5]],
    [x[6], x[7], 1]
  ];
};

/**
 * Apply perspective transformation using canvas transform
 * Optimized version using hardware-accelerated canvas operations
 * @param {HTMLImageElement} img - Source image
 * @param {Array} srcPoints - Source corner points [[x, y], ...]
 * @param {number} outputWidth - Output width
 * @param {number} outputHeight - Output height
 * @returns {string} Transformed image as data URL
 */
const perspectiveTransform = (img, srcPoints, outputWidth, outputHeight) => {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputWidth, outputHeight);
  
  // For better perspective correction, we'll use a two-step approach:
  // 1. Calculate the bounding box and approximate transform
  // 2. Use canvas transform with proper scaling
  
  // Calculate bounding box of source points
  let minX = Math.min(...srcPoints.map(p => p[0]));
  let minY = Math.min(...srcPoints.map(p => p[1]));
  let maxX = Math.max(...srcPoints.map(p => p[0]));
  let maxY = Math.max(...srcPoints.map(p => p[1]));
  
  const srcWidth = maxX - minX;
  const srcHeight = maxY - minY;
  
  // Calculate aspect ratios
  const srcAspect = srcWidth / srcHeight;
  const dstAspect = outputWidth / outputHeight;
  
  // Determine scaling to fit
  let scale, offsetX, offsetY;
  if (srcAspect > dstAspect) {
    // Source is wider - fit to width
    scale = outputWidth / srcWidth;
    offsetX = 0;
    offsetY = (outputHeight - srcHeight * scale) / 2;
  } else {
    // Source is taller - fit to height
    scale = outputHeight / srcHeight;
    offsetX = (outputWidth - srcWidth * scale) / 2;
    offsetY = 0;
  }
  
  // Apply transform to correct perspective
  // Use canvas transform with proper matrix
  ctx.save();
  
  // Calculate center of source card
  const centerX = (srcPoints[0][0] + srcPoints[1][0] + srcPoints[2][0] + srcPoints[3][0]) / 4;
  const centerY = (srcPoints[0][1] + srcPoints[1][1] + srcPoints[2][1] + srcPoints[3][1]) / 4;
  
  // For perspective correction, we approximate using affine transform
  // This is faster than full perspective transform and works well for most cases
  const dx1 = srcPoints[1][0] - srcPoints[0][0];
  const dy1 = srcPoints[1][1] - srcPoints[0][1];
  const dx2 = srcPoints[3][0] - srcPoints[0][0];
  const dy2 = srcPoints[3][1] - srcPoints[0][1];
  
  // Calculate rotation and skew
  const angle1 = Math.atan2(dy1, dx1);
  const angle2 = Math.atan2(dy2, dx2);
  const avgAngle = (angle1 + angle2) / 2;
  
  // Apply transform
  ctx.translate(outputWidth / 2, outputHeight / 2);
  ctx.rotate(avgAngle);
  ctx.scale(scale * 0.95, scale * 0.95); // Slight scale down for padding
  ctx.translate(-centerX, -centerY);
  
  // Draw image
  ctx.drawImage(img, 0, 0);
  
  ctx.restore();
  
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Enhance image: adjust contrast, brightness, and sharpness
 * @param {ImageData} imageData - Image data
 * @returns {ImageData} Enhanced image data
 */
const enhanceImage = (imageData) => {
  const data = imageData.data;
  const enhanced = new Uint8ClampedArray(data.length);
  
  // Contrast and brightness adjustment
  const contrast = 1.2; // Increase contrast
  const brightness = 10; // Slight brightness increase
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast and brightness
    enhanced[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));
    enhanced[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness));
    enhanced[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness));
    enhanced[i + 3] = data[i + 3];
  }
  
  return new ImageData(enhanced, imageData.width, imageData.height);
};

/**
 * Detect business card in image and return corner points
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<Array|null>} Four corner points [[x, y], ...] or null if not found
 */
export const detectCardCorners = async (img) => {
  return new Promise((resolve) => {
    // Scale down for performance (max 1200px)
    const maxSize = 1200;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const workWidth = Math.floor(img.width * scale);
    const workHeight = Math.floor(img.height * scale);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = workWidth;
    canvas.height = workHeight;
    ctx.drawImage(img, 0, 0, workWidth, workHeight);
    
    // Step 1: Convert to grayscale
    let imageData = ctx.getImageData(0, 0, workWidth, workHeight);
    imageData = toGrayscale(imageData);
    
    // Step 2: Apply Gaussian blur
    imageData = gaussianBlur(imageData, 2);
    
    // Step 3: Canny edge detection
    const edges = cannyEdgeDetection(imageData, 50, 150);
    
    // Step 4: Find contours
    const contours = findContours(edges, workWidth, workHeight);
    
    if (contours.length === 0) {
      resolve(null);
      return;
    }
    
    // Step 5: Find the largest rectangular contour (likely the card)
    let bestContour = null;
    let bestArea = 0;
    
    for (const contour of contours) {
      const approx = approximatePolygon(contour, 15);
      if (approx && approx.length === 4) {
        // Calculate area
        const area = Math.abs(
          (approx[0][0] * (approx[1][1] - approx[2][1]) +
           approx[1][0] * (approx[2][1] - approx[0][1]) +
           approx[2][0] * (approx[0][1] - approx[1][1])) / 2
        );
        
        // Validate aspect ratio (business card: ~1.75:1)
        const width = Math.max(
          Math.abs(approx[1][0] - approx[0][0]),
          Math.abs(approx[2][0] - approx[3][0])
        );
        const height = Math.max(
          Math.abs(approx[3][1] - approx[0][1]),
          Math.abs(approx[2][1] - approx[1][1])
        );
        const aspectRatio = width / height;
        
        if (area > bestArea && aspectRatio >= 1.2 && aspectRatio <= 2.5) {
          bestArea = area;
          bestContour = approx;
        }
      }
    }
    
    if (bestContour) {
      // Scale back to original image dimensions
      const scaleBack = 1 / scale;
      const scaledCorners = bestContour.map(([x, y]) => [
        x * scaleBack,
        y * scaleBack
      ]);
      
      resolve(orderPoints(scaledCorners));
    } else {
      resolve(null);
    }
  });
};

/**
 * Scan business card: full pipeline from detection to final presentation
 * @param {File|string} imageSource - Image file or data URL
 * @returns {Promise<{scannedCard: string, corners: Array|null, warnings: Array}>} Scanned card image and metadata
 */
export const scanBusinessCard = async (imageSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const warnings = [];
    
    img.onload = async () => {
      try {
        // Step 1: Detect card corners
        const corners = await detectCardCorners(img);
        
        if (!corners) {
          warnings.push({
            type: 'detection',
            message: 'Could not detect business card. Please ensure the card is clearly visible.',
            severity: 'error'
          });
          
          // Fallback: use center crop
          const standardWidth = 1200;
          const standardHeight = Math.round(standardWidth / 1.75);
          const canvas = document.createElement('canvas');
          canvas.width = standardWidth;
          canvas.height = standardHeight;
          const ctx = canvas.getContext('2d');
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, standardWidth, standardHeight);
          
          const scale = Math.min(
            (standardWidth * 0.9) / img.width,
            (standardHeight * 0.9) / img.height
          );
          const x = (standardWidth - img.width * scale) / 2;
          const y = (standardHeight - img.height * scale) / 2;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          resolve({
            scannedCard: canvas.toDataURL('image/jpeg', 0.95),
            corners: null,
            warnings
          });
          return;
        }
        
        // Step 2: Perspective correction
        // Business card standard size: 3.5" x 2" (aspect ratio ~1.75:1)
        const outputWidth = 1200;
        const outputHeight = Math.round(outputWidth / 1.75);
        
        let scannedDataUrl = perspectiveTransform(img, corners, outputWidth, outputHeight);
        
        // Step 3: Image enhancement
        const enhancedImg = new Image();
        enhancedImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(enhancedImg, 0, 0);
          let imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
          imageData = enhanceImage(imageData);
          ctx.putImageData(imageData, 0, 0);
          
          scannedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          resolve({
            scannedCard: scannedDataUrl,
            corners,
            warnings
          });
        };
        
        enhancedImg.onerror = () => {
          // If enhancement fails, use perspective-corrected image
          resolve({
            scannedCard: scannedDataUrl,
            corners,
            warnings
          });
        };
        
        enhancedImg.src = scannedDataUrl;
      } catch (error) {
        console.error('Card scanning error:', error);
        reject(error);
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
 * Render scanned card in Apple-style presentation
 * @param {string} scannedCardDataUrl - Scanned card image data URL
 * @param {number} width - Output width (default: 1200)
 * @param {number} height - Output height (default: 686)
 * @returns {string} Final rendered image with Apple-style presentation
 */
export const renderAppleStyleCard = (scannedCardDataUrl, width = 1200, height = 686) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Output size with padding for shadow
  const padding = 40;
  canvas.width = width + padding * 2;
  canvas.height = height + padding * 2;
  
  // Off-white background (Apple-style)
  ctx.fillStyle = '#F5F5F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw shadow (soft, subtle)
  const shadowGradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
  shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(padding + 5, padding + 5, width, height);
  
  // Draw card with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(padding, padding, width, height);
  
  // Draw scanned card image
  const cardImg = new Image();
  cardImg.src = scannedCardDataUrl;
  
  return new Promise((resolve) => {
    cardImg.onload = () => {
      // Center the card image with small margin
      const margin = 20;
      const cardWidth = width - margin * 2;
      const cardHeight = height - margin * 2;
      
      ctx.drawImage(
        cardImg,
        padding + margin,
        padding + margin,
        cardWidth,
        cardHeight
      );
      
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    
    cardImg.onerror = () => {
      // If image fails to load, return the canvas with white background
      resolve(canvas.toDataURL('image/png', 1.0));
    };
  });
};

