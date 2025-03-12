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

    const { sessionId, operationId, startTime } = await request.json();

    if (!sessionId || !operationId || !startTime) {
      return NextResponse.json({ message: 'Session ID, operation ID, and start time are required' }, { status: 400 });
    }

    // Check if session exists and belongs to this user
    const timeStudySession = await prisma.timeStudySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!timeStudySession) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    // Check if operation exists and belongs to the process
    const operation = await prisma.operation.findFirst({
      where: {
        id: operationId,
        processId: timeStudySession.processId,
      },
    });

    if (!operation) {
      return NextResponse.json({ message: 'Operation not found' }, { status: 404 });
    }

    // Create a new operation timing
    const operationTiming = await prisma.operationTiming.create({
      data: {
        sessionId: sessionId,
        operationId: operationId,
        startTime: new Date(startTime),
      },
    });

    return NextResponse.json({ 
      message: 'Operation timing started successfully',
      timingId: operationTiming.id
    });
  } catch (error) {
    console.error('Error starting operation timing:', error);
    return NextResponse.json({ message: 'Failed to start operation timing' }, { status: 500 });
  }
}
