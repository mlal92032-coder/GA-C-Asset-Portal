import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const assetType = searchParams.get('assetType');

    if (!assetId || !assetType) {
      return NextResponse.json(
        { success: false, error: 'Asset ID and type are required' },
        { status: 400 }
      );
    }

    const attachments = await prisma.attachment.findMany({
      where: { assetId, assetType },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assetId = formData.get('assetId') as string;
    const assetType = formData.get('assetType') as string;

    if (!file || !assetId || !assetType) {
      return NextResponse.json(
        { success: false, error: 'File, asset ID, and asset type are required' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'attachments');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const attachment = await prisma.attachment.create({
      data: {
        assetId,
        assetType,
        fileName: file.name,
        filePath: `/uploads/attachments/${fileName}`,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
      },
    });

    return NextResponse.json(
      { success: true, data: attachment, message: 'File uploaded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
