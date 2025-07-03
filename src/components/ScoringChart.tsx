
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
        return 'w-12 h-12 text-xs';
      case 'large':
        return 'w-20 h-20 text-lg';
      default:
        return 'w-16 h-16 text-sm';
    }
  };

  const isSelected = (methodIndex: number, scopeIndex: number) => {
    return methods[methodIndex] === selectedMethod && scopes[scopeIndex] === selectedScope;
  };

  return (
    <Card className="w-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {/* Header with scope labels */}
          <div className="flex gap-2">
            <div className={`${getCellSize()} flex items-center justify-center font-medium text-xs`}>
              방식/범위
            </div>
            {scopes.map((scope, index) => (
              <div 
                key={scope}
                className={`${getCellSize()} flex items-center justify-center font-medium text-xs ok-bright-gray`}
              >
                {scope}
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          {methods.map((method, methodIndex) => (
            <div key={method} className="flex gap-2">
              {/* Method label */}
              <div className={`${getCellSize()} flex items-center justify-center font-medium text-xs ok-bright-gray`}>
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
                      font-bold rounded-lg border-2 transition-all
                      ${getScoreClass(score)}
                      ${selected ? 'border-black scale-110 shadow-lg' : 'border-transparent'}
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
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-1 rounded"></div>
              <span>1점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-2 rounded"></div>
              <span>2점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-3 rounded"></div>
              <span>3점</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 score-4 rounded"></div>
              <span>4점</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
