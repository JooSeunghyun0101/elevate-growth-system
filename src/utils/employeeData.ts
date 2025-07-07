
// Employee data mapping with positions and growth levels
export const employeeData: Record<string, {name: string, position: string, department: string, growthLevel: number}> = {
  // 차장급 (성장레벨 3)
  'H0908033': { name: '박판근', position: '차장', department: '인사기획팀', growthLevel: 3 },
  'H1310159': { name: '김남엽', position: '차장', department: '인사팀', growthLevel: 3 },
  'H1310172': { name: '이수한', position: '차장', department: '인사기획팀', growthLevel: 3 },
  'H1411166': { name: '주승현', position: '차장', department: '인사기획팀', growthLevel: 3 },
  'H1411231': { name: '최은송', position: '차장', department: '인사팀', growthLevel: 3 },
  // 대리급 (성장레벨 2)
  'H1911042': { name: '김민선', position: '대리', department: '인사기획팀', growthLevel: 2 },
  'H1205006': { name: '황정원', position: '대리', department: '인사팀', growthLevel: 2 },
  'H1501077': { name: '조혜인', position: '대리', department: '인사팀', growthLevel: 2 },
  // 사원급 (성장레벨 1)
  'H2301040': { name: '김민영', position: '사원', department: '인사팀', growthLevel: 1 }
};

export const getEmployeeData = (employeeId: string) => {
  return employeeData[employeeId] || { name: '알 수 없음', position: '사원', department: '알 수 없음', growthLevel: 1 };
};
