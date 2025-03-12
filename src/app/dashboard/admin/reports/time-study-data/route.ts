import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const processId = searchParams.get('processId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
    }

    // Create date objects with time set to start and end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    // Build query filters
    const filters: any = {
      session: {
        startedAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
        user: {
          companyId: session.user.companyId,
        },
      },
    };

    // Add process filter if specified
    if (processId) {
      filters.session.processId = processId;
    }

    // Query operation timings with related data
    const operationTimings = await prisma.operationTiming.findMany({
      where: filters,
      include: {
        operation: true,
        session: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                badgeId: true,
              },
            },
            process: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { session: { startedAt: 'desc' } },
        { startTime: 'asc' },
      ],
    });

    // Format data for response
    const formattedData = operationTimings.map(timing => {
      const totalTimeSeconds = timing.totalTimeSeconds || 0;
      const timeBetweenOperations = timing.timeBetweenOperationsSeconds || 0;
      
      return {
        id: timing.id,
        operationId: timing.operation.operationId,
        operationDescription: timing.operation.description,
        operator: timing.session.user.name,
        operatorBadgeId: timing.session.user.badgeId,
        processName: timing.session.process.name,
        startTime: timing.startTime.toISOString(),
        endTime: timing.endTime ? timing.endTime.toISOString() : null,
        totalTime: totalTimeSeconds > 0 ? `${totalTimeSeconds.toFixed(1)}s` : null,
        timeBetweenOps: timeBetweenOperations > 0 ? `${timeBetweenOperations.toFixed(1)}s` : null,
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching time study data:', error);
    return NextResponse.json({ message: 'Failed to fetch time study data' }, { status: 500 });
  }
}
