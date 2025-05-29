import React from 'react';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

interface QuizOptionProps {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  text,
  index,
  isSelected,
  isCorrect,
  isRevealed = false,
  disabled = false,
  onSelect,
}) => {
  const optionLetters = ['A', 'B', 'C', 'D'];
  
  const handleClick = () => {
    if (!disabled) {
      console.log('QuizOption clicked:', index);
      onSelect(index);
    }
  };
  
  // Style classes for different states
  const getClasses = () => {
    // Base styles
    const baseClasses = 'flex items-start p-3 border rounded-lg transition-all duration-200 gap-3';
    
    // States for unrevealed answers
    if (!isRevealed) {
      if (isSelected) {
        return clsx(baseClasses, 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm');
      }
      return clsx(
        baseClasses,
        'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      );
    }
    
    // States for revealed answers (after submission)
    if (isCorrect) {
      return clsx(baseClasses, 'border-success-500 bg-success-50 text-success-700');
    }
    
    if (isSelected) {
      return clsx(baseClasses, 'border-error-500 bg-error-50 text-error-700');
    }
    
    return clsx(baseClasses, 'border-gray-200 opacity-70');
  };
  
  return (
    <div className={getClasses()} onClick={handleClick}>
      <div className={clsx(
        'flex items-center justify-center w-6 h-6 rounded-full shrink-0 font-medium text-sm',
        isRevealed
          ? isCorrect
            ? 'bg-success-500 text-white'
            : isSelected
              ? 'bg-error-500 text-white'
              : 'bg-gray-200 text-gray-700'
          : isSelected
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-700'
      )}>
        {isRevealed ? (
          isCorrect ? (
            <Check size={14} />
          ) : isSelected ? (
            <X size={14} />
          ) : (
            optionLetters[index]
          )
        ) : (
          optionLetters[index]
        )}
      </div>
      
      <span className="text-base pt-0.5">{text}</span>
    </div>
  );
};