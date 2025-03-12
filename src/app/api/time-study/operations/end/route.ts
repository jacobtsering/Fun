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

    const { sessionId, operationId, endTime, totalTimeSeconds } = await request.json();

    if (!sessionId || !operationId || !endTime) {
      return NextResponse.json({ message: 'Session ID, operation ID, and end time are required' }, { status: 400 });
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

    // Find the operation timing to update
    const operationTiming = await prisma.operationTiming.findFirst({
      where: {
        sessionId: sessionId,
        operationId: operationId,
        endTime: null, // Only get the one that hasn't ended yet
      },
      orderBy: {
        startTime: 'desc', // Get the most recent one
      },
    });

    if (!operationTiming) {
      return NextResponse.json({ message: 'Operation timing not found' }, { status: 404 });
    }

    // Calculate time between operations if this isn't the first operation in the session
    let timeBetweenOperationsSeconds = null;
    
    const previousTiming = await prisma.operationTiming.findFirst({
      where: {
        sessionId: sessionId,
        id: { not: operationTiming.id },
        endTime: { not: null },
      },
      orderBy: {
        endTime: 'desc', // Get the most recently ended one
      },
    });

    if (previousTiming && previousTiming.endTime) {
      const previousEndTime = new Date(previousTiming.endTime);
      const currentStartTime = new Date(operationTiming.startTime);
      timeBetweenOperationsSeconds = Math.floor((currentStartTime.getTime() - previousEndTime.getTime()) / 1000);
    }

    // Update the operation timing
    const updatedTiming = await prisma.operationTiming.update({
      where: {
        id: operationTiming.id,
      },
      data: {
        endTime: new Date(endTime),
        totalTimeSeconds: totalTimeSeconds || null,
        timeBetweenOperationsSeconds: timeBetweenOperationsSeconds,
      },
    });

    return NextResponse.json({ 
      message: 'Operation timing ended successfully',
      timingId: updatedTiming.id
    });
  } catch (error) {
    console.error('Error ending operation timing:', error);
    return NextResponse.json({ message: 'Failed to end operation timing' }, { status: 500 });
  }
}
