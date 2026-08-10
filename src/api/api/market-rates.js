// api/market-rates.js

const TROY_OUNCE_GRAMS = 31.1034768;
const TOLA_GRAMS = 11.6638125;
const TOLA_IN_TROY_OUNCE =
  TOLA_GRAMS / TROY_OUNCE_GRAMS;

export default async function handler(req, res) {
  // Only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.METALS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'METALS_API_KEY is not configured on Vercel.',
    });
  }

  try {
    // Metals.Dev latest endpoint
    // USD + Troy Ounce
    const url =
      `https://api.metals.dev/v1/latest` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&currency=USD` +
      `&unit=toz`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || data?.status !== 'success') {
      console.error('Metals.Dev error:', data);

      return res.status(502).json({
        success: false,
        error:
          data?.error_message ||
          data?.error?.message ||
          'Metals.Dev API request failed.',
      });
    }

    const metals = data.metals || {};
    const currencies = data.currencies || {};

    // USD -> PKR
    const usdPkr = Number(currencies.PKR);

    if (!Number.isFinite(usdPkr) || usdPkr <= 0) {
      throw new Error('USD/PKR rate not available.');
    }

    // Metals.Dev prices are USD per Troy Ounce
    const goldUsdOz = Number(metals.gold);
    const silverUsdOz = Number(metals.silver);
    const platinumUsdOz = Number(metals.platinum);
    const copperUsdOz = Number(metals.copper);

    // Convert USD / Troy Ounce -> USD / Tola
    const toUsdPerTola = (usdPerOz) => {
      if (!Number.isFinite(usdPerOz) || usdPerOz <= 0) {
        return 0;
      }

      return usdPerOz * TOLA_IN_TROY_OUNCE;
    };

    // USD / Tola -> PKR / Tola
    const toPkrPerTola = (usdPerOz) => {
      const usdTola = toUsdPerTola(usdPerOz);

      if (!usdTola) {
        return 0;
      }

      return usdTola * usdPkr;
    };

    const result = {
      success: true,

      source: 'Metals.Dev',

      timestamp:
        data.timestamp || new Date().toISOString(),

      currency: 'USD',
      unit: 'toz',

      conversion: {
        troyOunceGrams: TROY_OUNCE_GRAMS,
        tolaGrams: TOLA_GRAMS,
        tolaInTroyOunce: TOLA_IN_TROY_OUNCE,
      },

      currencyRates: {
        usdPkr,
      },

      metals: {
        gold: {
          usdPerOz: goldUsdOz,
          usdPerTola: toUsdPerTola(goldUsdOz),
          pkrPerTola: toPkrPerTola(goldUsdOz),
        },

        silver: {
          usdPerOz: silverUsdOz,
          usdPerTola: toUsdPerTola(silverUsdOz),
          pkrPerTola: toPkrPerTola(silverUsdOz),
        },

        platinum: {
          usdPerOz: platinumUsdOz,
          usdPerTola: toUsdPerTola(platinumUsdOz),
          pkrPerTola: toPkrPerTola(platinumUsdOz),
        },

        copper: {
          usdPerOz: copperUsdOz,
          usdPerTola: toUsdPerTola(copperUsdOz),
          pkrPerTola: toPkrPerTola(copperUsdOz),
        },
      },
    };

    // Small cache so many visitors don't hammer the provider.
    res.setHeader(
      'Cache-Control',
      's-maxage=60, stale-while-revalidate=30'
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Market rates server error:', error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        'Unable to retrieve live market rates.',
    });
  }
}
