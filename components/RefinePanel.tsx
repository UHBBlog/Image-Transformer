import React, { useState } from 'react';
import { EditIcon, FaceSmileIcon, StarIcon, SunIcon, SnowflakeIcon, ZapIcon, DetailIcon } from './icons';

interface RefinePanelProps {
  onRefine: (prompt: string) => void;
  isLoading: boolean;
}

const FACE_SMOOTH_PROMPT = "Perform a professional skin retouch on this portrait. Smooth the skin texture naturally, reduce minor blemishes and wrinkles, while preserving the natural facial features and character. Avoid making the skin look plastic or overly edited. Keep the overall look realistic and high-quality.";
const ENHANCE_QUALITY_PROMPT = "Upscale this image to the highest possible resolution and clarity. Enhance all details, textures, and sharpness to create a photorealistic, ultra-high-definition result. Remove any compression artifacts or blurriness. The final image should look like it was captured with a high-end professional camera, approximating 16K resolution in terms of detail.";
const DETAIL_ENHANCEMENT_PROMPT = "Intelligently enhance the details and sharpness of the image. Clarify textures and edges without introducing noise or artificial-looking artifacts. The result should be a crisper, more defined image.";

const COLOR_GRADING_WARM_PROMPT = "Apply a warm color grade to the image. Enhance the reds, oranges, and yellows to create a cozy, sun-kissed feel. The changes should be subtle and maintain a natural look.";
const COLOR_GRADING_COOL_PROMPT = "Apply a cool color grade to the image. Enhance the blues and cyans to create a calm, moody, or cinematic feel. The changes should be subtle and maintain a natural look.";
const COLOR_GRADING_DRAMATIC_PROMPT = "Apply a dramatic color grade to the image. Increase contrast, deepen the shadows, and desaturate the colors slightly to create a powerful, moody, and cinematic look.";


export const RefinePanel: React.FC<RefinePanelProps> = ({ onRefine, isLoading }) => {
    const [refinePrompt, setRefinePrompt] = useState('');

    const handleRefineClick = () => {
        if (refinePrompt.trim() && !isLoading) {
            onRefine(refinePrompt);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleRefineClick();
      }
    }
    
    const handlePresetClick = (prompt: string) => {
        if (!isLoading) {
            onRefine(prompt);
        }
    };

    return (
        <div className="mt-6 w-full max-w-3xl mx-auto bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fade-in">
            <h3 className="text-md font-semibold mb-4 text-gray-300">4. Further Editing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Adjustments</h4>
                    <div className="flex flex-wrap gap-3">
                         <button onClick={() => handlePresetClick(FACE_SMOOTH_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Apply Face Smoothing">
                            <FaceSmileIcon className="w-5 h-5" /> Smooth Face
                        </button>
                        <button onClick={() => handlePresetClick(ENHANCE_QUALITY_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Enhance image quality">
                            <StarIcon className="w-5 h-5 text-yellow-400" /> Enhance Quality
                        </button>
                        <button onClick={() => handlePresetClick(DETAIL_ENHANCEMENT_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Enhance details">
                            <DetailIcon className="w-5 h-5 text-cyan-400" /> Detail Enhancement
                        </button>
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Color Grading</h4>
                    <div className="flex flex-wrap gap-3">
                         <button onClick={() => handlePresetClick(COLOR_GRADING_WARM_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Apply Warm Tone">
                            <SunIcon className="w-5 h-5 text-orange-400" /> Warm Tone
                        </button>
                        <button onClick={() => handlePresetClick(COLOR_GRADING_COOL_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Apply Cool Tone">
                            <SnowflakeIcon className="w-5 h-5 text-blue-400" /> Cool Tone
                        </button>
                         <button onClick={() => handlePresetClick(COLOR_GRADING_DRAMATIC_PROMPT)} disabled={isLoading} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Apply Dramatic Tone">
                            <ZapIcon className="w-5 h-5 text-purple-400" /> Dramatic Tone
                        </button>
                    </div>
                </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">Or describe a custom change (e.g., "remove the background", "add sunglasses").</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <textarea
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., add a retro filter"
                    rows={1}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleRefineClick}
                    disabled={isLoading || !refinePrompt.trim()}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-600 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    aria-label="Refine Image with custom prompt"
                >
                     <EditIcon className="w-5 h-5" />
                    Refine Image
                </button>
            </div>
        </div>
    );
}