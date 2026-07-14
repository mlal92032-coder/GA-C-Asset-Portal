import { AssetService } from '@/services/asset.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma')

describe('AssetService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createFurnitureAsset', () => {
    it('should create a furniture asset with valid data', async () => {
      const mockAsset = {
        id: '1',
        assetTag: 'FURN-000001',
        name: 'Executive Desk',
        description: 'Solid wood desk',
        category: 'Desk',
        condition: 'GOOD',
        status: 'IN_STORE',
        purchasePrice: 1500,
        createdAt: new Date(),
      }

      mockPrisma.furnitureAsset.create.mockResolvedValueOnce(mockAsset as any)

      const result = await AssetService.createFurnitureAsset({
        assetTag: 'FURN-000001',
        name: 'Executive Desk',
      })

      expect(result.id).toBe('1')
      expect(result.name).toBe('Executive Desk')
      expect(mockPrisma.furnitureAsset.create).toHaveBeenCalled()
    })

    it('should throw error with invalid data', async () => {
      mockPrisma.furnitureAsset.create.mockRejectedValueOnce(
        new Error('Invalid data'),
      )

      await expect(
        AssetService.createFurnitureAsset({ name: '' }),
      ).rejects.toThrow('Invalid data')
    })
  })

  describe('getFurnitureAssets', () => {
    it('should return filtered furniture assets', async () => {
      const mockAssets = [
        {
          id: '1',
          name: 'Desk 1',
          status: 'IN_STORE',
        },
        {
          id: '2',
          name: 'Desk 2',
          status: 'IN_USE',
        },
      ]

      mockPrisma.furnitureAsset.findMany.mockResolvedValueOnce(mockAssets as any)

      const result = await AssetService.getFurnitureAssets({
        status: 'IN_STORE',
        limit: 50,
      })

      expect(result).toHaveLength(2)
      expect(mockPrisma.furnitureAsset.findMany).toHaveBeenCalled()
    })

    it('should apply search filter', async () => {
      const mockAssets = [
        {
          id: '1',
          name: 'Executive Desk',
          assetTag: 'FURN-000001',
        },
      ]

      mockPrisma.furnitureAsset.findMany.mockResolvedValueOnce(mockAssets as any)

      await AssetService.getFurnitureAssets({
        search: 'Executive',
      })

      expect(mockPrisma.furnitureAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      )
    })

    it('should handle pagination', async () => {
      mockPrisma.furnitureAsset.findMany.mockResolvedValueOnce([])

      await AssetService.getFurnitureAssets({
        limit: 20,
        offset: 40,
      })

      expect(mockPrisma.furnitureAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        }),
      )
    })
  })

  describe('getFurnitureAsset', () => {
    it('should return single furniture asset with relations', async () => {
      const mockAsset = {
        id: '1',
        name: 'Desk',
        checkouts: [],
        maintenances: [],
        auditLogs: [],
      }

      mockPrisma.furnitureAsset.findUnique.mockResolvedValueOnce(mockAsset as any)

      const result = await AssetService.getFurnitureAsset('1')

      expect(result.id).toBe('1')
      expect(result).toHaveProperty('checkouts')
      expect(result).toHaveProperty('maintenances')
    })

    it('should return null if asset not found', async () => {
      mockPrisma.furnitureAsset.findUnique.mockResolvedValueOnce(null)

      const result = await AssetService.getFurnitureAsset('invalid-id')

      expect(result).toBeNull()
    })
  })

  describe('updateFurnitureAsset', () => {
    it('should update furniture asset', async () => {
      const mockAsset = {
        id: '1',
        name: 'Updated Desk',
        updatedAt: new Date(),
      }

      mockPrisma.furnitureAsset.update.mockResolvedValueOnce(mockAsset as any)

      const result = await AssetService.updateFurnitureAsset('1', {
        name: 'Updated Desk',
      })

      expect(result.name).toBe('Updated Desk')
      expect(mockPrisma.furnitureAsset.update).toHaveBeenCalled()
    })
  })

  describe('getAssetStats', () => {
    it('should return asset statistics', async () => {
      mockPrisma.furnitureAsset.count.mockResolvedValueOnce(10)
      mockPrisma.electronicAsset.count.mockResolvedValueOnce(20)
      mockPrisma.vehicleAsset.count.mockResolvedValueOnce(5)
      mockPrisma.furnitureAsset.aggregate.mockResolvedValueOnce({
        _sum: { purchasePrice: 15000 },
      } as any)
      mockPrisma.electronicAsset.aggregate.mockResolvedValueOnce({
        _sum: { purchasePrice: 50000 },
      } as any)
      mockPrisma.vehicleAsset.aggregate.mockResolvedValueOnce({
        _sum: { purchasePrice: 200000 },
      } as any)

      const result = await AssetService.getAssetStats()

      expect(result.total).toBe(35)
      expect(result.furniture).toBe(10)
      expect(result.electronics).toBe(20)
      expect(result.vehicles).toBe(5)
      expect(result.totalValue).toBe(265000)
    })
  })
})
