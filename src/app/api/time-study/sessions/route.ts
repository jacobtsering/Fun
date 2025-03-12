import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'operator') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { processId } = await request.json();

    if (!processId) {
      return NextResponse.json({ message: 'Process ID is required' }, { status: 400 });
    }

    // Check if operator has access to this process
    const access = await prisma.operatorProcessAccess.findFirst({
      where: {
        userId: session.user.id,
        processId: processId,
      },
    });

    if (!access) {
      return NextResponse.json({ message: 'You do not have access to this process' }, { status: 403 });
    }

    // Create a new time study session
    const timeStudySession = await prisma.timeStudySession.create({
      data: {
        userId: session.user.id,
        processId: processId,
      },
    });

    // Update process tracking count and last tracked date
    await prisma.process.update({
      where: {
        id: processId,
      },
      data: {
        trackingCount: {
          increment: 1,
        },
        lastTrackedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'Session created successfully',
      sessionId: timeStudySession.id
    });
  } catch (error) {
    console.error('Error creating time study session:', error);
    return NextResponse.json({ message: 'Failed to create session' }, { status: 500 });
  }
}
