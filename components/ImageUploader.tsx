'use client';

import { useRef, ChangeEvent } from 'react';

interface ImageUploaderProps {
  label: string;
  onImageLoad: (imageData: string) => void;
  image: string | null;
}

export default function ImageUploader({ label, onImageLoad, image }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const img = new Image();
          img.onload = () => {
            if (img.width !== img.height) {
              alert('Please upload a square image (e.g., 512x512).');
              return;
            }
            onImageLoad(dataUrl);
          };
          img.onerror = () => {
            alert('Could not load the selected image.');
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm lift-on-hover relative">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">
          {label}
        </h3>
      </div>

      <div
        onClick={handleClick}
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        {image ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={label}
              className="w-full h-auto rounded-lg border border-slate-200 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/70 px-3 py-1 rounded-md transition-opacity shadow">
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors bg-slate-50/50">
            <svg
              className="mx-auto h-12 w-12 text-slate-300"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-slate-600 mt-3">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
