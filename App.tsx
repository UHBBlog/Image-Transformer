
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditorPanel } from './components/EditorPanel';
import { ImageViewer } from './components/ImageViewer';
import { RefinePanel } from './components/RefinePanel';
import { HistoryControls } from './components/HistoryControls';
import { ErrorNotification } from './components/ErrorNotification';
import { editImageWithPrompt } from './services/geminiService';
import { EditMode } from './types';
import { SparklesIcon } from './components/icons';

export default function App() {
  const [mode, setMode] = useState<EditMode>('avatar');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  
  // Replaces modelImageFile to support multiple reference images (for combine mode)
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  
  const [history, setHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [variationIndex, setVariationIndex] = useState<number>(-1);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);

  const currentVariations = history[historyIndex] ?? [];
  const generatedImage = currentVariations[variationIndex] ?? null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleImageUpload = (file: File, dataUrl: string) => {
    setOriginalImage(dataUrl);
    setOriginalImageFile(file);
    setAdditionalImages([]); // Reset additional images when main image changes
    setHistory([]);
    setHistoryIndex(-1);
    setVariationIndex(-1);
    setLastPrompt(null);
    setError(null);
    setLastFailedAction(null);
  };

  const handleAdditionalImageUpload = (file: File) => {
    setAdditionalImages(prev => [...prev, file]);
  }

  const removeAdditionalImage = (index: number) => {
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  }

  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const mimeType = blob.type || 'image/png';
      const extension = mimeType.split('/')[1] ?? 'png';
      const finalFilename = `${filename}.${extension}`;
      return new File([blob], finalFilename, { type: mimeType });
  };

  const executeGeneration = async (
    prompt: string, 
    baseFile: File, 
    isRegeneration: boolean = false,
    extraImages: File[] = [],
  ) => {
      if (!prompt.trim()) {
        setError(isRegeneration ? "Cannot regenerate without a prompt." : "Please select a style or enter a custom prompt.");
        return;
      }
      setIsLoading(true);
      setError(null);
      setLastFailedAction(null);
      
      if (!isRegeneration) {
        setLastPrompt(prompt);
      }

      try {
          // Pass the array of additional images to the service
          const result = await editImageWithPrompt(prompt, baseFile, extraImages);
          
          if (isRegeneration) {
              if (historyIndex > -1) {
                  const newHistory = [...history];
                  newHistory[historyIndex].push(result);
                  setHistory(newHistory);
                  setVariationIndex(newHistory[historyIndex].length - 1);
              }
          } else {
              const slicedHistory = history.slice(0, historyIndex + 1);
              slicedHistory.push([result]);
              setHistory(slicedHistory);
              setHistoryIndex(slicedHistory.length - 1);
              setVariationIndex(0);
          }
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
          setError(`Generation failed: ${errorMessage}`);
          const retryAction = () => executeGeneration(prompt, baseFile, isRegeneration, extraImages);
          setLastFailedAction(() => retryAction);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!originalImageFile) {
      setError("Please upload an image first.");
      return;
    }
    // Pass current additionalImages from state
    await executeGeneration(prompt, originalImageFile, false, additionalImages);
  }, [originalImageFile, additionalImages, history, historyIndex]);

  const handleRefineImage = useCallback(async (prompt: string) => {
    if (!generatedImage) {
        setError("No generated image to refine.");
        return;
    }
    const imageFile = await dataUrlToFile(generatedImage, 'generated-image-for-refining');
    // For refinement, we usually don't include the original additional reference images unless explicitly needed,
    // but typically refinement is just on the result.
    await executeGeneration(prompt, imageFile, false, []);
  }, [generatedImage, history, historyIndex]);

  const handleRegenerate = useCallback(async () => {
    if (!lastPrompt) {
      setError("No recent prompt to regenerate.");
      return;
    }
    if (historyIndex < 0) {
        setError("Cannot regenerate, no history available.");
        return;
    }

    const isFirstStep = historyIndex === 0;
    const baseImageSource = isFirstStep 
        ? originalImage 
        : history[historyIndex - 1][history[historyIndex - 1].length - 1];

    if (!baseImageSource && !originalImageFile) {
        setError("Original image is missing for regeneration.");
        return;
    }

    const baseFile = baseImageSource 
        ? await dataUrlToFile(baseImageSource, 'base-for-regeneration')
        : originalImageFile!;

    await executeGeneration(lastPrompt, baseFile, true, additionalImages);
  }, [lastPrompt, originalImage, originalImageFile, additionalImages, history, historyIndex]);
  
  const handleVariationSelect = (index: number) => {
    setVariationIndex(index);
  };
  
  const handleUndo = () => {
    if (canUndo) {
      const prevStepIndex = historyIndex - 1;
      setHistoryIndex(prevStepIndex);
      setVariationIndex(history[prevStepIndex].length - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextStepIndex = historyIndex + 1;
      setHistoryIndex(nextStepIndex);
      setVariationIndex(0);
    }
  };

  const handleRetry = () => {
    if (lastFailedAction) {
        lastFailedAction();
    }
  };

  const dismissError = () => {
    setError(null);
    setLastFailedAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
       {error && (
        <ErrorNotification 
          message={error}
          onDismiss={dismissError}
          onRetry={lastFailedAction ? handleRetry : undefined}
        />
      )}
      <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <ImageUploader onImageUpload={handleImageUpload} currentImage={originalImage} />
          {originalImage && (
            <EditorPanel
              mode={mode}
              setMode={setMode}
              onGenerate={handleGenerate}
              onAdditionalImageUpload={handleAdditionalImageUpload}
              onRemoveAdditionalImage={removeAdditionalImage}
              additionalImages={additionalImages}
              isLoading={isLoading}
            />
          )}
        </aside>
        <section className="lg:col-span-8 xl:col-span-9 bg-gray-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700 min-h-[60vh] flex flex-col">
          <ImageViewer
            originalImage={originalImage}
            generatedImage={generatedImage}
            isLoading={isLoading}
            variations={currentVariations}
            activeVariationIndex={variationIndex}
            onRegenerate={handleRegenerate}
            onVariationSelect={handleVariationSelect}
          />
          {generatedImage && (
             <div className="mt-6 flex flex-col items-center gap-4">
              <HistoryControls onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} />
              <RefinePanel onRefine={handleRefineImage} isLoading={isLoading} />
            </div>
          )}
           {!originalImage && (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
                <SparklesIcon className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold text-gray-400">AI Image Studio</h2>
                <p className="mt-2 max-w-md">Upload a photo to begin transforming it with the power of AI. Choose a mode, select a style, and watch the magic happen.</p>
              </div>
           )}
        </section>
      </main>
    </div>
  );
}
