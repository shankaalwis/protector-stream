import { useEffect, useState } from 'react';

export const NetworkHealthMonitor = () => {
  const [pulseData, setPulseData] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    // Generate more realistic ECG-like pulse data with variations
    const generateRealisticPulse = () => {
      const newData: number[] = [];
      const segments = 5; // Number of heartbeat cycles
      const pointsPerSegment = 40;
      
      for (let seg = 0; seg < segments; seg++) {
        for (let i = 0; i < pointsPerSegment; i++) {
          const position = i / pointsPerSegment;
          
          // P-wave (small bump before main spike)
          if (position >= 0.1 && position < 0.2) {
            const t = (position - 0.1) / 0.1;
            newData.push(20 + Math.sin(t * Math.PI) * 8);
          }
          // PR segment (flat)
          else if (position >= 0.2 && position < 0.3) {
            newData.push(20);
          }
          // QRS complex (main spike - THE PEAK)
          else if (position >= 0.3 && position < 0.4) {
            const t = (position - 0.3) / 0.1;
            if (t < 0.3) {
              // Q wave (small dip)
              newData.push(20 - Math.sin(t * Math.PI * 3.33) * 5);
            } else if (t < 0.7) {
              // R wave (HUGE SPIKE)
              const spikeT = (t - 0.3) / 0.4;
              newData.push(20 + Math.sin(spikeT * Math.PI) * 65);
            } else {
              // S wave (small dip)
              const sT = (t - 0.7) / 0.3;
              newData.push(20 - Math.sin(sT * Math.PI) * 8);
            }
          }
          // ST segment (flat recovery)
          else if (position >= 0.4 && position < 0.55) {
            newData.push(20);
          }
          // T-wave (recovery wave)
          else if (position >= 0.55 && position < 0.75) {
            const t = (position - 0.55) / 0.2;
            newData.push(20 + Math.sin(t * Math.PI) * 15);
          }
          // Baseline (normal flat line)
          else {
            newData.push(20 + (Math.random() - 0.5) * 1); // Slight noise for realism
          }
        }
      }
      return newData;
    };

    setPulseData(generateRealisticPulse());
    
    // Animate the wave by updating offset
    const interval = setInterval(() => {
      setOffset(prev => (prev + 0.5) % 100);
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  // Generate SVG path from pulse data
  const generatePath = () => {
    if (pulseData.length === 0) return '';
    
    const offsetIndex = Math.floor((offset / 100) * pulseData.length);
    const extendedData = [...pulseData, ...pulseData];
    const visibleData = extendedData.slice(offsetIndex, offsetIndex + pulseData.length);
    
    let path = `M 0 ${100 - visibleData[0]}`;
    visibleData.forEach((value, index) => {
      const x = (index / visibleData.length) * 100;
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
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1"/>
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <rect width="100" height="100" fill="url(#grid-bold)" />
        </svg>
      </div>

      {/* Animated pulse line */}
      <svg 
        className="relative z-10 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
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
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="drop-shadow-lg"
        />
      </svg>

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

