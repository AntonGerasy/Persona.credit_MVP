import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartTooltipProps {
    content: string;
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({ content }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('top');
    const [alignment, setAlignment] = useState<'left' | 'right' | 'center'>('center');
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            
            // Check horizontal bounds
            if (rect.right > window.innerWidth - 20) {
                setAlignment('right');
            } else if (rect.left < 20) {
                setAlignment('left');
            } else {
                setAlignment('center');
            }
            
            // Check vertical bounds (relative to trigger)
            const triggerRect = triggerRef.current.getBoundingClientRect();
            if (triggerRect.top < rect.height + 20) {
                setPosition('bottom');
            } else {
                setPosition('top');
            }
        }
    }, [isVisible]);

    const getAlignmentClass = () => {
        if (alignment === 'left') return 'left-0';
        if (alignment === 'right') return 'right-0';
        return 'left-1/2 -translate-x-1/2';
    };

    const getTriangleAlignmentClass = () => {
        if (alignment === 'left') return 'left-2';
        if (alignment === 'right') return 'right-2';
        return 'left-1/2 -translate-x-1/2';
    };

    const getPositionClass = () => {
        return position === 'top' ? 'bottom-full mb-4' : 'top-full mt-4';
    };

    return (
        <span className="relative inline-flex items-center ml-2" ref={triggerRef}>
            <button 
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="cursor-help focus:outline-none transition-all hover:scale-125 hover:text-brand-blue active:scale-95 text-brand-gray/60"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 8 : -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 8 : -8 }}
                        className={`absolute ${getPositionClass()} ${getAlignmentClass()} z-[9999] w-64 p-4 bg-brand-dark border border-brand-dark text-white text-[10px] font-bold leading-relaxed rounded-xl shadow-2xl pointer-events-none whitespace-normal transition-all duration-200 uppercase tracking-tight`}
                    >
                        {content}
                        <div className={`absolute ${position === 'top' ? 'top-full border-t-brand-dark' : 'bottom-full border-b-brand-dark'} ${getTriangleAlignmentClass()} border-[6px] border-transparent`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

export default SmartTooltip;
