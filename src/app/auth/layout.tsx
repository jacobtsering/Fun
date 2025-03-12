import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Time Study App</h1>
          <p className="text-gray-600 mt-2">Track operation times efficiently</p>
        </div>
        {children}
      </div>
    </div>
  );
}
