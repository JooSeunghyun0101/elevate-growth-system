import React from 'react';

interface ThumbsUpEffectProps {
  isActive: boolean;
  clickPosition: { x: number; y: number };
}

const ThumbsUpEffect: React.FC<ThumbsUpEffectProps> = ({ isActive, clickPosition }) => {
  if (!isActive) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[10000] flex items-center justify-center"
      style={{
        left: clickPosition.x,
        top: clickPosition.y,
        transform: 'translate(-50%, -50%)', // 중앙 정렬
      }}
    >
      <div
        className="text-[6.3rem] leading-none"
        style={{
          animation: 'thumbsUpFade 2s ease-out forwards'
        }}
      >
        👍
      </div>
    </div>
  );
};

export default ThumbsUpEffect;