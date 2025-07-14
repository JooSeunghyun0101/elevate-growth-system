
import React, { useState } from 'react';
import { Task } from '@/types/evaluation';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MiniGanttChartProps {
  tasks: Task[];
  className?: string;
  maxInitialTasks?: number;
}

const MiniGanttChart: React.FC<MiniGanttChartProps> = ({ 
  tasks, 
  className = '', 
  maxInitialTasks = 3 
}) => {
  const [showAll, setShowAll] = useState(false);
  
  // Filter tasks that have both start and end dates
  const tasksWithDates = tasks.filter(task => task.startDate && task.endDate);
  
  if (tasksWithDates.length === 0) {
    return (
      <div className={`text-center text-gray-400 py-4 text-xs ${className}`}>
        설정된 기간이 없습니다
      </div>
    );
  }

  // 기존 minDate, maxDate 계산 부분을 다음으로 대체
  const minDate = new Date(new Date().getFullYear(), 0, 1);
  const maxDate = new Date(new Date().getFullYear(), 11, 31);
  const totalDays = differenceInDays(maxDate, minDate);

  const ganttColors = ['#F55000', '#55474A', '#FFAA00'];

  const displayTasks = showAll ? tasksWithDates : tasksWithDates.slice(0, maxInitialTasks);
  const hasMore = tasksWithDates.length > maxInitialTasks;

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-1">
        {/* Header with date range */}
        <div className="flex justify-between text-xs text-black mb-2">
          <span>{format(minDate, 'MM/dd')}</span>
          <span>{format(maxDate, 'MM/dd')}</span>
        </div>
        
        {/* Tasks */}
        {displayTasks.map((task, index) => {
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
                  className="absolute h-full rounded-sm"
                  style={{
                    left: `${Math.max(0, leftPercent)}%`,
                    width: `${Math.min(100 - Math.max(0, leftPercent), widthPercent)}%`,
                    backgroundColor: ganttColors[index % ganttColors.length],
                    opacity: 0.85
                  }}
                />
              </div>
              <div className="text-xs text-black w-12 text-right">
                {taskDays + 1}일
              </div>
            </div>
          );
        })}
        
        {/* Show more/less button */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  +{tasksWithDates.length - maxInitialTasks}개 더
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGanttChart;
