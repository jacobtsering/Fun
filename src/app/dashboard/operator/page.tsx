import { requireOperatorAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default async function OperatorDashboardPage() {
  const user = await requireOperatorAuth();
  
  // Fetch processes that this operator has access to
  const accessibleProcesses = await prisma.operatorProcessAccess.findMany({
    where: {
      userId: user.id,
    },
    include: {
      process: true,
    },
    orderBy: {
      process: {
        name: 'asc',
      },
    },
  });
  
  const processes = accessibleProcesses.map(access => access.process);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operator Dashboard</h1>
      </div>
      
      {processes.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Select Operation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processes.map((process) => (
              <Card key={process.id} title={process.name} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Select this operation to begin time study.
                  </p>
                  <Link href={`/dashboard/operator/process/${process.id}`}>
                    <Button variant="primary" fullWidth>Start Time Study</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card title="No Operations Available">
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              You don't have access to any operations for time study.
              Please contact your administrator to get access.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
