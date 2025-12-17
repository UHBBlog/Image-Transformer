
import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700/50">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center">
        <SparklesIcon className="w-8 h-8 text-purple-400 mr-3" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
          AI Image Studio
        </h1>
        <span className="ml-3 text-xs text-gray-500 hidden sm:inline">Smart Photo Transformer</span>
      </div>
    </header>
  );
};
