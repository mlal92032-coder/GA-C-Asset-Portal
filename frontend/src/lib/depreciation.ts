/**
 * Straight-line depreciation calculation
 * Equal depreciation each year
 */
export function calculateStraightLine(
  purchaseValue: number,
  salvageValue: number,
  usefulLifeYears: number,
  yearsElapsed: number
): { currentBookValue: number; annualDepreciation: number; totalDepreciation: number } {
  const annualDepreciation = (purchaseValue - salvageValue) / usefulLifeYears;
  const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, purchaseValue - salvageValue);
  const currentBookValue = Math.max(purchaseValue - totalDepreciation, salvageValue);
  
  return {
    currentBookValue: Math.round(currentBookValue * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
  };
}

/**
 * Declining balance depreciation calculation
 * Higher depreciation in early years
 */
export function calculateDecliningBalance(
  purchaseValue: number,
  salvageValue: number,
  usefulLifeYears: number,
  yearsElapsed: number
): { currentBookValue: number; annualDepreciation: number; totalDepreciation: number } {
  const rate = 2 / usefulLifeYears; // Double declining balance
  let bookValue = purchaseValue;
  
  for (let year = 0; year < Math.min(yearsElapsed, usefulLifeYears); year++) {
    const depreciation = bookValue * rate;
    bookValue = Math.max(bookValue - depreciation, salvageValue);
  }
  
  const currentBookValue = Math.max(bookValue, salvageValue);
  const totalDepreciation = purchaseValue - currentBookValue;
  const annualDepreciation = bookValue * rate;
  
  return {
    currentBookValue: Math.round(currentBookValue * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
  };
}

/**
 * Get current book value for an asset
 */
export function getCurrentBookValue(
  purchaseValue: number,
  purchaseDate: Date,
  usefulLifeYears: number,
  salvageValue: number = 0,
  method: string = 'STRAIGHT_LINE'
): { currentBookValue: number; annualDepreciation: number; totalDepreciation: number; yearsElapsed: number } {
  const yearsElapsed = Math.max(0, Math.floor((Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
  
  if (yearsElapsed === 0) {
    return {
      currentBookValue: purchaseValue,
      annualDepreciation: 0,
      totalDepreciation: 0,
      yearsElapsed: 0,
    };
  }
  
  let result;
  if (method === 'DECLINING_BALANCE') {
    result = calculateDecliningBalance(purchaseValue, salvageValue, usefulLifeYears, yearsElapsed);
  } else {
    result = calculateStraightLine(purchaseValue, salvageValue, usefulLifeYears, yearsElapsed);
  }
  
  return {
    ...result,
    yearsElapsed,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
