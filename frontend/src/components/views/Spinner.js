import React, { useState, useEffect } from "react";

const Spinner = ({ onComplete }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const letters = "WANDERLUST".split("");
  
  // Sophisticated red theme palette
  const colors = {
    primary: '#e74c3c',       // Muted red
    secondary: '#ff7675',     // Soft coral
    accent: '#fab1a0',        // Light peach
    dark: '#c0392b',          // Darker red
    light: '#ffeceb',         // Very light pink
    text: '#5d2a28',          // Dark red-brown for text
    background: '#fff9f9'     // Off-white with pink tint
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getDelay = () => {
      if (loadingCount < 40) return 25 + Math.random() * 10;
      if (loadingCount < 70) return 35 + Math.random() * 15;
      if (loadingCount < 90) return 55 + Math.random() * 20;
      return 85 + Math.random() * 20;
    };

    if (loadingCount < 100) {
      const counterTimer = setTimeout(() => {
        setLoadingCount((prev) => {
          const next = prev + (0.5 + Math.random());
          return Math.min(next, 100);
        });
      }, getDelay());
      return () => clearTimeout(counterTimer);
    } else {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(completeTimer);
    }
  }, [loadingCount, onComplete]);

  // Dynamic color based on loading progress
  const getProgressColor = (progress) => {
    const hue = 5; // Slightly orange-red
    const saturation = 65 + (progress / 5);
    const lightness = 45 - (progress / 6);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" 
         style={{ backgroundColor: colors.background }}>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(${colors.primary} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Elegant title animation */}
      <div className="relative mb-16 z-10">
        <div className="flex">
          {letters.map((letter, index) => (
            <span
              key={index}
              className="text-5xl mx-0.5 font-medium"
              style={{
                opacity: isInitialized ? 1 : 0,
                color: colors.text,
                fontFamily: "'Lora', serif",
                fontWeight: 400,
                letterSpacing: '1px',
                transition: 'all 0.3s ease-out',
                transform: `
                  translateY(${isInitialized ? 0 : 20}px)
                  rotate(${index % 2 === 0 ? -1 : 1}deg)
                `,
                animation: `
                  float 4s ease-in-out infinite ${index * 0.15}s
                `,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.primary;
                e.target.style.transform = `
                  translateY(-5px)
                  rotate(${index % 2 === 0 ? -3 : 3}deg)
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colors.text;
                e.target.style.transform = `
                  translateY(0)
                  rotate(${index % 2 === 0 ? -1 : 1}deg)
                `;
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Refined loading bar */}
      <div className="w-80 max-w-full px-4 flex flex-col items-center z-10">
        {/* Progress bar container */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-sm">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${loadingCount}%`,
              background: `linear-gradient(
                to right,
                ${colors.light},
                ${colors.accent},
                ${colors.secondary},
                ${colors.primary}
              )`,
              boxShadow: `inset 0 1px 2px rgba(255,255,255,0.3)`
            }}
          />
        </div>

        {/* Loading information */}
        <div className="flex justify-between w-full mt-3">
          <span className="text-xs font-light text-gray-500">
            {loadingCount < 30 && "Preparing..."}
            {loadingCount >= 30 && loadingCount < 60 && "Loading resources..."}
            {loadingCount >= 60 && loadingCount < 90 && "Almost there..."}
            {loadingCount >= 90 && "Finalizing..."}
          </span>
          <span className="text-xs font-medium" style={{ 
            color: getProgressColor(loadingCount)
          }}>
            {Math.round(loadingCount)}%
          </span>
        </div>

        {/* Completion message */}
        {loadingCount === 100 && (
          <div className="mt-4 text-sm text-center transition-all duration-500" 
               style={{ color: colors.dark }}>
            <svg 
              className="w-4 h-4 inline-block mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            Ready to explore
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;