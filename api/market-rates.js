// api/market-rates.js

const TOLA_GRAMS = 11.6638125;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.METALS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'METALS_API_KEY is not configured.',
    });
  }

  try {
    /*
     * We request:
     * currency = USD
     * unit     = gram
     *
     * This makes all metals comparable:
     * Gold      -> USD / gram
     * Silver    -> USD / gram
     * Platinum  -> USD / gram
     * Copper    -> USD / gram
     *
     * Metals.Dev normally gives industrial metals such as
     * copper in metric tonnes, but the unit parameter allows
     * conversion to grams.
     */
    const url =
      `https://api.metals.dev/v1/latest` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&currency=USD` +
      `&unit=g`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || data?.status !== 'success') {
      console.error('Metals.Dev error:', data);

      return res.status(502).json({
        success: false,
        error:
          data?.error_message ||
          'Metals.Dev API request failed.',
        errorCode: data?.error_code || null,
      });
    }

    const metals = data.metals || {};
    const currencies = data.currencies || {};

    /*
     * Because the API request is in USD,
     * currencies.PKR represents PKR for USD.
     */
    const usdPkr = Number(currencies.PKR);

    if (!Number.isFinite(usdPkr) || usdPkr <= 0) {
      throw new Error('USD/PKR rate unavailable.');
    }

    const goldUsdGram = Number(metals.gold);
    const silverUsdGram = Number(metals.silver);
    const platinumUsdGram = Number(metals.platinum);
    const copperUsdGram = Number(metals.copper);

    function validNumber(value) {
      return Number.isFinite(value) && value > 0;
    }

    /*
     * USD per gram -> USD per Tola
     */
    function usdGramToUsdTola(usdGram) {
      if (!validNumber(usdGram)) return 0;

      return usdGram * TOLA_GRAMS;
    }

    /*
     * USD per gram -> PKR per Tola
     */
    function usdGramToPkrTola(usdGram) {
      if (!validNumber(usdGram)) return 0;

      return usdGram * TOLA_GRAMS * usdPkr;
    }

    const result = {
      success: true,

      source: 'Metals.Dev',

      timestamp:
        data.timestamp ||
        data.timestamps?.metal ||
        new Date().toISOString(),

      currency: 'USD',
      unit: 'g',

      conversion: {
        tolaGrams: TOLA_GRAMS,
      },

      usdPkr,

      gold: {
        usdPerGram: goldUsdGram,
        usdPerTola: usdGramToUsdTola(goldUsdGram),
        pkrPerTola: usdGramToPkrTola(goldUsdGram),
      },

      silver: {
        usdPerGram: silverUsdGram,
        usdPerTola: usdGramToUsdTola(silverUsdGram),
        pkrPerTola: usdGramToPkrTola(silverUsdGram),
      },

      platinum: {
        usdPerGram: platinumUsdGram,
        usdPerTola: usdGramToUsdTola(platinumUsdGram),
        pkrPerTola: usdGramToPkrTola(platinumUsdGram),
      },

      copper: {
        usdPerGram: copperUsdGram,
        usdPerTola: usdGramToUsdTola(copperUsdGram),
        pkrPerTola: usdGramToPkrTola(copperUsdGram),
      },
    };

    /*
     * Vercel cache:
     * Metals.Dev maximum delay is around 60 seconds.
     *
     * This prevents every visitor from creating a new
     * Metals.Dev request.
     */
    res.setHeader(
      'Cache-Control',
      's-maxage=60, stale-while-revalidate=30'
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Market rates error:', error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        'Unable to retrieve live market rates.',
    });
  }
}
