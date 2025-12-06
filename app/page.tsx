'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImageProcessor from '@/components/ImageProcessor';

export default function Home() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [blockSize, setBlockSize] = useState(32);
  const [gradientWeight, setGradientWeight] = useState(0.7);
  const [algorithm, setAlgorithm] = useState<'greedy' | 'hungarian'>('greedy');
  const [shouldProcess, setShouldProcess] = useState(false);
  const [processKey, setProcessKey] = useState(0);

  const handleRunTransform = () => {
    // Increment key to force re-render with new settings
    setProcessKey(prev => prev + 1);
    setShouldProcess(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Image Reorder
          </h1>
          <p className="text-gray-600">
            Reorganize blocks from one image to match another using gradient analysis
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Uploads & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Uploaders */}
            <div className="space-y-4">
              <ImageUploader
                label="Base Image"
                onImageLoad={setBaseImage}
                image={baseImage}
              />
              <ImageUploader
                label="Target Image"
                onImageLoad={setTargetImage}
                image={targetImage}
              />
            </div>

            {/* Settings Panel */}
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Block Size
                    </label>
                    <span className="text-sm font-semibold text-indigo-600">
                      {blockSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    step="4"
                    value={blockSize}
                    onChange={(e) => setBlockSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>4px</span>
                    <span>128px</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Algorithm Weight
                    </label>
                    <div className="text-xs font-medium text-gray-600">
                      <span className="text-indigo-600">{Math.round(gradientWeight * 100)}%</span> Gradient /
                      <span className="text-purple-600"> {Math.round((1 - gradientWeight) * 100)}%</span> Color
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={gradientWeight}
                    onChange={(e) => setGradientWeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Color</span>
                    <span>Gradient</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Matching Algorithm
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="algorithm"
                        value="greedy"
                        checked={algorithm === 'greedy'}
                        onChange={(e) => setAlgorithm(e.target.value as 'greedy' | 'hungarian')}
                        className="mr-3 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Greedy (Fast)</div>
                        <div className="text-xs text-gray-500">Quick results, good quality</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="algorithm"
                        value="hungarian"
                        checked={algorithm === 'hungarian'}
                        onChange={(e) => setAlgorithm(e.target.value as 'greedy' | 'hungarian')}
                        className="mr-3 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Hungarian (Optimal)</div>
                        <div className="text-xs text-gray-500">Best quality, slower with many blocks</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Transform Button */}
            <button
              onClick={handleRunTransform}
              disabled={!baseImage || !targetImage}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Run Transform
            </button>
          </div>

          {/* Right Column - Results (Sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-[180px]">
              {baseImage && targetImage && shouldProcess ? (
                <ImageProcessor
                  key={processKey}
                  baseImage={baseImage}
                  targetImage={targetImage}
                  blockSize={blockSize}
                  gradientWeight={gradientWeight}
                  algorithm={algorithm}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center min-h-[600px] flex items-center justify-center">
                  <div>
                    <svg
                      className="mx-auto h-16 w-16 text-gray-300 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-400 text-lg font-medium">
                      Upload both images to start
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Results will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
