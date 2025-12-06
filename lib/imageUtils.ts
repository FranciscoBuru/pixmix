/**
 * Load an image from a data URL and return as HTMLImageElement
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Resize images to have the same number of blocks
 */
export function normalizeImageSizes(
  img1: HTMLImageElement,
  img2: HTMLImageElement,
  blockSize: number
): { width: number; height: number } {
  // Calculate how many blocks each image would have
  const blocks1X = Math.floor(img1.width / blockSize);
  const blocks1Y = Math.floor(img1.height / blockSize);
  const blocks2X = Math.floor(img2.width / blockSize);
  const blocks2Y = Math.floor(img2.height / blockSize);

  // Use the minimum block count to ensure both images have the same grid
  const blocksX = Math.min(blocks1X, blocks2X);
  const blocksY = Math.min(blocks1Y, blocks2Y);

  return {
    width: blocksX * blockSize,
    height: blocksY * blockSize,
  };
}

/**
 * Draw image on canvas with specified dimensions
 */
export function drawImageOnCanvas(
  img: HTMLImageElement,
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx };
}

/**
 * Convert RGB to grayscale
 */
export function rgbToGray(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
