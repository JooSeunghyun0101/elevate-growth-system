
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, Target, Users, Award } from 'lucide-react';

interface EvaluationGuideProps {
  onClose: () => void;
}

const EvaluationGuide: React.FC<EvaluationGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-orange-500" />
              평가 가이드
            </CardTitle>
            <CardDescription>
              효과적인 성과 평가를 위한 가이드라인
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* 점수 체계 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              점수 체계
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">5점 (매우 우수)</span>
                  <Badge className="bg-green-100 text-green-800">탁월</Badge>
                </div>
                <p className="text-sm text-gray-600">기대를 크게 상회하는 성과</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">4점 (우수)</span>
                  <Badge className="bg-blue-100 text-blue-800">우수</Badge>
                </div>
                <p className="text-sm text-gray-600">기대를 상회하는 성과</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">3점 (보통)</span>
                  <Badge className="bg-yellow-100 text-yellow-800">충족</Badge>
                </div>
                <p className="text-sm text-gray-600">기대 수준에 부합하는 성과</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">2점 (개선필요)</span>
                  <Badge className="bg-orange-100 text-orange-800">미흡</Badge>
                </div>
                <p className="text-sm text-gray-600">기대에 미치지 못하는 성과</p>
              </div>
            </div>
          </div>

          {/* 기여방법 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              기여방법
            </h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">주도</Badge>
                <p className="text-sm text-gray-600">업무를 주도적으로 이끌어감</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">참여</Badge>
                <p className="text-sm text-gray-600">업무에 적극적으로 참여함</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">지원</Badge>
                <p className="text-sm text-gray-600">업무를 지원하고 보조함</p>
              </div>
            </div>
          </div>

          {/* 기여범위 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              기여범위
            </h3>
            <div className="grid gap-2 md:grid-cols-4">
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">개인</Badge>
                <p className="text-sm text-gray-600">개인 업무 범위</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">팀</Badge>
                <p className="text-sm text-gray-600">팀 단위 업무</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">부서</Badge>
                <p className="text-sm text-gray-600">부서 단위 업무</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">전사</Badge>
                <p className="text-sm text-gray-600">전사 단위 업무</p>
              </div>
            </div>
          </div>

          {/* 평가 원칙 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">평가 원칙</h3>
            <div className="space-y-2">
              <div className="p-3 ok-bright-gray rounded-lg">
                <p className="font-medium mb-1">🎯 객관적 평가</p>
                <p className="text-sm text-gray-600">구체적인 사실과 결과를 바탕으로 평가합니다.</p>
              </div>
              <div className="p-3 ok-bright-gray rounded-lg">
                <p className="font-medium mb-1">💬 건설적 피드백</p>
                <p className="text-sm text-gray-600">개선점과 발전 방향을 제시하는 피드백을 작성합니다.</p>
              </div>
              <div className="p-3 ok-bright-gray rounded-lg">
                <p className="font-medium mb-1">⚖️ 공정한 기준</p>
                <p className="text-sm text-gray-600">모든 평가 대상자에게 동일한 기준을 적용합니다.</p>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <Button onClick={onClose} className="ok-orange hover:opacity-90">
            확인
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EvaluationGuide;
