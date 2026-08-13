// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const API_KEY = process.env.METALS_API_KEY;

    if (!API_KEY) {
      throw new Error('METALS_API_KEY is not configured');
    }

    // Metals.Dev - Live Precious Metals
    const metalsUrl =
      `https://api.metals.dev/v1/latest?api_key=${API_KEY}&currency=USD&unit=toz`;

    const metalsRes = await fetch(metalsUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!metalsRes.ok) {
      throw new Error(
        `Metals.Dev API failed: ${metalsRes.status}`
      );
    }

    const metalsData = await metalsRes.json();

    if (metalsData?.status !== 'success') {
      throw new Error(
        metalsData?.error?.message ||
        'Metals.Dev returned an error'
      );
    }

    const goldUsdOz = Number(metalsData?.metals?.gold);
    const silverUsdOz = Number(metalsData?.metals?.silver);
    const platinumUsdOz = Number(metalsData?.metals?.platinum);

    if (
      !goldUsdOz ||
      !silverUsdOz ||
      !platinumUsdOz
    ) {
      throw new Error(
        'Gold/Silver/Platinum data unavailable'
      );
    }

    // USD → PKR
    const pkrRes = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        cache: 'no-store',
      }
    );

    if (!pkrRes.ok) {
      throw new Error('USD/PKR API failed');
    }

    const pkrData = await pkrRes.json();

    const usdPkr = Number(
      pkrData?.rates?.PKR
    );

    if (!usdPkr || usdPkr <= 0) {
      throw new Error('USD/PKR rate unavailable');
    }

    // 1 Tola = 11.6638125g
    // 1 Troy Ounce = 31.1034768g
    const TOLA_IN_TROY_OUNCE =
      11.6638125 / 31.1034768;

    // Per Tola in PKR
    const goldTolaPkr =
      goldUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const silverTolaPkr =
      silverUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const platinumTolaPkr =
      platinumUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    return res.status(200).json({
      success: true,

      metals: {
        goldUsdOz,
        silverUsdOz,
        platinumUsdOz,
      },

      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
      },

      usdPkr,

      timestamp:
        metalsData?.timestamp ||
        new Date().toISOString(),
    });

  } catch (error) {
    console.error(
      'Market rates API error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}