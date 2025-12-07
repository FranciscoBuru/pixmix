'use client';

import { useEffect, useRef, useState } from 'react';
import { loadImage, normalizeImageSizes, drawImageOnCanvas } from '@/lib/imageUtils';
import { divideIntoBlocks } from '@/lib/blocks';
import { findGreedyMatching } from '@/lib/matching';
import { generateSimultaneousAnimation, renderFrame, AnimationFrame } from '@/lib/animation';
import { exportToGIF } from '@/lib/gifExport';
import { Block, MatchResult } from '@/lib/types';

interface ImageProcessorProps {
  baseImage: string;
  targetImage: string;
  blockSize: number;
  gradientWeight: number;
  algorithm: 'greedy';
}

export default function ImageProcessor({
  baseImage,
  targetImage,
  blockSize,
  gradientWeight,
  algorithm,
}: ImageProcessorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [baseBlocks, setBaseBlocks] = useState<Block[]>([]);
  const [targetBlocks, setTargetBlocks] = useState<Block[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  const computeExportDuration = () => {
    // Scale duration with frame count but keep it between 1.5s and 5s
    const auto = frames.length * 60; // ~60ms per frame target
    return Math.min(5000, Math.max(1500, auto));
  };

  // Process images - only runs once when component mounts or key props change
  useEffect(() => {
    const process = async () => {
      setProcessing(true);
      setCurrentFrame(0); // Reset to first frame
      try {
        setProcessingStep('Loading images...');
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI update

        const baseImg = await loadImage(baseImage);
        const targetImg = await loadImage(targetImage);

        setProcessingStep('Normalizing dimensions...');
        await new Promise(resolve => setTimeout(resolve, 0));

        const { width, height } = normalizeImageSizes(baseImg, targetImg, blockSize);
        setDimensions({ width, height });

        setProcessingStep('Drawing to canvas...');
        await new Promise(resolve => setTimeout(resolve, 0));

        const { canvas: baseCanvas, ctx: baseCtx } = drawImageOnCanvas(
          baseImg,
          width,
          height
        );
        const { canvas: targetCanvas, ctx: targetCtx } = drawImageOnCanvas(
          targetImg,
          width,
          height
        );

        const totalBlocks = Math.floor(width / blockSize) * Math.floor(height / blockSize);
        setProcessingStep(`Dividing into ${totalBlocks} blocks...`);
        await new Promise(resolve => setTimeout(resolve, 0));

        const baseBlocksData = divideIntoBlocks(baseCanvas, baseCtx, blockSize);
        const targetBlocksData = divideIntoBlocks(targetCanvas, targetCtx, blockSize);

        setBaseBlocks(baseBlocksData);
        setTargetBlocks(targetBlocksData);

        setProcessingStep(`Computing ${algorithm} matching (${totalBlocks} blocks)...`);
        await new Promise(resolve => setTimeout(resolve, 100));

        const matches = findGreedyMatching(baseBlocksData, targetBlocksData, gradientWeight);
        setMatchResults(matches);

        setProcessingStep('Generating animation...');
        await new Promise(resolve => setTimeout(resolve, 0));

        const animFrames = generateSimultaneousAnimation(
          baseBlocksData,
          targetBlocksData,
          matches
        );
        setFrames(animFrames);

        setProcessingStep('Done!');
      } catch (error) {
        console.error('Error processing images:', error);
        setProcessingStep('Error processing images');
      } finally {
        setTimeout(() => {
          setProcessing(false);
          setProcessingStep('');
        }, 500);
      }
    };

    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once when component mounts

  // Render current frame when not playing
  useEffect(() => {
    if (!canvasRef.current || frames.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    renderFrame(ctx, frames[currentFrame], dimensions.width, dimensions.height);
  }, [frames, currentFrame, dimensions]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    let frame = currentFrame;
    let lastFrameTime = 0;

    // Adjust duration based on block count - longer for more blocks
    const blockCount = baseBlocks.length;
    let targetDuration = 1600; // ms

    if (blockCount > 8000) {
      targetDuration = 2400; // Give a bit more time for extreme block counts
    } else if (blockCount > 4000) {
      targetDuration = 2000;
    } else if (blockCount > 1500) {
      targetDuration = 1800;
    }

    const frameDelay = targetDuration / frames.length;

    const animate = (timestamp: number) => {
      if (frame >= frames.length) {
        setCurrentFrame(frames.length - 1);
        setIsPlaying(false);
        return;
      }

      // Throttle to maintain consistent speed
      if (timestamp - lastFrameTime < frameDelay) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = timestamp;
      renderFrame(ctx, frames[frame], dimensions.width, dimensions.height);
      setCurrentFrame(frame);
      frame++;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frames, dimensions, currentFrame, baseBlocks.length]);

  const handlePlay = () => {
    // If at the end, restart from beginning
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleExportGIF = async () => {
    if (frames.length === 0) return;

    try {
      setProcessing(true);
      const blob = await exportToGIF(
        frames,
        dimensions.width,
        dimensions.height,
        computeExportDuration()
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixmix.gif';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting GIF:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (processing && frames.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl p-12 bg-white text-center h-full min-h-[480px] flex items-center justify-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent absolute top-0"></div>
          </div>
          <p className="text-slate-700 font-medium">Processing images...</p>
          <p className="text-slate-500 text-sm">{processingStep}</p>
          <p className="text-slate-400 text-xs">
            Large block counts may take a moment. Increase block size for faster previews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm h-full flex flex-col relative lift-on-hover">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
      {processing && (
        <span className="absolute top-4 right-4 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-sm">
          {processingStep || 'Processing...'}
        </span>
      )}

      <div className="flex-1 flex flex-col gap-4 p-5 min-h-0">
        <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-inner border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
          {dimensions.width > 0 && dimensions.height > 0 ? (
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto rounded border border-slate-200 shadow-sm"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          ) : (
            <p className="text-slate-400 text-sm">Canvas initializing...</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center shrink-0">
          <div className="border border-slate-200 rounded-lg py-3 bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Frame</p>
            <p className="text-lg font-semibold text-slate-900">{frames.length ? currentFrame + 1 : 0} / {frames.length || 0}</p>
          </div>
          <div className="border border-slate-200 rounded-lg py-3 bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Blocks</p>
            <p className="text-lg font-semibold text-slate-900">{baseBlocks.length}</p>
          </div>
          <div className="border border-slate-200 rounded-lg py-3 bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dimensions</p>
            <p className="text-lg font-semibold text-slate-900">{dimensions.width}×{dimensions.height}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-white border-t border-slate-200 mt-auto">
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handlePlay}
            disabled={frames.length === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {isPlaying ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play Animation
              </>
            )}
          </button>

          <button
            onClick={handleExportGIF}
            disabled={frames.length === 0 || processing}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {processing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export GIF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
