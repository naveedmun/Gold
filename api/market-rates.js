// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    // ==================================================
    // CONSTANTS & CONVERSIONS
    // ==================================================
    const TOLA_GRAMS = 11.6638125;
    const TROY_OUNCE_GRAMS = 31.1034768;
    const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

    const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

    if (!GOLDAPI_KEY) {
      throw new Error('GOLDAPI_KEY environment variable is missing');
    }

    // ==================================================
    // GOLDAPI.IO HELPER
    // ==================================================
    async function getGoldApiPrice(symbol) {
      const url = `https://www.goldapi.io/api/price/${symbol}/USD`;

      const response = await fetch(url, {
        headers: {
          'x-access-token': GOLDAPI_KEY,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`GoldAPI failed for ${symbol}: ${response.status} ${errText}`);
      }

      const data = await response.json();

      const price = Number(data?.price);
      const change = Number(data?.ch ?? 0);
      const changePercent = Number(data?.chp ?? 0);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`No valid price returned for ${symbol}`);
      }

      return { price, change, changePercent };
    }

    // ==================================================
    // FETCH USD / PKR
    // ==================================================
    const currencyResponse = await fetch('https://open.er-api.com/v6/latest/USD', {
      cache: 'no-store',
    });

    if (!currencyResponse.ok) {
      throw new Error(`USD/PKR API failed: ${currencyResponse.status}`);
    }

    const currencyData = await currencyResponse.json();
    const usdPkr = Number(currencyData?.rates?.PKR);

    if (!Number.isFinite(usdPkr) || usdPkr <= 0) {
      throw new Error('USD/PKR rate unavailable');
    }

    // ==================================================
    // FETCH METALS (GoldAPI symbols: XAU, XAG, XPT)
    // ==================================================
    const [gold, silver, platinum] = await Promise.all([
      getGoldApiPrice('XAU'),
      getGoldApiPrice('XAG'),
      getGoldApiPrice('XPT'),
    ]);

    // ==================================================
    // CONVERT TO PKR PER TOLA
    // ==================================================
    const goldTolaPkr = gold.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverTolaPkr = silver.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumTolaPkr = platinum.price * TOLA_IN_TROY_OUNCE * usdPkr;

    // ==================================================
    // CHANGE IN PKR PER TOLA
    // ==================================================
    const goldChangePkr = gold.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverChangePkr = silver.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumChangePkr = platinum.change * TOLA_IN_TROY_OUNCE * usdPkr;

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(200).json({
      success: true,
      metals: {
        goldUsdOz: gold.price,
        silverUsdOz: silver.price,
        platinumUsdOz: platinum.price,
      },
      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
      },
      changes: {
        gold: {
          amount: goldChangePkr,
          percent: gold.changePercent,
          direction: gold.change > 0 ? 'up' : gold.change < 0 ? 'down' : 'flat',
        },
        silver: {
          amount: silverChangePkr,
          percent: silver.changePercent,
          direction: silver.change > 0 ? 'up' : silver.change < 0 ? 'down' : 'flat',
        },
        platinum: {
          amount: platinumChangePkr,
          percent: platinum.changePercent,
          direction: platinum.change > 0 ? 'up' : platinum.change < 0 ? 'down' : 'flat',
        },
      },
      usdPkr,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Market rates API error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Market rates unavailable',
    });
  }
}
