import React from 'react';

interface FooterProps {
  companyName?: string;
}

export default function Footer({ companyName }: FooterProps) {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Time Study App
              {companyName && ` - ${companyName}`}
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
