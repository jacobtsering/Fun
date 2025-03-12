'use client';

import { useState } from 'react';
// import Button from '@/components/ui/Button'; /* Commented out by fix-eslint.js */
import Card from '@/components/ui/Card';
import OperationEditForm from '@/components/forms/OperationEditForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Operation {
  id: string;
  operationId: string;
  description: string;
  standardTimeSeconds: number | null;
  toolsRequired: string | null;
  qualityCheck: string | null;
  sequenceNumber: number;
}

interface EditOperationsClientProps {
  processId: string;
  processName: string;
  operations: Operation[];
}

export default function EditOperationsClient({ 
  processId, 
  processName, 
  operations: initialOperations 
}: EditOperationsClientProps) {
  const _router = useRouter();
  const [operations, setOperations] = useState<Operation[]>(initialOperations);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(null);
  const [isAddingOperation, setIsAddingOperation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOperation, setNewOperation] = useState<Partial<Operation>>({
    operationId: '',
    description: '',
    standardTimeSeconds: null,
    toolsRequired: null,
    qualityCheck: null,
  });

  // Handle edit button click
  const handleEditClick = (operationId: string) => {
    setEditingOperationId(operationId);
    setIsAddingOperation(false);
  };

  // Handle delete button click
  const handleDeleteClick = async (operationId: string) => {
    if (!confirm('Are you sure you want to delete this operation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/processes/${processId}/operations/${operationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete operation');
      }

      // Remove the operation from the state
      setOperations(operations.filter(op => op.id !== operationId));
      
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error('Error deleting operation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Handle add operation button click
  const handleAddClick = () => {
    setIsAddingOperation(true);
    setEditingOperationId(null);
    
    // Set default operation ID based on the last operation
    if (operations.length > 0) {
      const lastOpId = operations[operations.length - 1].operationId;
      const match = lastOpId.match(/^OP(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1]) + 1;
        setNewOperation({
          ...newOperation,
          operationId: `OP${nextNum.toString().padStart(3, '0')}`,
        });
      }
    } else {
      setNewOperation({
        ...newOperation,
        operationId: 'OP001',
      });
    }
  };

  // Handle save changes for an existing operation
  const handleSaveOperation = async (operationId: string, data: unknown /* TODO: Replace with proper type */) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/processes/${processId}/operations/${operationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to update operation');
      }

      // Update the operation in the state
      setOperations(operations.map(op => 
        op.id === operationId ? { ...op, ...data } : op
      ));
      
      setEditingOperationId(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating operation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save for a new operation
  const handleSaveNewOperation = async (data: unknown /* TODO: Replace with proper type */) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/processes/${processId}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sequenceNumber: operations.length > 0 
            ? operations[operations.length - 1].sequenceNumber + 1 
            : 0,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to add operation');
      }

      const newOp = await response.json();
      
      // Add the new operation to the state
      setOperations([...operations, newOp]);
      
      setIsAddingOperation(false);
      setNewOperation({
        operationId: '',
        description: '',
        standardTimeSeconds: null,
        toolsRequired: null,
        qualityCheck: null,
      });
      
      router.refresh();
    } catch (error) {
      console.error('Error adding operation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save all changes
  const handleSaveAllChanges = async () => {
    try {
      router.push('/dashboard/admin/operations');
      router.refresh();
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Process: {processName}</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard/admin/operations">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button 
            variant="primary" 
            onClick={handleSaveAllChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <Card title="Operations">
        <div className="space-y-4">
          <p className="text-gray-600">
            Edit the operations for this process. You can modify the details of each operation or add new operations.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sequence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standard Time (sec)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tools Required
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Check
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((operation) => (
                  editingOperationId === operation.id ? (
                    <tr key={operation.id} className="bg-blue-50">
                      <td colSpan={7} className="px-6 py-4">
                        <OperationEditForm
                          operationId={operation.id}
                          initialData={operation}
                          onCancel={() => setEditingOperationId(null)}
                          onSave={(data) => handleSaveOperation(operation.id, data)}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={operation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.sequenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.operationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.standardTimeSeconds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.toolsRequired || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {operation.qualityCheck || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleEditClick(operation.id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(operation.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                
                {isAddingOperation && (
                  <tr className="bg-green-50">
                    <td colSpan={7} className="px-6 py-4">
                      <OperationEditForm
                        operationId="new"
                        initialData={{
                          id: "new",
                          operationId: newOperation.operationId as string,
                          description: newOperation.description as string,
                          standardTimeSeconds: newOperation.standardTimeSeconds,
                          toolsRequired: newOperation.toolsRequired,
                          qualityCheck: newOperation.qualityCheck,
                          sequenceNumber: operations.length > 0 
                            ? operations[operations.length - 1].sequenceNumber + 1 
                            : 0,
                        }}
                        onCancel={() => setIsAddingOperation(false)}
                        onSave={handleSaveNewOperation}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!isAddingOperation && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="secondary"
                onClick={handleAddClick}
              >
                Add Operation
              </Button>
            </div>
          )}
          
          <div className="text-right mt-6">
            <p className="text-sm text-gray-500 mb-2">
              Note: For more complex changes, consider replacing the entire operation sheet.
            </p>
            <Link href={`/dashboard/admin/operations/${processId}/replace`}>
              <Button variant="secondary">Replace Entire Operation</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
