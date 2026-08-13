// api/market-rates.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const API_KEY = process.env.METALS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'METALS_API_KEY environment variable missing.',
    });
  }

  try {
    const { range = '1D', metal = 'gold' } = req.query;

    const allowedMetals = ['gold', 'silver'];

    if (!allowedMetals.includes(metal)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metal. Use gold or silver.',
      });
    }

    const rangeDays = {
      '1D': 2,
      '5D': 5,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
    };

    const totalDays = rangeDays[range] || 2;

    const today = new Date();

    // --------------------------------------------------
    // DATE HELPERS
    // --------------------------------------------------

    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const subtractDays = (date, days) => {
      const result = new Date(date);
      result.setUTCDate(result.getUTCDate() - days);
      return result;
    };

    // --------------------------------------------------
    // BUILD 30-DAY REQUEST CHUNKS
    // Metals.Dev max timeseries range = 30 days
    // --------------------------------------------------

    const chunks = [];

    let remaining = totalDays;
    let endDate = today;

    while (remaining > 0) {
      const chunkDays = Math.min(30, remaining);

      const startDate = subtractDays(
        endDate,
        chunkDays - 1
      );

      chunks.push({
        start: formatDate(startDate),
        end: formatDate(endDate),
      });

      endDate = subtractDays(
        startDate,
        1
      );

      remaining -= chunkDays;
    }

    // --------------------------------------------------
    // FETCH HISTORICAL DATA
    // --------------------------------------------------

    const responses = await Promise.all(
      chunks.map(async (chunk) => {
        const url =
          `https://api.metals.dev/v1/timeseries` +
          `?api_key=${encodeURIComponent(API_KEY)}` +
          `&start_date=${chunk.start}` +
          `&end_date=${chunk.end}`;

        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            `Metals.Dev HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (data.status !== 'success') {
          throw new Error(
            data.error_message ||
              'Metals.Dev timeseries failed'
          );
        }

        return data;
      })
    );

    // --------------------------------------------------
    // CONVERT RESPONSE TO CHART DATA
    // --------------------------------------------------

    const allPoints = [];

    responses.forEach((response) => {
      const rates = response.rates || {};

      Object.entries(rates).forEach(
        ([date, dayData]) => {
          const usdPrice = Number(
            dayData?.metals?.[metal]
          );

          const usdPkr = Number(
            dayData?.currencies?.PKR
          );

          if (
            !usdPrice ||
            usdPrice <= 0 ||
            !usdPkr ||
            usdPkr <= 0
          ) {
            return;
          }

          // 1 Tola = 11.6638125g
          // 1 Troy Ounce = 31.1034768g

          const TOLA_IN_TROY_OUNCE =
            11.6638125 /
            31.1034768;

          const pricePkr =
            usdPrice *
            TOLA_IN_TROY_OUNCE *
            usdPkr;

          allPoints.push({
            date,
            priceUsd: usdPrice,
            pricePkr,
          });
        }
      );
    });

    // --------------------------------------------------
    // REMOVE DUPLICATES + SORT
    // --------------------------------------------------

    const unique = new Map();

    allPoints.forEach((point) => {
      unique.set(point.date, point);
    });

    let sortedPoints = Array.from(
      unique.values()
    ).sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    // --------------------------------------------------
    // REDUCE LONG RANGES
    // 1Y doesn't need 365 points on mobile.
    // Keep approximately monthly points.
    // --------------------------------------------------

    if (range === '1Y') {
      const monthly = [];

      sortedPoints.forEach((point) => {
        const month =
          point.date.substring(0, 7);

        const existing =
          monthly.find(
            (item) =>
              item.date.substring(0, 7) ===
              month
          );

        if (!existing) {
          monthly.push(point);
        }
      });

      sortedPoints = monthly;
    }

    // --------------------------------------------------
    // DISPLAY LABEL
    // --------------------------------------------------

    const chart = sortedPoints.map(
      (point) => {
        const date = new Date(
          `${point.date}T00:00:00`
        );

        let label;

        if (range === '1D') {
          label = date.toLocaleDateString(
            'en-PK',
            {
              day: '2-digit',
              month: 'short',
            }
          );
        } else if (
          range === '1Y'
        ) {
          label = date.toLocaleDateString(
            'en-PK',
            {
              month: 'short',
              year: '2-digit',
            }
          );
        } else {
          label = date.toLocaleDateString(
            'en-PK',
            {
              day: '2-digit',
              month: 'short',
            }
          );
        }

        return {
          date: point.date,
          time: label,
          priceUsd: point.priceUsd,
          pricePkr: Math.round(
            point.pricePkr
          ),
        };
      }
    );

    return res.status(200).json({
      success: true,
      metal,
      range,
      points: chart,
      count: chart.length,
      timestamp:
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
        error.message ||
        'Unable to fetch market data.',
    });
  }
}