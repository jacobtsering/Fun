import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Extract process name from Excel (typically in cell B1)
    let processName = null;
    if (data.length > 0 && data[0].length > 1 && data[0][1]) {
      processName = String(data[0][1]);
    }

    return NextResponse.json({ 
      processName: processName,
      message: processName ? 'Process name extracted successfully' : 'No process name found in Excel file'
    });
  } catch (error) {
    console.error('Error extracting process name:', error);
    return NextResponse.json({ 
      message: 'Failed to extract process name', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
