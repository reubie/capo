/**
 * cardDetection.js
 * Utility functions for detecting and cropping business cards from images
 * Workflow:
 * 1. Detect edges
 * 2. Find largest quadrilateral
 * 3. Approximate to 4 corner points
 * 4. Order points (TL, TR, BR, BL)
 * 5. Perspective transform (deskew)
 * 6. Add margin
 * 7. Normalize aspect ratio
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
 * @param {Object} bounds - Bounding box
 * @param {number} imgWidth - Image width
 * @param {number} imgHeight - Image height
 * @returns {Object} {isTooSmall: boolean, reason: string, minSize: number}
 */
const validateCardSize = (bounds, imgWidth, imgHeight) => {
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
  
  const cardSize = Math.min(bounds.width, bounds.height);
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
 * STEP 1: Detect edges using Canny edge detection
 * @param {Uint8Array} grayData - Grayscale image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Uint8Array} Edge map (255 = edge, 0 = no edge)
 */
const detectEdges = (grayData, width, height) => {
  // Apply Gaussian blur to reduce noise
  const blurred = new Uint8Array(width * height);
  const kernel = [
    1, 4, 6, 4, 1,
    4, 16, 24, 16, 4,
    6, 24, 36, 24, 6,
    4, 16, 24, 16, 4,
    1, 4, 6, 4, 1
  ];
  const kernelSum = 256;
  
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let sum = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kIdx = (ky + 2) * 5 + (kx + 2);
          sum += grayData[idx] * kernel[kIdx];
        }
      }
      blurred[y * width + x] = sum / kernelSum;
    }
  }
  
  // Canny edge detection
  const edgeMap = new Uint8Array(width * height);
  const lowThreshold = 50;
  const highThreshold = 150;
  
  // Sobel operator for gradient calculation
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Sobel X
      const gx = 
        -1 * blurred[(y - 1) * width + (x - 1)] +
         1 * blurred[(y - 1) * width + (x + 1)] +
        -2 * blurred[y * width + (x - 1)] +
         2 * blurred[y * width + (x + 1)] +
        -1 * blurred[(y + 1) * width + (x - 1)] +
         1 * blurred[(y + 1) * width + (x + 1)];
      
      // Sobel Y
      const gy = 
        -1 * blurred[(y - 1) * width + (x - 1)] +
        -2 * blurred[(y - 1) * width + x] +
        -1 * blurred[(y - 1) * width + (x + 1)] +
         1 * blurred[(y + 1) * width + (x - 1)] +
         2 * blurred[(y + 1) * width + x] +
         1 * blurred[(y + 1) * width + (x + 1)];
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // Canny thresholding
      if (magnitude > highThreshold) {
        edgeMap[idx] = 255; // Strong edge
      } else if (magnitude > lowThreshold) {
        edgeMap[idx] = 128; // Weak edge
      } else {
        edgeMap[idx] = 0;
      }
    }
  }
  
  // Hysteresis: connect weak edges to strong edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (edgeMap[idx] === 128) {
        let connected = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = (y + dy) * width + (x + dx);
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
  
  return edgeMap;
};

/**
 * STEP 2: Find largest quadrilateral from contours
 * @param {Uint8Array} edgeMap - Edge map
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Array|null} Largest contour or null
 */
