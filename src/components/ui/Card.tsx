import React from 'react';

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-brand-peach/30 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
