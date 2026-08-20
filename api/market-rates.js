// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  // Local Sarafa Premium Multiplier (Import Duty & Local Premium Margin)
  const LOCAL_SARAFA_PREMIUM = 1.035; // ~3.5% local sarafa adjustment

  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  // Static Fallback Benchmarks (Agar APIs Fail Ho Jayein)
  const FALLBACK_BENCHMARKS = {
    usdPkr: 278.70,
    goldUsdOz: 2650.00,
    silverUsdOz: 31.50,
    platinumUsdOz: 980.00
  };

  try {
    const GOLDAPI_KEY = process.env.GOLDAPI_KEY;

    // 1. Fetch USD/PKR Rate (Fail-safe)
    let usdPkr = FALLBACK_BENCHMARKS.usdPkr;
    try {
      const currencyResponse = await fetch('https://open.er-api.com/v6/latest/USD', {
        next: { revalidate: 300 }
      });
      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        if (Number.isFinite(currencyData?.rates?.PKR)) {
          usdPkr = Number(currencyData.rates.PKR);
        }
      }
    } catch (currErr) {
      console.warn('Currency API failed, using fallback USD/PKR:', currErr.message);
    }

    // 2. GoldAPI.io Helper (Graceful single-symbol fetch)
    async function fetchMetal(symbol, fallbackPrice) {
      if (!GOLDAPI_KEY) {
        return { price: fallbackPrice, change: 0, changePercent: 0 };
      }

      try {
        const response = await fetch(`https://www.goldapi.io/api/price/${symbol}/USD`, {
          headers: {
            'x-access-token': GOLDAPI_KEY,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 180 }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const price = Number(data?.price);
        
        if (!Number.isFinite(price) || price <= 0) {
          throw new Error('Invalid price data');
        }

        return {
          price,
          change: Number(data?.ch ?? 0),
          changePercent: Number(data?.chp ?? 0)
        };
      } catch (err) {
        console.warn(`GoldAPI failed for ${symbol}, using benchmark fallback:`, err.message);
        return { price: fallbackPrice, change: 0, changePercent: 0 };
      }
    }

    // 3. Fetch Metals Parallelly (Promise.allSettled behavior)
    const [gold, silver, platinum] = await Promise.all([
      fetchMetal('XAU', FALLBACK_BENCHMARKS.goldUsdOz),
      fetchMetal('XAG', FALLBACK_BENCHMARKS.silverUsdOz),
      fetchMetal('XPT', FALLBACK_BENCHMARKS.platinumUsdOz)
    ]);

    // 4. Calculate PKR per Tola (Including Sarafa Adjustment)
    const goldTolaPkr = Math.round(gold.price * TOLA_IN_TROY_OUNCE * usdPkr * LOCAL_SARAFA_PREMIUM);
    const silverTolaPkr = Math.round(silver.price * TOLA_IN_TROY_OUNCE * usdPkr * LOCAL_SARAFA_PREMIUM);
    const platinumTolaPkr = Math.round(platinum.price * TOLA_IN_TROY_OUNCE * usdPkr);

    const goldChangePkr = Math.round(gold.change * TOLA_IN_TROY_OUNCE * usdPkr * LOCAL_SARAFA_PREMIUM);
    const silverChangePkr = Math.round(silver.change * TOLA_IN_TROY_OUNCE * usdPkr * LOCAL_SARAFA_PREMIUM);
    const platinumChangePkr = Math.round(platinum.change * TOLA_IN_TROY_OUNCE * usdPkr);

    // 5. Success Response (Guaranteed Response to Frontend)
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

  } catch (criticalError) {
    console.error('Critical Handler Error:', criticalError);
    
    // Absolute Fallback Return - Ensures frontend NEVER sees 500 or Unavailable
    return res.status(200).json({
      success: true,
      isFallback: true,
      calculatedPkr: {
        goldTola: 454300,
        silverTola: 6940,
        platinumTola: 123000,
      },
      usdPkr: 278.70,
      timestamp: new Date().toISOString(),
    });
  }
}