const findLargestQuadrilateral = (edgeMap, width, height) => {
  // Find contours (connected edge regions)
  const visited = new Uint8Array(width * height);
  const contours = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (edgeMap[idx] === 255 && !visited[idx]) {
        // Flood fill to find connected component
        const contour = [];
        const stack = [[x, y]];
        
        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          const cidx = cy * width + cx;
          
          if (cx < 0 || cx >= width || cy < 0 || cy >= height || 
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
  
  if (contours.length === 0) return null;
  
  // Find the largest contour (by area)
  let largestContour = null;
  let largestArea = 0;
  
  for (const contour of contours) {
    // Calculate bounding box area as approximation
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
    
    // Validate it's a reasonable rectangle (business card aspect ratio ~1.2-2.5)
    const aspectRatio = width / height;
    const minSize = Math.min(width, height) * 0.15;
    
    if (area > largestArea && 
        width > minSize && height > minSize &&
        aspectRatio >= 1.2 && aspectRatio <= 2.5) {
      largestArea = area;
      largestContour = contour;
    }
  }
  
  return largestContour;
};

/**
 * STEP 3: Approximate contour to 4 corner points using Douglas-Peucker
 * @param {Array} contour - Contour points
 * @param {number} epsilon - Approximation accuracy (lower = more accurate)
 * @returns {Array|null} Four corner points [[x,y], ...] or null
 */
const approximateTo4Corners = (contour, epsilon = 2) => {
  if (contour.length < 4) return null;
  
  // Douglas-Peucker algorithm for polygon approximation
  const simplify = (points, tolerance) => {
    if (points.length <= 2) return points;
    
    let maxDist = 0;
    let maxIndex = 0;
    const end = points.length - 1;
    
    for (let i = 1; i < end; i++) {
      const dist = pointToLineDistance(points[i], points[0], points[end]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    
    if (maxDist > tolerance) {
      const left = simplify(points.slice(0, maxIndex + 1), tolerance);
      const right = simplify(points.slice(maxIndex), tolerance);
      return left.slice(0, -1).concat(right);
    } else {
      return [points[0], points[end]];
    }
  };
  
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point[0] - lineStart[0];
    const B = point[1] - lineStart[1];
    const C = lineEnd[0] - lineStart[0];
    const D = lineEnd[1] - lineStart[1];
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    const param = dot / lenSq;
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart[0];
      yy = lineStart[1];
    } else if (param > 1) {
      xx = lineEnd[0];
      yy = lineEnd[1];
    } else {
      xx = lineStart[0] + param * C;
      yy = lineStart[1] + param * D;
    }
    
    const dx = point[0] - xx;
    const dy = point[1] - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Simplify contour
  let simplified = simplify(contour, epsilon);
  
  // If we have exactly 4 points, return them
  if (simplified.length === 4) {
    return simplified;
  }
  
  // If we have more than 4 points, find the 4 most extreme points
  if (simplified.length > 4) {
    // Find points with maximum curvature (actual corners)
    const cornerCandidates = [];
    const windowSize = Math.max(3, Math.floor(simplified.length / 20));
    
    for (let i = windowSize; i < simplified.length - windowSize; i++) {
      const prev = simplified[i - windowSize];
      const curr = simplified[i];
      const next = simplified[i + windowSize];
      
      const v1 = [curr[0] - prev[0], curr[1] - prev[1]];
      const v2 = [next[0] - curr[0], next[1] - curr[1]];
      
      const dot = v1[0] * v2[0] + v1[1] * v2[1];
      const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
      const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
      
      if (mag1 > 0 && mag2 > 0) {
        const cosAngle = dot / (mag1 * mag2);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
        
        if (angle < 2.5) { // Sharp corner
          cornerCandidates.push({
            point: curr,
            index: i,
            sharpness: Math.PI - angle
          });
        }
      }
    }
    
    if (cornerCandidates.length >= 4) {
      cornerCandidates.sort((a, b) => b.sharpness - a.sharpness);
      
      // Select 4 well-distributed corners
      const selected = [];
      const minDist = simplified.length / 8;
      
      for (const candidate of cornerCandidates) {
        if (selected.length === 0) {
          selected.push(candidate);
        } else {
          const isFarEnough = selected.every(s => {
            const dist = Math.abs(candidate.index - s.index);
            return dist > minDist || dist > simplified.length - minDist;
          });
          if (isFarEnough) {
            selected.push(candidate);
            if (selected.length === 4) break;
          }
        }
      }
      
      if (selected.length === 4) {
        return selected.map(s => s.point);
      }
    }
    
    // Fallback: use extreme points in each quadrant
    let sumX = 0, sumY = 0;
    for (const [x, y] of simplified) {
      sumX += x;
      sumY += y;
    }
    const centerX = sumX / simplified.length;
    const centerY = sumY / simplified.length;
    
    const quadrants = [[], [], [], []];
    for (const [x, y] of simplified) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx < 0 && dy < 0) quadrants[0].push([x, y]);
      else if (dx >= 0 && dy < 0) quadrants[1].push([x, y]);
      else if (dx >= 0 && dy >= 0) quadrants[2].push([x, y]);
      else quadrants[3].push([x, y]);
    }
    
    const corners = [];
    for (const quadrant of quadrants) {
      if (quadrant.length === 0) continue;
      let extreme = quadrant[0];
      let maxDist = 0;
      for (const point of quadrant) {
        const dist = Math.sqrt(
          Math.pow(point[0] - centerX, 2) + 
          Math.pow(point[1] - centerY, 2)
        );
        if (dist > maxDist) {
          maxDist = dist;
          extreme = point;
        }
      }
      corners.push(extreme);
    }
    
    if (corners.length === 4) return corners;
  }
  
  return null;
};

/**
 * STEP 4: Order points (TL, TR, BR, BL)
 * @param {Array} points - Array of 4 [x, y] points
 * @returns {Array} Ordered points [TL, TR, BR, BL]
 */
const orderPoints = (points) => {
  if (points.length !== 4) return points;
  
  // Find center
  const centerX = points.reduce((sum, p) => sum + p[0], 0) / 4;
  const centerY = points.reduce((sum, p) => sum + p[1], 0) / 4;
  
  // Find top-left (smallest x+y)
  let topLeftIdx = 0;
  let minSum = Infinity;
  for (let i = 0; i < points.length; i++) {
    const sum = points[i][0] + points[i][1];
    if (sum < minSum) {
      minSum = sum;
      topLeftIdx = i;
    }
  }
  
  // Calculate angles from center
  const withAngles = points.map((p, i) => ({
    point: p,
    angle: Math.atan2(p[1] - centerY, p[0] - centerX),
    index: i
  }));
  
  // Sort by angle
  withAngles.sort((a, b) => a.angle - b.angle);
  
  // Find top-left in sorted array
  let sortedTopLeftIdx = 0;
  for (let i = 0; i < withAngles.length; i++) {
    if (withAngles[i].index === topLeftIdx) {
      sortedTopLeftIdx = i;
      break;
    }
  }
  
  // Reorder starting from top-left: TL, TR, BR, BL
  const ordered = [];
  for (let i = 0; i < 4; i++) {
    ordered.push(withAngles[(sortedTopLeftIdx + i) % 4].point);
  }
  
  return ordered;
};

/**
 * Calculate perspective transformation matrix (homography)
 * @param {Array} srcPoints - Source 4 points [[x,y], ...]
 * @param {Array} dstPoints - Destination 4 points [[x,y], ...]
 * @returns {Array} 3x3 transformation matrix
 */
const calculateHomography = (srcPoints, dstPoints) => {
  // Build system of equations: A * h = b
  const A = [];
  const b = [];
  
  for (let i = 0; i < 4; i++) {
    const [x, y] = srcPoints[i];
    const [u, v] = dstPoints[i];
    
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  
  // Solve using Gaussian elimination
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const h = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    h[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      h[i] -= augmented[i][j] * h[j];
    }
    h[i] /= augmented[i][i];
  }
  
  // Return as 3x3 matrix
  return [
    h[0], h[1], h[2],
    h[3], h[4], h[5],
    h[6], h[7], 1
  ];
};

/**
 * Transform point using homography matrix
 * @param {Array} H - 3x3 homography matrix
 * @param {number} x - Source x
 * @param {number} y - Source y
 * @returns {Array} [u, v] destination coordinates
 */
const transformPoint = (H, x, y) => {
  const w = H[6] * x + H[7] * y + H[8];
  const u = (H[0] * x + H[1] * y + H[2]) / w;
  const v = (H[3] * x + H[4] * y + H[5]) / w;
  return [u, v];
};

/**
 * Calculate inverse homography matrix
 * @param {Array} H - 3x3 matrix
 * @returns {Array} Inverse matrix
 */
const calculateInverseHomography = (H) => {
  const det = 
    H[0] * (H[4] * H[8] - H[5] * H[7]) -
    H[1] * (H[3] * H[8] - H[5] * H[6]) +
    H[2] * (H[3] * H[7] - H[4] * H[6]);
  
  if (Math.abs(det) < 1e-10) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }
  
  const invDet = 1 / det;
  return [
    (H[4] * H[8] - H[5] * H[7]) * invDet,
    (H[2] * H[7] - H[1] * H[8]) * invDet,
    (H[1] * H[5] - H[2] * H[4]) * invDet,
    (H[5] * H[6] - H[3] * H[8]) * invDet,
    (H[0] * H[8] - H[2] * H[6]) * invDet,
    (H[2] * H[3] - H[0] * H[5]) * invDet,
    (H[3] * H[7] - H[4] * H[6]) * invDet,
    (H[1] * H[6] - H[0] * H[7]) * invDet,
    (H[0] * H[4] - H[1] * H[3]) * invDet
  ];
};

