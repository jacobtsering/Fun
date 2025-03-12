import { requireOperatorAuth } from '@/lib/auth';
// import prisma from '@/lib/prisma'; /* Commented out by fix-eslint.js */
import TimeStudy from '@/components/time-study/TimeStudy';

export default async function ProcessPage({ params }: { params: { id: string } }) {
  const user = await requireOperatorAuth();
  // Directly use params.id without Promise.resolve
  const processId = params.id;
  
  // Check if operator has access to this process
  const access = await prisma.operatorProcessAccess.findFirst({
    where: {
      userId: user.id,
      processId: processId,
    },
  });
  
  if (!access) {
    return (
      <div className="text-center py-8 text-red-600">
        You don't have access to this process. Please contact your administrator.
      </div>
    );
  }
  
  // Fetch process and its operations
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
  
  if (!process) {
    return (
      <div className="text-center py-8 text-red-600">
        Process not found.
      </div>
    );
  }
  
  return (
    <TimeStudy 
      processId={process.id} 
      processName={process.name} 
      operations={process.operations} 
    />
  );
}
