import { NextRequest } from 'next/server';

export type TenantTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  slug: string;
  tier: TenantTier;
  status: TenantStatus;
  features: string[];
  storageQuotaGB: number;
  maxUsers: number;
  maxAssets: number;
  maxAPICallsPerMonth: number;
  customBrandingEnabled: boolean;
  billingEmail: string;
}

export interface TenantRequest extends NextRequest {
  tenant?: TenantContext;
  tenantId?: string;
  userId?: string;
}

export interface TenantQuotas {
  storage: {
    used: number; // bytes
    limit: number; // bytes
    percentUsed: number;
  };
  users: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  assets: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentUsed: number;
  };
}

export interface TenantBranding {
  name: string;
  logo?: string;
  banner?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customBrandingEnabled: boolean;
}

export interface UsageReport {
  tier: TenantTier;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  storage: {
    usedGB: number;
    limitGB: number;
    percentUsed: number;
  };
  users: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  assets: {
    used: number;
    limit: number;
    percentUsed: number;
  };
  costs?: {
    basePrice: number;
    apiCallsOverage: number;
    storageOverage: number;
    usersOverage: number;
    total: number;
  };
}

export interface TenantSettings {
  organizationName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  currencySymbol: string;
}
