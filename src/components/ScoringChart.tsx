
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getContributionTooltip } from '@/utils/evaluationUtils';

interface ScoringChartProps {
  selectedScope?: string;
  selectedMethod?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  onMethodClick?: (method: string) => void;
  onScopeClick?: (scope: string) => void;
}

const ScoringChart: React.FC<ScoringChartProps> = ({ 
  selectedScope, 
  selectedMethod, 
  title = "스코어링 매트릭스",
  size = 'medium',
  onMethodClick,
  onScopeClick
}) => {
  // 기여 방식 (Y축)
  const methods = ['총괄', '리딩', '실무', '지원'];
  
  // 기여 범위 (X축)  
  const scopes = ['의존적', '독립적', '상호적', '전략적'];

  // 점수 매트릭스 (방식 x 범위)
  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

  const getCellSize = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs';
      case 'large':
        return 'w-20 h-20 text-lg';
      default:
        return 'w-14 h-14 text-sm';
    }
  };

  const getHeaderSize = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs';
      case 'large':
        return 'w-20 h-20 text-base';
      default:
        return 'w-14 h-14 text-xs';
    }
  };

  const isMethodSelected = (methodIndex: number) => {
    return methods[methodIndex] === selectedMethod;
  };

  const isScopeSelected = (scopeIndex: number) => {
    return scopes[scopeIndex] === selectedScope;
  };

  const isCellHighlighted = (methodIndex: number, scopeIndex: number) => {
    return methods[methodIndex] === selectedMethod && scopes[scopeIndex] === selectedScope;
  };

  const isNoContributionSelected = () => {
    return selectedMethod === '기여없음' && selectedScope === '기여없음';
  };

  const handleMethodClick = (methodIndex: number) => {
    if (onMethodClick) {
      const method = methods[methodIndex];
      onMethodClick(method);
    }
  };

  const handleScopeClick = (scopeIndex: number) => {
    if (onScopeClick) {
      const scope = scopes[scopeIndex];
      onScopeClick(scope);
    }
  };

  const handleNoContributionClick = () => {
    if (onMethodClick && onScopeClick) {
      onMethodClick('기여없음');
      onScopeClick('기여없음');
    }
  };

  return (
    <Card className="w-fit border-orange-200 max-w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-center text-orange-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          {/* Matrix rows with method labels */}
          {methods.map((method, methodIndex) => (
            <div key={method} className="flex gap-1">
              {/* Method label */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`
                    ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border cursor-pointer transition-all text-center leading-tight
                    ${isMethodSelected(methodIndex) 
                      ? 'bg-orange-500 text-white border-orange-600 border-2 shadow-lg transform scale-105' 
                      : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                    }
                  `}
                  onClick={() => handleMethodClick(methodIndex)}
                  >
                    {method}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 bg-orange-50 border-orange-200 shadow-lg">
                  <p className="text-sm text-orange-900 leading-relaxed">
                    {getContributionTooltip('method', method)}
                  </p>
                </TooltipContent>
              </Tooltip>
              
              {/* Score cells */}
              {scopes.map((scope, scopeIndex) => {
                const score = scoreMatrix[methodIndex][scopeIndex];
                const highlighted = isCellHighlighted(methodIndex, scopeIndex);
                
                return (
                  <div
                    key={`${method}-${scope}`}
                    className={`
                      ${getCellSize()} 
                      flex items-center justify-center 
                      font-bold rounded border-2 transition-all
                      ${highlighted 
                        ? 'bg-green-100 text-green-800 border-green-500 scale-110 shadow-lg ring-2 ring-green-300' 
                        : 'bg-white text-gray-500 border-gray-200'
                      }
                    `}
                  >
                    {score}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Header row at bottom */}
          <div className="flex gap-1 mt-1">
            <div 
              className={`
                ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border cursor-pointer transition-all text-center leading-tight
                ${isNoContributionSelected() 
                  ? 'bg-red-500 text-white border-red-600 border-2 shadow-lg transform scale-105' 
                  : 'bg-red-200 text-gray-900 hover:bg-red-300'
                }
              `}
              onClick={handleNoContributionClick}
            >
              기여없음
            </div>
            {scopes.map((scope, index) => (
              <Tooltip key={scope}>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border text-center leading-tight cursor-pointer transition-all
                      ${isScopeSelected(index) 
                        ? 'bg-amber-500 text-white border-amber-600 border-2 shadow-lg transform scale-105' 
                        : 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                      }
                    `}
                    onClick={() => handleScopeClick(index)}
                  >
                    {scope}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 bg-amber-50 border-amber-200 shadow-lg">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {getContributionTooltip('scope', scope)}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
