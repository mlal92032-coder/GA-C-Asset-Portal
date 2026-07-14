import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock session provider
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <MockSessionProvider>{children}</MockSessionProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render, userEvent }

// Common test helpers
export const waitForLoadingToFinish = () => {
  return screen.findByText(/loading/i).then(() => {
    return screen.queryByText(/loading/i)
  })
}

export const mockApiResponse = <T,>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response)
}

export const mockApiError = (message: string, status = 400) => {
  return Promise.reject({
    ok: false,
    status,
    message,
  })
}

// Mock Prisma Client
export const createMockPrismaClient = () => ({
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  furnitureAsset: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  electronicAsset: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  vehicleAsset: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  assetCheckout: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
})

// Setup common test data
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  ...overrides,
})

export const createMockAsset = (overrides = {}) => ({
  id: '1',
  assetTag: 'FURN-000001',
  name: 'Test Asset',
  status: 'IN_STORE',
  condition: 'GOOD',
  purchasePrice: 1000,
  ...overrides,
})

export const createMockCheckout = (overrides = {}) => ({
  id: '1',
  assetId: '1',
  userId: '1',
  status: 'CHECKED_OUT',
  checkoutDate: new Date(),
  ...overrides,
})

// Common assertions
export const expectApiCall = (mock: jest.Mock, expectedData?: any) => {
  expect(mock).toHaveBeenCalled()
  if (expectedData) {
    expect(mock).toHaveBeenCalledWith(expect.objectContaining(expectedData))
  }
}

export const expectButtonToBeDisabled = (button: HTMLElement) => {
  expect(button).toBeDisabled()
}

export const expectButtonToBeEnabled = (button: HTMLElement) => {
  expect(button).not.toBeDisabled()
}

// Screen helper
const { screen } = require('@testing-library/react')
