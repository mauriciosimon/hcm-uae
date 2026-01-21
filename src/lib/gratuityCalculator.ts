import {
  GratuityInput,
  GratuityBreakdown,
  UAE_GRATUITY_LAW,
} from '@/types/gratuity';

/**
 * Calculate gratuity based on UAE Federal Decree-Law No. 33/2021, Article 51
 */
export function calculateGratuity(input: GratuityInput): GratuityBreakdown {
  const {
    basicSalary,
    employmentStartDate,
    employmentEndDate,
    contractType,
    terminationType,
    unpaidLeaveDays,
  } = input;

  // Calculate total service days
  const startDate = new Date(employmentStartDate);
  const endDate = new Date(employmentEndDate);
  const totalServiceDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Exclude unpaid leave days
  const effectiveServiceDays = Math.max(0, totalServiceDays - unpaidLeaveDays);

  // Convert to years, months, days
  const yearsOfService = effectiveServiceDays / 365;
  const fullYears = Math.floor(yearsOfService);
  const remainingDaysAfterYears = effectiveServiceDays - fullYears * 365;
  const fullMonths = Math.floor(remainingDaysAfterYears / 30);
  const remainingDays = Math.floor(remainingDaysAfterYears - fullMonths * 30);

  // Check eligibility
  const isEligible = yearsOfService >= UAE_GRATUITY_LAW.minServiceYears;
  let ineligibilityReason: string | undefined;

  if (!isEligible) {
    ineligibilityReason = `Minimum ${UAE_GRATUITY_LAW.minServiceYears} year of continuous service required. Current service: ${yearsOfService.toFixed(2)} years.`;
  }

  // Calculate daily wage: (Basic Salary × 12) / 365
  const annualSalary = basicSalary * 12;
  const dailyWage = annualSalary / UAE_GRATUITY_LAW.daysInYear;

  // Calculate gratuity for first 5 years
  // Gratuity (≤5 years) = Daily wage × 21 × years
  const yearsInFirstTier = Math.min(yearsOfService, 5);
  const firstFiveYearsAmount = isEligible
    ? dailyWage * UAE_GRATUITY_LAW.daysPerYearFirst5 * yearsInFirstTier
    : 0;

  // Calculate gratuity for years after 5
  // Gratuity (>5 years) = Daily wage × 30 × (years - 5)
  const yearsInSecondTier = Math.max(0, yearsOfService - 5);
  const afterFiveYearsAmount = isEligible
    ? dailyWage * UAE_GRATUITY_LAW.daysPerYearAfter5 * yearsInSecondTier
    : 0;

  // Gross gratuity before any deductions
  const grossGratuity = firstFiveYearsAmount + afterFiveYearsAmount;

  // Calculate resignation multiplier for unlimited contracts
  let resignationMultiplier = 1;

  if (contractType === 'unlimited' && terminationType === 'resignation') {
    if (yearsOfService < UAE_GRATUITY_LAW.thresholdYears.tier1) {
      resignationMultiplier = UAE_GRATUITY_LAW.resignationMultipliers.lessThan1Year;
    } else if (yearsOfService < UAE_GRATUITY_LAW.thresholdYears.tier2) {
      resignationMultiplier = UAE_GRATUITY_LAW.resignationMultipliers.between1And3Years;
    } else if (yearsOfService < UAE_GRATUITY_LAW.thresholdYears.tier3) {
      resignationMultiplier = UAE_GRATUITY_LAW.resignationMultipliers.between3And5Years;
    } else {
      resignationMultiplier = UAE_GRATUITY_LAW.resignationMultipliers.moreThan5Years;
    }
  }
  // For limited contracts: full amount regardless of resignation/termination

  const resignationDeduction = grossGratuity * (1 - resignationMultiplier);
  const netGratuity = grossGratuity * resignationMultiplier;

  // Apply maximum cap: 2 years total basic salary
  const maxCap = annualSalary * UAE_GRATUITY_LAW.maxCapYears;
  const isCapped = netGratuity > maxCap;
  const cappedGratuity = Math.min(netGratuity, maxCap);

  return {
    // Service details
    totalServiceDays,
    effectiveServiceDays,
    yearsOfService,
    monthsOfService: fullMonths,
    daysOfService: remainingDays,

    // Wage calculation
    basicSalary,
    annualSalary,
    dailyWage,

    // Gratuity calculation
    firstFiveYearsAmount,
    afterFiveYearsAmount,
    grossGratuity,

    // Adjustments
    resignationMultiplier,
    resignationDeduction,

    // Final amounts
    netGratuity,
    cappedGratuity,
    maxCap,
    isCapped,

    // Eligibility
    isEligible,
    ineligibilityReason,
  };
}

/**
 * Format service duration as readable string
 */
export function formatServiceDuration(breakdown: GratuityBreakdown): string {
  const years = Math.floor(breakdown.yearsOfService);
  const months = breakdown.monthsOfService;
  const days = breakdown.daysOfService;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

  return parts.join(', ') || '0 days';
}

/**
 * Get resignation tier description
 */
export function getResignationTierDescription(yearsOfService: number): string {
  if (yearsOfService < 1) {
    return 'Less than 1 year - No gratuity entitlement';
  } else if (yearsOfService < 3) {
    return '1-3 years - Entitled to 1/3 of gratuity';
  } else if (yearsOfService < 5) {
    return '3-5 years - Entitled to 2/3 of gratuity';
  } else {
    return '5+ years - Entitled to full gratuity';
  }
}

/**
 * Calculate payment deadline
 */
