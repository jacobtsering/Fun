import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const userId = params.id;
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        operatorAccess: {
          include: {
            process: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user belongs to admin's company
    if (user.companyId !== admin.companyId) {
      return NextResponse.json(
        { message: 'You do not have permission to view this user' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const userId = params.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.badgeId || !data.name || !data.role) {
      return NextResponse.json(
        { message: 'Badge ID, name, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists and belongs to admin's company
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (existingUser.companyId !== admin.companyId) {
      return NextResponse.json(
        { message: 'You do not have permission to update this user' },
        { status: 403 }
      );
    }
    
    // Check if badge ID already exists (if changed)
    if (data.badgeId !== existingUser.badgeId) {
      const badgeExists = await prisma.user.findUnique({
        where: {
          badgeId: data.badgeId,
        },
      });
      
      if (badgeExists) {
        return NextResponse.json(
          { message: 'Badge ID already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update user in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user basic info
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          badgeId: data.badgeId,
          name: data.name,
          role: data.role,
        },
      });
      
      // If user is an operator, update process access
      if (data.role === 'operator' && Array.isArray(data.processAccess)) {
        // Delete existing access
        await tx.operatorProcessAccess.deleteMany({
          where: {
            userId: userId,
          },
        });
        
        // Create new access records
        if (data.processAccess.length > 0) {
          await tx.operatorProcessAccess.createMany({
            data: data.processAccess.map((processId: string) => ({
              userId: userId,
              processId,
            })),
          });
        }
      }
      
      return user;
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdminAuth();
    const userId = params.id;
    
    // Check if user exists and belongs to admin's company
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (existingUser.companyId !== admin.companyId) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this user' },
        { status: 403 }
      );
    }
    
    // Delete user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
