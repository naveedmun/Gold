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
    const POUND_GRAMS = 453.59237;

    // ==================================================
    // YAHOO FINANCE HELPER
    // ==================================================
    async function getYahooChart(symbol) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Market data failed for ${symbol}: ${response.status}`);
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];

      if (!result) {
        throw new Error(`No market data returned for ${symbol}`);
      }

      const closes = result?.indicators?.quote?.[0]?.close || [];
      const validPrices = closes
        .map(Number)
        .filter(value => Number.isFinite(value) && value > 0);

      if (!validPrices.length) {
        throw new Error(`No valid price for ${symbol}`);
      }

      const current = validPrices[validPrices.length - 1];
      const previous = validPrices.length > 1 ? validPrices[0] : current;
      const change = current - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      return {
        price: current,
        change,
        changePercent,
      };
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
    // FETCH METALS
    // ==================================================
    const [gold, silver, platinum, copper] = await Promise.all([
      getYahooChart('GC=F'),
      getYahooChart('SI=F'),
      getYahooChart('PL=F'),
      getYahooChart('HG=F'),
    ]);

    // ==================================================
    // CONVERT TO PKR PER TOLA (WITH LOCAL MARKET CALIBRATION)
    // ==================================================
    // International spot prices sometimes include premium formulas or futures variances.
    // Applying standard local market alignment coefficients.
    
    const goldTolaPkr = gold.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverTolaPkr = silver.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumTolaPkr = platinum.price * TOLA_IN_TROY_OUNCE * usdPkr;
    const copperTolaPkr = copper.price * (TOLA_GRAMS / POUND_GRAMS) * usdPkr;

    // ==================================================
    // CHANGE IN PKR PER TOLA
    // ==================================================
    const goldChangePkr = gold.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const silverChangePkr = silver.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const platinumChangePkr = platinum.change * TOLA_IN_TROY_OUNCE * usdPkr;
    const copperChangePkr = copper.change * (TOLA_GRAMS / POUND_GRAMS) * usdPkr;

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(200).json({
      success: true,
      metals: {
        goldUsdOz: gold.price,
        silverUsdOz: silver.price,
        platinumUsdOz: platinum.price,
        copperUsdLb: copper.price,
      },
      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
        copperTola: copperTolaPkr,
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
        copper: {
          amount: copperChangePkr,
          percent: copper.changePercent,
          direction: copper.change > 0 ? 'up' : copper.change < 0 ? 'down' : 'flat',
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