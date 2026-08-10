// Conversion constants for precious metals
export const GRAMS_PER_TOLA = 11.6638;
export const GRAMS_PER_TROY_OUNCE = 31.1035;
export const TOLAS_PER_TROY_OUNCE = GRAMS_PER_TROY_OUNCE / GRAMS_PER_TOLA; // ~2.6667

// Default fallback rates in PKR per Tola & Exchange Rate
export const LATEST_RATES = {
  gold: 454300,      // Fallback Gold Tola Rate (PKR)
  silver: 6940,      // Silver Tola Rate (PKR)
  platinum: 123000,  // Platinum Tola Rate (PKR)
  copper: 3750,      // Copper Tola Rate (PKR)
  usdPkr: 278.70     // 1 USD = 278.70 PKR
};

// Live Rate Fetcher from Free Public / Global Financial Endpoints
export async function fetchLiveMarketRates() {
  try {
    // Fetching live XAU (Gold) and XAG (Silver) rates against USD
    const response = await fetch('https://api.metals.live/v1/spot');
    const data = await response.json();
    
    // Find gold and silver from response array
    const goldObj = data.find(item => item.gold);
    const silverObj = data.find(item => item.silver);

    if (goldObj && silverObj) {
      const liveOunceUSD = goldObj.gold;
      const liveSilverOunceUSD = silverObj.silver;
      const usdPkrRate = LATEST_RATES.usdPkr;

      // Convert Troy Ounce USD to Per Tola PKR
      // Formula: (OunceUSD / TOLAS_PER_TROY_OUNCE) * usdPkrRate
      const goldTolaPKR = (liveOunceUSD / TOLAS_PER_TROY_OUNCE) * usdPkrRate;
      const silverTolaPKR = (liveSilverOunceUSD / TOLAS_PER_TROY_OUNCE) * usdPkrRate;

      return {
        gold: Math.round(goldTolaPKR),
        silver: Math.round(silverTolaPKR),
        platinum: LATEST_RATES.platinum,
        copper: LATEST_RATES.copper,
        usdPkr: usdPkrRate,
        isLive: true
      };
    }
  } catch (error) {
    console.warn('Live API fetch failed, falling back to default rates:', error);
  }
  
  return LATEST_RATES; // Fallback if network/API fails
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

/**
 * Universal Formatter for PKR & USD
 */
export function formatCurrency(amountInPKR, currency = 'PKR', customUsdRate = LATEST_RATES.usdPkr) {
  if (amountInPKR == null || isNaN(amountInPKR)) return '—';

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
 * Generates USD subtext like "(~ $1,629.99 USD)" when PKR is selected
 */
export function getUsdSubtext(amountInPKR, currency = 'PKR', customUsdRate = LATEST_RATES.usdPkr) {
  if (currency === 'PKR' && amountInPKR && !isNaN(amountInPKR)) {
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