/**
 * STEP 5: Perspective transform (deskew) using homography
 * @param {HTMLImageElement} img - Source image
 * @param {Array} srcPoints - Source 4 corner points [TL, TR, BR, BL]
 * @param {number} outputWidth - Output width
 * @param {number} outputHeight - Output height
 * @returns {string} Warped image as data URL
 */
const perspectiveTransform = (img, srcPoints, outputWidth, outputHeight) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputWidth, outputHeight);
  
  // Destination points (rectangle) - [TL, TR, BR, BL]
  const dstPoints = [
    [0, 0],
    [outputWidth, 0],
    [outputWidth, outputHeight],
    [0, outputHeight]
  ];
  
  // Calculate homography
  const H = calculateHomography(srcPoints, dstPoints);
  const H_inv = calculateInverseHomography(H);
  
  // Get source image data
  const srcCanvas = document.createElement('canvas');
  const srcCtx = srcCanvas.getContext('2d');
  srcCanvas.width = img.width;
  srcCanvas.height = img.height;
  srcCtx.drawImage(img, 0, 0);
  const srcImageData = srcCtx.getImageData(0, 0, img.width, img.height);
  const srcData = srcImageData.data;
  
  // Create destination image data
  const dstImageData = ctx.createImageData(outputWidth, outputHeight);
  const dstData = dstImageData.data;
  
  // Fill with white
  for (let i = 3; i < dstData.length; i += 4) {
    dstData[i] = 255;
  }
  
  // Apply inverse transformation: for each destination pixel, find source pixel
  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const [srcX, srcY] = transformPoint(H_inv, x, y);
      
      // Bilinear interpolation
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = x1 + 1;
      const y2 = y1 + 1;
      
      if (x1 >= 0 && x2 < img.width && y1 >= 0 && y2 < img.height) {
        const dx = srcX - x1;
        const dy = srcY - y1;
        
        const idx1 = (y1 * img.width + x1) * 4;
        const idx2 = (y1 * img.width + x2) * 4;
        const idx3 = (y2 * img.width + x1) * 4;
        const idx4 = (y2 * img.width + x2) * 4;
        
        for (let c = 0; c < 3; c++) {
          const val = 
            srcData[idx1 + c] * (1 - dx) * (1 - dy) +
            srcData[idx2 + c] * dx * (1 - dy) +
            srcData[idx3 + c] * (1 - dx) * dy +
            srcData[idx4 + c] * dx * dy;
          dstData[(y * outputWidth + x) * 4 + c] = Math.round(val);
        }
      }
    }
  }
  
  ctx.putImageData(dstImageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
};

