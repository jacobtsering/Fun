import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

// GET /api/processes/[processId]/operations/[operationId] - Get a specific operation
export async function GET(
  request: NextRequest,
  { params }: { params: { processId: string; operationId: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const { processId, operationId } = params;
    
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
    
    // Get the operation
    const operation = await prisma.operation.findUnique({
      where: {
        id: operationId,
      },
    });
    
    if (!operation || operation.processId !== processId) {
      return NextResponse.json({ message: 'Operation not found' }, { status: 404 });
    }
    
    return NextResponse.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    return NextResponse.json({ message: 'Failed to fetch operation' }, { status: 500 });
  }
}

// PUT /api/processes/[processId]/operations/[operationId] - Update an operation
export async function PUT(
  request: NextRequest,
  { params }: { params: { processId: string; operationId: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const { processId, operationId } = params;
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
    
    // Check if operation exists and belongs to this process
    const existingOperation = await prisma.operation.findUnique({
      where: {
        id: operationId,
      },
    });
    
    if (!existingOperation || existingOperation.processId !== processId) {
      return NextResponse.json({ message: 'Operation not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.operationId || !data.description) {
      return NextResponse.json(
        { message: 'Operation ID and description are required' },
        { status: 400 }
      );
    }
    
    // Check if operation ID already exists for this process (if changed)
    if (data.operationId !== existingOperation.operationId) {
      const duplicateOperation = await prisma.operation.findFirst({
        where: {
          processId: processId,
          operationId: data.operationId,
          id: { not: operationId },
        },
      });
      
      if (duplicateOperation) {
        return NextResponse.json(
          { message: 'Operation ID already exists for this process' },
          { status: 400 }
        );
      }
    }
    
    // Update operation
    const updatedOperation = await prisma.operation.update({
      where: {
        id: operationId,
      },
      data: {
        operationId: data.operationId,
        description: data.description,
        standardTimeSeconds: data.standardTimeSeconds,
        toolsRequired: data.toolsRequired,
        qualityCheck: data.qualityCheck,
      },
    });
    
    return NextResponse.json(updatedOperation);
  } catch (error) {
    console.error('Error updating operation:', error);
    return NextResponse.json({ message: 'Failed to update operation' }, { status: 500 });
  }
}

// DELETE /api/processes/[processId]/operations/[operationId] - Delete an operation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { processId: string; operationId: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const { processId, operationId } = params;
    
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
    
    // Check if operation exists and belongs to this process
    const operation = await prisma.operation.findUnique({
      where: {
        id: operationId,
      },
    });
    
    if (!operation || operation.processId !== processId) {
      return NextResponse.json({ message: 'Operation not found' }, { status: 404 });
    }
    
    // Delete operation
    await prisma.operation.delete({
      where: {
        id: operationId,
      },
    });
    
    // Update sequence numbers for remaining operations
    const remainingOperations = await prisma.operation.findMany({
      where: {
        processId: processId,
        sequenceNumber: {
          gt: operation.sequenceNumber,
        },
      },
      orderBy: {
        sequenceNumber: 'asc',
      },
    });
    
    // Update sequence numbers in a transaction
    if (remainingOperations.length > 0) {
      await prisma.$transaction(
        remainingOperations.map(op => 
          prisma.operation.update({
            where: { id: op.id },
            data: { sequenceNumber: op.sequenceNumber - 1 },
          })
        )
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting operation:', error);
    return NextResponse.json({ message: 'Failed to delete operation' }, { status: 500 });
  }
}
