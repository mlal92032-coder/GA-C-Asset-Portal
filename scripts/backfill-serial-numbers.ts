import { prisma } from '../src/lib/prisma';

async function backfillSerialNumbers() {
  console.log('Starting serial number backfill...');

  try {
    // Get all assets from all three tables, ordered by creation date
    const [furniture, electronics, vehicles] = await Promise.all([
      prisma.furnitureAsset.findMany({
        where: { serialNumber: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, assetName: true, createdAt: true },
      }),
      prisma.electronicAsset.findMany({
        where: { serialNumber: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, assetName: true, createdAt: true },
      }),
      prisma.vehicleAsset.findMany({
        where: { serialNumber: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true, assetName: true, createdAt: true },
      }),
    ]);

    // Get the current maximum serial number
    const [furnitureMax, electronicsMax, vehiclesMax] = await Promise.all([
      prisma.furnitureAsset.findFirst({
        where: { serialNumber: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { serialNumber: true },
      }),
      prisma.electronicAsset.findFirst({
        where: { serialNumber: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { serialNumber: true },
      }),
      prisma.vehicleAsset.findFirst({
        where: { serialNumber: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { serialNumber: true },
      }),
    ]);

    const sequences = [
      furnitureMax?.serialNumber ? parseInt(furnitureMax.serialNumber, 10) : 0,
      electronicsMax?.serialNumber ? parseInt(electronicsMax.serialNumber, 10) : 0,
      vehiclesMax?.serialNumber ? parseInt(vehiclesMax.serialNumber, 10) : 0,
    ];

    let currentSerial = Math.max(...sequences.filter(n => !isNaN(n)));

    // Combine all assets and sort by creation date
    const allAssets = [
      ...furniture.map(a => ({ ...a, type: 'furniture' as const })),
      ...electronics.map(a => ({ ...a, type: 'electronics' as const })),
      ...vehicles.map(a => ({ ...a, type: 'vehicles' as const })),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(`Found ${allAssets.length} assets without serial numbers`);
    console.log(`Starting from serial number: ${currentSerial + 1}`);

    // Update each asset with sequential serial number
    for (const asset of allAssets) {
      currentSerial++;
      const serialNumber = currentSerial.toString();

      if (asset.type === 'furniture') {
        await prisma.furnitureAsset.update({
          where: { id: asset.id },
          data: { serialNumber },
        });
        console.log(`✓ Furniture: ${asset.assetName} → Serial #${serialNumber}`);
      } else if (asset.type === 'electronics') {
        await prisma.electronicAsset.update({
          where: { id: asset.id },
          data: { serialNumber },
        });
        console.log(`✓ Electronics: ${asset.assetName} → Serial #${serialNumber}`);
      } else if (asset.type === 'vehicles') {
        await prisma.vehicleAsset.update({
          where: { id: asset.id },
          data: { serialNumber },
        });
        console.log(`✓ Vehicle: ${asset.assetName} → Serial #${serialNumber}`);
      }
    }

    console.log('\n✅ Serial number backfill completed successfully!');
    console.log(`Total assets updated: ${allAssets.length}`);
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillSerialNumbers();
