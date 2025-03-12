import React from 'react';

interface BarcodeInputProps {
  onScan: (data: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

export default function BarcodeInput({
  onScan,
  placeholder = 'Scan or type ID...',
  buttonText = 'Submit',
  autoFocus = true
}: BarcodeInputProps) {
  const [value, setValue] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onScan(value.trim());
      setValue('');
    }
  };
  
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Process when Enter key is pressed (simulating barcode scanner behavior)
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onScan(value.trim());
        setValue('');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-grow px-4 py-3 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}
