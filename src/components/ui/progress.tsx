import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | string;
  showValue?: boolean;
  valuePosition?: 'inner' | 'right';
  animated?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max,
  size = 'md',
  color = 'primary',
  showValue = false,
  valuePosition = 'right',
  animated = false,
  className,
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };
  
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };
  
  const barColor = colorClasses[color as keyof typeof colorClasses] || color;
  const animationClass = animated ? 'transition-all duration-500 ease-in-out' : '';
  
  return (
    <div className={twMerge('flex items-center w-full gap-2', className)}>
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={clsx('rounded-full', barColor, sizeClasses[size], animationClass)}
          style={{ width: `${percentage}%` }}
        >
          {showValue && valuePosition === 'inner' && (
            <span className="sr-only">{percentage}%</span>
          )}
        </div>
      </div>
      
      {showValue && valuePosition === 'right' && (
        <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
};