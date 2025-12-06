import { rgbToGray } from './imageUtils';
import { BlockSignature } from './types';

/**
 * Sobel kernels for gradient calculation
 */
const SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const SOBEL_Y = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

/**
 * Apply Sobel filter to get gradients
 */
function applySobel(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { gx: number[][]; gy: number[][] } {
  const gx: number[][] = [];
  const gy: number[][] = [];

  // Convert to grayscale
  const gray: number[][] = [];
  for (let y = 0; y < height; y++) {
    gray[y] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      gray[y][x] = rgbToGray(data[i], data[i + 1], data[i + 2]);
    }
  }

  // Apply Sobel kernels
  for (let y = 0; y < height; y++) {
    gx[y] = [];
    gy[y] = [];
    for (let x = 0; x < width; x++) {
      let sumX = 0;
      let sumY = 0;

      // Convolve with kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const py = Math.min(Math.max(y + ky, 0), height - 1);
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const val = gray[py][px];
          sumX += val * SOBEL_X[ky + 1][kx + 1];
          sumY += val * SOBEL_Y[ky + 1][kx + 1];
        }
      }

      gx[y][x] = sumX;
      gy[y][x] = sumY;
    }
  }

  return { gx, gy };
}

/**
 * Calculate block signature from image data
 */
export function calculateBlockSignature(
  imageData: ImageData,
  x: number,
  y: number
): BlockSignature {
  const { data, width, height } = imageData;
  const { gx, gy } = applySobel(data, width, height);

  let totalMagnitude = 0;
  let totalDirX = 0;
  let totalDirY = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  // Calculate averages for the block
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const gradX = gx[py][px];
      const gradY = gy[py][px];
      const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);

      totalMagnitude += magnitude;
      totalDirX += gradX;
      totalDirY += gradY;

      const i = (py * width + px) * 4;
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  const avgMagnitude = totalMagnitude / count;
  const direction = Math.atan2(totalDirY, totalDirX);

  return {
    magnitude: avgMagnitude,
    direction,
    avgColor: {
      r: totalR / count,
      g: totalG / count,
      b: totalB / count,
    },
    x,
    y,
  };
}
