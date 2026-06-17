import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    const where: {
      OR?: Array<{ fullName?: { contains: string } } | { email?: { contains: string } } | { department?: { contains: string } }>;
      status?: 'ACTIVE' | 'INACTIVE';
      department?: string;
    } = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { department: { contains: search } },
      ];
    }
    if (status) where.status = status as 'ACTIVE' | 'INACTIVE';
    if (department) where.department = department;

    // Fetch employees with all related assets in single query (no N+1)
    const employees = await prisma.user.findMany({
      where,
      include: {
        assignedFurniture: {
          select: {
            id: true,
            assetTag: true,
            assetName: true,
            furnitureType: true,
            condition: true,
            status: true,
            location: { select: { locationName: true } },
          },
        },
        assignedElectronic: {
          select: {
            id: true,
            assetTag: true,
            assetName: true,
            deviceType: true,
            brand: true,
            model: true,
            condition: true,
            status: true,
            location: { select: { locationName: true } },
          },
        },
        assignedVehicle: {
          select: {
            id: true,
            assetTag: true,
            assetName: true,
            vehicleType: true,
            brand: true,
            model: true,
            registrationNumber: true,
            condition: true,
            status: true,
            location: { select: { locationName: true } },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    // Calculate total assets for each employee
    const employeesWithAssetCount = employees.map((emp) => ({
      id: emp.id,
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone,
      role: emp.role,
      status: emp.status,
      permissions: emp.permissions,
      createdAt: emp.createdAt,
      furnitureAssets: emp.assignedFurniture,
      electronicAssets: emp.assignedElectronic,
      vehicleAssets: emp.assignedVehicle,
      totalAssets: emp.assignedFurniture.length + emp.assignedElectronic.length + emp.assignedVehicle.length,
    }));

    return NextResponse.json({
      success: true,
      data: employeesWithAssetCount,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
