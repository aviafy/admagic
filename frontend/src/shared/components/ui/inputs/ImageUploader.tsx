/**
 * ImageUploader component - Upload images with preview
 */

'use client';

import { useState, useRef, ChangeEvent } from 'react';

export interface ImageUploaderProps {
  label?: string;
  value?: string; // Image URL or base64
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  acceptedFormats?: string[];
}

export function ImageUploader({
  label,
  value,
  onChange,
  error,
  helperText,
  maxSizeMB = 5,
  disabled = false,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setUploadError(
        `Invalid file type. Accepted: ${acceptedFormats.join(', ')}`
      );
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      setUploadError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Failed to upload image');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Upload Area */}
        {!preview ? (
          <div
            onClick={handleClick}
            className={`
              relative border-2 border-dashed border-gray-300 rounded-lg p-6
              flex flex-col items-center justify-center
              transition-colors
              ${
                disabled
                  ? 'bg-gray-50 cursor-not-allowed opacity-50'
                  : 'hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
              }
              ${uploading ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />

            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-blue-600 font-medium">Click to upload</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP up to {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        ) : (
          /* Preview Area */
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {(error || uploadError) && (
          <p className="text-sm text-red-600">{error || uploadError}</p>
        )}

        {/* Helper Text */}
        {helperText && !error && !uploadError && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    </div>
  );
}
