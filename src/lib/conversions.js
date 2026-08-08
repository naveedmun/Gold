// Conversion constants for precious metals
export const GRAMS_PER_TOLA = 11.6638;
export const GRAMS_PER_TROY_OUNCE = 31.1035;
export const TOLAS_PER_TROY_OUNCE = GRAMS_PER_TROY_OUNCE / GRAMS_PER_TOLA; // ~2.6667

// Today's benchmark rates in PKR per Tola & Exchange Rate
export const LATEST_RATES = {
  gold: 424350,  // Gold Tola Rate (PKR)
  silver: 6940,  // Silver Tola Rate (PKR)
  usdPkr: 278.5  // 1 USD = 278.5 PKR (approx)
};

// Convert from per-tola price to other units
export function convertFromTola(perTolaPrice, unit) {
  switch (unit) {
    case 'gram':
      return perTolaPrice / GRAMS_PER_TOLA;
    case '10gram':
    case 'tenGram':
      return (perTolaPrice / GRAMS_PER_TOLA) * 10;
    case 'tola':
      return perTolaPrice;
    case 'ounce':
      return perTolaPrice * TOLAS_PER_TROY_OUNCE;
    default:
      return perTolaPrice;
  }
}

// Formatting Numbers & PKR
export function formatPKR(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

export function formatNumber(amount, decimals = 2) {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(amount);
}

// Currency Switcher Formatter (Supports PKR & USD)
export function formatCurrency(amountInPKR, currency = 'PKR') {
  if (amountInPKR == null || isNaN(amountInPKR)) return '—';

  if (currency === 'USD') {
    const amountInUSD = amountInPKR / LATEST_RATES.usdPkr;
    return `$ ${amountInUSD.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return `Rs ${formatPKR(amountInPKR)}`;
}

export const UNITS = [
  { value: 'gram', label: 'Per Gram', factor: 1 / GRAMS_PER_TOLA },
  { value: '10gram', label: 'Per 10 Gram', factor: 10 / GRAMS_PER_TOLA },
  { value: 'tola', label: 'Per Tola', factor: 1 },
  { value: 'ounce', label: 'Per Ounce', factor: TOLAS_PER_TROY_OUNCE }
];
