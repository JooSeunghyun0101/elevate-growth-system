
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, Target, Users, Award, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface EvaluationGuideProps {
  onClose: () => void;
}

const EvaluationGuide: React.FC<EvaluationGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6 flex-shrink-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              평가 가이드
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              효과적인 성과 평가를 위한 상세 가이드라인
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* 평가기준 */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              평가기준
            </h3>
            <div className="space-y-3">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-sm sm:text-base mb-3 text-orange-800">성장레벨별 역할 기준</h4>
                <div className="grid gap-2 sm:gap-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-amber-100 text-amber-800 text-xs flex-shrink-0">Lv.1</Badge>
                    <p className="text-xs sm:text-sm text-gray-700">기본 업무 수행 능력을 갖추고, 주어진 과업을 성실히 완수하는 단계</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">Lv.2</Badge>
                    <p className="text-xs sm:text-sm text-gray-700">독립적 업무 수행과 팀 내 협업을 통해 상호적 성과를 창출하는 단계</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-red-100 text-red-800 text-xs flex-shrink-0">Lv.3</Badge>
                    <p className="text-xs sm:text-sm text-gray-700">전략적 사고와 리딩 역할을 통해 조직 전체에 영향을 미치는 단계</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-purple-100 text-purple-800 text-xs flex-shrink-0">Lv.4</Badge>
                    <p className="text-xs sm:text-sm text-gray-700">총괄적 관리와 전략적 의사결정을 통해 조직의 방향을 이끄는 단계</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-sm sm:text-base mb-3 text-blue-800">수시 성과관리체계</h4>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-gray-700">
                    • <strong>지속적 모니터링:</strong> 과업 진행 상황을 실시간으로 추적하고 관리
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    • <strong>정기적 피드백:</strong> 수시 성과보고를 통한 양방향 소통과 개선점 도출
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    • <strong>적응적 목표 조정:</strong> 변화하는 환경에 맞춰 과업과 목표를 유연하게 조정
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    • <strong>성장 중심 평가:</strong> 결과뿐만 아니라 과정과 학습을 중시하는 발전적 평가
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 평가 절차 */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              평가 절차
            </h3>
            <div className="grid gap-2 sm:gap-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-orange-600">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm sm:text-base mb-1">과업 검토</h4>
                  <p className="text-xs sm:text-sm text-gray-600">피평가자의 과업 목록과 가중치를 확인합니다. 필요시 과업 관리에서 수정할 수 있습니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-orange-600">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm sm:text-base mb-1">기여방식 평가</h4>
                  <p className="text-xs sm:text-sm text-gray-600">각 과업에 대해 피평가자의 기여방식(총괄/리딩/실무/지원)을 선택합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-orange-600">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm sm:text-base mb-1">기여범위 평가</h4>
                  <p className="text-xs sm:text-sm text-gray-600">과업의 영향 범위(전략적/상호적/독립적/의존적)를 평가합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-orange-600">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm sm:text-base mb-1">피드백 작성</h4>
                  <p className="text-xs sm:text-sm text-gray-600">구체적이고 건설적인 피드백을 작성하여 성장 방향을 제시합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm sm:text-base mb-1">평가 완료</h4>
                  <p className="text-xs sm:text-sm text-gray-600">모든 과업 평가 완료 후 저장하여 평가를 마무리합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 점수 매트릭스 */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              점수 매트릭스
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 sm:p-3 text-left border-b">기여방식 \ 기여범위</th>
                    <th className="p-2 sm:p-3 text-center border-b">전략적</th>
                    <th className="p-2 sm:p-3 text-center border-b">상호적</th>
                    <th className="p-2 sm:p-3 text-center border-b">독립적</th>
                    <th className="p-2 sm:p-3 text-center border-b">의존적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 sm:p-3 font-medium border-b">총괄</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-orange-300">4점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-orange-200">4점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-orange-100">3점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-orange-50">2점</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-medium border-b">리딩</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-blue-300">4점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-blue-200">3점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-blue-100">2점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-blue-50">1점</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-medium border-b">실무</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-green-200">3점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-green-100">2점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-green-50">1점</td>
                    <td className="p-2 sm:p-3 text-center border-b bg-green-50">1점</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-medium">지원</td>
                    <td className="p-2 sm:p-3 text-center bg-gray-100">2점</td>
                    <td className="p-2 sm:p-3 text-center bg-gray-50">1점</td>
                    <td className="p-2 sm:p-3 text-center bg-gray-50">1점</td>
                    <td className="p-2 sm:p-3 text-center bg-gray-50">1점</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 기여방식 상세 설명 */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              기여방식 상세
            </h3>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-100 text-orange-800 text-xs">총괄</Badge>
                  <span className="text-xs sm:text-sm font-medium">업무 전체를 책임지고 관리</span>
                </div>
                <p className="text-xs text-gray-600">프로젝트나 업무의 전체적인 방향을 설정하고 다른 구성원들을 이끌어 목표를 달성하는 역할</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">리딩</Badge>
                  <span className="text-xs sm:text-sm font-medium">특정 영역을 주도적으로 담당</span>
                </div>
                <p className="text-xs text-gray-600">업무의 특정 부분에서 주도적인 역할을 하며, 해당 영역의 성과에 직접적인 책임을 지는 역할</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">실무</Badge>
                  <span className="text-xs sm:text-sm font-medium">핵심 업무를 직접 수행</span>
                </div>
                <p className="text-xs text-gray-600">주어진 업무를 성실히 수행하며, 업무의 질적 완성도에 기여하는 역할</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">지원</Badge>
                  <span className="text-xs sm:text-sm font-medium">다른 구성원을 보조하고 지원</span>
                </div>
                <p className="text-xs text-gray-600">주 담당자를 보조하여 업무가 원활히 진행될 수 있도록 돕는 역할</p>
              </div>
            </div>
          </div>

          {/* 기여범위 상세 설명 - 순서 변경 */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              기여범위 상세
            </h3>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">전략적</Badge>
                  <span className="text-xs sm:text-sm font-medium">조직 전체에 영향</span>
                </div>
                <p className="text-xs text-gray-600">부서를 넘어 조직 전체의 방향성이나 성과에 영향을 미치는 범위</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">상호적</Badge>
                  <span className="text-xs sm:text-sm font-medium">팀 단위 협업</span>
                </div>
                <p className="text-xs text-gray-600">팀 내 다른 구성원들과 긴밀히 협력하여 공동의 목표를 달성하는 범위</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">독립적</Badge>
                  <span className="text-xs sm:text-sm font-medium">자율적 업무 수행</span>
                </div>
                <p className="text-xs text-gray-600">개인의 판단과 책임 하에 독립적으로 업무를 기획하고 실행하는 범위</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">의존적</Badge>
                  <span className="text-xs sm:text-sm font-medium">지시받은 업무 수행</span>
                </div>
                <p className="text-xs text-gray-600">상급자나 동료의 지시나 가이드라인에 따라 업무를 수행하는 범위</p>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t bg-gray-50 flex-shrink-0 p-4 sm:p-6">
          <Button onClick={onClose} className="ok-orange hover:opacity-90 w-full sm:w-auto sm:ml-auto flex">
            확인
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EvaluationGuide;
