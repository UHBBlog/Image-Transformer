
import React, { useRef, useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File, dataUrl: string) => void;
  currentImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, currentImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const file = files?.[0];
    if (!file) {
      return;
    }

    if (file.type.startsWith('image/')) {
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        const errorMsg = "Invalid file type. Please use PNG, JPG, or WEBP.";
        setUploadError(errorMsg);
        errorTimeoutRef.current = window.setTimeout(() => {
            setUploadError(null);
        }, 4000);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files);
        e.dataTransfer.clearData();
    }
  }, [handleDragEvents]);


  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">1. Upload Photo</h2>
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        accept="image/*"
        className="hidden"
      />
      <label
        onClick={handleClick}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'}
          ${uploadError ? '!border-red-500' : ''}
        `}
      >
        {currentImage ? (
            <img src={currentImage} alt="Uploaded preview" className="max-h-32 w-auto object-cover rounded-md" />
        ) : (
            <>
                <UploadIcon className="w-10 h-10 text-gray-500 mb-3" />
                <span className="text-sm font-medium text-gray-400">Click to upload or drag & drop</span>
                {uploadError ? (
                  <span className="text-xs text-red-400 mt-1 animate-fade-in">{uploadError}</span>
                ) : (
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</span>
                )}
            </>
        )}
      </label>
    </div>
  );
};
