import React, { useState } from 'react';
import { DownloadIcon, SparklesIcon, ZoomInIcon, RegenerateIcon } from './icons';
import { ImageZoomModal } from './ImageZoomModal';

interface ImageViewerProps {
  originalImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  variations: string[];
  activeVariationIndex: number;
  onRegenerate: () => void;
  onVariationSelect: (index: number) => void;
}

interface ImagePanelProps {
    title: string; 
    imageUrl: string | null; 
    isLoading?: boolean; 
    isZoomable?: boolean;
    onImageClick?: () => void;
    children?: React.ReactNode
}

const ImagePanel: React.FC<ImagePanelProps> = ({ title, imageUrl, isLoading = false, isZoomable = false, onImageClick, children }) => {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-3 px-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
            {children}
        </div>
        <div 
          className="relative w-full aspect-square bg-gray-900/50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-700 group"
          onClick={isZoomable ? onImageClick : undefined}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
              <SparklesIcon className="w-12 h-12 text-purple-400 animate-pulse" />
              <p className="mt-4 text-gray-400">Generating magic...</p>
            </div>
          )}
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
              {isZoomable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    <ZoomInIcon className="w-12 h-12 text-white" />
                </div>
              )}
            </>
          ) : (
            !isLoading && <span className="text-gray-600 text-sm">Image will appear here</span>
          )}
        </div>
      </div>
    );
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
    originalImage, 
    generatedImage, 
    isLoading,
    variations,
    activeVariationIndex,
    onRegenerate,
    onVariationSelect
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (!originalImage) return null;

    return (
        <>
            <div className="flex-grow flex flex-col sm:flex-row items-start justify-center gap-4 sm:gap-6 lg:gap-8">
                <ImagePanel title="Before" imageUrl={originalImage} />
                <ImagePanel 
                    title="After" 
                    imageUrl={generatedImage} 
                    isLoading={isLoading && !generatedImage}
                    isZoomable={!!generatedImage}
                    onImageClick={() => setIsModalOpen(true)}
                >
                    {generatedImage && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onRegenerate}
                                disabled={isLoading}
                                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Regenerate image"
                            >
                                <RegenerateIcon className="w-4 h-4" />
                                Regenerate
                            </button>
                            <a
                                href={generatedImage}
                                download="ai-generated-image.png"
                                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                onClick={(e) => e.stopPropagation()} // Prevent modal from opening on download click
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Download
                            </a>
                        </div>
                    )}
                </ImagePanel>
            </div>

            {variations && variations.length > 1 && (
              <div className="mt-4 w-full animate-fade-in">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 text-center">Variations</h4>
                  <div className="flex justify-center gap-2 flex-wrap p-2 bg-gray-900/30 rounded-lg">
                      {variations.map((variationUrl, index) => (
                          <button 
                              key={index}
                              onClick={() => onVariationSelect(index)}
                              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 transform hover:scale-105 ${activeVariationIndex === index ? 'border-purple-500 scale-105' : 'border-gray-700 hover:border-gray-500'}`}
                              aria-label={`Select variation ${index + 1}`}
                          >
                              <img src={variationUrl} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                      ))}
                  </div>
              </div>
            )}
            
            {generatedImage && (
                <ImageZoomModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageUrl={generatedImage}
                />
            )}
        </>
    );
};