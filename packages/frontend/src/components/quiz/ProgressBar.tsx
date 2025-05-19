import React from 'react';
import { Progress } from '../ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
  timeLeft?: number;
  totalTime?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total,
  timeLeft,
  totalTime
}) => {
  // Calculate completion percentage
  const completionPercentage = Math.round((current / total) * 100);
  
  // Calculate time percentage if time tracking is enabled
  const timePercentage = timeLeft && totalTime ? Math.round((timeLeft / totalTime) * 100) : null;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">Question {current} of {total}</span>
        {timeLeft !== undefined && (
          <span className="text-gray-700">
            Time left: <span className="font-medium">{Math.ceil(timeLeft)}s</span>
          </span>
        )}
      </div>
      
      <Progress 
        value={current} 
        max={total}
        color="primary"
        size="md"
        animated
        showValue={false}
      />
      
      {timeLeft !== undefined && totalTime !== undefined && (
        <Progress
          value={timeLeft}
          max={totalTime}
          color={
            timePercentage && timePercentage > 50 ? 'success' : 
            timePercentage && timePercentage > 20 ? 'warning' : 'error'
          }
          size="sm"
          animated
          showValue={false}
        />
      )}
    </div>
  );
};