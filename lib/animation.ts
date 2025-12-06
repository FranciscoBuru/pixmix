import { Block, MatchResult } from './types';

export interface AnimationFrame {
  blocks: { block: Block; x: number; y: number }[];
  progress: number;
}

/**
 * Generate animation frames for simultaneous block movement
 */
export function generateSimultaneousAnimation(
  sourceBlocks: Block[],
  targetBlocks: Block[],
  matchResults: MatchResult[],
  duration: number = 2000, // milliseconds
  fps: number = 30
): AnimationFrame[] {
  const frames: AnimationFrame[] = [];

  // Keep frame count reasonable regardless of block count
  const blockCount = sourceBlocks.length;
  let adjustedFps = fps;

  // Drastically reduce frames for huge block counts
  if (blockCount > 1000) {
    adjustedFps = 20;
  }
  if (blockCount > 4000) {
    adjustedFps = 15;
  }
  if (blockCount > 10000) {
    adjustedFps = 10; // Very few frames for extreme cases
  }

  const totalFrames = Math.floor((duration / 1000) * adjustedFps);

  for (let frame = 0; frame <= totalFrames; frame++) {
    const progress = frame / totalFrames;
    const eased = easeInOutCubic(progress);

    const frameBlocks = matchResults.map(({ sourceIndex, targetIndex }) => {
      const sourceBlock = sourceBlocks[sourceIndex];
      const targetPos = targetBlocks[targetIndex];

      // Interpolate position
      const x = lerp(sourceBlock.x, targetPos.x, eased);
      const y = lerp(sourceBlock.y, targetPos.y, eased);

      return {
        block: sourceBlock,
        x,
        y,
      };
    });

    frames.push({
      blocks: frameBlocks,
      progress,
    });
  }

  return frames;
}

/**
 * Render a single animation frame to canvas
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: AnimationFrame,
  width: number,
  height: number
): void {
  // Clear canvas with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Batch putImageData calls for better performance
  // For very large block counts, we can skip some intermediate positions
  const blockCount = frame.blocks.length;
  const skipFactor = blockCount > 10000 ? 2 : 1; // Skip every other block for huge counts

  for (let i = 0; i < frame.blocks.length; i += skipFactor) {
    const { block, x, y } = frame.blocks[i];
    ctx.putImageData(block.imageData, Math.round(x), Math.round(y));
  }

  // If we skipped blocks, fill the rest in a second pass (less visible gaps)
  if (skipFactor > 1) {
    for (let i = 1; i < frame.blocks.length; i += skipFactor) {
      const { block, x, y } = frame.blocks[i];
      ctx.putImageData(block.imageData, Math.round(x), Math.round(y));
    }
  }
}

/**
 * Linear interpolation
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Ease in-out cubic easing function
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
