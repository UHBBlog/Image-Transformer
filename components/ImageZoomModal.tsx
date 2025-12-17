import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './icons';

interface ImageZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button
        onClick={onClick}
        className="p-2 bg-gray-800/80 rounded-full text-white hover:bg-gray-700/80 transition-colors"
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, onClose, imageUrl }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startDragRef = useRef({ x: 0, y: 0 });

    const reset = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
            reset();
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, reset]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        startDragRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        if (imageRef.current) {
            imageRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - startDragRef.current.x,
            y: e.clientY - startDragRef.current.y,
        });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = false;
        if (imageRef.current) {
            imageRef.current.style.cursor = 'grab';
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, scale + delta), 4);
        setScale(newScale);
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            ref={containerRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" 
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                aria-label="Close"
            >
                <CloseIcon className="w-8 h-8" />
            </button>
            
            <div 
                className="absolute"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves container
                onWheel={handleWheel}
            >
                 <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Zoomed view"
                    className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
                        cursor: 'grab',
                    }}
                />
            </div>

            <div 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/30 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
                <ControlButton onClick={() => setScale(s => Math.min(s + 0.2, 4))} aria-label="Zoom In">
                    <ZoomInIcon className="w-6 h-6" />
                </ControlButton>
                <ControlButton onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} aria-label="Zoom Out">
                    <ZoomOutIcon className="w-6 h-6" />
                </ControlButton>
                <ControlButton onClick={reset} aria-label="Reset Zoom">
                    <ResetZoomIcon className="w-6 h-6" />
                </ControlButton>
            </div>
        </div>,
        document.body
    );
};
