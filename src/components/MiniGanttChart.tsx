
import React from 'react';
import { Task } from '@/types/evaluation';
import { format, differenceInDays, parseISO } from 'date-fns';

interface MiniGanttChartProps {
  tasks: Task[];
  className?: string;
}

const MiniGanttChart: React.FC<MiniGanttChartProps> = ({ tasks, className = '' }) => {
  // Filter tasks that have both start and end dates
  const tasksWithDates = tasks.filter(task => task.startDate && task.endDate);
  
  if (tasksWithDates.length === 0) {
    return (
      <div className={`text-center text-gray-400 py-4 text-xs ${className}`}>
        설정된 기간이 없습니다
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
    'bg-blue-400',
    'bg-green-400', 
    'bg-yellow-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-indigo-400'
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-1">
        {/* Header with date range */}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>{format(minDate, 'MM/dd')}</span>
          <span>{format(maxDate, 'MM/dd')}</span>
        </div>
        
        {/* Tasks */}
        {tasksWithDates.slice(0, 4).map((task, index) => {
          const startDate = parseISO(task.startDate!);
          const endDate = parseISO(task.endDate!);
          const taskDays = differenceInDays(endDate, startDate);
          const startOffset = differenceInDays(startDate, minDate);
          
          const leftPercent = totalDays > 0 ? (startOffset / totalDays) * 100 : 0;
          const widthPercent = totalDays > 0 ? (taskDays / totalDays) * 100 : 100;
          
          return (
            <div key={task.id} className="flex items-center space-x-2">
              <div className="w-16 text-xs truncate" title={task.title}>
                {task.title}
              </div>
              <div className="flex-1 relative bg-gray-100 h-3 rounded-sm">
                <div
                  className={`absolute h-full rounded-sm ${colors[index % colors.length]} opacity-70`}
                  style={{
                    left: `${Math.max(0, leftPercent)}%`,
                    width: `${Math.min(100 - Math.max(0, leftPercent), widthPercent)}%`
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 w-12 text-right">
                {taskDays + 1}일
              </div>
            </div>
          );
        })}
        
        {tasksWithDates.length > 4 && (
          <div className="text-xs text-gray-400 text-center pt-1">
            +{tasksWithDates.length - 4}개 더
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGanttChart;
