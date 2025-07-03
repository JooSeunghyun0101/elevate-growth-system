
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const methods = ['총괄', '리딩', '실무', '지원'];
  const scopes = ['의존적', '독립적', '상호적', '전략적'];

  const scoreMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];

  const getCellSize = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10 text-xs';
      case 'large':
        return 'w-20 h-20 text-lg';
      default:
        return 'w-14 h-14 text-sm';
    }
  };

  const getHeaderSize = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10 text-xs';
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

  return (
    <Card className="w-fit border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-center text-orange-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Header with method label only */}
          <div className="flex gap-1">
            <div className={`${getHeaderSize()} flex items-center justify-center font-bold text-xs bg-gray-300 text-gray-900 rounded border`}>
              기여방식
            </div>
            {/* Empty cells for alignment */}
            {scopes.map((_, index) => (
              <div key={index} className={`${getHeaderSize()}`}></div>
            ))}
          </div>

          {/* Matrix rows */}
          {methods.map((method, methodIndex) => (
            <div key={method} className="flex gap-1">
              {/* Method label */}
              <div className={`
                ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border cursor-pointer transition-all
                ${isMethodSelected(methodIndex) 
                  ? 'bg-orange-500 text-white border-orange-600 border-2 shadow-lg transform scale-105' 
                  : 'bg-orange-200 text-gray-900 hover:bg-orange-300'
                }
              `}
              onClick={() => handleMethodClick(methodIndex)}
              >
                {method}
              </div>
              
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

          {/* Scope header at the bottom */}
          <div className="flex gap-1 mt-1">
            <div className={`${getHeaderSize()}`}></div>
            {scopes.map((scope, index) => (
              <div 
                key={scope}
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
            ))}
          </div>
          
          {/* Bottom label for scope */}
          <div className="flex gap-1">
            <div className={`${getHeaderSize()}`}></div>
            <div className={`flex-1 flex items-center justify-center font-bold text-xs bg-gray-300 text-gray-900 rounded border`}>
              기여범위
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <span>기여방식 (클릭)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-200 rounded"></div>
              <span>기여범위 (클릭)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-500 rounded"></div>
              <span>선택된 조합</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
