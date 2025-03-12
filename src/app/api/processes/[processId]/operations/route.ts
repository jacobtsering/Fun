import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

// GET /api/processes/[processId]/operations - Get all operations for a process
export async function GET(
  request: NextRequest,
  { params }: { params: { processId: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const processId = params.processId;
    
    // Check if process exists and belongs to admin's company
    const process = await prisma.process.findFirst({
      where: {
        id: processId,
        companyId: admin.companyId,
      },
    });
    
    if (!process) {
      return NextResponse.json({ message: 'Process not found' }, { status: 404 });
    }
    
    // Get all operations for this process
    const operations = await prisma.operation.findMany({
      where: {
        processId: processId,
      },
      orderBy: {
        sequenceNumber: 'asc',
      },
    });
    
    return NextResponse.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    return NextResponse.json({ message: 'Failed to fetch operations' }, { status: 500 });
  }
}

// POST /api/processes/[processId]/operations - Create a new operation
export async function POST(
  request: NextRequest,
  { params }: { params: { processId: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const processId = params.processId;
    const data = await request.json();
    
    // Check if process exists and belongs to admin's company
    const process = await prisma.process.findFirst({
      where: {
        id: processId,
        companyId: admin.companyId,
      },
    });
    
    if (!process) {
      return NextResponse.json({ message: 'Process not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.operationId || !data.description) {
      return NextResponse.json(
        { message: 'Operation ID and description are required' },
        { status: 400 }
      );
    }
    
    // Check if operation ID already exists for this process
    const existingOperation = await prisma.operation.findFirst({
      where: {
        processId: processId,
        operationId: data.operationId,
      },
    });
    
    if (existingOperation) {
      return NextResponse.json(
        { message: 'Operation ID already exists for this process' },
        { status: 400 }
      );
    }
    
    // Create new operation
    const operation = await prisma.operation.create({
      data: {
        processId: processId,
        operationId: data.operationId,
        description: data.description,
        standardTimeSeconds: data.standardTimeSeconds,
        toolsRequired: data.toolsRequired,
        qualityCheck: data.qualityCheck,
        sequenceNumber: data.sequenceNumber || 0,
      },
    });
    
    return NextResponse.json(operation);
  } catch (error) {
    console.error('Error creating operation:', error);
    return NextResponse.json({ message: 'Failed to create operation' }, { status: 500 });
  }
}
