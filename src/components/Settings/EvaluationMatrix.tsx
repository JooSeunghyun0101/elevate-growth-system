
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/lib/database';
import { X, Save } from 'lucide-react';

interface EvaluationMatrixProps {
  onClose: () => void;
}

export const EvaluationMatrix: React.FC<EvaluationMatrixProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Default matrix from evaluation logic
  const defaultMatrix = [
    [2, 3, 4, 4], // 총괄
    [1, 2, 3, 4], // 리딩
    [1, 1, 2, 3], // 실무
    [1, 1, 1, 2]  // 지원
  ];
  
  const [matrix, setMatrix] = useState(defaultMatrix);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 DB에서 설정 로드
  useEffect(() => {
    const loadMatrix = async () => {
      if (!user) return;

      try {
        console.log('🔍 평가 매트릭스 로딩 시작...');
        const setting = await settingsService.getUserSetting(user.employeeId, 'evaluation_matrix');
        
        if (setting && setting.setting_data) {
          setMatrix(setting.setting_data);
          console.log('✅ 저장된 매트릭스 로드 완료');
        } else {
          console.log('📝 기본 매트릭스 사용');
        }
      } catch (error) {
        console.error('❌ 매트릭스 로딩 실패:', error);
        // 에러 발생 시 기본 매트릭스 사용
      } finally {
        setIsLoading(false);
      }
    };

    loadMatrix();
  }, [user]);

  const contributionMethods = ['총괄', '리딩', '실무', '지원'];
  const contributionScopes = ['의존적', '독립적', '상호적', '전략적'];

  const handleMatrixChange = (methodIndex: number, scopeIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0 || numValue > 4) return;
    
    const newMatrix = matrix.map((row, i) => 
      i === methodIndex 
        ? row.map((cell, j) => j === scopeIndex ? numValue : cell)
        : row
    );
    setMatrix(newMatrix);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      console.log('💾 평가 매트릭스 저장 시작...');
      
      await settingsService.saveSetting(user.employeeId, 'evaluation_matrix', matrix);
      
      toast({
        title: "매트릭스 저장 완료",
        description: "평가 매트릭스가 성공적으로 저장되었습니다.",
      });
      
      console.log('✅ 평가 매트릭스 저장 완료');
    } catch (error) {
      console.error('❌ 매트릭스 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "평가 매트릭스 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setMatrix(defaultMatrix);
    toast({
      title: "매트릭스 초기화",
      description: "기본 매트릭스로 초기화되었습니다.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">평가 매트릭스 설정</h2>
            <p className="text-muted-foreground">데이터를 로딩 중입니다...</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            닫기
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">평가 매트릭스 설정</h2>
          <p className="text-muted-foreground">기여 방식과 범위에 따른 점수 매트릭스를 설정하세요</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          닫기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>점수 매트릭스</CardTitle>
          <CardDescription>
            각 기여 방식과 범위의 조합에 따른 점수를 설정합니다 (1-4점)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left font-medium">
                    기여 방식 \ 기여 범위
                  </th>
                  {contributionScopes.map((scope, index) => (
                    <th key={index} className="border border-gray-300 p-3 text-center font-medium">
                      {scope}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributionMethods.map((method, methodIndex) => (
                  <tr key={methodIndex}>
                    <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                      {method}
                    </td>
                    {contributionScopes.map((scope, scopeIndex) => (
                      <td key={scopeIndex} className="border border-gray-300 p-2">
                        <Input
                          type="number"
                          min="1"
                          max="4"
                          value={matrix[methodIndex][scopeIndex]}
                          onChange={(e) => handleMatrixChange(methodIndex, scopeIndex, e.target.value)}
                          className="w-full text-center"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleReset}>
              기본값으로 초기화
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>매트릭스 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">기여 방식</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>총괄:</strong> 프로젝트나 업무를 전체적으로 주도하고 관리</li>
              <li><strong>리딩:</strong> 팀이나 그룹을 이끌며 방향성 제시</li>
              <li><strong>실무:</strong> 구체적인 업무 실행과 결과물 생성</li>
              <li><strong>지원:</strong> 다른 업무나 팀을 보조하고 지원</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">기여 범위</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>의존적:</strong> 다른 사람의 도움이나 지시가 필요한 수준</li>
              <li><strong>독립적:</strong> 혼자서 업무를 완수할 수 있는 수준</li>
              <li><strong>상호적:</strong> 타 부서나 팀과 협력하여 진행하는 수준</li>
              <li><strong>전략적:</strong> 조직 전체에 영향을 미치는 전략적 수준</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
