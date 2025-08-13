import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

const Card = ({ children, className = '', hoverEffect = false, style }: CardProps) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm overflow-hidden';
  const hoverClasses = hoverEffect ? 'transition-all duration-200 hover:shadow-md' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} style={style}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>{children}</div>;
};

export default Card;
