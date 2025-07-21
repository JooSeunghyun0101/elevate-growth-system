import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'square' | 'star' | 'heart' | 'diamond';
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  friction: number;
}

interface FullScreenConfettiProps {
  isActive: boolean;
  onAnimationComplete?: () => void;
  className?: string;
  clickPosition?: { x: number; y: number };
}

const FullScreenConfetti: React.FC<FullScreenConfettiProps> = ({ 
  isActive, 
  onAnimationComplete,
  className = '',
  clickPosition = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isAnimatingRef = useRef(false);

  const colors = [
    '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93',
    '#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d',
    '#43aa8b', '#577590', '#ff6b6b', '#4ecdc4', '#45b7d1',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#ff6b9d', '#c44569', '#f39c12', '#e74c3c', '#9b59b6'
  ];

  const createParticle = useCallback((x: number, y: number): Particle => {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 15 + 8; // 속도 증가
    const typeRandom = Math.random();
    let type: Particle['type'];
    
    if (typeRandom > 0.8) type = 'star';
    else if (typeRandom > 0.6) type = 'heart';
    else if (typeRandom > 0.4) type = 'diamond';
    else if (typeRandom > 0.2) type = 'square';
    else type = 'circle';
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5, // 위쪽으로 더 강한 초기 속도
      life: 180, // 생명력 증가
      maxLife: 180,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, // 크기 증가
      type,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20, // 회전 속도 증가
      gravity: 0.15 + Math.random() * 0.2, // 중력 감소로 더 오래 떠있게
      friction: 0.99 + Math.random() * 0.01 // 마찰 감소
    };
  }, []);

  const createConfetti = useCallback((x: number, y: number) => {
    const particleCount = 120; // 파티클 수 증가
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(x, y));
    }
    
    particlesRef.current.push(...newParticles);
  }, [createParticle]);

  const drawHeart = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.6, 0, size);
    ctx.bezierCurveTo(size, size * 0.6, size * 0.5, -size * 0.2, 0, size * 0.3);
    ctx.fill();
  }, []);

  const drawDiamond = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
  }, []);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 전체 화면으로 설정
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 배경 클리어 (반투명 효과)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // 더 투명하게
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 파티클 업데이트 및 그리기
    particlesRef.current = particlesRef.current.filter(particle => {
      // 물리 업데이트
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity; // 개별 중력
      particle.vx *= particle.friction; // 개별 마찰
      particle.vy *= particle.friction; // 개별 마찰
      particle.life--;
      particle.rotation += particle.rotationSpeed;

      // 화면 경계 처리 - 더 넓게 퍼지도록
      if (particle.x < 0) {
        particle.vx *= -0.3;
        particle.x = 0;
      }
      if (particle.x > canvas.width) {
        particle.vx *= -0.3;
        particle.x = canvas.width;
      }
      if (particle.y > canvas.height) {
        particle.vy *= -0.2;
        particle.y = canvas.height;
      }

      // 생명력에 따른 투명도 계산
      const alpha = particle.life / particle.maxLife;
      
      // 파티클 그리기
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);

      switch (particle.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
          break;
        case 'star':
          // 별 모양 그리기
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
        case 'heart':
          drawHeart(ctx, particle.size);
          break;
        case 'diamond':
          drawDiamond(ctx, particle.size);
          break;
      }
      
      ctx.restore();

      return particle.life > 0;
    });

    // 애니메이션 계속 실행 (파티클이 있으면 계속)
    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles);
    } else {
      isAnimatingRef.current = false;
      onAnimationComplete?.();
    }
  }, [drawHeart, drawDiamond, onAnimationComplete]);

  const startAnimation = useCallback((x: number, y: number) => {
    // 애니메이션 중에도 새로운 폭죽 추가 가능
    createConfetti(x, y);
    
    // 애니메이션이 실행 중이 아니면 시작
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      updateParticles();
    }
  }, [createConfetti, updateParticles]);

  // isActive가 true일 때 자동으로 애니메이션 시작
  useEffect(() => {
    if (isActive) {
      // clickPosition이 제공되면 해당 위치에서 시작, 아니면 화면 중앙에서 시작
      let x, y;
      
      if (clickPosition.x && clickPosition.y) {
        // 클릭 위치를 직접 사용 (이미 화면 좌표계)
        x = clickPosition.x;
        y = clickPosition.y;
      } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }
      
      startAnimation(x, y);
    }
  }, [isActive, clickPosition, startAnimation]);

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
      style={{ zIndex: 9999 }}
    />
  );
};

export default FullScreenConfetti; 