/**
 * STEP 6 & 7: Add margin and normalize aspect ratio
 * @param {string} warpedDataUrl - Warped image data URL
 * @param {number} marginPercent - Margin percentage (default 8%)
 * @param {number} targetAspectRatio - Target aspect ratio (default 1.75 for business cards)
 * @returns {string} Final image as data URL
 */
const addMarginAndNormalize = (warpedDataUrl, marginPercent = 0.08, targetAspectRatio = 1.75) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate output dimensions with margin
      const margin = marginPercent;
      const cardWidth = img.width * (1 - 2 * margin);
      const cardHeight = img.height * (1 - 2 * margin);
      const currentAspectRatio = cardWidth / cardHeight;
      
      // Normalize aspect ratio
      let outputWidth, outputHeight;
      if (currentAspectRatio > targetAspectRatio) {
        // Card is wider - fit to width
        outputWidth = Math.max(1200, Math.floor(cardWidth));
        outputHeight = Math.floor(outputWidth / targetAspectRatio);
      } else {
        // Card is taller - fit to height
        outputHeight = Math.max(686, Math.floor(cardHeight));
        outputWidth = Math.floor(outputHeight * targetAspectRatio);
      }
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      
      // Calculate card size to fit with margins
      const finalCardWidth = outputWidth * (1 - 2 * margin);
      const finalCardHeight = finalCardWidth / targetAspectRatio;
      
      if (finalCardHeight > outputHeight * (1 - 2 * margin)) {
        const adjustedHeight = outputHeight * (1 - 2 * margin);
        const adjustedWidth = adjustedHeight * targetAspectRatio;
        const offsetX = (outputWidth - adjustedWidth) / 2;
        const offsetY = (outputHeight - adjustedHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, adjustedWidth, adjustedHeight);
      } else {
        const offsetX = (outputWidth - finalCardWidth) / 2;
        const offsetY = (outputHeight - finalCardHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, finalCardWidth, finalCardHeight);
      }
      
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = warpedDataUrl;
  });
};

