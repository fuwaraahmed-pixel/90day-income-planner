import React, { useState, useEffect, useRef } from 'react';

export default function TruncatedText({ text, className = "" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef(null);
  const spanRef = useRef(null);

  // Close tooltip when clicking outside or when another tooltip opens
  useEffect(() => {
    const handleCloseOthers = (e) => {
      // If the event was dispatched and it's not from this instance, close this one
      if (e.detail && e.detail.ref !== containerRef.current) {
        setShowTooltip(false);
      }
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };

    window.addEventListener('close-all-tooltips', handleCloseOthers);
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      window.removeEventListener('close-all-tooltips', handleCloseOthers);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (!text) return;
    const checkTruncation = () => {
      if (spanRef.current) {
        setIsTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
      }
    };
    
    // Check initially and whenever text changes
    checkTruncation();
    
    // Also check on resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  if (!text) return <span className="text-slate-400 italic">--</span>;

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent parent row/card clicks
    if (!showTooltip) {
      // Announce to other tooltips to close themselves
      window.dispatchEvent(new CustomEvent('close-all-tooltips', { detail: { ref: containerRef.current } }));
    }
    setShowTooltip(!showTooltip);
  };

  return (
    <div 
      className={`relative flex items-center min-w-0 w-full group ${className}`} 
      ref={containerRef}
    >
      <span 
        ref={spanRef}
        className={`truncate block w-full transition-colors ${isTruncated ? 'cursor-help hover:text-slate-900' : ''}`}
        onClick={(e) => {
          if (isTruncated) handleToggle(e);
        }}
        onMouseEnter={() => {
          if (isTruncated) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          if (isTruncated) setShowTooltip(false);
        }}
      >
        {text}
      </span>

      {/* Popover/Tooltip */}
      {showTooltip && isTruncated && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] sm:max-w-xs bg-slate-900 text-slate-100 text-[11px] sm:text-xs rounded-xl shadow-xl border border-slate-700 p-3 whitespace-normal break-words leading-relaxed animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} // Prevent closing when interacting with the tooltip itself
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
          {text}
        </div>
      )}
    </div>
  );
}
