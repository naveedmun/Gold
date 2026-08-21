// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Vercel CDN par response cache karein taake requests limit exhaust na hon
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  // Static Fallback Data (Jab GoldAPI limit over ho jaye)
  const FALLBACK_METALS = {
    gold: { price: 2510.50, change: 12.30, changePercent: 0.49 },
    silver: { price: 29.50, change: -0.15, changePercent: -0.50 },
    platinum: { price: 950.00, change: 4.10, changePercent: 0.43 },
  };

  const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

  try {
    // 1. Fetch USD to PKR
    let usdPkr = 277.76;
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
      console.log('Using default USD/PKR rate');
    }

    // Safe Helper Function
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
        return fallback; // Direct error return karne ke bajaye fallback rate dega
      }
    }

    // 2. Fetch Metals (Safe Fetch)
    const [gold, silver, platinum] = await Promise.all([
      getGoldApiPrice('XAU', FALLBACK_METALS.gold),
      getGoldApiPrice('XAG', FALLBACK_METALS.silver),
      getGoldApiPrice('XPT', FALLBACK_METALS.platinum),
    ]);

    // 3. International Spot to PKR Tola Calculations
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
      error: error?.message || 'Server Error',
    });
  }
}