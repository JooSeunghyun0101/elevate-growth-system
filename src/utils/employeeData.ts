
import { employeeService } from '@/lib/database';

// Legacy function to maintain compatibility with existing code
export const getEmployeeData = async (employeeId: string) => {
  try {
    const employee = await employeeService.getEmployeeById(employeeId);
    if (employee) {
      return {
        name: employee.name,
        position: employee.position,
        department: employee.department,
        growthLevel: employee.growth_level || 1
      };
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
  
  return { name: '알 수 없음', position: '사원', department: '알 수 없음', growthLevel: 1 };
};

// Synchronous version for backward compatibility (with fallback data)
export const getEmployeeDataSync = (employeeId: string) => {
  // This is a fallback for places that need immediate data
  // In a real app, you'd want to refactor these to use async/await
  const fallbackData: Record<string, {name: string, position: string, department: string, growthLevel: number}> = {
    'H0908033': { name: '박판근', position: '차장', department: '인사기획팀', growthLevel: 3 },
    'H1310159': { name: '김남엽', position: '차장', department: '인사팀', growthLevel: 3 },
    'H1310172': { name: '이수한', position: '차장', department: '인사기획팀', growthLevel: 3 },
    'H1411166': { name: '주승현', position: '차장', department: '인사기획팀', growthLevel: 3 },
    'H1411231': { name: '최은송', position: '차장', department: '인사팀', growthLevel: 3 },
    'H1911042': { name: '김민선', position: '대리', department: '인사기획팀', growthLevel: 2 },
    'H1205006': { name: '황정원', position: '대리', department: '인사팀', growthLevel: 2 },
    'H1501077': { name: '조혜인', position: '대리', department: '인사팀', growthLevel: 2 },
    'H2301040': { name: '김민영', position: '사원', department: '인사팀', growthLevel: 1 }
  };
  
  return fallbackData[employeeId] || { name: '알 수 없음', position: '사원', department: '알 수 없음', growthLevel: 1 };
};
