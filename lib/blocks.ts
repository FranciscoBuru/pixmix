import { Block } from './types';
import { calculateBlockSignature } from './gradients';

/**
 * Divide image into blocks and calculate signatures
 */
export function divideIntoBlocks(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  blockSize: number
): Block[] {
  const blocks: Block[] = [];
  const width = canvas.width;
  const height = canvas.height;

  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const x = bx * blockSize;
      const y = by * blockSize;

      // Extract block image data
      const imageData = ctx.getImageData(x, y, blockSize, blockSize);

      // Calculate signature
      const signature = calculateBlockSignature(imageData, x, y);

      blocks.push({
        x,
        y,
        width: blockSize,
        height: blockSize,
        imageData,
        signature,
      });
    }
  }

  return blocks;
}