/**
 * Main detection function - follows the complete workflow
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<{corners: Array, bounds: Object}>} Corner points and bounds
 */
export const detectCardEdges = (img) => {
  return new Promise((resolve) => {
    // Scale down for performance
    const maxSize = 1500;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const workWidth = Math.floor(img.width * scale);
    const workHeight = Math.floor(img.height * scale);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = workWidth;
    canvas.height = workHeight;
    ctx.drawImage(img, 0, 0, workWidth, workHeight);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, workWidth, workHeight);
    const data = imageData.data;
    
    // Convert to grayscale
    const grayData = new Uint8Array(workWidth * workHeight);
    for (let i = 0; i < data.length; i += 4) {
      grayData[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    
    // STEP 1: Detect edges
    const edgeMap = detectEdges(grayData, workWidth, workHeight);
    
    // STEP 2: Find largest quadrilateral
    const largestContour = findLargestQuadrilateral(edgeMap, workWidth, workHeight);
    
    if (!largestContour) {
      // Fallback: center crop
      const margin = 0.15;
      const cardAspect = 1.75;
      let cropWidth = workWidth * (1 - 2 * margin);
      let cropHeight = cropWidth / cardAspect;
      if (cropHeight > workHeight * (1 - 2 * margin)) {
        cropHeight = workHeight * (1 - 2 * margin);
        cropWidth = cropHeight * cardAspect;
      }
      
      const scaleBack = 1 / scale;
      resolve({
        corners: null,
        bounds: {
          x: Math.floor((img.width - cropWidth * scaleBack) / 2),
          y: Math.floor((img.height - cropHeight * scaleBack) / 2),
          width: Math.floor(cropWidth * scaleBack),
          height: Math.floor(cropHeight * scaleBack)
        }
      });
      return;
    }
    
    // STEP 3: Approximate to 4 corner points
    const corners = approximateTo4Corners(largestContour, 2);
    
    if (!corners || corners.length !== 4) {
      // Fallback: use bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of largestContour) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      
      const scaleBack = 1 / scale;
      resolve({
        corners: null,
        bounds: {
          x: Math.floor(minX * scaleBack),
          y: Math.floor(minY * scaleBack),
          width: Math.floor((maxX - minX) * scaleBack),
          height: Math.floor((maxY - minY) * scaleBack)
        }
      });
      return;
    }
    
    // STEP 4: Order points (TL, TR, BR, BL)
    const orderedCorners = orderPoints(corners);
    
    // Scale corners back to original image dimensions
    const scaleBack = 1 / scale;
    const scaledCorners = orderedCorners.map(([x, y]) => [
      Math.floor(x * scaleBack),
      Math.floor(y * scaleBack)
    ]);
    
    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of scaledCorners) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    
    resolve({
      corners: scaledCorners,
      bounds: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    });
  });
};

/**
 * Crop image using the complete workflow
 * @param {HTMLImageElement|string} imageSource - Image element or data URL
 * @param {Object} detectionResult - Detection result with corners and/or bounds
 * @returns {Promise<string>} Cropped image as data URL
 */
