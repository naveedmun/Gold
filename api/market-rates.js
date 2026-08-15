// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    // International standard conversion factors
    const TOLA_GRAMS = 11.6638;
    const OUNCE_GRAMS = 31.1035;

    // Helper to fetch Yahoo Finance market data
    async function getPrice(symbol) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`;
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      
      const meta = data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose;
      
      return {
        price: price,
        change: price - previousClose,
        percent: ((price - previousClose) / previousClose) * 100
      };
    }

    // Fetch USD/PKR Interbank Rate
    const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    const currencyData = await currencyRes.json();
    const usdPkr = currencyData.rates.PKR;

    // Fetch Metals
    const [gold, silver] = await Promise.all([
      getPrice('GC=F'),
      getPrice('SI=F')
    ]);

    // Calculation Formula: (USD Price per Ounce / 31.1035) * 11.6638 * USD/PKR Rate
    // Yeh pure mathematical formula hai jo international gold price ko PKR tola mein convert karta hai.
    const goldTolaPkr = (gold.price / OUNCE_GRAMS) * TOLA_GRAMS * usdPkr;
    const silverTolaPkr = (silver.price / OUNCE_GRAMS) * TOLA_GRAMS * usdPkr;

    // Calculate changes in PKR
    const goldChangePkr = (gold.change / OUNCE_GRAMS) * TOLA_GRAMS * usdPkr;
    const silverChangePkr = (silver.change / OUNCE_GRAMS) * TOLA_GRAMS * usdPkr;

    return res.status(200).json({
      success: true,
      metals: {
        goldUsdOz: gold.price,
        silverUsdOz: silver.price
      },
      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr
      },
      changes: {
        gold: {
          amount: goldChangePkr,
          percent: gold.percent,
          direction: gold.change >= 0 ? 'up' : 'down'
        },
        silver: {
          amount: silverChangePkr,
          percent: silver.percent,
          direction: silver.change >= 0 ? 'up' : 'down'
        }
      },
      usdPkr,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch market rates' });
  }
}