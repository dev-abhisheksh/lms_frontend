import React from 'react';

/**
 * Universal Loader Component
 * @param {boolean} fixed - If true, covers the entire screen (fixed). If false, covers its relative parent (absolute).
 * @param {string} label - Text to display below the spinner.
 */
const Loader = ({ fixed = false, label = "Syncing Data" }) => {
  const containerClasses = fixed 
    ? "fixed inset-0 z-[999] bg-white/60 backdrop-blur-sm"
    : "absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px]";

  return (
    <div className={`${containerClasses} flex items-center justify-center transition-opacity duration-300 min-h-[120px]`}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Outer Ring */}
        <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        
        {/* Pulsing Core */}
        <div className="absolute top-3 left-3 h-6 w-6 rounded-full bg-indigo-600/10 animate-pulse flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
        </div>

        {/* Text */}
        {label && (
            <div className="flex flex-col items-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 animate-pulse">
                    {label}
                </p>
                <div className="flex gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-indigo-600/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 rounded-full bg-indigo-600/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 rounded-full bg-indigo-600/40 animate-bounce" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
