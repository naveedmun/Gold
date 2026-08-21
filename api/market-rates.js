// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const TOLA_GRAMS = 11.6638125;
  const TROY_OUNCE_GRAMS = 31.1034768;
  const TOLA_IN_TROY_OUNCE = TOLA_GRAMS / TROY_OUNCE_GRAMS;

  try {
    // 1. Fetch Live Spot Metals from Yahoo Finance (GC=F Gold, SI=F Silver, PL=F Platinum)
    const yahooUrl = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F,SI=F,PL=F';
    const metalsRes = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    });

    if (!metalsRes.ok) throw new Error('Yahoo Finance API failed');
    const metalsData = await metalsRes.json();
    const results = metalsData?.quoteResponse?.result || [];

    const goldData = results.find(item => item.symbol === 'GC=F');
    const silverData = results.find(item => item.symbol === 'SI=F');
    const platData = results.find(item => item.symbol === 'PL=F');

    const gold = {
      price: goldData?.regularMarketPrice || 0,
      change: goldData?.regularMarketChange || 0,
      changePercent: goldData?.regularMarketChangePercent || 0
    };
    const silver = {
      price: silverData?.regularMarketPrice || 0,
      change: silverData?.regularMarketChange || 0,
      changePercent: silverData?.regularMarketChangePercent || 0
    };
    const platinum = {
      price: platData?.regularMarketPrice || 0,
      change: platData?.regularMarketChange || 0,
      changePercent: platData?.regularMarketChangePercent || 0
    };

    // 2. Fetch Live USD to PKR Rate
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
    } catch (e) {
      console.error('USD/PKR fetch error');
    }

    // 3. Convert Spot USD/Oz to PKR Per Tola
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
      error: error?.message || 'Live rates fetch failed',
    });
  }
}