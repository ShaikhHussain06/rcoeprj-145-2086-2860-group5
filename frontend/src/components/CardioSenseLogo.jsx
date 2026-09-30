import React from 'react';

export function CardioSenseLogo({ className = "h-8", showText = true, textColor = "#0284c7" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon SVG: Blue Heart with Auscultation/ECG Rhythm */}
      <svg 
        className="h-full aspect-square overflow-visible flex-shrink-0" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 84C50 84 16 62 16 35C16 22 26 13 39 13C46 13 50 17 50 17C50 17 54 13 61 13C74 13 84 22 84 35C84 62 50 84 50 84Z"
          stroke="#38BDF8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M23 49H35L42 35L51 65L60 43L66 51H77"
          stroke="#38BDF8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span 
          className="font-bold text-xl tracking-tight leading-none"
          style={{ color: textColor }}
        >
          CardioSense <span className="text-sky-500">AI</span>
        </span>
      )}
    </div>
  );
}

export function CardioSenseCardSymbol({ className = "w-48 h-32" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        className="w-20 h-20 overflow-visible mb-2 drop-shadow-sm" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 84C50 84 16 62 16 35C16 22 26 13 39 13C46 13 50 17 50 17C50 17 54 13 61 13C74 13 84 22 84 35C84 62 50 84 50 84Z"
          stroke="#38BDF8"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M23 49H35L42 35L51 65L60 43L66 51H77"
          stroke="#38BDF8"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-extrabold text-2xl tracking-tight text-sky-500">
        CardioSense <span className="text-sky-600">AI</span>
      </span>
    </div>
  );
}

export function ClinicalBadgeGraphic({ className = "w-full max-w-sm" }) {
  return (
    <div className={`bg-gradient-to-tr from-sky-50 to-white rounded-2xl p-6 border border-sky-200/80 shadow-sm flex flex-col items-center text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center mb-4 shadow-md">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
      <span className="font-mono text-xs uppercase tracking-wider text-sky-700 font-bold mb-1">
        Clinical Acoustic Validation
      </span>
      <h3 className="font-bold text-lg text-slate-900 mb-2">
        PhysioNet &amp; CirCAD Standard
      </h3>
      <div className="flex items-center gap-3 text-xs text-slate-600 font-mono mt-2 pt-2 border-t border-sky-100 w-full justify-center">
        <span className="text-emerald-700 font-bold">96.4% Accuracy</span>
        <span>•</span>
        <span className="text-sky-700 font-bold">4.2 kHz DSP Sync</span>
      </div>
    </div>
  );
}
