import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default async function ExportOperationPage({ params }: { params: { id: string } }) {
  const user = await requireAdminAuth();
  const processId = params.id;
  
  // Fetch process to get its name
  const process = await prisma.process.findFirst({
    where: {
      id: processId,
      companyId: user.companyId,
    },
  });
  
  if (!process) {
    return (
      <div className="text-center py-8 text-red-600">
        Process not found or you don't have permission to access it.
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Export Time Study Data</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Process: {process.name}</h2>
        
        <p className="text-gray-600 mb-6">
          Click the button below to download all time study data for this process as an Excel file.
          The file will include all tracked operations with timing information.
        </p>
        
        <div className="flex space-x-4">
          <Link href={`/api/processes/${processId}/export`} target="_blank">
            <Button variant="primary">Download Excel File</Button>
          </Link>
          
          <Link href="/dashboard/admin/operations">
            <Button variant="secondary">Back to Operations</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
