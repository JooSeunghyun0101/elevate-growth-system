
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { X, Download, FileText, Calendar } from 'lucide-react';
import { loadAllEvaluationData, getAllEmployees } from '@/utils/evaluationUtils';
import * as XLSX from 'xlsx';

interface DataExportProps {
  onClose: () => void;
}

export const DataExport: React.FC<DataExportProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState({
    evaluationData: true,
    employeeInfo: true,
    feedbackData: true,
    statisticsData: false
  });

  const handleOptionChange = (option: keyof typeof exportOptions, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      if (exportOptions.employeeInfo) {
        const employees = getAllEmployees();
        const employeeSheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
          '직원ID': emp.id,
          '이름': emp.name,
          '직급': emp.position,
          '부서': emp.department,
          '성장레벨': emp.growthLevel
        })));
        XLSX.utils.book_append_sheet(wb, employeeSheet, '직원정보');
      }

      if (exportOptions.evaluationData) {
        const evaluations = loadAllEvaluationData();
        const evaluationSheet = XLSX.utils.json_to_sheet(evaluations.map(eval => ({
          '피평가자ID': eval.evaluateeId,
          '피평가자명': eval.evaluateeName,
          '직급': eval.evaluateePosition,
          '부서': eval.evaluateeDepartment,
          '성장레벨': eval.growthLevel,
          '평가상태': eval.evaluationStatus === 'completed' ? '완료' : '진행중',
          '최종수정일': new Date(eval.lastModified).toLocaleDateString('ko-KR'),
          '총점수': eval.tasks.reduce((sum, task) => sum + (task.score ? (task.score * task.weight / 100) : 0), 0).toFixed(1),
          '달성여부': eval.tasks.reduce((sum, task) => sum + (task.score ? (task.score * task.weight / 100) : 0), 0) >= eval.growthLevel ? '달성' : '미달성'
        })));
        XLSX.utils.book_append_sheet(wb, evaluationSheet, '평가현황');
      }

      if (exportOptions.feedbackData) {
        const evaluations = loadAllEvaluationData();
        const feedbacks: any[] = [];
        
        evaluations.forEach(eval => {
          eval.tasks.forEach(task => {
            if (task.feedback) {
              feedbacks.push({
                '피평가자명': eval.evaluateeName,
                '부서': eval.evaluateeDepartment,
                '과업명': task.title,
                '점수': task.score || 0,
                '가중치': task.weight,
                '기여방식': task.contributionMethod || '',
                '기여범위': task.contributionScope || '',
                '피드백': task.feedback,
                '평가자': task.evaluatorName || '평가자 미확인',
                '피드백일시': task.feedbackDate ? new Date(task.feedbackDate).toLocaleDateString('ko-KR') : ''
              });
            }
          });
        });
        
        const feedbackSheet = XLSX.utils.json_to_sheet(feedbacks);
        XLSX.utils.book_append_sheet(wb, feedbackSheet, '피드백내역');
      }

      if (exportOptions.statisticsData) {
        const evaluations = loadAllEvaluationData();
        const employees = getAllEmployees();
        
        // Department statistics
        const deptStats = employees.reduce((acc, emp) => {
          if (!acc[emp.department]) {
            acc[emp.department] = { total: 0, completed: 0 };
          }
          acc[emp.department].total++;
          return acc;
        }, {} as Record<string, { total: number; completed: number }>);
        
        evaluations.forEach(eval => {
          if (eval.evaluationStatus === 'completed') {
            deptStats[eval.evaluateeDepartment].completed++;
          }
        });
        
        const statsData = Object.entries(deptStats).map(([dept, stats]) => ({
          '부서': dept,
          '전체인원': stats.total,
          '완료인원': stats.completed,
          '완료율': `${Math.round((stats.completed / stats.total) * 100)}%`
        }));
        
        const statsSheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, statsSheet, '부서별통계');
      }

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `평가데이터_${today}.xlsx`);
      
      toast({
        title: "데이터 내보내기 완료",
        description: "Excel 파일이 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "내보내기 실패",
        description: "데이터 내보내기 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const exportReports = () => {
    try {
      const evaluations = loadAllEvaluationData();
      const employees = getAllEmployees();
      
      // Generate summary report data
      const totalEmployees = employees.length;
      const completedEvaluations = evaluations.filter(e => e.evaluationStatus === 'completed').length;
      const achievedCount = evaluations.filter(eval => {
        const totalScore = eval.tasks.reduce((sum, task) => sum + (task.score ? (task.score * task.weight / 100) : 0), 0);
        return Math.floor(totalScore) >= eval.growthLevel;
      }).length;
      
      const reportData = {
        reportDate: new Date().toLocaleDateString('ko-KR'),
        totalEmployees,
        completedEvaluations,
        completionRate: `${Math.round((completedEvaluations / totalEmployees) * 100)}%`,
        achievedCount,
        achievementRate: completedEvaluations > 0 ? `${Math.round((achievedCount / completedEvaluations) * 100)}%` : '0%'
      };
      
      const wb = XLSX.utils.book_new();
      const reportSheet = XLSX.utils.json_to_sheet([{
        '보고서 생성일': reportData.reportDate,
        '전체 직원 수': reportData.totalEmployees,
        '평가 완료 수': reportData.completedEvaluations,
        '평가 완료율': reportData.completionRate,
        '목표 달성 수': reportData.achievedCount,
        '목표 달성률': reportData.achievementRate
      }]);
      
      XLSX.utils.book_append_sheet(wb, reportSheet, '요약보고서');
      
      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `평가보고서_${today}.xlsx`);
      
      toast({
        title: "보고서 생성 완료",
        description: "요약 보고서가 성공적으로 생성되었습니다.",
      });
    } catch (error) {
      toast({
        title: "보고서 생성 실패",
        description: "보고서 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">데이터 내보내기</h2>
          <p className="text-muted-foreground">평가 데이터를 백업하고 리포트를 생성하세요</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          닫기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            데이터 선택
          </CardTitle>
          <CardDescription>내보낼 데이터를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluationData"
              checked={exportOptions.evaluationData}
              onCheckedChange={(checked) => handleOptionChange('evaluationData', checked as boolean)}
            />
            <label htmlFor="evaluationData" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              평가 현황 데이터
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="employeeInfo"
              checked={exportOptions.employeeInfo}
              onCheckedChange={(checked) => handleOptionChange('employeeInfo', checked as boolean)}
            />
            <label htmlFor="employeeInfo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              직원 정보
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="feedbackData"
              checked={exportOptions.feedbackData}
              onCheckedChange={(checked) => handleOptionChange('feedbackData', checked as boolean)}
            />
            <label htmlFor="feedbackData" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              피드백 내역
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="statisticsData"
              checked={exportOptions.statisticsData}
              onCheckedChange={(checked) => handleOptionChange('statisticsData', checked as boolean)}
            />
            <label htmlFor="statisticsData" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              부서별 통계
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              상세 데이터 내보내기
            </CardTitle>
            <CardDescription>선택한 데이터를 Excel 파일로 내보냅니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportToExcel} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Excel로 내보내기
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              요약 보고서
            </CardTitle>
            <CardDescription>전체 평가 현황 요약 보고서를 생성합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportReports} variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              보고서 생성
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
