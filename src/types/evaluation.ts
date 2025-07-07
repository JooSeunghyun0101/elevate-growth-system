
export interface FeedbackHistoryItem {
  id: string;
  content: string;
  date: string;
  evaluatorName: string;
  evaluatorId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  weight: number;
  startDate?: string;
  endDate?: string;
  contributionMethod?: string;
  contributionScope?: string;
  score?: number;
  feedback?: string;
  feedbackHistory?: FeedbackHistoryItem[];
  feedbackDate?: string;
  lastModified?: string;
  evaluatorName?: string;
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
