
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoringChartProps {
  selectedScope?: string;
  selectedMethod?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  onCellClick?: (method: string, scope: string, score: number) => void;
}

const ScoringChart: React.FC<ScoringChartProps> = ({ 
  selectedScope, 
  selectedMethod, 
  title = "스코어링 매트릭스",
  size = 'medium',
  onCellClick
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

  const isSelected = (methodIndex: number, scopeIndex: number) => {
    return methods[methodIndex] === selectedMethod && scopes[scopeIndex] === selectedScope;
  };

  const isMethodSelected = (methodIndex: number) => {
    return methods[methodIndex] === selectedMethod;
  };

  const isScopeSelected = (scopeIndex: number) => {
    return scopes[scopeIndex] === selectedScope;
  };

  const handleCellClick = (methodIndex: number, scopeIndex: number) => {
    if (onCellClick) {
      const method = methods[methodIndex];
      const scope = scopes[scopeIndex];
      const score = scoreMatrix[methodIndex][scopeIndex];
      onCellClick(method, scope, score);
    }
  };

  return (
    <Card className="w-fit border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-center text-orange-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Header with scope labels */}
          <div className="flex gap-1">
            <div className={`${getHeaderSize()} flex items-center justify-center font-bold text-xs bg-gray-300 text-gray-900 rounded border`}>
              방식/범위
            </div>
            {scopes.map((scope, index) => (
              <div 
                key={scope}
                className={`
                  ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border text-center leading-tight
                  ${isScopeSelected(index) 
                    ? 'bg-amber-400 text-gray-900 border-amber-500 border-2 shadow-lg' 
                    : 'bg-amber-200 text-gray-900'
                  }
                `}
              >
                {scope}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {methods.map((method, methodIndex) => (
            <div key={method} className="flex gap-1">
              {/* Method label */}
              <div className={`
                ${getHeaderSize()} flex items-center justify-center font-bold text-xs rounded border
                ${isMethodSelected(methodIndex) 
                  ? 'bg-orange-400 text-gray-900 border-orange-500 border-2 shadow-lg' 
                  : 'bg-orange-200 text-gray-900'
                }
              `}>
                {method}
              </div>
              
              {/* Score cells */}
              {scopes.map((scope, scopeIndex) => {
                const score = scoreMatrix[methodIndex][scopeIndex];
                const selected = isSelected(methodIndex, scopeIndex);
                
                return (
                  <div
                    key={`${method}-${scope}`}
                    className={`
                      ${getCellSize()} 
                      flex items-center justify-center 
                      font-bold rounded border-2 transition-all cursor-pointer
                      bg-white text-gray-700 hover:bg-gray-50
                      ${selected ? 'border-orange-600 scale-110 shadow-lg ring-2 ring-orange-300' : 'border-gray-300 hover:border-orange-300'}
                    `}
                    onClick={() => handleCellClick(methodIndex, scopeIndex)}
                  >
                    {score}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
              <span>점수 표 (클릭 가능)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <span>기여방식</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-200 rounded"></div>
              <span>기여범위</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
