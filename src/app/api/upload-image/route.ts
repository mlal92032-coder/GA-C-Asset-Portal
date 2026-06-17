import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, copyFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
// Save to public/uploads for direct static serving
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, BMP` },
        { status: 400 }
      );
    }

    // Validate file size
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds 10MB limit (${(fileSize / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // Generate unique filename: timestamp-uuid.ext
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const uuid = randomUUID().slice(0, 8);
    const fileName = `${timestamp}-${uuid}.${ext}`;

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const filePath = path.join(UPLOAD_DIR, fileName);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Also copy to prisma/uploads for backup/portability
    try {
      const backupDir = path.join(process.cwd(), 'prisma', 'uploads');
      await mkdir(backupDir, { recursive: true });
      await copyFile(filePath, path.join(backupDir, fileName));
    } catch (e) {
      // Backup copy failed, continue without backup
    }

    // Return path for direct static serving from public/
    const publicPath = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        filePath: publicPath,
        fileSize,
        fileType: file.type,
      },
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