export function calculatePaymentDeadline(endDate: string): string {
  const end = new Date(endDate);
  end.setDate(end.getDate() + UAE_GRATUITY_LAW.paymentDeadlineDays);
  return end.toISOString().split('T')[0];
}

/**
 * Generate gratuity statement for PDF
 */
export function generateGratuityStatementHTML(
  employeeName: string,
  employeeId: string,
  input: GratuityInput,
  breakdown: GratuityBreakdown
): string {
  const paymentDeadline = calculatePaymentDeadline(input.employmentEndDate);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-AE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Gratuity Statement - ${employeeName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 20px; }
    .header h1 { color: #0d9488; font-size: 24px; margin-bottom: 5px; }
    .header p { color: #666; }
    .section { margin-bottom: 25px; }
    .section-title { background: #f0fdfa; color: #0d9488; padding: 8px 12px; font-weight: 600; margin-bottom: 10px; border-left: 3px solid #0d9488; }
    .row { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 500; }
    .highlight { background: #fef3c7; }
    .total-row { background: #0d9488; color: white; font-size: 14px; font-weight: 600; }
    .note { background: #fef9c3; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 11px; }
    .note-title { font-weight: 600; color: #92400e; margin-bottom: 5px; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 20px; }
    .legal { background: #f8fafc; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 10px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>End of Service Gratuity Statement</h1>
    <p>As per UAE Federal Decree-Law No. 33/2021, Article 51</p>
  </div>

  <div class="section">
    <div class="section-title">Employee Details</div>
    <div class="row"><span class="label">Employee Name</span><span class="value">${employeeName}</span></div>
    <div class="row"><span class="label">Employee ID</span><span class="value">${employeeId}</span></div>
    <div class="row"><span class="label">Contract Type</span><span class="value">${input.contractType === 'limited' ? 'Limited Contract' : 'Unlimited Contract'}</span></div>
    <div class="row"><span class="label">Termination Type</span><span class="value">${input.terminationType === 'resignation' ? 'Resignation' : 'Termination by Employer'}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Service Period</div>
    <div class="row"><span class="label">Start Date</span><span class="value">${formatDate(input.employmentStartDate)}</span></div>
    <div class="row"><span class="label">End Date</span><span class="value">${formatDate(input.employmentEndDate)}</span></div>
    <div class="row"><span class="label">Total Service Days</span><span class="value">${breakdown.totalServiceDays.toLocaleString()} days</span></div>
    ${input.unpaidLeaveDays > 0 ? `<div class="row"><span class="label">Less: Unpaid Leave Days</span><span class="value">(${input.unpaidLeaveDays} days)</span></div>` : ''}
    <div class="row highlight"><span class="label">Effective Service</span><span class="value">${formatServiceDuration(breakdown)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Salary & Daily Wage Calculation</div>
    <div class="row"><span class="label">Basic Monthly Salary</span><span class="value">${formatCurrency(breakdown.basicSalary)}</span></div>
    <div class="row"><span class="label">Annual Salary (Basic × 12)</span><span class="value">${formatCurrency(breakdown.annualSalary)}</span></div>
    <div class="row highlight"><span class="label">Daily Wage (Annual ÷ 365)</span><span class="value">${formatCurrency(breakdown.dailyWage)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Gratuity Calculation</div>
    <div class="row"><span class="label">First 5 Years (21 days × ${Math.min(breakdown.yearsOfService, 5).toFixed(2)} years × ${formatCurrency(breakdown.dailyWage)})</span><span class="value">${formatCurrency(breakdown.firstFiveYearsAmount)}</span></div>
    ${breakdown.yearsOfService > 5 ? `<div class="row"><span class="label">After 5 Years (30 days × ${(breakdown.yearsOfService - 5).toFixed(2)} years × ${formatCurrency(breakdown.dailyWage)})</span><span class="value">${formatCurrency(breakdown.afterFiveYearsAmount)}</span></div>` : ''}
    <div class="row"><span class="label">Gross Gratuity</span><span class="value">${formatCurrency(breakdown.grossGratuity)}</span></div>
    ${breakdown.resignationDeduction > 0 ? `<div class="row"><span class="label">Less: Resignation Deduction (${((1 - breakdown.resignationMultiplier) * 100).toFixed(0)}%)</span><span class="value">(${formatCurrency(breakdown.resignationDeduction)})</span></div>` : ''}
    ${breakdown.isCapped ? `<div class="row"><span class="label">Maximum Cap Applied (2 years salary)</span><span class="value">${formatCurrency(breakdown.maxCap)}</span></div>` : ''}
    <div class="row total-row"><span class="label">NET GRATUITY PAYABLE</span><span class="value">${formatCurrency(breakdown.cappedGratuity)}</span></div>
  </div>

  <div class="note">
    <div class="note-title">Payment Deadline</div>
    <p>As per UAE Labor Law, gratuity must be paid within 14 days of contract end date.</p>
    <p><strong>Payment Due By: ${formatDate(paymentDeadline)}</strong></p>
  </div>

  <div class="legal">
    <strong>Legal Reference:</strong> This calculation is based on UAE Federal Decree-Law No. 33/2021 (UAE Labor Law), Article 51 - End of Service Gratuity.
    For unlimited contracts where the employee resigns: less than 1 year = 0%, 1-3 years = 33.33%, 3-5 years = 66.67%, 5+ years = 100% of calculated gratuity.
    For limited contracts: full gratuity regardless of resignation or termination. Maximum gratuity capped at 2 years of basic salary.
  </div>

  <div class="footer">
    <p>Generated on ${formatDate(new Date().toISOString())} | HCM UAE by Pantaia</p>
    <p>This is a computer-generated statement and is valid without signature.</p>
  </div>
</body>
</html>
  `;
}
