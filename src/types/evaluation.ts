
export interface Task {
  id: string;
  title: string;
  description: string;
  weight: number;
  contributionMethod?: string;
  contributionScope?: string;
  score?: number;
  feedback?: string;
}

export interface EvaluationData {
  evaluateeId: string;
  evaluateeName: string;
  evaluateePosition: string;
  evaluateeDepartment: string;
  growthLevel: number;
  evaluationStatus: 'in-progress' | 'completed';
  lastModified: string;
  tasks: Task[];
}
