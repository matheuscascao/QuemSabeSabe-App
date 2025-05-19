import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const hoverClasses = hoverEffect
    ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer'
    : '';

  const classes = twMerge(
    clsx(
      'rounded-lg',
      variantClasses[variant],
      paddingClasses[padding],
      hoverClasses,
      className
    )
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const classes = twMerge(
    clsx('mb-4', className)
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  const classes = twMerge(
    clsx('text-xl font-semibold text-gray-900', className)
  );

  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  const classes = twMerge(
    clsx('text-sm text-gray-500', className)
  );

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const classes = twMerge(
    clsx('mt-4 flex items-center', className)
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};