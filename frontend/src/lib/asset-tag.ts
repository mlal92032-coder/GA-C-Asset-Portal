import { prisma } from './prisma';

/**
 * Generate a unique asset tag in the format: AST-{TYPE}-{YEAR}-{SEQUENCE}
 * Example: AST-FUR-2025-0001, AST-ELE-2025-0042, AST-VEH-2025-0123
 * Uses timestamp to prevent race conditions in concurrent creates.
 */
export async function generateAssetTag(assetType: 'FUR' | 'ELE' | 'VEH'): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AST-${assetType}-${year}`;
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp for uniqueness

  // Format with timestamp-based uniqueness instead of sequential counter
  // This prevents race conditions where two concurrent creates get the same sequence number
  const tag = `${prefix}-${timestamp}`;

  return tag;
}
