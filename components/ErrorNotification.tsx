import React, { useEffect } from 'react';
import { CloseIcon, RegenerateIcon } from './icons';

interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onDismiss, onRetry }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.();
  }

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm animate-fade-in" role="alert" aria-live="assertive">
      <div className="bg-red-900/70 backdrop-blur-md border border-red-600 text-red-100 px-4 py-3 rounded-lg shadow-lg relative">
        <div className="flex items-start">
          <div className="py-1">
            <svg className="fill-current h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V5z"/></svg>
          </div>
          <div>
            <p className="font-bold">Operation Failed</p>
            <p className="text-sm">{message}</p>
            {onRetry && (
              <button
                onClick={handleRetryClick}
                className="mt-2 flex items-center gap-2 text-sm bg-red-500/30 hover:bg-red-500/50 text-white font-semibold py-1 px-3 rounded-md transition-colors"
              >
                <RegenerateIcon className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        </div>
        <button onClick={handleDismissClick} className="absolute top-2 right-2 p-1 text-red-300 hover:text-white rounded-full hover:bg-red-500/30 transition-colors" aria-label="Dismiss">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};