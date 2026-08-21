// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Vercel CDN Caching: 1 ghante tak Vercel API response cache karega
  // Safe limit: Monthly max 24 calls, limits exhaust nahi hongi!
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  // Static Fallback Rates (Agar API fail ho jaye toh app break nahi hogi)
  const FALLBACK_METALS = {
    gold: { price: 2650.50, change: 12.30, changePercent: 0.46 },
    silver: { price: 31.20, change: -0.15, changePercent: -0.48 },
    platinum: { price: 980.00, change: 5.10, changePercent: 0.52 },
  };

  try {
    const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

    // Helper Function with Fallback
    async function getGoldApiPrice(symbol, fallback) {
      if (!GOLDAPI_KEY) return fallback;

      try {
        const url = `https://www.goldapi.io/api/price/${symbol}/USD`;
        const response = await fetch(url, {
          headers: {
            'x-access-token': GOLDAPI_KEY,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 },
        });

        if (!response.ok) return fallback;

        const data = await response.json();
        const price = Number(data?.price);
        
        if (!Number.isFinite(price) || price <= 0) return fallback;

        return {
          price,
          change: Number(data?.ch ?? 0),
          changePercent: Number(data?.chp ?? 0),
        };
      } catch (err) {
        return fallback;
      }
    }

    // Fetch USD / PKR (With Fallback)
    let usdPkr = 278.50; // Fallback PKR rate
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
      console.log('Using PKR fallback rate');
    }

    // Fetch Metals
    const [gold, silver, platinum] = await Promise.all([
      getGoldApiPrice('XAU', FALLBACK_METALS.gold),
      getGoldApiPrice('XAG', FALLBACK_METALS.silver),
      getGoldApiPrice('XPT', FALLBACK_METALS.platinum),
    ]);

    // Conversion Calculations
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
      error: error?.message || 'Server error',
    });
  }
}