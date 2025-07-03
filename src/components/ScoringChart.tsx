
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoringChartProps {
  selectedScope?: string;
  selectedMethod?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

const ScoringChart: React.FC<ScoringChartProps> = ({ 
  selectedScope, 
  selectedMethod, 
  title = "스코어링 매트릭스",
  size = 'medium'
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

  const getScoreClass = (score: number) => {
    return `score-${score}`;
  };

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

  return (
    <Card className="w-fit border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-center text-orange-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Header with scope labels */}
          <div className="flex gap-1">
            <div className={`${getHeaderSize()} flex items-center justify-center font-medium text-xs ok-bright-gray rounded border`}>
              방식/범위
            </div>
            {scopes.map((scope, index) => (
              <div 
                key={scope}
                className={`${getHeaderSize()} flex items-center justify-center font-medium text-xs ok-bright-gray rounded border text-center leading-tight`}
              >
                {scope}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {methods.map((method, methodIndex) => (
            <div key={method} className="flex gap-1">
              {/* Method label */}
              <div className={`${getHeaderSize()} flex items-center justify-center font-medium text-xs ok-bright-gray rounded border`}>
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
                      font-bold rounded border-2 transition-all
                      ${getScoreClass(score)}
                      ${selected ? 'border-orange-600 scale-110 shadow-lg ring-2 ring-orange-300' : 'border-transparent'}
                    `}
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
              <div className="w-3 h-3 score-1 rounded border"></div>
              <span>1점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-2 rounded border"></div>
              <span>2점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-3 rounded border"></div>
              <span>3점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-4 rounded border"></div>
              <span>4점</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
