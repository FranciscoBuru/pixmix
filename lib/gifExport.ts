import { AnimationFrame } from './animation';

/**
 * Export animation frames to GIF
 */
export async function exportToGIF(
  frames: AnimationFrame[],
  width: number,
  height: number,
  durationMs: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamically import GIF.js
      const GIF = (await import('gif.js')).default;

      // Create temporary canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Initialize GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: '/gif.worker.js',
        width,
        height,
      });

      // Add frames
      const delay = Math.max(10, durationMs / Math.max(1, frames.length));
      frames.forEach((frame) => {
        // Clear and render frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        frame.blocks.forEach(({ block, x, y }) => {
          ctx.putImageData(block.imageData, Math.round(x), Math.round(y));
        });

        gif.addFrame(canvas, { delay, copy: true });
      });

      // Handle completion
      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      // Start encoding
      gif.render();

      if (onProgress) {
        onProgress(0.5); // Simplified progress tracking
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
