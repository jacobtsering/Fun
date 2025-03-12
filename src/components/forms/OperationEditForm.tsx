'use client';

import { useState } from 'react';
// import Button from '@/components/ui/Button'; /* Commented out by fix-eslint.js */
import Card from '@/components/ui/Card';

interface OperationEditFormProps {
  operationId: string;
  initialData: {
    id: string;
    operationId: string;
    description: string;
    standardTimeSeconds: number | null;
    toolsRequired: string | null;
    qualityCheck: string | null;
    sequenceNumber: number;
  };
  onCancel: () => void;
  onSave: (data: unknown /* TODO: Replace with proper type */) => void;
}

export default function OperationEditForm({ 
  operationId, 
  initialData, 
  onCancel, 
  onSave 
}: OperationEditFormProps) {
  const [formData, setFormData] = useState({
    operationId: initialData.operationId,
    description: initialData.description,
    standardTimeSeconds: initialData.standardTimeSeconds || '',
    toolsRequired: initialData.toolsRequired || '',
    qualityCheck: initialData.qualityCheck || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert standardTimeSeconds to number if it's not empty
      const dataToSave = {
        ...formData,
        standardTimeSeconds: formData.standardTimeSeconds 
          ? parseFloat(formData.standardTimeSeconds.toString()) 
          : null,
      };
      
      onSave(dataToSave);
    } catch (error) {
      console.error('Error saving operation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card title={`Edit Operation: ${initialData.operationId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="operationId" className="block text-sm font-medium text-gray-700 mb-1">
            Operation ID
          </label>
          <input
            type="text"
            id="operationId"
            name="operationId"
            value={formData.operationId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            rows={3}
            required
          />
        </div>
        
        <div>
          <label htmlFor="standardTimeSeconds" className="block text-sm font-medium text-gray-700 mb-1">
            Standard Time (seconds)
          </label>
          <input
            type="number"
            id="standardTimeSeconds"
            name="standardTimeSeconds"
            value={formData.standardTimeSeconds}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            step="0.01"
          />
        </div>
        
        <div>
          <label htmlFor="toolsRequired" className="block text-sm font-medium text-gray-700 mb-1">
            Tools Required
          </label>
          <input
            type="text"
            id="toolsRequired"
            name="toolsRequired"
            value={formData.toolsRequired}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="qualityCheck" className="block text-sm font-medium text-gray-700 mb-1">
            Quality Check
          </label>
          <input
            type="text"
            id="qualityCheck"
            name="qualityCheck"
            value={formData.qualityCheck}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? &apos;Saving...&apos; : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
