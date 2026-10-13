import { prisma } from '@/lib/prisma'

export class CheckoutService {
  static async checkoutAsset(data: {
    assetId: string
    assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE'
    userId: string
    notes?: string
    expectedReturnDate?: Date
  }) {
    const checkout = await prisma.assetCheckout.create({
      data: {
        assetId: data.assetId,
        assetType: data.assetType,
        userId: data.userId,
        notes: data.notes,
        checkoutDate: new Date(),
        expectedReturnDate: data.expectedReturnDate,
        status: 'CHECKED_OUT',
      },
      include: {
        user: true,
        asset: true,
      },
    })

    // Update asset status to IN_USE
    if (data.assetType === 'FURNITURE') {
      await prisma.furnitureAsset.update({
        where: { id: data.assetId },
        data: { status: 'IN_USE' },
      })
    } else if (data.assetType === 'ELECTRONIC') {
      await prisma.electronicAsset.update({
        where: { id: data.assetId },
        data: { status: 'IN_USE' },
      })
    } else if (data.assetType === 'VEHICLE') {
      await prisma.vehicleAsset.update({
        where: { id: data.assetId },
        data: { status: 'IN_USE' },
      })
    }

    return checkout
  }

  static async checkinAsset(checkoutId: string, notes?: string) {
    const checkout = await prisma.assetCheckout.findUnique({
      where: { id: checkoutId },
    })

    if (!checkout) {
      throw new Error('Checkout not found')
    }

    // Update checkout record
    const updated = await prisma.assetCheckout.update({
      where: { id: checkoutId },
      data: {
        status: 'CHECKED_IN',
        returnDate: new Date(),
        returnNotes: notes,
      },
      include: {
        user: true,
      },
    })

    // Update asset status to IN_STORE
    if (checkout.assetType === 'FURNITURE') {
      await prisma.furnitureAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE', assigned_user_id: null },
      })
    } else if (checkout.assetType === 'ELECTRONIC') {
      await prisma.electronicAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE' },
      })
    } else if (checkout.assetType === 'VEHICLE') {
      await prisma.vehicleAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE' },
      })
    }

    return updated
  }

  static async getUserCheckouts(userId: string) {
    return prisma.assetCheckout.findMany({
      where: {
        userId,
        status: 'CHECKED_OUT',
      },
      include: {
        user: true,
      },
      orderBy: { checkoutDate: 'desc' },
    })
  }

  static async getCheckoutHistory(assetId: string) {
    return prisma.assetCheckout.findMany({
      where: { assetId },
      include: {
        user: true,
      },
      orderBy: { checkoutDate: 'desc' },
    })
  }

  static async getOverdueCheckouts() {
    const now = new Date()
    return prisma.assetCheckout.findMany({
      where: {
        status: 'CHECKED_OUT',
        expectedReturnDate: {
          lt: now,
        },
      },
      include: {
        user: true,
      },
      orderBy: { expectedReturnDate: 'asc' },
    })
  }

  static async getCheckoutStats(companyId?: string) {
    const where = companyId ? { /* company filter */ } : {}

    const [total, checkedOut, overdue] = await Promise.all([
      prisma.assetCheckout.count(),
      prisma.assetCheckout.count({
        where: { status: 'CHECKED_OUT' },
      }),
      prisma.assetCheckout.count({
        where: {
          status: 'CHECKED_OUT',
          expectedReturnDate: { lt: new Date() },
        },
      }),
    ])

    return {
      total,
      checkedOut,
      overdue,
      checkedIn: total - checkedOut,
    }
  }

  static async extendCheckout(checkoutId: string, newReturnDate: Date) {
    return prisma.assetCheckout.update({
      where: { id: checkoutId },
      data: {
        expectedReturnDate: newReturnDate,
      },
      include: {
        user: true,
      },
    })
  }
}
