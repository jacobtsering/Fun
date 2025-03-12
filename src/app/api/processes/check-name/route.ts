import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get process name from query
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ message: 'Process name is required' }, { status: 400 });
    }

    // Check if process name already exists for this company
    const existingProcess = await prisma.process.findFirst({
      where: {
        name: name,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json({ exists: !!existingProcess });
  } catch (error) {
    console.error('Error checking process name:', error);
    return NextResponse.json({ message: 'Failed to check process name' }, { status: 500 });
  }
}
