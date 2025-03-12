import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export default function Card({ title, children, className = '', loading = false }: CardProps) {
  return (
    <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-md w-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        {loading && (
          <div className="animate-pulse">
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>
      <div className={loading ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}
