import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest, { params }: { params: { processId: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const processId = params.processId;
    // Check if process exists and belongs to this company
    const existingProcess = await prisma.process.findFirst({
      where: {
        id: processId,
        companyId: session.user.companyId,
      },
    });
    if (!existingProcess) {
      return NextResponse.json({ message: 'Process not found' }, { status: 404 });
    }
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }
    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return NextResponse.json({ message: 'Excel file is empty' }, { status: 400 });
    }
    // Delete existing operations
    await prisma.operation.deleteMany({
      where: {
        processId: processId,
      },
    });
    // Extract operations from Excel data
    const operations = [];
    let sequenceNumber = 0;
    for (const row of data) {
      // Skip rows without operation ID
      if (!row['Operation ID'] || typeof row['Operation ID'] !== 'string' || !row['Operation ID'].startsWith('OP')) {
        continue;
      }
      operations.push({
        processId: processId,
        operationId: row['Operation ID'],
        description: row['Operation Description'] || '',
        standardTimeSeconds: typeof row['Standard time (sec)'] === 'number' ? row['Standard time (sec)'] : null,
        toolsRequired: row['Tools Required'] || null,
        qualityCheck: row['Quality Check'] || null,
        sequenceNumber: sequenceNumber++,
      });
    }
    // Create operations
    if (operations.length > 0) {
      await prisma.operation.createMany({
        data: operations,
      });
    } else {
      return NextResponse.json({ message: 'No valid operations found in Excel file' }, { status: 400 });
    }
    return NextResponse.json({ 
      message: 'Process replaced successfully',
      operationCount: operations.length
    });
  } catch (error) {
    console.error('Error replacing process:', error);
    return NextResponse.json({ message: 'Failed to replace process' }, { status: 500 });
  }
}
