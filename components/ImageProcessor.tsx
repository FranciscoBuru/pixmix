'use client';

import { useEffect, useRef, useState } from 'react';
import { loadImage, normalizeImageSizes, drawImageOnCanvas } from '@/lib/imageUtils';
import { divideIntoBlocks } from '@/lib/blocks';
import { findOptimalMatching, findGreedyMatching } from '@/lib/matching';
import { generateSimultaneousAnimation, renderFrame, AnimationFrame } from '@/lib/animation';
import { exportToGIF, downloadBlob } from '@/lib/gifExport';
import { Block, MatchResult } from '@/lib/types';

interface ImageProcessorProps {
  baseImage: string;
  targetImage: string;
  blockSize: number;
  gradientWeight: number;
  algorithm: 'greedy' | 'hungarian';
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

        const matches = algorithm === 'greedy'
          ? findGreedyMatching(baseBlocksData, targetBlocksData, gradientWeight)
          : findOptimalMatching(baseBlocksData, targetBlocksData, gradientWeight);
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
    let targetDuration = 2000; // ms

    if (blockCount > 10000) {
      targetDuration = 3000; // Give more time for huge block counts
    }

    const frameDelay = targetDuration / frames.length;

    const animate = (timestamp: number) => {
      if (frame >= frames.length) {
        // Stop at the end instead of looping
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
      const blob = await exportToGIF(frames, dimensions.width, dimensions.height);
      downloadBlob(blob, 'image-reorder.gif');
    } catch (error) {
      console.error('Error exporting GIF:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (processing && frames.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-12 bg-white text-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
          </div>
          <p className="text-gray-600 mt-6 font-medium">Processing images...</p>
          <p className="text-gray-500 text-sm mt-2">{processingStep}</p>
          <p className="text-gray-400 text-xs mt-4">
            Large block counts may take a while. Try increasing block size for faster processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Animation Preview
        </h2>
      </div>

      {/* Canvas */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-h-[400px] flex items-center justify-center">
          {dimensions.width > 0 && dimensions.height > 0 ? (
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto rounded"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          ) : (
            <p className="text-gray-400">Canvas initializing...</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Frame</p>
            <p className="text-lg font-semibold text-gray-900">{currentFrame + 1} / {frames.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Blocks</p>
            <p className="text-lg font-semibold text-gray-900">{baseBlocks.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dimensions</p>
            <p className="text-lg font-semibold text-gray-900">{dimensions.width}×{dimensions.height}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4">
        <div className="flex gap-3">
          <button
            onClick={handlePlay}
            disabled={frames.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
