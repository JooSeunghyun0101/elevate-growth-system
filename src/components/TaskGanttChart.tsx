
import React from 'react';
import { Task } from '@/types/evaluation';
import { format, differenceInDays, parseISO } from 'date-fns';

interface TaskGanttChartProps {
  tasks: Task[];
}

const TaskGanttChart: React.FC<TaskGanttChartProps> = ({ tasks }) => {
  // Filter tasks that have both start and end dates
  const tasksWithDates = tasks.filter(task => task.startDate && task.endDate);
  
  if (tasksWithDates.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        과업 기간이 설정된 항목이 없습니다.
      </div>
    );
  }

  // Find the earliest start date and latest end date
  const allDates = tasksWithDates.flatMap(task => [
    parseISO(task.startDate!),
    parseISO(task.endDate!)
  ]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = differenceInDays(maxDate, minDate);

  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] space-y-2">
        {/* Header with date range */}
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>{format(minDate, 'yyyy-MM-dd')}</span>
          <span>{format(maxDate, 'yyyy-MM-dd')}</span>
        </div>
        
        {/* Tasks */}
        {tasksWithDates.map((task, index) => {
          const startDate = parseISO(task.startDate!);
          const endDate = parseISO(task.endDate!);
          const taskDays = differenceInDays(endDate, startDate);
          const startOffset = differenceInDays(startDate, minDate);
          
          const leftPercent = totalDays > 0 ? (startOffset / totalDays) * 100 : 0;
          const widthPercent = totalDays > 0 ? (taskDays / totalDays) * 100 : 100;
          
          return (
            <div key={task.id} className="flex items-center space-x-4">
              <div className="w-48 text-sm pr-2" title={task.title}>
                <div className="truncate">{task.title}</div>
              </div>
              <div className="flex-1 relative bg-gray-100 h-6 rounded min-w-0">
                <div
                  className={`absolute h-full rounded ${colors[index % colors.length]} opacity-80`}
                  style={{
                    left: `${Math.max(0, leftPercent)}%`,
                    width: `${Math.min(100 - Math.max(0, leftPercent), widthPercent)}%`
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium">
                  {taskDays + 1}일
                </div>
              </div>
              <div className="text-xs text-gray-500 w-24 text-right">
                {format(startDate, 'MM/dd')} - {format(endDate, 'MM/dd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskGanttChart;
