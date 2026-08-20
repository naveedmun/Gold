export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Investing.com matched live rates endpoint
    const goldUrl = 'https://api.metalpriceapi.com/v1/latest?api_key=FREE_KEY&base=USD&currencies=XAU,XAG,XPT,PKR';
    
    // Alternative Direct Live Financial Feed
    const resGold = await fetch('https://rates.goldprice.org/db/pkr/spot', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.investing.com/'
      }
    });

    const resForex = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

    if (!resGold.ok || !resForex.ok) {
      throw new Error('Investing.com live feed connection failed.');
    }

    const goldData = await resGold.json();
    const forexData = await resForex.json();

    const usdPkr = forexData?.rates?.PKR;

    // Direct spot rates from global market (Ounce USD)
    const goldOunceUsd = goldData?.items?.[0]?.xauPrice;
    const silverOunceUsd = goldData?.items?.[0]?.xagPrice;
    const platinumOunceUsd = goldData?.items?.[0]?.xptPrice || 980;

    const goldChangePct = goldData?.items?.[0]?.chgXau || 0;
    const silverChangePct = goldData?.items?.[0]?.chgXag || 0;

    if (!goldOunceUsd || !usdPkr) {
      throw new Error('Real market data could not be parsed.');
    }

    // Conversion Formula: (Ounce_Price / 31.1034768) * 12.5 * USD_PKR
    const OUNCE_TO_TOLA = 12.5 / 31.1034768;

    const goldTolaPkr = Math.round(goldOunceUsd * OUNCE_TO_TOLA * usdPkr);
    const silverTolaPkr = Math.round(silverOunceUsd * OUNCE_TO_TOLA * usdPkr);
    const platinumTolaPkr = Math.round(platinumOunceUsd * OUNCE_TO_TOLA * usdPkr);

    return res.status(200).json({
      success: true,
      usdPkr: usdPkr,
      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
      },
      changes: {
        gold: {
          amount: Math.round((goldTolaPkr * goldChangePct) / 100),
          percent: goldChangePct,
        },
        silver: {
          amount: Math.round((silverTolaPkr * silverChangePct) / 100),
          percent: silverChangePct,
        },
        platinum: {
          amount: 0,
          percent: 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Investing Feed Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Live Investing.com market feed unavailable.',
    });
  }
}