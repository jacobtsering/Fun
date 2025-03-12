import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserForm from '@/components/forms/UserForm';

export default async function NewUserPage() {
  const user = await requireAdminAuth();
  
  // Fetch all processes for this company to populate the access checkboxes
  const processes = await prisma.process.findMany({
    where: {
      companyId: user.companyId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  return <UserForm processes={processes} />;
}
