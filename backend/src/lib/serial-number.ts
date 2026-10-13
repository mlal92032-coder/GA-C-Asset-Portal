import { prisma } from './prisma';

/**
 * Generate a global sequential serial number across all asset types
 * Format: Simple sequential numbers starting from 1
 * This provides a total count of all assets in the system
 */
export async function generateSerialNumber(assetType: 'FUR' | 'ELE' | 'VEH'): Promise<string> {
  let maxSequence = 0;

  // Get the highest serial number from all asset types
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

  // Find the maximum serial number across all asset types
  const sequences = [
    furnitureMax?.serialNumber ? parseInt(furnitureMax.serialNumber, 10) : 0,
    electronicsMax?.serialNumber ? parseInt(electronicsMax.serialNumber, 10) : 0,
    vehiclesMax?.serialNumber ? parseInt(vehiclesMax.serialNumber, 10) : 0,
  ];

  maxSequence = Math.max(...sequences.filter(n => !isNaN(n)));

  // Return the next sequential number
  return (maxSequence + 1).toString();
}
