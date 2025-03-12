import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest, { params }: { params: { processId: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const processId = params.processId;

    // Check if process exists and belongs to this company
    const process = await prisma.process.findFirst({
      where: {
        id: processId,
        companyId: session.user.companyId,
      },
      include: {
        operations: {
          orderBy: {
            sequenceNumber: 'asc',
          },
        },
        timeStudySessions: {
          include: {
            operationTimings: {
              include: {
                operation: true,
              },
              orderBy: {
                startTime: 'asc',
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                badgeId: true,
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    });

    if (!process) {
      return NextResponse.json({ message: 'Process not found' }, { status: 404 });
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Format data for export
    const exportData = process.timeStudySessions.flatMap(session => 
      session.operationTimings.map((timing, index) => {
        const totalTimeSeconds = timing.totalTimeSeconds || 0;
        const timeBetweenOperations = timing.timeBetweenOperationsSeconds || 0;
        
        return {
          'Unique Operation ID': timing.id,
          'User ID': session.user.badgeId,
          'User Name': session.user.name,
          'Operation ID': timing.operation.operationId,
          'Operation Description': timing.operation.description,
          'Start Time': timing.startTime.toISOString(),
          'End Time': timing.endTime ? timing.endTime.toISOString() : '',
          'Total Time (seconds)': totalTimeSeconds,
          'Time Between Operations (seconds)': index === 0 ? '' : timeBetweenOperations,
        };
      })
    );

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Time Study Data');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${process.name}_time_study_data.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting process data:', error);
    return NextResponse.json({ message: 'Failed to export process data' }, { status: 500 });
  }
}
