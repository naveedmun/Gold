// src/lib/conversions.js

const TROY_OUNCE_GRAMS = 31.1034768;
const TOLA_GRAMS = 11.6638125;

// 1 Tola in Troy Ounce
const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

// Metals.Dev API Key
// Vite mein .env file ke andar:
// VITE_METALS_API_KEY=YOUR_API_KEY
const METALS_API_KEY = import.meta.env.VITE_METALS_API_KEY;

// ---------------------------------------------------------
// Helper: Safe number
// ---------------------------------------------------------
function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// ---------------------------------------------------------
// Fetch USD/PKR
// ---------------------------------------------------------
// open.er-api.com is used for currency conversion.
// This is an FX/interbank reference rate and may not equal
// Pakistan's open-market/Sarafa rate exactly.
async function fetchUsdPkr() {
  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`USD/PKR API failed: ${response.status}`);
    }

    const data = await response.json();

    const usdPkr = toNumber(data?.rates?.PKR);

    if (!usdPkr) {
      throw new Error('USD/PKR rate not found');
    }

    return usdPkr;
  } catch (error) {
    console.error('USD/PKR fetch error:', error);
    throw error;
  }
}

// ---------------------------------------------------------
// Fetch live metal rates from Metals.Dev
// ---------------------------------------------------------
async function fetchMetalRates() {
  if (!METALS_API_KEY) {
    throw new Error(
      'VITE_METALS_API_KEY is missing. Add it to your .env file.'
    );
  }

  const url =
    `https://api.metals.dev/v1/latest` +
    `?api_key=${encodeURIComponent(METALS_API_KEY)}` +
    `&currency=USD` +
    `&unit=toz`;

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Metals.Dev API failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data?.status !== 'success') {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      'Metals.Dev returned an unsuccessful response'
    );
  }

  return data;
}

// ---------------------------------------------------------
// Convert USD per Troy Ounce -> PKR per Tola
// ---------------------------------------------------------
function usdPerTroyOunceToPkrPerTola(
  usdPerTroyOunce,
  usdPkr
) {
  const usdPerOunce = toNumber(usdPerTroyOunce);

  if (!usdPerOunce || !usdPkr) {
    return 0;
  }

  // Price per Troy Ounce × Tola fraction
  const usdPerTola =
    usdPerOunce * TOLA_IN_TROY_OUNCE;

  // Convert USD -> PKR
  return usdPerTola * usdPkr;
}

// ---------------------------------------------------------
// Convert USD per Troy Ounce -> USD per Tola
// ---------------------------------------------------------
function usdPerTroyOunceToUsdPerTola(
  usdPerTroyOunce
) {
  const usdPerOunce = toNumber(usdPerTroyOunce);

  if (!usdPerOunce) {
    return 0;
  }

  return usdPerOunce * TOLA_IN_TROY_OUNCE;
}

// ---------------------------------------------------------
// Main LIVE Market Rates Function
// ---------------------------------------------------------
export async function fetchLiveMarketRates() {
  try {
    // Fetch both APIs at the same time
    const [metalData, usdPkr] = await Promise.all([
      fetchMetalRates(),
      fetchUsdPkr(),
    ]);

    const metals = metalData?.metals || {};

    // Metals.Dev returns prices in USD per Troy Ounce
    const goldUsdOz = toNumber(metals.gold);
    const silverUsdOz = toNumber(metals.silver);
    const platinumUsdOz = toNumber(metals.platinum);
    const copperUsdOz = toNumber(metals.copper);

    // Convert to PKR per Tola
    const goldTola = usdPerTroyOunceToPkrPerTola(
      goldUsdOz,
      usdPkr
    );

    const silverTola = usdPerTroyOunceToPkrPerTola(
      silverUsdOz,
      usdPkr
    );

    const platinumTola = usdPerTroyOunceToPkrPerTola(
      platinumUsdOz,
      usdPkr
    );

    const copperTola = usdPerTroyOunceToPkrPerTola(
      copperUsdOz,
      usdPkr
    );

    // USD value per Tola
    const goldUsdTola =
      usdPerTroyOunceToUsdPerTola(goldUsdOz);

    const silverUsdTola =
      usdPerTroyOunceToUsdPerTola(silverUsdOz);

    const platinumUsdTola =
      usdPerTroyOunceToUsdPerTola(platinumUsdOz);

    const copperUsdTola =
      usdPerTroyOunceToUsdPerTola(copperUsdOz);

    const result = {
      // PKR per Tola
      gold: goldTola,
      silver: silverTola,
      platinum: platinumTola,
      copper: copperTola,

      // USD per Tola
      goldUsd: goldUsdTola,
      silverUsd: silverUsdTola,
      platinumUsd: platinumUsdTola,
      copperUsd: copperUsdTola,

      // USD/PKR
      usdPkr,

      // Original international spot prices
      goldUsdOz,
      silverUsdOz,
      platinumUsdOz,
      copperUsdOz,

      // API timestamp
      timestamp:
        metalData?.timestamp ||
        new Date().toISOString(),

      currency: 'USD',
      unit: 'toz',

      source: 'Metals.Dev',
    };

    console.log('LIVE MARKET RATES:', result);

    return result;
  } catch (error) {
    console.error(
      'fetchLiveMarketRates() failed:',
      error
    );

    // IMPORTANT:
    // Do NOT return fake/static rates.
    // Let Home.jsx know that live data failed.
    throw error;
  }
}

// ---------------------------------------------------------
// Individual conversion helpers
// ---------------------------------------------------------

export function usdToPkr(amountUsd, usdPkr) {
  const amount = toNumber(amountUsd);
  const rate = toNumber(usdPkr);

  if (!amount || !rate) return 0;

  return amount * rate;
}

export function pkrToUsd(amountPkr, usdPkr) {
  const amount = toNumber(amountPkr);
  const rate = toNumber(usdPkr);

  if (!amount || !rate) return 0;

  return amount / rate;
}

export function troyOunceToTola(amount) {
  const value = toNumber(amount);

  if (!value) return 0;

  return value * TOLA_IN_TROY_OUNCE;
}

export function tolaToTroyOunce(amount) {
  const value = toNumber(amount);

  if (!value) return 0;

  return value / TOLA_IN_TROY_OUNCE;
}

export function gramsToTola(grams) {
  const value = toNumber(grams);

  if (!value) return 0;

  return value / TOLA_GRAMS;
}

export function tolaToGrams(tola) {
  const value = toNumber(tola);

  if (!value) return 0;

  return value * TOLA_GRAMS;
}

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------

export const CONVERSION_CONSTANTS = {
  TROY_OUNCE_GRAMS,
  TOLA_GRAMS,
  TOLA_IN_TROY_OUNCE,
};
