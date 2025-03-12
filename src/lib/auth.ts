import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

export async function requireAdminAuth() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard/operator');
  }
  
  return user;
}

export async function requireOperatorAuth() {
  const user = await requireAuth();
  
  if (user.role !== 'operator') {
    redirect('/dashboard/admin');
  }
  
  return user;
}
