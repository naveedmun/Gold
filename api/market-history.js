// api/market-history.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const { metal = 'gold', days = '30' } = req.query;

    const apiKey = process.env.METALS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'METALS_API_KEY is not configured',
      });
    }

    const allowedMetals = [
      'gold',
      'silver',
      'platinum',
      'copper',
    ];

    if (!allowedMetals.includes(metal)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metal',
      });
    }

    const requestedDays = Math.min(
      Math.max(Number(days) || 30, 1),
      30
    );

    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(
      endDate.getDate() - (requestedDays - 1)
    );

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const url =
      `https://api.metals.dev/v1/timeseries` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&start_date=${start}` +
      `&end_date=${end}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Metals.Dev returned ${response.status}`
      );
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(
        data.error_message || 'Historical data unavailable'
      );
    }

    const result = [];

    Object.entries(data.rates || {}).forEach(
      ([date, values]) => {
        const price =
          values?.metals?.[metal];

        if (
          typeof price === 'number' &&
          price > 0
        ) {
          result.push({
            date,
            price,
          });
        }
      }
    );

    result.sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return res.status(200).json({
      success: true,
      metal,
      currency: 'USD',
      unit: 'toz',
      startDate: start,
      endDate: end,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(
      'Historical market data error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}