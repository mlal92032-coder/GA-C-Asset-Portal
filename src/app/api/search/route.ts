import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireView } from '@/lib/api-auth';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireView('furniture');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    try {
      searchSchema.parse({ q: query });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: true, data: [] }
        );
      }
      throw error;
    }

    // Search across all asset types and entities (case-insensitive via contains in SQLite)
    const [furniture, electronics, vehicles, companies, locations, users] = await Promise.all([
      prisma.furnitureAsset.findMany({
        where: {
          OR: [
            { assetName: { contains: query } },
            { assetTag: { contains: query } },
            { material: { contains: query } },
          ],
        },
        take: 10,
        select: { id: true, assetTag: true, assetName: true, condition: true, status: true },
      }),
      prisma.electronicAsset.findMany({
        where: {
          OR: [
            { assetName: { contains: query } },
            { assetTag: { contains: query } },
            { brand: { contains: query } },
            { model: { contains: query } },
          ],
        },
        take: 10,
        select: { id: true, assetTag: true, assetName: true, condition: true, status: true },
      }),
      prisma.vehicleAsset.findMany({
        where: {
          OR: [
            { assetName: { contains: query } },
            { assetTag: { contains: query } },
            { brand: { contains: query } },
            { registrationNumber: { contains: query } },
          ],
        },
        take: 10,
        select: { id: true, assetTag: true, assetName: true, condition: true, status: true },
      }),
      prisma.company.findMany({
        where: {
          OR: [
            { companyName: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 5,
        select: { id: true, companyName: true, email: true },
      }),
      prisma.location.findMany({
        where: {
          OR: [
            { locationName: { contains: query } },
            { building: { contains: query } },
          ],
        },
        take: 5,
        select: { id: true, locationName: true, building: true },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 5,
        select: { id: true, fullName: true, email: true },
      }),
    ]);

    const results = [
      ...furniture.map((item) => ({ ...item, type: 'FURNITURE' as const })),
      ...electronics.map((item) => ({ ...item, type: 'ELECTRONIC' as const })),
      ...vehicles.map((item) => ({ ...item, type: 'VEHICLE' as const })),
      ...companies.map((item) => ({ ...item, type: 'COMPANY' as const })),
      ...locations.map((item) => ({ ...item, type: 'LOCATION' as const })),
    ];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error performing global search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
