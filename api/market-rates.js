// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Vercel CDN Cache: 1 ghante tak Vercel API response cache rakhega
  // Safe Limit: Poore mahine mein max 24 calls hongi, limit bachegi!
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

  try {
    // 1. USD to PKR Rate
    let usdPkr = 278.50;
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
    } catch (e) {
      console.error('USD/PKR fetch failed');
    }

    // Helper for Metals
    async function getMetalPrice(symbol, defaultPrice, defaultChange, defaultChangePct) {
      if (!GOLDAPI_KEY) {
        return { price: defaultPrice, change: defaultChange, changePercent: defaultChangePct };
      }

      try {
        const url = `https://www.goldapi.io/api/price/${symbol}/USD`;
        const response = await fetch(url, {
          headers: {
            'x-access-token': GOLDAPI_KEY,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          return { price: defaultPrice, change: defaultChange, changePercent: defaultChangePct };
        }

        const data = await response.json();
        const price = Number(data?.price);
        if (!Number.isFinite(price) || price <= 0) {
          return { price: defaultPrice, change: defaultChange, changePercent: defaultChangePct };
        }

        return {
          price,
          change: Number(data?.ch ?? 0),
          changePercent: Number(data?.chp ?? 0),
        };
      } catch (err) {
        return { price: defaultPrice, change: defaultChange, changePercent: defaultChangePct };
      }
    }

    // Fetch Rates with standard market defaults if API is exhausted
    const [gold, silver, platinum] = await Promise.all([
      getMetalPrice('XAU', 2512.40, 11.20, 0.45),
      getMetalPrice('XAG', 29.80, -0.12, -0.40),
      getMetalPrice('XPT', 955.00, 3.50, 0.37),
    ]);

    // Conversion to PKR Tola
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
    return res.status(500).json({
      success: false,
      error: 'Error loading rates',
    });
  }
}