// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const API_KEY = process.env.METALS_API_KEY;

    if (!API_KEY) {
      throw new Error('METALS_API_KEY is not configured');
    }

    const TOLA_IN_TROY_OUNCE =
      11.6638125 / 31.1034768;

    // ------------------------------------------
    // LIVE LATEST RATES
    // ------------------------------------------

    const latestUrl =
      `https://api.metals.dev/v1/latest?api_key=${API_KEY}&currency=USD&unit=toz`;

    const latestRes = await fetch(latestUrl, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!latestRes.ok) {
      throw new Error(
        `Metals.Dev Latest API failed: ${latestRes.status}`
      );
    }

    const latestData = await latestRes.json();

    if (latestData?.status !== 'success') {
      throw new Error(
        latestData?.error?.message ||
        'Metals.Dev latest data unavailable'
      );
    }

    const goldUsdOz =
      Number(latestData?.metals?.gold);

    const silverUsdOz =
      Number(latestData?.metals?.silver);

    const platinumUsdOz =
      Number(latestData?.metals?.platinum);

    const copperUsdMt =
      Number(latestData?.metals?.copper);

    // ------------------------------------------
    // USD / PKR
    // ------------------------------------------

    const pkrRes = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        cache: 'no-store',
      }
    );

    if (!pkrRes.ok) {
      throw new Error('USD/PKR API failed');
    }

    const pkrData = await pkrRes.json();

    const usdPkr =
      Number(pkrData?.rates?.PKR);

    if (!usdPkr || usdPkr <= 0) {
      throw new Error('USD/PKR rate unavailable');
    }

    // ------------------------------------------
    // PKR PER TOLA
    // ------------------------------------------

    const goldTolaPkr =
      goldUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const silverTolaPkr =
      silverUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const platinumTolaPkr =
      platinumUsdOz *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    const copperTolaPkr =
      copperUsdMt *
      TOLA_IN_TROY_OUNCE *
      usdPkr;

    // ------------------------------------------
    // GOLD SPOT / CHANGE
    // ------------------------------------------

    const goldSpotUrl =
      `https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=gold&currency=USD`;

    const goldSpotRes = await fetch(
      goldSpotUrl,
      {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    let goldChange = 0;
    let goldChangePercent = 0;

    if (goldSpotRes.ok) {
      const goldSpotData =
        await goldSpotRes.json();

      goldChange =
        Number(
          goldSpotData?.rate?.change
        ) || 0;

      goldChangePercent =
        Number(
          goldSpotData?.rate?.change_percent
        ) || 0;
    }

    // ------------------------------------------
    // SILVER SPOT / CHANGE
    // ------------------------------------------

    const silverSpotUrl =
      `https://api.metals.dev/v1/metal/spot?api_key=${API_KEY}&metal=silver&currency=USD`;

    const silverSpotRes = await fetch(
      silverSpotUrl,
      {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    let silverChange = 0;
    let silverChangePercent = 0;

    if (silverSpotRes.ok) {
      const silverSpotData =
        await silverSpotRes.json();

      silverChange =
        Number(
          silverSpotData?.rate?.change
        ) || 0;

      silverChangePercent =
        Number(
          silverSpotData?.rate?.change_percent
        ) || 0;
    }

    // ------------------------------------------
    // RETURN
    // ------------------------------------------

    return res.status(200).json({
      success: true,

      metals: {
        goldUsdOz,
        silverUsdOz,
        platinumUsdOz,
        copperUsdMt,
      },

      calculatedPkr: {
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
        copperTola: copperTolaPkr,
      },

      changes: {
        gold: {
          usd: goldChange,
          percent: goldChangePercent,
        },

        silver: {
          usd: silverChange,
          percent: silverChangePercent,
        },
      },

      usdPkr,

      timestamp:
        latestData?.timestamp ||
        new Date().toISOString(),
    });

  } catch (error) {
    console.error(
      'Market rates API error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}