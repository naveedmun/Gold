export default async function handler(req, res) {
  try {
    // Allow GET only
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
        error: 'METALS_API_KEY is not configured on Vercel.',
      });
    }

    const url =
      'https://api.metals.dev/v1/latest' +
      `?api_key=${encodeURIComponent(apiKey)}` +
      '&currency=USD' +
      '&unit=toz';

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || data?.status !== 'success') {
      return res.status(response.status || 502).json({
        success: false,
        error:
          data?.error_message ||
          data?.error?.message ||
          data?.message ||
          'Metals.Dev API request failed.',
      });
    }

    return res.status(200).json({
      success: true,

      source: 'Metals.Dev',

      timestamp:
        data.timestamp ||
        new Date().toISOString(),

      currency: data.currency || 'USD',

      unit: data.unit || 'toz',

      metals: {
        gold: Number(data?.metals?.gold) || 0,
        silver: Number(data?.metals?.silver) || 0,
        platinum:
          Number(data?.metals?.platinum) || 0,
        copper:
          Number(data?.metals?.copper) || 0,
      },
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
        'Internal server error.',
    });
  }
}
