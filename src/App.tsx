
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProviderDB } from "@/contexts/NotificationContextDB";
import ProtectedRoute from "@/components/ProtectedRoute";
import FullScreenConfetti from "@/components/Evaluation/FullScreenConfetti";
import RainAnimation from "@/components/Evaluation/RainAnimation";
import ThumbsUpEffect from "@/components/Evaluation/ThumbsUpEffect";
import { useState, useCallback, useEffect, useRef } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Evaluation from "./pages/Evaluation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showFullScreenConfetti, setShowFullScreenConfetti] = useState(false);
  const [showRainAnimation, setShowRainAnimation] = useState(false);
  const [isNotAchieved, setIsNotAchieved] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [rainPosition, setRainPosition] = useState({ x: 0, y: 0 });
  const [thumbsUpEffects, setThumbsUpEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const thumbsUpIdRef = useRef(0);

  const handleConfettiComplete = useCallback(() => {
    setShowFullScreenConfetti(false);
  }, []);

  // 왕따봉 효과 제거 함수
  const removeThumbsUpEffect = useCallback((id: number) => {
    setThumbsUpEffects(prev => prev.filter(effect => effect.id !== id));
  }, []);

  const handleGlobalClick = useCallback((e: React.MouseEvent) => {
    // 특정 요소 클릭 시에만 폭죽 효과 활성화
    const target = e.target as HTMLElement;
    const confettiTrigger = target.closest('[data-confetti-trigger]');
    const notAchievedTrigger = target.closest('[data-not-achieved]');
    
    if (confettiTrigger) {
      // 달성 카드 클릭 시 폭죽 효과와 왕따봉 효과
      setConfettiPosition({ x: e.clientX, y: e.clientY });
      setShowFullScreenConfetti(true);
      
      // 새로운 왕따봉 효과 추가
      const newId = thumbsUpIdRef.current++;
      const newEffect = { id: newId, x: e.clientX, y: e.clientY };
      
      setThumbsUpEffects(prev => [...prev, newEffect]);
      
      // 2초 후 해당 왕따봉 효과 제거
      setTimeout(() => {
        removeThumbsUpEffect(newId);
      }, 2000);
    } else if (notAchievedTrigger) {
      // 미달성 카드 클릭 시 비 애니메이션 강화
      setRainPosition({ x: e.clientX, y: e.clientY });
      
      // 기존 비 애니메이션을 중지하고 새로 시작
      setShowRainAnimation(false);
      setTimeout(() => {
        setShowRainAnimation(true);
      }, 50);
      
      // 5초 후 비 애니메이션 중지 (더 자연스러운 종료를 위해)
      setTimeout(() => {
        setShowRainAnimation(false);
      }, 5000);
    }
  }, [removeThumbsUpEffect]);

  // 미달성 상태 감지 (비 애니메이션은 클릭 시에만 활성화)
  useEffect(() => {
    const checkNotAchieved = () => {
      const notAchievedElements = document.querySelectorAll('[data-not-achieved="true"]');
      if (notAchievedElements.length > 0) {
        setIsNotAchieved(true);
        // 자동으로 비 애니메이션을 시작하지 않음 (클릭 시에만)
        // setShowRainAnimation(true);
      } else {
        setIsNotAchieved(false);
        setShowRainAnimation(false);
      }
    };

    // 초기 체크
    checkNotAchieved();

    // DOM 변화 감지
    const observer = new MutationObserver(checkNotAchieved);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-not-achieved']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <NotificationProviderDB>
            <div onClick={handleGlobalClick}>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Login />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/evaluation/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['evaluator']}>
                        <Evaluation />
                      </ProtectedRoute>
                    } 
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              
              {/* 전체 화면 폭죽 효과 */}
              <FullScreenConfetti 
                isActive={showFullScreenConfetti}
                onAnimationComplete={handleConfettiComplete}
                clickPosition={confettiPosition}
              />
              
              {/* 비 애니메이션 (미달성 시) */}
              <RainAnimation 
                isActive={showRainAnimation}
                clickPosition={rainPosition}
              />
              
              {/* 왕따봉 효과들 (달성 시) */}
              {thumbsUpEffects.map(effect => (
                <ThumbsUpEffect 
                  key={effect.id}
                  isActive={true}
                  clickPosition={{ x: effect.x, y: effect.y }}
                />
              ))}
            </div>
          </NotificationProviderDB>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
