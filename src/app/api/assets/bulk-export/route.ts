import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BulkExportSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(100),
  assetType: z.enum(['FURNITURE', 'ELECTRONICS', 'VEHICLES']),
  format: z.enum(['csv', 'pdf']).default('csv'),
});

type BulkExportRequest = z.infer<typeof BulkExportSchema>;

function generateCSV(assets: any[], assetType: string): string {
  const headers = [
    'ID',
    'Asset Name',
    'Asset Tag',
    'Status',
    'Condition',
    'Location',
    'Assigned To',
    'Company',
    'Purchase Price',
    'Created Date',
  ];

  if (assetType === 'FURNITURE') {
    headers.splice(3, 0, 'Furniture Type');
  } else if (assetType === 'ELECTRONICS') {
    headers.splice(3, 0, 'Equipment Type');
  } else if (assetType === 'VEHICLES') {
    headers.splice(3, 0, 'Make/Model');
  }

  const rows = assets.map((asset: any) => {
    const baseRow = [
      asset.id,
      asset.assetName || '',
      asset.assetTag || '',
      asset.status || '',
      asset.condition || '',
      asset.location?.locationName || '',
      asset.assignedUser?.fullName || '',
      asset.company?.companyName || '',
      asset.purchasePrice ? asset.purchasePrice.toString() : '',
      new Date(asset.createdAt).toLocaleDateString(),
    ];

    if (assetType === 'FURNITURE') {
      baseRow.splice(3, 0, asset.furnitureType || '');
    } else if (assetType === 'ELECTRONICS') {
      baseRow.splice(3, 0, asset.equipmentType || '');
    } else if (assetType === 'VEHICLES') {
      baseRow.splice(
        3,
        0,
        `${asset.make || ''} ${asset.model || ''}`.trim()
      );
    }

    return baseRow;
  });

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = BulkExportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { assetIds, assetType, format } = validation.data as BulkExportRequest;

    // Determine the model to query
    const modelMap = {
      FURNITURE: 'furnitureAsset',
      ELECTRONICS: 'electronicAsset',
      VEHICLES: 'vehicleAsset',
    } as const;

    const model = modelMap[assetType];

    // Get all assets
    const assets = await (prisma[model] as any).findMany({
      where: { id: { in: assetIds } },
      include: {
        location: { select: { locationName: true } },
        assignedUser: { select: { fullName: true } },
        company: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const csv = generateCSV(assets, assetType);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${assetType.toLowerCase()}-export-${Date.now()}.csv"`,
        },
      });
    }

    // For now, return CSV even if PDF requested (PDF implementation can be added later)
    const csv = generateCSV(assets, assetType);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${assetType.toLowerCase()}-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Bulk export error:', error);
    return NextResponse.json(
      { error: 'Failed to export assets' },
      { status: 500 }
    );
  }
}
