export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const API_KEY = process.env.METALS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'METALS_API_KEY is not configured on Vercel.'
    });
  }

  try {
    const metal = req.query?.metal || 'gold';
    const startDate = req.query?.start_date;
    const endDate = req.query?.end_date;

    const allowedMetals = [
      'gold',
      'silver',
      'platinum',
      'copper'
    ];

    if (!allowedMetals.includes(metal)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metal.'
      });
    }

    // --------------------------------------------------
    // HISTORICAL / TIMESERIES
    // --------------------------------------------------

    if (startDate && endDate) {
      const url =
        `https://api.metals.dev/v1/timeseries` +
        `?api_key=${encodeURIComponent(API_KEY)}` +
        `&start_date=${encodeURIComponent(startDate)}` +
        `&end_date=${encodeURIComponent(endDate)}`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok || data?.status !== 'success') {
        return res.status(502).json({
          success: false,
          error:
            data?.error_message ||
            'Historical metals data unavailable.'
        });
      }

      return res.status(200).json({
        success: true,
        type: 'timeseries',
        metal,
        data
      });
    }

    // --------------------------------------------------
    // LIVE RATES
    // --------------------------------------------------

    const url =
      `https://api.metals.dev/v1/latest` +
      `?api_key=${encodeURIComponent(API_KEY)}` +
      `&currency=USD` +
      `&unit=toz`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || data?.status !== 'success') {
      return res.status(502).json({
        success: false,
        error:
          data?.error_message ||
          'Live metals data unavailable.'
      });
    }

    return res.status(200).json({
      success: true,
      type: 'latest',
      data
    });

  } catch (error) {
    console.error('Market rates error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
}