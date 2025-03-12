import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import EditOperationsClient from '@/components/forms/EditOperationsClient';

export default async function EditOperationPage({ params }: { params: { id: string } }) {
  const admin = await requireAdminAuth();
  const processId = params.id;
  
  // Fetch process data
  const process = await prisma.process.findUnique({
    where: {
      id: processId,
    },
    include: {
      operations: {
        orderBy: {
          sequenceNumber: 'asc',
        },
      },
    },
  });
  
  if (!process || process.companyId !== admin.companyId) {
    return (
      <div className="text-center py-8 text-red-600">
        Process not found or you don't have permission to edit this process.
      </div>
    );
  }
  
  return (
    <EditOperationsClient 
      processId={process.id} 
      processName={process.name} 
      operations={process.operations}
    />
  );
}
