'use client';

import { useEffect, useState } from 'react';

interface RainDrop {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export function RainEffect() {
  const [drops, setDrops] = useState<RainDrop[]>([]);

  useEffect(() => {
    // Create rain drops
    const rainDrops: RainDrop[] = [];
    const dropCount = 100;

    for (let i = 0; i < dropCount; i++) {
      rainDrops.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.5,
      });
    }

    setDrops(rainDrops);
  }, []);

  return (
    <div className="rain-container">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
    </div>
  );
}



