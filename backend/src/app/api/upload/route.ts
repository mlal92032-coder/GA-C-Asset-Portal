import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile, stat } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'assets');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const assetId = formData.get('assetId') as string | null;
    const assetType = formData.get('assetType') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!assetId) {
      return NextResponse.json({ success: false, error: 'No asset ID provided' }, { status: 400 });
    }

    if (!assetType) {
      return NextResponse.json({ success: false, error: 'No asset type provided' }, { status: 400 });
    }

    // Validate asset type
    const validAssetTypes = ['FURNITURE', 'ELECTRONIC', 'VEHICLE'];
    if (!validAssetTypes.includes(assetType)) {
      return NextResponse.json({ success: false, error: 'Invalid asset type' }, { status: 400 });
    }

    // Validate file size
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds 5MB limit (${(fileSize / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // Generate safe file name with timestamp
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${originalName}`;

    // Create asset-specific directory
    const assetDir = path.join(UPLOAD_DIR, assetId);
    await mkdir(assetDir, { recursive: true });

    const filePath = path.join(assetDir, fileName);
    const relativePath = `/uploads/assets/${assetId}/${fileName}`;

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create attachment record in database
    const attachment = await prisma.attachment.create({
      data: {
        assetId,
        assetType,
        fileName: originalName,
        filePath: relativePath,
        fileSize,
        fileType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      data: attachment,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const assetType = searchParams.get('assetType');

    if (!assetId || !assetType) {
      return NextResponse.json({ success: false, error: 'assetId and assetType required' }, { status: 400 });
    }

    const attachments = await prisma.attachment.findMany({
      where: { assetId, assetType },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    console.error('Fetch attachments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return NextResponse.json({ success: false, error: 'Attachment ID required' }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ success: false, error: 'Attachment not found' }, { status: 404 });
    }

    // Delete file from filesystem
    const fullPath = path.join(process.cwd(), 'public', attachment.filePath);
    try {
      await stat(fullPath);
      const { unlink } = await import('fs/promises');
      await unlink(fullPath);
    } catch {
      // File might already be deleted, continue
    }

    // Delete database record
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
