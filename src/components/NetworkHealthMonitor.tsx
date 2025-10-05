import { useEffect, useState } from 'react';

export const NetworkHealthMonitor = () => {
  const [pulseData, setPulseData] = useState<number[]>([]);
  
  useEffect(() => {
    // Generate ECG-like pulse data
    const generatePulse = () => {
      const newData: number[] = [];
      for (let i = 0; i < 100; i++) {
        if (i % 20 === 10) {
          // Spike (R-wave)
          newData.push(80);
        } else if (i % 20 === 9 || i % 20 === 11) {
          // Gradual rise/fall
          newData.push(60);
        } else if (i % 20 === 8 || i % 20 === 12) {
          newData.push(40);
        } else if (i % 20 === 7) {
          // P-wave
          newData.push(25);
        } else if (i % 20 === 13) {
          // T-wave
          newData.push(30);
        } else {
          // Baseline
          newData.push(20);
        }
      }
      return newData;
    };

    setPulseData(generatePulse());
  }, []);

  // Generate SVG path from pulse data
  const generatePath = () => {
    if (pulseData.length === 0) return '';
    
    let path = `M 0 ${100 - pulseData[0]}`;
    pulseData.forEach((value, index) => {
      const x = (index / pulseData.length) * 100;
      const y = 100 - value;
      path += ` L ${x} ${y}`;
    });
    
    return path;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/30"/>
            </pattern>
            <pattern id="grid-bold" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/50"/>
            </pattern>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <rect width="100" height="100" fill="url(#grid-bold)" />
        </svg>
      </div>

      {/* Animated pulse line */}
      <svg 
        className="relative z-10 w-full h-full animate-pulse-wave" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Pulse line with glow */}
        <path
          d={generatePath()}
          fill="none"
          stroke="url(#pulseGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="pulse-line"
        />
        
        {/* Moving dot indicator */}
        <circle 
          cx="50" 
          cy="20" 
          r="2" 
          fill="hsl(var(--primary))"
          className="animate-pulse"
        >
          <animate
            attributeName="cx"
            values="0;100;0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Status text */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-primary/70 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span>Network Healthy</span>
        </div>
      </div>

      {/* Heartbeat indicator */}
      <div className="absolute top-2 left-2 text-xs font-mono text-primary/70 animate-fade-in">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>Monitoring</span>
        </div>
      </div>
    </div>
  );
};
