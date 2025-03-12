import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; /* Commented out by fix-eslint.js */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const _session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let processName = formData.get('processName') as string;

    if (!file) {
      return NextResponse.json({ message: 'Excel file is required' }, { status: 400 });
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    
    if (data.length === 0) {
      return NextResponse.json({ message: 'Excel file is empty' }, { status: 400 });
    }

    // Extract process name from Excel if not provided in form
    if (!processName || processName.trim() === '') {
      // Try to find process name in the Excel file (typically in cell B1)
      if (data.length > 0 && data[0].length > 1 && data[0][1]) {
        processName = String(data[0][1]);
      } else {
        return NextResponse.json({ message: 'Process name not found in Excel file and not provided in form' }, { status: 400 });
      }
    }

    // Check if process name already exists for this company
    const existingProcess = await prisma.process.findFirst({
      where: {
        name: processName,
        companyId: session.user.companyId,
      },
    });

    if (existingProcess) {
      return NextResponse.json({ message: 'Process name already exists' }, { status: 400 });
    }

    // Create process
    const process = await prisma.process.create({
      data: {
        name: processName,
        companyId: session.user.companyId,
      },
    });

    // Extract operations from Excel data
    const operations = [];
    let sequenceNumber = 0;
    let operationHeaderRow = -1;

    // Find the row with operation headers
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row[0] === 'Operation ID') {
        operationHeaderRow = i;
        break;
      }
    }

    if (operationHeaderRow === -1) {
      await prisma.process.delete({
        where: { id: process.id },
      });
      return NextResponse.json({ message: 'Operation headers not found in Excel file' }, { status: 400 });
    }

    // Get column indices for each field
    const _headers = data[operationHeaderRow];
    const columnIndices = {
      operationId: 0,
      description: 1,
      standardTime: 2,
      toolsRequired: 3,
      qualityCheck: 4
    };

    // Process operations starting from the row after headers
    for (let i = operationHeaderRow + 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || !row[columnIndices.operationId]) {
        continue;
      }
      
      const _operationId = String(row[columnIndices.operationId]);
      
      // Check if this is a valid operation ID (starts with OP or op)
      if (!operationId.toLowerCase().startsWith('op')) {
        continue;
      }

      operations.push({
        processId: process.id,
        operationId: operationId,
        description: row[columnIndices.description] ? String(row[columnIndices.description]) : '',
        standardTimeSeconds: typeof row[columnIndices.standardTime] === 'number' ? row[columnIndices.standardTime] : null,
        toolsRequired: row[columnIndices.toolsRequired] ? String(row[columnIndices.toolsRequired]) : null,
        qualityCheck: row[columnIndices.qualityCheck] ? String(row[columnIndices.qualityCheck]) : null,
        sequenceNumber: sequenceNumber++,
      });
    }

    // Create operations
    if (operations.length > 0) {
      await prisma.operation.createMany({
        data: operations,
      });
    } else {
      // If no operations were found, delete the process
      await prisma.process.delete({
        where: { id: process.id },
      });
      return NextResponse.json({ 
        message: 'No valid operations found in Excel file. Operations must have IDs starting with "OP" and follow the template format.',
        details: 'Please ensure your Excel file has a row with "Operation ID" header followed by operation rows.'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Process imported successfully',
      processId: process.id,
      processName: processName,
      operationCount: operations.length
    });
  } catch (error) {
    console.error('Error importing process:', error);
    return NextResponse.json({ 
      message: 'Failed to import process', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
