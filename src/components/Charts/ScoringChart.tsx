
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface ScoringChartProps {
  contributionType: '총괄' | '리딩' | '실무' | '지원';
  contributionScope: '전략적' | '상호적' | '독립적' | '의존적';
  score: number;
  weight: number;
  taskName: string;
  className?: string;
}

const ScoringChart: React.FC<ScoringChartProps> = ({ 
  contributionType, 
  contributionScope, 
  score, 
  weight, 
  taskName,
  className = "" 
}) => {
  // 점수 매트릭스 정의
  const scoreMatrix = {
    '총괄': { '의존적': 2, '독립적': 3, '상호적': 4, '전략적': 4 },
    '리딩': { '의존적': 2, '독립적': 3, '상호적': 3, '전략적': 4 },
    '실무': { '의존적': 1, '독립적': 2, '상호적': 3, '전략적': 3 },
    '지원': { '의존적': 1, '독립적': 1, '상호적': 2, '전략적': 2 }
  };

  // 현재 기여 유형의 모든 범위별 점수 데이터
  const chartData = Object.entries(scoreMatrix[contributionType]).map(([scope, value]) => ({
    scope,
    score: value,
    isSelected: scope === contributionScope
  }));

  const getScoreColor = (score: number, isSelected: boolean) => {
    if (isSelected) {
      if (score >= 4) return '#10b981'; // green-500
      if (score >= 3) return '#3b82f6'; // blue-500
      if (score >= 2) return '#f59e0b'; // amber-500
      return '#ef4444'; // red-500
    }
    return '#e5e7eb'; // gray-200
  };

  const getContributionTypeColor = (type: string) => {
    switch (type) {
      case '총괄': return 'bg-purple-100 text-purple-700 border-purple-200';
      case '리딩': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '실무': return 'bg-green-100 text-green-700 border-green-200';
      case '지원': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case '전략적': return 'bg-red-100 text-red-700 border-red-200';
      case '상호적': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '독립적': return 'bg-green-100 text-green-700 border-green-200';
      case '의존적': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const chartConfig = {
    score: {
      label: "점수",
    },
  };

  return (
    <Card className={`${className} border-l-4 border-l-blue-500`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate flex-1 mr-2">
            {taskName}
          </CardTitle>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-blue-600">{score}</span>
            <span className="text-xs text-gray-500">점</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={`text-xs ${getContributionTypeColor(contributionType)}`}>
            {contributionType}
          </Badge>
          <Badge className={`text-xs ${getScopeColor(contributionScope)}`}>
            {contributionScope}
          </Badge>
          <Badge variant="outline" className="text-xs">
            가중치 {weight}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-20">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="scope" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getScoreColor(entry.score, entry.isSelected)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {contributionType} 유형의 범위별 점수 분포
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringChart;
