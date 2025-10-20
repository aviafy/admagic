/**
 * Alert/Message component
 */

'use client';

import { ReactNode } from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  className?: string;
}

export function Alert({ type = 'info', children, className = '' }: AlertProps) {
  const typeStyles = {
    error: 'text-red-600 bg-red-50 border-red-200',
    success: 'text-green-600 bg-green-50 border-green-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  };

  return (
    <div
      className={`text-sm text-center p-3 rounded-lg border ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}
