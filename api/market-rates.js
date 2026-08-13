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

    // ==================================================
    // LIVE LATEST METALS.DEV RATES
    // ==================================================

    const latestUrl =
      `https://api.metals.dev/v1/latest?api_key=${encodeURIComponent(
        API_KEY
      )}&currency=USD&unit=toz`;

    const latestRes = await fetch(latestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    // IMPORTANT:
    // Metals.Dev ka actual error response bhi read karna hai.
    if (!latestRes.ok) {
      const errorText = await latestRes.text();

      throw new Error(
        `Metals.Dev Latest API failed: ${latestRes.status} - ${errorText}`
      );
    }

    const latestData = await latestRes.json();

    if (latestData?.status !== 'success') {
      throw new Error(
        latestData?.error?.message ||
        latestData?.error ||
        'Metals.Dev latest data unavailable'
      );
    }

    // ==================================================
    // READ METAL PRICES
    // ==================================================

    const goldUsdOz =
      Number(latestData?.metals?.gold);

    const silverUsdOz =
      Number(latestData?.metals?.silver);

    const platinumUsdOz =
      Number(latestData?.metals?.platinum);

    const copperUsdMt =
      Number(latestData?.metals?.copper);

    if (!goldUsdOz || goldUsdOz <= 0) {
      throw new Error(
        'Gold price unavailable from Metals.Dev'
      );
    }

    if (!silverUsdOz || silverUsdOz <= 0) {
      throw new Error(
        'Silver price unavailable from Metals.Dev'
      );
    }

    if (!platinumUsdOz || platinumUsdOz <= 0) {
      throw new Error(
        'Platinum price unavailable from Metals.Dev'
      );
    }

    // ==================================================
    // USD / PKR
    // ==================================================

    const pkrRes = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!pkrRes.ok) {
      const pkrError = await pkrRes.text();

      throw new Error(
        `USD/PKR API failed: ${pkrRes.status} - ${pkrError}`
      );
    }

    const pkrData = await pkrRes.json();

    const usdPkr =
      Number(pkrData?.rates?.PKR);

    if (!usdPkr || usdPkr <= 0) {
      throw new Error(
        'USD/PKR rate unavailable'
      );
    }

    // ==================================================
    // PKR PER TOLA
    // ==================================================

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

    /*
     * Copper ka unit Metals.Dev response mein
     * gold/silver ki tarah toz nahi hota.
     *
     * Is liye filhaal copper ko 0 rakha gaya hai
     * taake wrong calculation display na ho.
     */
    const copperTolaPkr = 0;

    // ==================================================
    // GOLD 24H CHANGE
    // ==================================================

    let goldChange = 0;
    let goldChangePercent = 0;

    try {
      const goldSpotUrl =
        `https://api.metals.dev/v1/metal/spot?api_key=${encodeURIComponent(
          API_KEY
        )}&metal=gold&currency=USD`;

      const goldSpotRes = await fetch(
        goldSpotUrl,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

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
    } catch (goldError) {
      console.error(
        'Gold 24H change error:',
        goldError
      );
    }

    // ==================================================
    // SILVER 24H CHANGE
    // ==================================================

    let silverChange = 0;
    let silverChangePercent = 0;

    try {
      const silverSpotUrl =
        `https://api.metals.dev/v1/metal/spot?api_key=${encodeURIComponent(
          API_KEY
        )}&metal=silver&currency=USD`;

      const silverSpotRes = await fetch(
        silverSpotUrl,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

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
    } catch (silverError) {
      console.error(
        'Silver 24H change error:',
        silverError
      );
    }

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      metals: {
        goldUsdOz,
        silverUsdOz,
        platinumUsdOz,
        copperUsdMt:
          Number(copperUsdMt) || 0,
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
      error:
        error?.message ||
        'Unknown market rates API error',
    });
  }
}