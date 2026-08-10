// src/lib/conversions.js

const TOLA_GRAMS = 11.6638125;

// ---------------------------------------------------------
// Helper: Safe number
// ---------------------------------------------------------
function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

// ---------------------------------------------------------
// Fetch LIVE market rates
// ---------------------------------------------------------
// IMPORTANT:
// The browser does NOT call Metals.Dev directly.
//
// Browser
//   ↓
// /api/market-rates
//   ↓
// Vercel Server
//   ↓
// Metals.Dev
//
// Therefore METALS_API_KEY stays safely on Vercel.
// ---------------------------------------------------------
export async function fetchLiveMarketRates() {
  try {
    const response = await fetch('/api/market-rates', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.error ||
          `Market API failed with status ${response.status}`
      );
    }

    // -----------------------------------------------------
    // Validate returned data
    // -----------------------------------------------------

    const gold = data?.gold || {};
    const silver = data?.silver || {};
    const platinum = data?.platinum || {};
    const copper = data?.copper || {};

    const usdPkr = toNumber(data?.usdPkr);

    if (!usdPkr) {
      throw new Error('USD/PKR rate unavailable.');
    }

    // -----------------------------------------------------
    // Final result used by Home.jsx
    // -----------------------------------------------------

    const result = {
      // PKR per Tola
      gold: toNumber(gold.pkrPerTola),
      silver: toNumber(silver.pkrPerTola),
      platinum: toNumber(platinum.pkrPerTola),
      copper: toNumber(copper.pkrPerTola),

      // USD per Tola
      goldUsd: toNumber(gold.usdPerTola),
      silverUsd: toNumber(silver.usdPerTola),
      platinumUsd: toNumber(platinum.usdPerTola),
      copperUsd: toNumber(copper.usdPerTola),

      // USD / PKR
      usdPkr,

      // USD per gram
      goldUsdGram: toNumber(gold.usdPerGram),
      silverUsdGram: toNumber(silver.usdPerGram),
      platinumUsdGram: toNumber(platinum.usdPerGram),
      copperUsdGram: toNumber(copper.usdPerGram),

      // Timestamp
      timestamp:
        data?.timestamp ||
        new Date().toISOString(),

      source:
        data?.source ||
        'Metals.Dev',

      unit:
        data?.unit ||
        'g',
    };

    console.log(
      'LIVE MARKET RATES:',
      result
    );

    return result;
  } catch (error) {
    console.error(
      'fetchLiveMarketRates() failed:',
      error
    );

    // IMPORTANT:
    // Never return fake/static rates.
    throw error;
  }
}

// ---------------------------------------------------------
// USD → PKR
// ---------------------------------------------------------
export function usdToPkr(amountUsd, usdPkr) {
  const amount = toNumber(amountUsd);
  const rate = toNumber(usdPkr);

  if (!amount || !rate) {
    return 0;
  }

  return amount * rate;
}

// ---------------------------------------------------------
// PKR → USD
// ---------------------------------------------------------
export function pkrToUsd(amountPkr, usdPkr) {
  const amount = toNumber(amountPkr);
  const rate = toNumber(usdPkr);

  if (!amount || !rate) {
    return 0;
  }

  return amount / rate;
}

// ---------------------------------------------------------
// Grams → Tola
// ---------------------------------------------------------
export function gramsToTola(grams) {
  const value = toNumber(grams);

  if (!value) {
    return 0;
  }

  return value / TOLA_GRAMS;
}

// ---------------------------------------------------------
// Tola → Grams
// ---------------------------------------------------------
export function tolaToGrams(tola) {
  const value = toNumber(tola);

  if (!value) {
    return 0;
  }

  return value * TOLA_GRAMS;
}

// ---------------------------------------------------------
// Price per Gram → Price per Tola
// ---------------------------------------------------------
export function pricePerGramToTola(
  pricePerGram
) {
  const value = toNumber(pricePerGram);

  if (!value) {
    return 0;
  }

  return value * TOLA_GRAMS;
}

// ---------------------------------------------------------
// Price per Tola → Price per Gram
// ---------------------------------------------------------
export function pricePerTolaToGram(
  pricePerTola
) {
  const value = toNumber(pricePerTola);

  if (!value) {
    return 0;
  }

  return value / TOLA_GRAMS;
}

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------
export const CONVERSION_CONSTANTS = {
  TOLA_GRAMS,
};
