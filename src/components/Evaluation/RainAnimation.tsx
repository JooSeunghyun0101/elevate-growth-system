import React, { useRef, useEffect, useCallback } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface RainAnimationProps {
  isActive: boolean;
  className?: string;
  clickPosition?: { x: number; y: number };
}

const RainAnimation: React.FC<RainAnimationProps> = ({ 
  isActive, 
  className = '',
  clickPosition = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const raindropsRef = useRef<RainDrop[]>([]);
  const isAnimatingRef = useRef(false);

  const createRaindrop = useCallback((x?: number): RainDrop => {
    return {
      x: x || Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      speed: 4 + Math.random() * 2, // 속도를 일정하게 조정 (3-6 범위)
      length: 15 + Math.random() * 15, // 길이도 일정하게 조정
      opacity: 0.4 + Math.random() * 0.3, // 투명도도 일정하게 조정
      life: 120 + Math.random() * 30, // 생명력도 일정하게 조정
      maxLife: 120 + Math.random() * 30
    };
  }, []);

  const createRain = useCallback((centerX?: number) => {
    const raindropCount = 80; // 비 방울 수 증가
    const newRaindrops: RainDrop[] = [];
    
    for (let i = 0; i < raindropCount; i++) {
      // 전체 화면에 골고루 비 생성
      const x = Math.random() * window.innerWidth;
      newRaindrops.push(createRaindrop(x));
    }
    
    raindropsRef.current.push(...newRaindrops);
  }, [createRaindrop]);

  const updateRain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 배경을 완전히 투명하게 클리어 (잔상 제거)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 빗방울 업데이트 및 그리기
    raindropsRef.current = raindropsRef.current.filter(drop => {
      // 위치 업데이트
      drop.y += drop.speed;
      drop.life--;

      // 생명력에 따른 투명도 계산
      const alpha = drop.life / drop.maxLife;
      
      // 빗방울 그리기
      ctx.save();
      ctx.strokeStyle = `rgba(70, 130, 180, ${drop.opacity * alpha})`; // 더 진한 파란색
      ctx.lineWidth = 2; // 선 두께 증가
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
      
      ctx.restore();

      return drop.y < canvas.height + drop.length && drop.life > 0;
    });

    // 새로운 빗방울 추가 (애니메이션이 활성화된 경우에만)
    if (isAnimatingRef.current && Math.random() < 0.15) { // 빈도를 더 낮게 조정
      // 전체 화면에서 새로운 빗방울 생성
      raindropsRef.current.push(createRaindrop(Math.random() * window.innerWidth));
    }

    // 애니메이션 계속 실행 (파티클이 있거나 애니메이션이 활성화된 경우)
    if (raindropsRef.current.length > 0 || isAnimatingRef.current) {
      // 기존 애니메이션 프레임을 취소하고 새로운 것을 요청
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(updateRain);
    } else {
      // 모든 파티클이 사라지면 애니메이션 중지
      isAnimatingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    }
  }, [createRaindrop]);

  const startAnimation = useCallback((centerX?: number) => {
    console.log('RainAnimation: Starting animation', { centerX, isActive });
    
    // 기존 애니메이션을 완전히 중지
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // 기존 빗방울을 모두 제거하고 새로 시작
    raindropsRef.current = [];
    isAnimatingRef.current = true;
    createRain(centerX);
    updateRain();
  }, [createRain, updateRain]);

  const stopAnimation = useCallback(() => {
    console.log('RainAnimation: Stopping animation');
    // 즉시 중지하지 않고 자연스럽게 페이드아웃
    isAnimatingRef.current = false;
    // 기존 파티클들은 자연스럽게 사라지도록 함
  }, []);

  // isActive 상태에 따른 애니메이션 제어
  useEffect(() => {
    console.log('RainAnimation: isActive changed', { isActive, clickPosition });
    if (isActive) {
      // 전체 화면에서 비 시작 (클릭 위치와 상관없이)
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isActive, clickPosition, startAnimation, stopAnimation]);

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 9998 }}
    />
  );
};

export default RainAnimation; 