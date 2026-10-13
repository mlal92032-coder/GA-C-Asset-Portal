import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BulkPrintSchema = z.object({
  assetIds: z.array(z.string()).min(1),
  assetType: z.enum(['FURNITURE', 'ELECTRONICS', 'VEHICLE']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = BulkPrintSchema.parse(body);

    const { assetIds, assetType } = validatedData;

    // Fetch assets based on type
    let assets: any[] = [];

    if (assetType === 'FURNITURE') {
      assets = await prisma.furnitureAsset.findMany({
        where: { id: { in: assetIds } },
        select: {
          id: true,
          assetName: true,
          assetTag: true,
          status: true,
          location: { select: { locationName: true } },
        },
      });
    } else if (assetType === 'ELECTRONICS') {
      assets = await prisma.electronicAsset.findMany({
        where: { id: { in: assetIds } },
        select: {
          id: true,
          assetName: true,
          assetTag: true,
          status: true,
          location: { select: { locationName: true } },
        },
      });
    } else if (assetType === 'VEHICLE') {
      assets = await prisma.vehicleAsset.findMany({
        where: { id: { in: assetIds } },
        select: {
          id: true,
          assetName: true,
          assetTag: true,
          status: true,
          location: { select: { locationName: true } },
        },
      });
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json({ success: false, error: 'No assets found' }, { status: 404 });
    }

    // Generate HTML for printable labels (4x6 inches - thermal printer size)
    // 4x6 inches = 384x576 pixels at 96 DPI
    const labelHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Labels</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              background: white;
              padding: 0;
            }

            @page {
              size: 4in 6in;
              margin: 0;
              padding: 0;
            }

            .label {
              width: 4in;
              height: 6in;
              padding: 0.15in;
              border: 1px solid #ccc;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
            }

            .label-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 0.1in;
              margin-bottom: 0.1in;
            }

            .asset-name {
              font-size: 18px;
              font-weight: bold;
              color: #000;
              word-wrap: break-word;
              line-height: 1.2;
            }

            .asset-tag {
              font-size: 10px;
              color: #666;
              font-family: monospace;
              margin-top: 0.05in;
            }

            .barcode-container {
              text-align: center;
              margin: 0.1in 0;
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .barcode {
              font-family: 'Code 128', monospace;
              font-size: 24px;
              letter-spacing: 2px;
              font-weight: bold;
            }

            .label-footer {
              border-top: 1px solid #333;
              padding-top: 0.05in;
              font-size: 9px;
              text-align: center;
            }

            .status-badge {
              display: inline-block;
              padding: 0.05in 0.1in;
              border-radius: 2px;
              font-weight: bold;
              font-size: 10px;
              margin: 0.05in 0;
            }

            .status-in-use {
              background: #4ade80;
              color: white;
            }

            .status-in-store {
              background: #60a5fa;
              color: white;
            }

            .status-disposed {
              background: #ef4444;
              color: white;
            }

            .status-auction {
              background: #f59e0b;
              color: white;
            }

            .location {
              font-size: 9px;
              color: #555;
              margin-top: 0.05in;
            }
          </style>
        </head>
        <body>
          ${assets
            .map(
              (asset) => `
            <div class="label">
              <div class="label-header">
                <div class="asset-name">${asset.assetName}</div>
                <div class="asset-tag">${asset.assetTag || 'NO TAG'}</div>
              </div>

              <div class="barcode-container">
                <div class="barcode">${asset.assetTag ? asset.assetTag.substring(0, 20) : asset.id.substring(0, 15)}</div>
              </div>

              <div class="label-footer">
                <div class="status-badge status-${asset.status.toLowerCase().replace('_', '-')}">
                  ${asset.status.replace(/_/g, ' ')}
                </div>
                <div class="location">${asset.location?.locationName || 'Unknown'}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `;

    return new NextResponse(labelHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="asset-labels-${Date.now()}.html"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation error';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error('Bulk print error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate labels' },
      { status: 500 }
    );
  }
}
