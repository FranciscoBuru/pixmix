import { AnimationFrame, renderFrame } from './animation';
import { downloadBlob } from './gifExport';

type ProgressCb = (progress: number) => void;

export async function exportToVideo(
  frames: AnimationFrame[],
  width: number,
  height: number,
  durationMs: number,
  fps: number = 30,
  onProgress?: ProgressCb
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }

      const stream = canvas.captureStream(fps);
      const mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error('MediaRecorder does not support video/webm');
      }

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };

      recorder.start();

      const totalFrames = Math.max(2, Math.floor((durationMs / 1000) * fps));
      const remapIndex = (i: number) => {
        if (i === 0) return 0;
        if (i === totalFrames - 1) return frames.length - 1;
        const t = i / (totalFrames - 1);
        return Math.min(frames.length - 1, Math.round(t * (frames.length - 1)));
      };

      let idx = 0;
      const tick = () => {
        const frameIndex = remapIndex(idx);
        renderFrame(ctx, frames[frameIndex], width, height);
        if (onProgress) {
          onProgress(idx / totalFrames);
        }
        idx += 1;
        if (idx < totalFrames) {
          setTimeout(tick, durationMs / totalFrames);
        } else {
          setTimeout(() => recorder.stop(), durationMs / totalFrames);
        }
      };

      tick();
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadVideo(blob: Blob, filename: string): void {
  downloadBlob(blob, filename);
}
