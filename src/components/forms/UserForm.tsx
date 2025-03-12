'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface UserFormProps {
  initialData?: {
    id?: string;
    badgeId: string;
    name: string;
    role: string;
    processAccess?: { id: string; name: string; selected: boolean }[];
  };
  processes?: { id: string; name: string }[];
  isEdit?: boolean;
}

export default function UserForm({ initialData, processes = [], isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    badgeId: initialData?.badgeId || '',
    name: initialData?.name || '',
    role: initialData?.role || 'operator',
    processAccess: initialData?.processAccess || processes.map(p => ({ ...p, selected: false })),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleProcessAccessChange = (processId: string, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      processAccess: prev.processAccess.map(p => 
        p.id === processId ? { ...p, selected } : p
      ),
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.badgeId.trim()) {
      newErrors.badgeId = 'Badge ID is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const endpoint = isEdit 
        ? `/api/users/${initialData?.id}` 
        : '/api/users';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeId: formData.badgeId,
          name: formData.name,
          role: formData.role,
          processAccess: formData.processAccess
            .filter(p => p.selected)
            .map(p => p.id),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save user');
      }
      
      router.push('/dashboard/admin/users');
      router.refresh();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors(prev => ({
        ...prev,
        form: error instanceof Error ? error.message : 'An error occurred',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title={isEdit ? 'Edit User' : 'Create New User'}>
        <div className="space-y-4">
          <div>
            <label htmlFor="badgeId" className="block text-sm font-medium text-gray-700 mb-1">
              Badge ID
            </label>
            <input
              type="text"
              id="badgeId"
              name="badgeId"
              value={formData.badgeId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${
                errors.badgeId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.badgeId && (
              <p className="mt-1 text-sm text-red-600">{errors.badgeId}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {formData.role === 'operator' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation Access
              </label>
              {formData.processAccess.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {formData.processAccess.map(process => (
                    <div key={process.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`process-${process.id}`}
                        checked={process.selected}
                        onChange={e => handleProcessAccessChange(process.id, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`process-${process.id}`} className="text-sm">
                        {process.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No operations available. Please create operations first.
                </p>
              )}
            </div>
          )}
          
          {errors.form && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {errors.form}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard/admin/users')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
