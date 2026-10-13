import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserService {
  static async createUser(data: {
    email: string
    password: string
    fullName: string
    department?: string
    designation?: string
    phone?: string
    role?: Role
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        department: data.department,
        designation: data.designation,
        phone: data.phone,
        role: data.role || 'VIEW_USER',
        status: 'ACTIVE',
      },
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        assignedFurniture: true,
        assignedElectronic: true,
        assignedVehicle: true,
        auditLogs: { take: 10, orderBy: { createdAt: 'desc' } },
        checkouts: { where: { status: 'CHECKED_OUT' }, include: { } },
      },
    })
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        assignedFurniture: true,
        assignedElectronic: true,
        assignedVehicle: true,
        auditLogs: { take: 10, orderBy: { createdAt: 'desc' } },
        checkouts: { where: { status: 'CHECKED_OUT' } },
      },
    })
  }

  static async getUsers(filters?: {
    role?: Role
    department?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (filters?.role) where.role = filters.role
    if (filters?.department) where.department = filters.department
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { fullName: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.user.findMany({
      where,
      include: {
        checkouts: { where: { status: 'CHECKED_OUT' } },
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) throw new Error('User not found')

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) throw new Error('Invalid current password')

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }

  static async deactivateUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })
  }

  static async activateUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    })
  }

  static async getUserStats() {
    const [total, admins, active, inactive] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'INACTIVE' } }),
    ])

    return {
      total,
      admins,
      active,
      inactive,
    }
  }

  static async getUserDepartments() {
    const departments = await prisma.user.findMany({
      select: { department: true },
      distinct: ['department'],
      where: { department: { not: null } },
    })

    return departments.map(d => d.department).filter(Boolean)
  }

  static async getUsersByDepartment(department: string) {
    return prisma.user.findMany({
      where: { department },
      include: {
        checkouts: { where: { status: 'CHECKED_OUT' } },
      },
      orderBy: { fullName: 'asc' },
    })
  }
}
