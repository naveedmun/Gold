// api/market-rates.js

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    // Vercel Environment Variable
    const apiKey = process.env.METALS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'METALS_API_KEY environment variable is missing.'
      });
    }

    // Metals.Dev - Live international metal prices
    const metalsUrl =
      `https://api.metals.dev/v1/latest?api_key=${encodeURIComponent(apiKey)}&currency=USD&unit=toz`;

    const metalsRes = await fetch(metalsUrl, {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

    const metalsData = await metalsRes.json();

    if (!metalsRes.ok || metalsData.status !== 'success') {
      return res.status(502).json({
        success: false,
        error:
          metalsData.error_message ||
          'Metals.Dev API request failed.'
      });
    }

    // Metals.Dev data
    const goldPriceUsdPerOunce = Number(metalsData.metals?.gold || 0);
    const silverPriceUsdPerOunce = Number(metalsData.metals?.silver || 0);
    const platinumPriceUsdPerOunce = Number(metalsData.metals?.platinum || 0);

    // IMPORTANT:
    // Metals.Dev reports copper in its industrial-metal unit.
    // We keep the returned value for reference.
    const copperPrice = Number(metalsData.metals?.copper || 0);

    // USD -> PKR
    const pkrRes = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        cache: 'no-store'
      }
    );

    const pkrData = await pkrRes.json();
    const usdPkr = Number(pkrData?.rates?.PKR || 0);

    if (!usdPkr) {
      return res.status(502).json({
        success: false,
        error: 'Unable to fetch USD/PKR exchange rate.'
      });
    }

    // 1 Tola = 11.6638125 grams
    // 1 Troy Ounce = 31.1034768 grams
    const TOLA_IN_TROY_OUNCE =
      11.6638125 / 31.1034768;

    // Convert Troy Ounce USD -> Tola PKR
    const goldTolaPkr =
      goldPriceUsdPerOunce *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const silverTolaPkr =
      silverPriceUsdPerOunce *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const platinumTolaPkr =
      platinumPriceUsdPerOunce *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    return res.status(200).json({
      success: true,

      source: 'Metals.Dev',

      metals: {
        gold: goldPriceUsdPerOunce,
        silver: silverPriceUsdPerOunce,
        platinum: platinumPriceUsdPerOunce,
        copper: copperPrice
      },

      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr
      },

      usdPkr,

      timestamp:
        metalsData.timestamp ||
        new Date().toISOString()
    });

  } catch (error) {
    console.error('Market rates error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch market rates.'
    });
  }
}