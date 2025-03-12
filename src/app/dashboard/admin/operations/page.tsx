import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default async function OperationsPage() {
  const user = await requireAdminAuth();
  
  // Fetch operations for the current company
  const processes = await prisma.process.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      timeStudySessions: true,
      _count: {
        select: {
          operations: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // Format process data for display
  const formattedProcesses = processes.map(process => {
    const operationCount = process.timeStudySessions.length;
    const lastOperationDate = process.lastTrackedAt 
      ? new Date(process.lastTrackedAt).toLocaleDateString() 
      : 'Never';
    
    return [
      process.name,
      process._count.operations.toString(),
      operationCount.toString(),
      lastOperationDate,
      <div key={process.id} className="flex space-x-2">
        <Link href={`/dashboard/admin/operations/${process.id}/export`}>
          <Button variant="secondary" size="sm">Export</Button>
        </Link>
        <Link href={`/dashboard/admin/operations/${process.id}/edit`}>
          <Button variant="secondary" size="sm">Edit</Button>
        </Link>
        <Link href={`/dashboard/admin/operations/${process.id}/replace`}>
          <Button variant="secondary" size="sm">Replace</Button>
        </Link>
      </div>
    ];
  });
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operations Management</h1>
        <Link href="/dashboard/admin/operations/import">
          <Button variant="primary">Import Operation</Button>
        </Link>
      </div>
      
      <Card title="Operations">
        {processes.length > 0 ? (
          <Table 
            headers={[
              'Process Name', 
              'Operation Steps', 
              'Times Tracked', 
              'Last Tracked Date',
              'Actions'
            ]} 
            data={formattedProcesses} 
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No operations found. Import your first operation to get started.
          </div>
        )}
      </Card>
    </div>
  );
}
