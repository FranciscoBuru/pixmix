'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BlockMath, InlineMath } from 'react-katex';
import ImageUploader from '@/components/ImageUploader';
import ImageProcessor from '@/components/ImageProcessor';

export default function HomeClient() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [blockSize, setBlockSize] = useState(32);
  const [gradientWeight, setGradientWeight] = useState(0.7);
  const [algorithm, setAlgorithm] = useState<'greedy'>('greedy');
  const [shouldProcess, setShouldProcess] = useState(false);
  const [processKey, setProcessKey] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInfo(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleRunTransform = () => {
    setProcessKey(prev => prev + 1);
    setShouldProcess(true);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl border border-emerald-200 bg-white shadow-sm flex items-center justify-center overflow-hidden">
              <Image src="/favicon.svg" alt="PixMix.fun logo" width={32} height={32} priority />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                PixMix.fun
              </h1>
              <p className="text-slate-600 text-sm">
                Gradient-aware block matching with a fast live preview.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              PixMix fast preview — greedy matching only
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="text-sm font-semibold text-emerald-700 border border-emerald-200 bg-white rounded-lg px-3 py-2 shadow-sm hover:bg-emerald-50 transition"
            >
              How it works
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-8 items-start">
          <div className="lg:col-span-1 space-y-5 lg:max-h-[calc(100vh-136px)] lg:overflow-y-auto pr-1">
            <div className="space-y-3">
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
              <div className="text-xs text-slate-600 bg-emerald-50/70 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Recommended: square images, ideally 512×512 for best results.
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm relative overflow-hidden lift-on-hover">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center justify-between">
                Settings
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  Faster previews for larger blocks
                </span>
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Block Size
                    </label>
                    <span className="text-sm font-semibold text-emerald-700">
                      {blockSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="4"
                    value={blockSize}
                    onChange={(e) => setBlockSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-white"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>4px</span>
                    <span>32px</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Algorithm Weight
                    </label>
                    <div className="text-xs font-medium text-slate-600">
                      <span className="text-emerald-700">{Math.round(gradientWeight * 100)}%</span> Gradient /
                      <span className="text-amber-600"> {Math.round((1 - gradientWeight) * 100)}%</span> Color
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={gradientWeight}
                    onChange={(e) => setGradientWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-white"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Color</span>
                    <span>Gradient</span>
                  </div>
                </div>

                <div className="border border-emerald-100 bg-emerald-50/60 text-emerald-800 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Fast mode enabled (Greedy matching). Optimal mode removed for speed.
                </div>
              </div>
            </div>

            <button
              onClick={handleRunTransform}
              disabled={!baseImage || !targetImage}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-md lift-on-hover"
            >
              Run Transform
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[120px] lg:h-[calc(100vh-160px)]">
              {baseImage && targetImage && shouldProcess ? (
                <div className="h-full">
                  <ImageProcessor
                    key={processKey}
                    baseImage={baseImage}
                    targetImage={targetImage}
                    blockSize={blockSize}
                    gradientWeight={gradientWeight}
                    algorithm={algorithm}
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-16 text-center min-h-[520px] h-full flex items-center justify-center bg-white/70 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.04) 1px, transparent 0)', backgroundSize: '18px 18px' }}></div>
                  <div className="space-y-2 relative">
                    <svg
                      className="mx-auto h-16 w-16 text-slate-300 mb-4"
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
                    <p className="text-slate-500 text-lg font-medium">
                      Upload both images to start
                    </p>
                    <p className="text-slate-400 text-sm">
                      The preview and controls stay in view while you tweak settings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showInfo && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold text-emerald-700">PixMix.fun</p>
                <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-500 hover:text-slate-800 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">1) Normalize.</p>
                <p>Both images are resized to the same grid based on your block size, ensuring an equal block count for matching.</p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-slate-900">2) Sobel signatures.</p>
                <p>Each block is grayscaled and convolved with Sobel filters to capture edge strength and direction:</p>
                <BlockMath math={String.raw`\mathbf{G}_x = \begin{bmatrix}-1 & 0 & 1\\ -2 & 0 & 2\\ -1 & 0 & 1\end{bmatrix},\quad \mathbf{G}_y = \begin{bmatrix}-1 & -2 & -1\\ 0 & 0 & 0\\ 1 & 2 & 1\end{bmatrix}`} />
                <p className="text-slate-700">For each pixel <InlineMath math="(i,j)" />:</p>
                <BlockMath math={String.raw`g_x = (\mathbf{G}_x * I)(i,j),\quad g_y = (\mathbf{G}_y * I)(i,j)`} />
                <BlockMath math={String.raw`|g| = \sqrt{g_x^2 + g_y^2},\quad \theta = \operatorname{atan2}(g_y, g_x)`} />
                <p className="text-slate-700">We average <InlineMath math="|g|" /> and <InlineMath math="\theta" /> over the block and keep the average RGB color. This balances edge structure and color.</p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-slate-900">3) Cost function.</p>
                <p>For a source block <InlineMath math="s" /> and target block <InlineMath math="t" />:</p>
                <BlockMath math={String.raw`\operatorname{cost}(s,t) = w\,\bigl(|\Delta m| + \kappa\,\Delta \theta\bigr) + (1-w)\,\lVert\Delta c\rVert_2`} />
                <BlockMath math={String.raw`\Delta \theta = \min\bigl(|\theta_s-\theta_t|,\;2\pi-|\theta_s-\theta_t|\bigr)`} />
                <ul className="text-slate-700 space-y-1 list-disc list-inside">
                  <li><InlineMath math="w" /> (Gradient Weight) trades edges vs. color.</li>
                  <li><InlineMath math="\kappa = 10" /> scales angle importance.</li>
                  <li><InlineMath math="\Delta m" /> is average gradient magnitude difference.</li>
                  <li><InlineMath math="\Delta c" /> is the RGB vector difference.</li>
                  <li><InlineMath math="\Delta \theta" /> wraps angles to <InlineMath math="[-\pi,\pi]" /> for circular distance.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">4) Matching.</p>
                <p>A greedy matcher pairs each target with the lowest-cost unused source block to stay fast on large grids.</p>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900">5) Animation.</p>
                <p>Blocks interpolate to targets with easing; frame counts and mid-frame draws are throttled when block counts grow to keep playback responsive.</p>
              </div>

              <p className="text-slate-600">Tips: Larger block sizes preview faster; smaller blocks give finer detail. Square images around 512×512 keep processing light and results crisp.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
