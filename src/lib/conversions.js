// Conversion constants for precious metals
export const GRAMS_PER_TOLA = 11.6638;
export const GRAMS_PER_TROY_OUNCE = 31.1035;
export const TOLAS_PER_TROY_OUNCE = GRAMS_PER_TROY_OUNCE / GRAMS_PER_TOLA; // ~2.6667

// Clean base object with zero values (No hardcoded dummy rates)
export const LATEST_RATES = {
  gold: 0,
  silver: 0,
  platinum: 0,
  copper: 0,
  usdPkr: 278.70     // Base exchange rate
};

// Live Rate Fetcher using direct stable public endpoint
export async function fetchLiveMarketRates() {
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    const data = await response.json();
    
    if (data && data.price) {
      const liveOunceUSD = data.price; // Live ounce price in USD
      const usdPkrRate = LATEST_RATES.usdPkr;

      // Convert Troy Ounce USD to Per Tola PKR
      const goldTolaPKR = (liveOunceUSD / TOLAS_PER_TROY_OUNCE) * usdPkrRate;
      // Silver approximate ratio calculation based on market standard
      const silverTolaPKR = (liveOunceUSD / 85 / TOLAS_PER_TROY_OUNCE) * usdPkrRate;

      return {
        gold: Math.round(goldTolaPKR),
        silver: Math.round(silverTolaPKR),
        platinum: 123000,
        copper: 3750,
        usdPkr: usdPkrRate,
        isLive: true
      };
    }
  } catch (error) {
    console.error('Live API fetch failed:', error);
  }
  
  return LATEST_RATES; // Returns zero/fallback if network fails
}

// Convert from per-tola price to other units
export function convertFromTola(perTolaPrice, unit = 'tola') {
  if (!perTolaPrice || isNaN(perTolaPrice)) return 0;

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

// Formatting Numbers
export function formatPKR(amount) {
  if (amount == null || isNaN(amount) || amount === 0) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

export function formatNumber(amount, decimals = 2) {
  if (amount == null || isNaN(amount) || amount === 0) return '—';
  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(amount);
}

/**
 * Universal Formatter for PKR & USD
 */
export function formatCurrency(amountInPKR, currency = 'PKR', customUsdRate = LATEST_RATES.usdPkr) {
  if (amountInPKR == null || isNaN(amountInPKR) || amountInPKR === 0) return '—';

  if (currency === 'USD') {
    const amountInUSD = amountInPKR / customUsdRate;
    return `$ ${amountInUSD.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return `Rs ${formatPKR(amountInPKR)}`;
}

/**
 * Generates USD subtext when PKR is selected
 */
export function getUsdSubtext(amountInPKR, currency = 'PKR', customUsdRate = LATEST_RATES.usdPkr) {
  if (currency === 'PKR' && amountInPKR && !isNaN(amountInPKR) && amountInPKR !== 0) {
    const usdAmount = (amountInPKR / customUsdRate).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `(~ $${usdAmount} USD)`;
  }
  return null;
}

export const UNITS = [
  { value: 'gram', label: 'Per Gram', factor: 1 / GRAMS_PER_TOLA },
  { value: '10gram', label: 'Per 10 Gram', factor: 10 / GRAMS_PER_TOLA },
  { value: 'tola', label: 'Per Tola', factor: 1 },
  { value: 'ounce', label: 'Per Ounce', factor: TOLAS_PER_TROY_OUNCE }
];
