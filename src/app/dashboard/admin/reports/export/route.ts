import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

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

    // Format data for Excel export
    const exportData = operationTimings.map((timing, index) => {
      const totalTimeSeconds = timing.totalTimeSeconds || 0;
      const timeBetweenOperations = timing.timeBetweenOperationsSeconds || 0;
      
      return {
        'Unique Operation ID': timing.id,
        'Process Name': timing.session.process.name,
        'User ID': timing.session.user.badgeId,
        'User Name': timing.session.user.name,
        'Operation ID': timing.operation.operationId,
        'Operation Description': timing.operation.description,
        'Standard Time (sec)': timing.operation.standardTimeSeconds || '',
        'Tools Required': timing.operation.toolsRequired || '',
        'Quality Check': timing.operation.qualityCheck || '',
        'Start Time': timing.startTime.toISOString(),
        'End Time': timing.endTime ? timing.endTime.toISOString() : '',
        'Total Time (seconds)': totalTimeSeconds,
        'Time Between Operations (seconds)': timeBetweenOperations > 0 ? timeBetweenOperations : '',
        'Session ID': timing.sessionId,
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Study Data');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Get process name for filename if process filter is applied
    let filename = 'time-study-report';
    if (processId) {
      const process = await prisma.process.findUnique({
        where: { id: processId },
        select: { name: true }
      });
      if (process) {
        filename = `${process.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_time_study`;
      }
    }
    
    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}_${startDate}_to_${endDate}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting time study data:', error);
    return NextResponse.json({ message: 'Failed to export time study data' }, { status: 500 });
  }
}
