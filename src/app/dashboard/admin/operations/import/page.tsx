'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function FileUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processName, setProcessName] = useState('');
  const [extractedProcessName, setExtractedProcessName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameExists, setNameExists] = useState(false);
  const [useExtractedName, setUseExtractedName] = useState(true);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      // Try to extract process name from Excel file
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('/api/processes/extract-name', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.processName) {
            setExtractedProcessName(data.processName);
            if (useExtractedName) {
              setProcessName(data.processName);
              // Check if name exists
              checkNameExists(data.processName);
            }
          }
        }
      } catch (error) {
        console.error('Error extracting process name:', error);
      }
    }
  };
  
  const checkNameExists = async (name: string) => {
    if (name.trim()) {
      try {
        const response = await fetch(`/api/processes/check-name?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        setNameExists(data.exists);
      } catch (error) {
        console.error('Error checking process name:', error);
      }
    } else {
      setNameExists(false);
    }
  };
  
  const handleProcessNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProcessName(name);
    setUseExtractedName(false);
    await checkNameExists(name);
  };
  
  const validateForm = () => {
    if (!file) {
      setError('Please select an Excel file to upload');
      return false;
    }
    
    if (!processName.trim() && !extractedProcessName) {
      setError('Process name is required');
      return false;
    }
    
    if (nameExists) {
      setError('Process name already exists. Please choose a different name');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      formData.append('processName', processName);
      
      const response = await fetch('/api/processes/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload file');
      }
      
      router.push('/dashboard/admin/operations');
      router.refresh();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Import Operation">
        <div className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              Excel File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload an Excel file with operation details. The file should follow the template format.
            </p>
            {extractedProcessName && (
              <p className="mt-2 text-sm text-green-600">
                Process name extracted from file: <strong>{extractedProcessName}</strong>
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="processName" className="block text-sm font-medium text-gray-700 mb-1">
              Process Name {extractedProcessName ? '(Optional - will use extracted name if empty)' : ''}
            </label>
            <input
              type="text"
              id="processName"
              value={processName}
              onChange={handleProcessNameChange}
              className={`w-full px-4 py-2 border rounded-md ${
                nameExists ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={extractedProcessName ? `Override "${extractedProcessName}" (optional)` : "Enter process name"}
            />
            {nameExists && (
              <p className="mt-1 text-sm text-red-600">
                This process name already exists. Please choose a different name.
              </p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard/admin/operations')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading || nameExists || (!processName && !extractedProcessName)}
          >
            {isUploading ? 'Uploading...' : 'Import Operation'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
