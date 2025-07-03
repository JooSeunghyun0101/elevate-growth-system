
export interface EvaluatorMapping {
  id: string;
  evaluatorName: string;
  evaluatorDepartment: string;
  evaluatorPosition: string;
  evaluateeName: string;
  evaluateeDepartment: string;
  evaluateePosition: string;
  evaluationPeriod: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface ExcelRowData {
  evaluatorName: string;
  evaluatorDepartment: string;
  evaluatorPosition: string;
  evaluateeName: string;
  evaluateeDepartment: string;
  evaluateePosition: string;
  evaluationPeriod?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}
