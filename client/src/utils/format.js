/**
 * Format paise as rupees with 2 decimals.
 * Example: 200050 → "2,000.50"
 */
export function formatRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) return '0.00';
  const rupees = paise / 100;
  return rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
