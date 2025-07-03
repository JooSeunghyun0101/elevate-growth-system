
import * as XLSX from 'xlsx';
import { ExcelRowData, ValidationError, EvaluatorMapping } from '@/types/evaluatorManagement';
import { getAllEmployees } from './evaluationUtils';

export const readExcelFile = (file: File): Promise<ExcelRowData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Skip header row and convert to ExcelRowData
        const rows = jsonData.slice(1) as any[][];
        const parsedData: ExcelRowData[] = rows
          .filter(row => row.length > 0 && row[0]) // Filter empty rows
          .map(row => ({
            evaluatorName: row[0] || '',
            evaluatorDepartment: row[1] || '',
            evaluatorPosition: row[2] || '',
            evaluateeName: row[3] || '',
            evaluateeDepartment: row[4] || '',
            evaluateePosition: row[5] || '',
            evaluationPeriod: row[6] || '2024년 하반기'
          }));
        
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateExcelData = (data: ExcelRowData[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const employees = getAllEmployees();
  const employeeNames = employees.map(emp => emp.name);
  
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because array is 0-indexed and we skip header
    
    // Required fields validation
    if (!row.evaluatorName.trim()) {
      errors.push({ row: rowNum, field: '평가자명', message: '평가자명은 필수입니다.' });
    }
    if (!row.evaluateeName.trim()) {
      errors.push({ row: rowNum, field: '피평가자명', message: '피평가자명은 필수입니다.' });
    }
    
    // Check if employees exist
    if (row.evaluatorName && !employeeNames.includes(row.evaluatorName)) {
      errors.push({ row: rowNum, field: '평가자명', message: '존재하지 않는 직원입니다.' });
    }
    if (row.evaluateeName && !employeeNames.includes(row.evaluateeName)) {
      errors.push({ row: rowNum, field: '피평가자명', message: '존재하지 않는 직원입니다.' });
    }
    
    // Self-evaluation check
    if (row.evaluatorName === row.evaluateeName) {
      errors.push({ row: rowNum, field: '매칭', message: '평가자와 피평가자가 동일합니다.' });
    }
  });
  
  return errors;
};

export const generateTemplateFile = () => {
  const templateData = [
    ['평가자명', '평가자부서', '평가자직급', '피평가자명', '피평가자부서', '피평가자직급', '평가기간'],
    ['박서준', '개발팀', '팀장', '이하나', '마케팅팀', '사원', '2024년 하반기'],
    ['김민준', '인사팀', '대리', '김대리', '개발팀', '대리', '2024년 하반기']
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws, '평가자매칭');
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
};

export const saveEvaluatorMappings = (mappings: EvaluatorMapping[]) => {
  localStorage.setItem('evaluator-mappings', JSON.stringify(mappings));
};

export const loadEvaluatorMappings = (): EvaluatorMapping[] => {
  const saved = localStorage.getItem('evaluator-mappings');
  return saved ? JSON.parse(saved) : [];
};
