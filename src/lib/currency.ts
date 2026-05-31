/** Default monthly workspace rates (INR). */
export const WORKSPACE_PRICING = {
  hotDesk: 7999,
  dedicated: 14999,
  meeting: 24999,
  privateOffice: 45000,
} as const;

const inrWhole = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inrDecimal = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(
  amount: number,
  options?: { decimals?: boolean; compact?: boolean }
): string {
  if (options?.compact) {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000) return `₹${Math.round(amount / 1_000)}k`;
    return `₹${inrWhole.format(amount)}`;
  }
  if (options?.decimals) return `₹${inrDecimal.format(amount)}`;
  return `₹${inrWhole.format(amount)}`;
}
