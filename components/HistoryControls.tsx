import React from 'react';
import { UndoIcon, RedoIcon } from './icons';

interface HistoryControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const ControlButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode, 'aria-label': string }> = ({ onClick, disabled, children, 'aria-label': ariaLabel }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-700 rounded-md transform transition-all duration-200 enabled:hover:bg-gray-600 enabled:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


export const HistoryControls: React.FC<HistoryControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
    return (
        <div className="flex items-center justify-center gap-4 animate-fade-in">
            <ControlButton onClick={onUndo} disabled={!canUndo} aria-label="Undo last action">
                <UndoIcon className="w-5 h-5" />
                <span>Undo</span>
            </ControlButton>
            <ControlButton onClick={onRedo} disabled={!canRedo} aria-label="Redo last action">
                <span>Redo</span>
                <RedoIcon className="w-5 h-5" />
            </ControlButton>
        </div>
    );
};