import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireView } from '@/lib/api-auth';
import { z } from 'zod';

const reviewGetSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireView('reviews');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const assetType = searchParams.get('assetType');

    if (!assetId || !assetType) {
      return NextResponse.json(
        { success: false, error: 'assetId and assetType are required' },
        { status: 400 }
      );
    }

    try {
      reviewGetSchema.parse({ assetId, assetType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const reviews = await prisma.review.findMany({
      where: {
        assetId,
        assetType,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

const reviewPostSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireView('reviews');
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    const body = await request.json();

    let validatedData: z.infer<typeof reviewPostSchema>;
    try {
      validatedData = reviewPostSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify asset exists
    let assetExists = false;
    if (validatedData.assetType === 'FURNITURE') {
      assetExists = (await prisma.furnitureAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    } else if (validatedData.assetType === 'ELECTRONIC') {
      assetExists = (await prisma.electronicAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    } else if (validatedData.assetType === 'VEHICLE') {
      assetExists = (await prisma.vehicleAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    }

    if (!assetExists) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        assetId: validatedData.assetId,
        assetType: validatedData.assetType,
        userId: currentUser.id,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        tenantId: currentUser.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
