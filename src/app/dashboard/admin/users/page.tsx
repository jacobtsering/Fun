import { requireAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default async function UsersPage() {
  const user = await requireAdminAuth();
  
  // Fetch users for the current company
  const users = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      operatorAccess: {
        include: {
          process: true,
        },
      },
      timeStudySessions: {
        orderBy: {
          startedAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // Format user data for display
  const formattedUsers = users.map(user => {
    const operationCount = user.timeStudySessions.length;
    const lastOperationDate = user.timeStudySessions[0]?.startedAt 
      ? new Date(user.timeStudySessions[0].startedAt).toLocaleDateString() 
      : 'Never';
    
    const accessedOperations = user.operatorAccess.map(access => access.process.name).join(', ');
    
    return [
      user.badgeId,
      user.name,
      user.role,
      accessedOperations || 'None',
      operationCount.toString(),
      lastOperationDate,
      <div key={user.id} className="flex space-x-2">
        <Link href={`/dashboard/admin/users/${user.id}/edit`}>
          <Button variant="secondary" size="sm">Edit</Button>
        </Link>
        <Link href={`/dashboard/admin/users/${user.id}/delete`}>
          <Button variant="danger" size="sm">Delete</Button>
        </Link>
      </div>
    ];
  });
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/dashboard/admin/users/new">
          <Button variant="primary">Add New User</Button>
        </Link>
      </div>
      
      <Card title="Users">
        {users.length > 0 ? (
          <Table 
            headers={[
              'Badge ID', 
              'Name', 
              'Role', 
              'Assigned Operations', 
              'Operations Tracked', 
              'Last Operation Date',
              'Actions'
            ]} 
            data={formattedUsers} 
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No users found. Create your first user to get started.
          </div>
        )}
      </Card>
    </div>
  );
}
