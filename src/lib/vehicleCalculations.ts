import type { Maintenance, SparePart } from '@prisma/client';

export interface VehicleMaintenanceSummary {
  totalMaintenanceCost: number;
  numberOfServices: number;
  lastServiceDate: Date | null;
  nextServiceDue: Date | null;
  averageCostPerService: number;
  highestSingleRepairCost: number;
  totalLifecycleCost: number;
  daysSinceLastService: number;
  currentOdometer: number | null;
}

/**
 * Calculate total maintenance cost for a vehicle
 */
export function calculateTotalMaintenanceCost(maintenances: Maintenance[]): number {
  return maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
}

/**
 * Count total services/repairs for a vehicle
 */
export function calculateNumberOfServices(maintenances: Maintenance[]): number {
  return maintenances.length;
}

/**
 * Get the most recent service date
 */
export function getLastServiceDate(maintenances: Maintenance[]): Date | null {
  if (maintenances.length === 0) return null;

  const sorted = [...maintenances].sort(
    (a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime()
  );

  return sorted[0].maintenanceDate;
}

/**
 * Calculate next service due date
 * Rule: 6 months from last service OR 5000 km rule
 */
export function calculateNextServiceDue(
  lastServiceDate: Date | null,
  currentOdometer: number | null,
  lastOdometer: number | null
): Date | null {
  if (!lastServiceDate) return null;

  // 6-month rule
  const sixMonthsFromLastService = new Date(lastServiceDate);
  sixMonthsFromLastService.setMonth(sixMonthsFromLastService.getMonth() + 6);

  // 5000 km rule (if odometer data available)
  if (lastOdometer !== null && currentOdometer !== null) {
    const kmSinceService = currentOdometer - lastOdometer;
    if (kmSinceService >= 5000) {
      return new Date(); // Service is overdue
    }
  }

  return sixMonthsFromLastService;
}

/**
 * Calculate average maintenance cost per service
 */
export function calculateAverageCostPerService(
  totalCost: number,
  numberOfServices: number
): number {
  if (numberOfServices === 0) return 0;
  return Math.round((totalCost / numberOfServices) * 100) / 100;
}

/**
 * Find the highest single repair cost
 */
export function getHighestSingleRepairCost(maintenances: Maintenance[]): number {
  if (maintenances.length === 0) return 0;
  return Math.max(...maintenances.map(m => m.cost || 0));
}

/**
 * Calculate total lifecycle cost
 */
export function calculateTotalLifecycleCost(purchasePrice: number | null, totalMaintenanceCost: number): number {
  return (purchasePrice || 0) + totalMaintenanceCost;
}

/**
 * Calculate days since last service
 */
export function calculateDaysSinceLastService(lastServiceDate: Date | null): number {
  if (!lastServiceDate) return -1;

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastServiceDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get current odometer reading (most recent from maintenance records)
 */
export function getCurrentOdometerReading(maintenances: Maintenance[]): number | null {
  if (maintenances.length === 0) return null;

  const withOdometer = maintenances.filter(m => m.odometerReading !== null);
  if (withOdometer.length === 0) return null;

  const sorted = [...withOdometer].sort(
    (a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime()
  );

  return sorted[0].odometerReading;
}

/**
 * Calculate total spare parts cost for a vehicle
 */
export function calculateTotalSpareCostCost(spareParts: SparePart[]): number {
  return spareParts.reduce((sum, sp) => sum + (sp.totalCost || 0), 0);
}

/**
 * Get complete vehicle maintenance summary
 */
export function getVehicleMaintenanceSummary(
  maintenances: Maintenance[],
  purchasePrice: number | null,
  completedMaintenances: Maintenance[] = []
): VehicleMaintenanceSummary {
  const completed = completedMaintenances.length > 0
    ? completedMaintenances
    : maintenances.filter(m => m.status === 'COMPLETED');

  const totalCost = calculateTotalMaintenanceCost(completed);
  const numberOfServices = calculateNumberOfServices(completed);
  const lastService = getLastServiceDate(completed);
  const currentOdometer = getCurrentOdometerReading(maintenances);
  const prevMaintenance = completed.length > 1 ? completed[completed.length - 2] : null;
  const lastOdometer = prevMaintenance?.odometerReading || null;

  return {
    totalMaintenanceCost: totalCost,
    numberOfServices,
    lastServiceDate: lastService,
    nextServiceDue: calculateNextServiceDue(lastService, currentOdometer, lastOdometer),
    averageCostPerService: calculateAverageCostPerService(totalCost, numberOfServices),
    highestSingleRepairCost: getHighestSingleRepairCost(completed),
    totalLifecycleCost: calculateTotalLifecycleCost(purchasePrice, totalCost),
    daysSinceLastService: calculateDaysSinceLastService(lastService),
    currentOdometer,
  };
}

/**
 * Format currency for display (PKR)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'COMPLETED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'SCHEDULED': 'bg-yellow-100 text-yellow-800',
    'CANCELLED': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get work type badge color
 */
export function getWorkTypeColor(workType: string | null): string {
  if (!workType) return 'bg-gray-100 text-gray-800';

  const colors: Record<string, string> = {
    'Oil Change': 'bg-cyan-100 text-cyan-800',
    'Repair': 'bg-orange-100 text-orange-800',
    'Service': 'bg-green-100 text-green-800',
    'Inspection': 'bg-blue-100 text-blue-800',
    'Tire Change': 'bg-purple-100 text-purple-800',
    'Battery': 'bg-yellow-100 text-yellow-800',
  };

  return colors[workType] || 'bg-gray-100 text-gray-800';
}
