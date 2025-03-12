import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

// GET /api/users - Get all users for the current company
export async function GET() {
  try {
    const admin = await requireAdminAuth();
    
    const users = await prisma.user.findMany({
      where: {
        companyId: admin.companyId,
      },
      include: {
        operatorAccess: {
          include: {
            process: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminAuth();
    const data = await request.json();
    
    // Validate required fields
    if (!data.badgeId || !data.name || !data.role) {
      return NextResponse.json(
        { message: 'Badge ID, name, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if badge ID already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        badgeId: data.badgeId,
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Badge ID already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        badgeId: data.badgeId,
        name: data.name,
        role: data.role,
        companyId: admin.companyId,
      },
    });
    
    // If user is an operator and process access is provided, create access records
    if (data.role === 'operator' && Array.isArray(data.processAccess) && data.processAccess.length > 0) {
      await prisma.operatorProcessAccess.createMany({
        data: data.processAccess.map((processId: string) => ({
          userId: user.id,
          processId,
        })),
      });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
