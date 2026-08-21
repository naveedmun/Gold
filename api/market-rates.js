// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Vercel CDN Caching: 1 ghante ke liye cache taake GoldAPI free limits cross na hon
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  // Exact Weight Conversion Factors
  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

  try {
    // 1. Fetch Live USD to PKR Rate
    let usdPkr = 277.76; // Default Fallback
    try {
      const currencyResponse = await fetch('https://open.er-api.com/v6/latest/USD', {
        next: { revalidate: 3600 }
      });
      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        if (currencyData?.rates?.PKR) {
          usdPkr = Number(currencyData.rates.PKR);
        }
      }
    } catch (err) {
      console.error('USD/PKR Fetch Error:', err);
    }

    // Helper for GoldAPI
    async function getGoldApiPrice(symbol) {
      if (!GOLDAPI_KEY) throw new Error('API Key Missing');

      const url = `https://www.goldapi.io/api/price/${symbol}/USD`;
      const response = await fetch(url, {
        headers: {
          'x-access-token': GOLDAPI_KEY,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const data = await response.json();
      return {
        price: Number(data.price),
        change: Number(data.ch ?? 0),
        changePercent: Number(data.chp ?? 0),
      };
    }

    // 2. Fetch International Spot Prices (USD/Oz)
    const [gold, silver, platinum] = await Promise.all([
      getGoldApiPrice('XAU'),
      getGoldApiPrice('XAG'),
      getGoldApiPrice('XPT'),
    ]);

    // 3. Exact Pure International Spot to PKR Tola Calculations
    const goldTolaPkr = gold.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverTolaPkr = silver.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumTolaPkr = platinum.price * TOLA_IN_TROY_OUNCE * usdPkr;

    const goldChangePkr = gold.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverChangePkr = silver.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumChangePkr = platinum.change * TOLA_IN_TROY_OUNCE * usdPkr;

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
    console.error('Market rates error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch live market rates',
    });
  }
}