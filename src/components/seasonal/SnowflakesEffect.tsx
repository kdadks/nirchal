import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  color: string;
  icon: string;
}

const SnowflakesEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [isSeasonalPeriod, setIsSeasonalPeriod] = useState(false);

  useEffect(() => {
    // Check if we're in the Christmas/New Year season (Dec 15 - Jan 10)
    const checkSeasonalPeriod = () => {
      const now = new Date();
      const month = now.getMonth(); // 0-indexed (0 = January, 11 = December)
      const day = now.getDate();

      // December 15 - December 31 OR January 1 - January 10
      const isInPeriod = 
        (month === 11 && day >= 15) || // December 15-31
        (month === 0 && day <= 10);    // January 1-10

      setIsSeasonalPeriod(isInPeriod);
      return isInPeriod;
    };

    if (checkSeasonalPeriod()) {
      // Generate snowflakes and Christmas icons
      const flakes: Snowflake[] = [];
      const numberOfSnowflakes = 50; // Adjust for performance
      
      // Festive vibrant colors
      const colors = [
        '#FF1744', // Vibrant red
        '#FF4081', // Pink
        '#E040FB', // Purple
        '#7C4DFF', // Deep purple
        '#536DFE', // Indigo
        '#448AFF', // Blue
        '#00E5FF', // Cyan
        '#1DE9B6', // Teal
        '#00E676', // Green
        '#76FF03', // Light green
        '#FFEA00', // Yellow
        '#FFC400', // Amber
        '#FF9100', // Orange
        '#FF3D00', // Deep orange
        '#FFD700', // Gold
        '#FFFFFF', // White
        '#87CEEB', // Sky blue
        '#FFB6C1', // Light pink
        '#98FB98', // Pale green
        '#DDA0DD', // Plum
      ];

      // Christmas icons mix (more snowflakes)
      const icons = [
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '❄️', // Snowflake
        '🎄', // Christmas tree
        '🎅', // Santa
        '🎁', // Gift
        '⭐', // Star
        '🌟', // Glowing star
        '🎉', // Party popper
        '🎈', // Balloon
        '🔔', // Bell
        '🕯️', // Candle
        '🧦', // Stocking
        '🍬', // Candy
        '🎀', // Ribbon
        '⛄', // Snowman
      ];

      for (let i = 0; i < numberOfSnowflakes; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100, // Random horizontal position (0-100%)
          animationDuration: 10 + Math.random() * 20, // 10-30 seconds
          animationDelay: Math.random() * 10, // 0-10 seconds delay
          size: 12 + Math.random() * 16, // 12-28px (much larger)
          opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0
          color: colors[Math.floor(Math.random() * colors.length)],
          icon: icons[Math.floor(Math.random() * icons.length)],
        });
      }

      setSnowflakes(flakes);
    }
  }, []);

  if (!isSeasonalPeriod) {
    return null;
  }

  return (
    <div className="snowflakes-container pointer-events-none fixed inset-0 z-[9999] overflow-hidden touch-none">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake absolute will-change-transform"
          style={{
            left: `${flake.left}%`,
            top: '-10px',
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration}s linear ${flake.animationDelay}s infinite`,
            WebkitTransform: 'translateZ(0)', // Hardware acceleration for iOS
            transform: 'translateZ(0)', // Hardware acceleration
          }}
        >
          {flake.icon}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg) translateZ(0);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateZ(0);
          }
        }
        
        .snowflake {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-touch-callout: none;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .snowflakes-container {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default SnowflakesEffect;