export const cropImage = async (imageSource, detectionResult) => {
  const img = typeof imageSource === 'string' ? await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSource;
  }) : imageSource;
  
  const corners = detectionResult.corners;
  const bounds = detectionResult.bounds || detectionResult;
  
  // If we have 4 corners, use perspective transform
  if (corners && corners.length === 4) {
    // Calculate natural card dimensions
    const width = Math.sqrt(
      Math.pow(corners[1][0] - corners[0][0], 2) + 
      Math.pow(corners[1][1] - corners[0][1], 2)
    );
    const height = Math.sqrt(
      Math.pow(corners[3][0] - corners[0][0], 2) + 
      Math.pow(corners[3][1] - corners[0][1], 2)
    );
    
    // Calculate output size (maintain natural aspect ratio)
    const aspectRatio = width / height;
    const margin = 0.08;
    let outputWidth, outputHeight;
    
    if (aspectRatio > 1.75) {
      outputWidth = Math.max(1200, Math.floor(width * 1.16));
      outputHeight = Math.floor(outputWidth / aspectRatio);
    } else {
      outputHeight = Math.max(686, Math.floor(height * 1.16));
      outputWidth = Math.floor(outputHeight * aspectRatio);
    }
    
    // STEP 5: Perspective transform (deskew)
    const warpedDataUrl = perspectiveTransform(img, corners, outputWidth, outputHeight);
    
    // STEP 6 & 7: Add margin and normalize aspect ratio
    const finalDataUrl = await addMarginAndNormalize(warpedDataUrl, 0.08, 1.75);
    
    return finalDataUrl;
  } else {
    // Fallback: use bounding box crop
    const margin = 0.08;
    const targetAspect = 1.75;
    
    let outputWidth, outputHeight;
    if (bounds.width / bounds.height > targetAspect) {
      outputWidth = Math.max(1200, Math.floor(bounds.width * 1.16));
      outputHeight = Math.floor(outputWidth / targetAspect);
    } else {
      outputHeight = Math.max(686, Math.floor(bounds.height * 1.16));
      outputWidth = Math.floor(outputHeight * targetAspect);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    
    const cardWidth = outputWidth * (1 - 2 * margin);
    const cardHeight = cardWidth / targetAspect;
    const offsetX = (outputWidth - cardWidth) / 2;
    const offsetY = (outputHeight - cardHeight) / 2;
    
    ctx.drawImage(
      img,
      bounds.x, bounds.y, bounds.width, bounds.height,
      offsetX, offsetY, cardWidth, cardHeight
    );
    
    return canvas.toDataURL('image/jpeg', 0.92);
  }
};

/**
 * Auto-detect and crop business card from image
 * Handles edge cases: small cards, blurry images, detection failures
 * @param {File|string} imageSource - Image file or data URL
 * @returns {Promise<{croppedDataUrl: string, crop: Object, corners: Array, warnings: Array, quality: Object}>} Result with quality info
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
        canvas.width = Math.min(img.width, 800);
        canvas.height = Math.min(img.height, 800);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurScore = detectBlur(imageData);
        quality.blurScore = blurScore;
        
        const blurThreshold = 50;
        if (blurScore < blurThreshold) {
          quality.isBlurry = true;
          warnings.push({
            type: 'blur',
            message: 'Image appears blurry. Please ensure the card is in focus and try again.',
            severity: 'warning'
          });
        }
        
        // Step 2: Detect card edges (complete workflow)
        const detectionResult = await detectCardEdges(img);
        
        // Step 3: Validate card size
        const bounds = detectionResult.bounds || detectionResult;
        const sizeValidation = validateCardSize(bounds, img.width, img.height);
        quality.isTooSmall = sizeValidation.isTooSmall;
        
        if (sizeValidation.isTooSmall) {
          warnings.push({
            type: 'size',
            message: sizeValidation.reason,
            severity: 'error',
            suggestion: 'Please move closer to the card or ensure the card fills more of the frame.'
          });
          
          // Fallback: center crop
          const margin = 0.05;
          const cardAspect = 1.75;
          let cropWidth = img.width * (1 - 2 * margin);
          let cropHeight = cropWidth / cardAspect;
          if (cropHeight > img.height * (1 - 2 * margin)) {
            cropHeight = img.height * (1 - 2 * margin);
            cropWidth = cropHeight * cardAspect;
          }
          
          detectionResult.corners = null;
          detectionResult.bounds = {
            x: Math.floor((img.width - cropWidth) / 2),
            y: Math.floor((img.height - cropHeight) / 2),
            width: Math.floor(cropWidth),
            height: Math.floor(cropHeight)
          };
          
          quality.detectionConfidence = 'low';
        } else {
          if (detectionResult.corners && detectionResult.corners.length === 4) {
            quality.detectionConfidence = 'high';
          } else {
            quality.detectionConfidence = 'medium';
            warnings.push({
              type: 'detection',
              message: 'Card detection was uncertain. Using bounding box crop.',
              severity: 'info'
            });
          }
        }
        
        // Step 4: Crop the image (complete workflow: transform, margin, normalize)
        const croppedDataUrl = await cropImage(img, detectionResult);
        
        resolve({
          croppedDataUrl,
          crop: detectionResult.bounds || detectionResult,
          corners: detectionResult.corners,
          warnings,
          quality
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageSource);
    }
  });
};

/**
 * Convert data URL to File object
 * @param {string} dataUrl - Data URL
 * @param {string} filename - Original filename
 * @returns {File} File object
 */
export const dataURLtoFile = (dataUrl, filename) => {
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
