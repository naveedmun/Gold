// src/lib/conversions.js

const TROY_OUNCE_GRAMS = 31.1034768;
const TOLA_GRAMS = 11.6638125;

// 1 Tola in Troy Ounce
const TOLA_IN_TROY_OUNCE =
  TOLA_GRAMS / TROY_OUNCE_GRAMS;

// ---------------------------------------------------------
// Safe number
// ---------------------------------------------------------
function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

// ---------------------------------------------------------
// Static Latest Rates Fallback (Fixed Rate: 418,599 PKR per tola)
// ---------------------------------------------------------
export const LATEST_RATES = {
  gold: 418599,
  silver: 5200,
  platinum: 310000,
  copper: 3500,
  goldUsd: 2350,
  silverUsd: 28,
  platinumUsd: 1000,
  copperUsd: 4.2,
  usdPkr: 278,
  timestamp: new Date().toISOString(),
};

// ---------------------------------------------------------
// Fetch LIVE rates from our Vercel backend
// ---------------------------------------------------------
export async function fetchLiveMarketRates() {
  try {
    const response = await fetch(
      '/api/market-rates',
      {
        cache: 'no-store',
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.error ||
          `Market API failed: ${response.status}`
      );
    }

    const goldUsdOz =
      toNumber(data?.metals?.gold);

    const silverUsdOz =
      toNumber(data?.metals?.silver);

    const platinumUsdOz =
      toNumber(data?.metals?.platinum);

    const copperUsdOz =
      toNumber(data?.metals?.copper);

    const usdPkrResponse =
      await fetch(
        'https://open.er-api.com/v6/latest/USD',
        {
          cache: 'no-store',
        }
      );

    if (!usdPkrResponse.ok) {
      throw new Error(
        `USD/PKR API failed: ${usdPkrResponse.status}`
      );
    }

    const usdPkrData =
      await usdPkrResponse.json();

    const usdPkr =
      toNumber(
        usdPkrData?.rates?.PKR
      );

    if (!usdPkr) {
      throw new Error(
        'USD/PKR rate unavailable.'
      );
    }

    const usdPerTroyOunceToPkrPerTola =
      (usdPerTroyOunce) => {
        const value =
          toNumber(usdPerTroyOunce);

        if (!value || !usdPkr) {
          return 0;
        }

        return (
          value *
          TOLA_IN_TROY_OUNCE *
          usdPkr
        );
      };

    const usdPerTroyOunceToUsdPerTola =
      (usdPerTroyOunce) => {
        const value =
          toNumber(usdPerTroyOunce);

        if (!value) {
          return 0;
        }

        return (
          value *
          TOLA_IN_TROY_OUNCE
        );
      };

    const result = {
      gold:
        usdPerTroyOunceToPkrPerTola(
          goldUsdOz
        ),

      silver:
        usdPerTroyOunceToPkrPerTola(
          silverUsdOz
        ),

      platinum:
        usdPerTroyOunceToPkrPerTola(
          platinumUsdOz
        ),

      copper:
        usdPerTroyOunceToPkrPerTola(
          copperUsdOz
        ),

      goldUsd:
        usdPerTroyOunceToUsdPerTola(
          goldUsdOz
        ),

      silverUsd:
        usdPerTroyOunceToUsdPerTola(
          silverUsdOz
        ),

      platinumUsd:
        usdPerTroyOunceToUsdPerTola(
          platinumUsdOz
        ),

      copperUsd:
        usdPerTroyOunceToUsdPerTola(
          copperUsdOz
        ),

      usdPkr,

      goldUsdOz,
      silverUsdOz,
      platinumUsdOz,
      copperUsdOz,

      timestamp:
        data.timestamp ||
        new Date().toISOString(),

      currency: 'USD',
      unit: 'toz',

      source: 'Metals.Dev',
    };

    return result;
  } catch (error) {
    console.error(
      'fetchLiveMarketRates() failed:',
      error
    );

    throw error;
  }
}

// ---------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------

export function usdToPkr(
  amountUsd,
  usdPkr
) {
  const amount =
    toNumber(amountUsd);

  const rate =
    toNumber(usdPkr);

  if (!amount || !rate) {
    return 0;
  }

  return amount * rate;
}

export function pkrToUsd(
  amountPkr,
  usdPkr
) {
  const amount =
    toNumber(amountPkr);

  const rate =
    toNumber(usdPkr);

  if (!amount || !rate) {
    return 0;
  }

  return amount / rate;
}

export function troyOunceToTola(
  amount
) {
  const value =
    toNumber(amount);

  if (!value) {
    return 0;
  }

  return (
    value *
    TOLA_IN_TROY_OUNCE
  );
}

export function tolaToTroyOunce(
  amount
) {
  const value =
    toNumber(amount);

  if (!value) {
    return 0;
  }

  return (
    value /
    TOLA_IN_TROY_OUNCE
  );
}

export function gramsToTola(
  grams
) {
  const value =
    toNumber(grams);

  if (!value) {
    return 0;
  }

  return (
    value / TOLA_GRAMS
  );
}

export function tolaToGrams(
  tola
) {
  const value =
    toNumber(tola);

  if (!value) {
    return 0;
  }

  return (
    value * TOLA_GRAMS
  );
}

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------

export const CONVERSION_CONSTANTS = {
  TROY_OUNCE_GRAMS,
  TOLA_GRAMS,
  TOLA_IN_TROY_OUNCE,
};

// ---------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------

export function formatPKR(amount) {
  const value = toNumber(amount);
  return value.toLocaleString('en-PK', {
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(amount) {
  return formatPKR(amount);
}

export function getUsdSubtext(amountUsd) {
  const value = toNumber(amountUsd);
  return `$${value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;
}