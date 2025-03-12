import { requireAdminAuth } from '@/lib/auth';
// import prisma from '@/lib/prisma'; /* Commented out by fix-eslint.js */
import ReplaceOperationForm from '@/components/forms/ReplaceOperationForm';

export default async function ReplaceOperationPage({ params }: { params: { id: string } }) {
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
  
  return <ReplaceOperationForm processId={processId} processName={process.name} />;
}
