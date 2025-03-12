import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserForm from '@/components/forms/UserForm';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const admin = await requireAdminAuth();
  
  // Directly use params.id without Promise.resolve
  const userId = params.id;
  
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      operatorAccess: {
        include: {
          process: true,
        },
      },
    },
  });
  
  if (!user || user.companyId !== admin.companyId) {
    return (
      <div className="text-center py-8 text-red-600">
        User not found or you don't have permission to edit this user.
      </div>
    );
  }
  
  // Fetch processes for this company
  const processes = await prisma.process.findMany({
    where: {
      companyId: admin.companyId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // Format user data for the form
  const userData = {
    id: user.id,
    badgeId: user.badgeId,
    name: user.name,
    role: user.role,
    processAccess: processes.map(process => ({
      id: process.id,
      name: process.name,
      selected: user.operatorAccess.some(access => access.process.id === process.id),
    })),
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <UserForm 
        initialData={userData} 
        processes={processes}
        isEdit={true}
      />
    </div>
  );
}
