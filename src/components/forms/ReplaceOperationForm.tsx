'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ReplaceOperationForm({ processId, processName }: { processId: string, processName: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const validateForm = () => {
    if (!file) {
      setError('Please select an Excel file to upload');
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
      
      const response = await fetch(`/api/processes/${processId}/replace`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to replace operation');
      }
      
      router.push('/dashboard/admin/operations');
      router.refresh();
    } catch (error) {
      console.error('Error replacing operation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title={`Replace Operation: ${processName}`}>
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload a new Excel file to replace the operations for this process. 
            This will maintain the same process name and user access permissions, 
            but replace all operation steps with the ones from the new file.
          </p>
          
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
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Replace Operation'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
