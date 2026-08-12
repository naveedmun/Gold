import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function Home() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';

  const [rates, setRates] = useState({
    goldTola: 0,
    silverTola: 0,
    platinumTola: 0,
    copperTola: 0,
    usdPkr: 0,
  });

  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [selectedRange, setSelectedRange] = useState('1D');

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const TOLA_IN_TROY_OUNCE =
    11.6638125 / 31.1034768;

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const formatMoney = (amount) => {
    if (!amount || amount <= 0) {
      return loading ? 'Loading...' : 'Unavailable';
    }

    if (currency === 'USD' && rates.usdPkr > 0) {
      return `$ ${(
        amount / rates.usdPkr
      ).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `Rs ${amount.toLocaleString('en-PK', {
      maximumFractionDigits: 0,
    })}`;
  };

  // --------------------------------------------------
  // LIVE RATES
  // --------------------------------------------------

  const fetchLiveRates = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // USD / PKR
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

      const usdPkr = Number(
        pkrData?.rates?.PKR
      );

      if (!usdPkr || usdPkr <= 0) {
        throw new Error(
          'USD/PKR rate unavailable'
        );
      }

      // GOLD
      const goldRes = await fetch(
        'https://api.gold-api.com/price/XAU',
        {
          cache: 'no-store',
        }
      );

      if (!goldRes.ok) {
        throw new Error('Gold API failed');
      }

      const goldData = await goldRes.json();

      const goldUsdOz = Number(
        goldData?.price
      );

      if (!goldUsdOz || goldUsdOz <= 0) {
        throw new Error(
          'Gold price unavailable'
        );
      }

      // SILVER
      const silverRes = await fetch(
        'https://api.gold-api.com/price/XAG',
        {
          cache: 'no-store',
        }
      );

      if (!silverRes.ok) {
        throw new Error(
          'Silver API failed'
        );
      }

      const silverData =
        await silverRes.json();

      const silverUsdOz = Number(
        silverData?.price
      );

      if (
        !silverUsdOz ||
        silverUsdOz <= 0
      ) {
        throw new Error(
          'Silver price unavailable'
        );
      }

      // TOLA → PKR
      const goldTolaPkr =
        goldUsdOz *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      const silverTolaPkr =
        silverUsdOz *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      const platinumTolaPkr =
        1000 *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      const copperTolaPkr =
        4.2 *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      setRates({
        goldTola: goldTolaPkr,
        silverTola: silverTolaPkr,
        platinumTola: platinumTolaPkr,
        copperTola: copperTolaPkr,
        usdPkr,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        'Failed to fetch live rates:',
        err
      );

      setError(
        'Live rate fetch karne mein masla aa raha hai. Internet connection check karein.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // CHART
  // --------------------------------------------------

  const buildChartFromCurrentPrice = useCallback(
    (price) => {
      if (!price || price <= 0) {
        setChartData([]);
        return;
      }

      /*
       * IMPORTANT:
       * We do NOT invent historical market prices.
       *
       * Until a historical/OHLC source is connected,
       * the chart displays the current live quote as
       * a current-price reference.
       */

      const now = new Date();

      const points = [
        {
          time: now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          price,
        },
      ];

      setChartData(points);
    },
    []
  );

  const fetchChart = useCallback(async () => {
    setChartLoading(true);

    try {
      const symbol =
        selectedMetal === 'gold'
          ? 'XAU'
          : 'XAG';

      const response = await fetch(
        `https://api.gold-api.com/price/${symbol}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          'Chart price unavailable'
        );
      }

      const data =
        await response.json();

      const usdPrice = Number(
        data?.price
      );

      if (!usdPrice || usdPrice <= 0) {
        throw new Error(
          'Invalid chart price'
        );
      }

      const pkrPrice =
        usdPrice *
        TOLA_IN_TROY_OUNCE *
        rates.usdPkr;

      const displayPrice =
        currency === 'USD'
          ? usdPrice
          : pkrPrice;

      buildChartFromCurrentPrice(
        displayPrice
      );
    } catch (err) {
      console.error(
        'Chart error:',
        err
      );

      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [
    selectedMetal,
    selectedRange,
    currency,
    rates.usdPkr,
    buildChartFromCurrentPrice,
  ]);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchLiveRates();

    const interval = setInterval(
      fetchLiveRates,
      60 * 1000
    );

    return () =>
      clearInterval(interval);
  }, [fetchLiveRates]);

  // --------------------------------------------------
  // UPDATE CHART
  // --------------------------------------------------

  useEffect(() => {
    if (rates.usdPkr > 0) {
      fetchChart();
    }
  }, [
    selectedMetal,
    selectedRange,
    currency,
    rates.usdPkr,
    fetchChart,
  ]);

  // --------------------------------------------------
  // CURRENT CHART PRICE
  // --------------------------------------------------

  const currentChartPrice =
    selectedMetal === 'gold'
      ? rates.goldTola
      : rates.silverTola;

  const chartDisplayPrice =
    currency === 'USD' &&
    rates.usdPkr > 0
      ? currentChartPrice /
        rates.usdPkr
      : currentChartPrice;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">

      {/* --------------------------------------------
          HEADER
      --------------------------------------------- */}

      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">

        <div className="flex items-center gap-3">

          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />

          <div>

            <h1 className="font-bold text-sm text-foreground">
              {currency === 'USD'
                ? 'Global Market Rates (Live)'
                : 'Pakistani Sarafa Rates (Live)'}
            </h1>

            <p className="text-[11px] text-muted-foreground mt-0.5">
              Updated:{' '}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : 'Fetching...'}
              {' | '}
              USD/PKR: Rs{' '}
              {rates.usdPkr
                ? rates.usdPkr.toFixed(2)
                : '---'}
            </p>

          </div>
        </div>

        <button
          onClick={fetchLiveRates}
          disabled={loading}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          title="Refresh Rates"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />
        </button>

      </div>

      {/* --------------------------------------------
          ERROR
      --------------------------------------------- */}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-600">

          <AlertCircle className="h-4 w-4 flex-shrink-0" />

          <span>{error}</span>

        </div>
      )}

      {/* --------------------------------------------
          GOLD / SILVER CHART
      --------------------------------------------- */}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        {/* Chart Header */}

        <div className="p-4 pb-2">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-muted-foreground">
                {selectedMetal === 'gold'
                  ? 'Gold'
                  : 'Silver'}{' '}
                Price
              </p>

              <p className="text-2xl font-extrabold text-foreground mt-1">
                {formatMoney(
                  currentChartPrice
                )}
              </p>

            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">

              <TrendingUp className="h-4 w-4" />

              Live

            </div>

          </div>

        </div>

        {/* Metal Buttons */}

        <div className="px-4 pt-2">

          <div className="flex gap-2">

            <button
              onClick={() =>
                setSelectedMetal(
                  'gold'
                )
              }
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedMetal === 'gold'
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Gold
            </button>

            <button
              onClick={() =>
                setSelectedMetal(
                  'silver'
                )
              }
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedMetal ===
                'silver'
                  ? 'bg-slate-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Silver
            </button>

          </div>

        </div>

        {/* Time Range */}

        <div className="px-4 pt-3">

          <div className="flex items-center gap-1 overflow-x-auto">

            {[
              '1D',
              '5D',
              '1M',
              '3M',
              '6M',
              '1Y',
            ].map((range) => (

              <button
                key={range}
                onClick={() =>
                  setSelectedRange(
                    range
                  )
                }
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                  selectedRange ===
                  range
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {range}
              </button>

            ))}

          </div>

        </div>

        {/* Chart */}

        <div className="h-[300px] w-full px-2 pt-4 pb-2">

          {chartLoading ? (

            <div className="h-full flex items-center justify-center">

              <RefreshCw className="h-6 w-6 animate-spin text-[#D4AF37]" />

            </div>

          ) : chartData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="goldGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#D4AF37"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#D4AF37"
                      stopOpacity={0.02}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 10,
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={['auto', 'auto']}
                  tick={{
                    fontSize: 10,
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  tickFormatter={(value) =>
                    currency === 'USD'
                      ? `$${value.toLocaleString()}`
                      : `Rs ${Math.round(
                          value
                        ).toLocaleString()}`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    currency === 'USD'
                      ? `$ ${Number(
                          value
                        ).toLocaleString(
                          'en-US',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : `Rs ${Math.round(
                          value
                        ).toLocaleString(
                          'en-PK'
                        )}`,
                    selectedMetal ===
                    'gold'
                      ? 'Gold'
                      : 'Silver',
                  ]}
                  contentStyle={{
                    borderRadius:
                      '12px',
                    border:
                      '1px solid rgba(0,0,0,0.1)',
                    background:
                      'var(--card)',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fill="url(#goldGradient)"
                  dot={{
                    r: 4,
                    fill: '#D4AF37',
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </AreaChart>

            </ResponsiveContainer>

          ) : (

            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Chart data unavailable
            </div>

          )}

        </div>

        {/* Chart Footer */}

        <div className="border-t border-border px-4 py-3 flex items-center justify-between">

          <div>

            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Current Price
            </p>

            <p className="text-sm font-bold">
              {currency === 'USD'
                ? `$ ${chartDisplayPrice.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`
                : `Rs ${Math.round(
                    chartDisplayPrice
                  ).toLocaleString(
                    'en-PK'
                  )}`}
            </p>

          </div>

          <div className="text-right">

            <p className="text-[10px] text-muted-foreground">
              Per Tola
            </p>

            <p className="text-xs font-semibold text-emerald-600">
              Live Market
            </p>

          </div>

        </div>

      </div>

      {/* --------------------------------------------
          GOLD CARD
      --------------------------------------------- */}

      <div className="rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-card to-card p-5 shadow-sm space-y-2">

        <div className="flex justify-between items-center">

          <span className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            Gold Rate (24K - 1 Tola)
          </span>

          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/30 text-[#B8860B]">
            24 KARAT
          </span>

        </div>

        <div className="flex items-baseline justify-between pt-1">

          <div>

            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatMoney(
                rates.goldTola
              )}
            </p>

            {rates.usdPkr > 0 &&
              rates.goldTola > 0 && (

                <p className="text-xs font-medium text-muted-foreground mt-1">
                  (~ $
                  {Math.round(
                    rates.goldTola /
                      rates.usdPkr
                  )}{' '}
                  USD per Tola)
                </p>

              )}

          </div>

          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">

            <TrendingUp className="h-4 w-4" />

            Live Market

          </span>

        </div>

      </div>

      {/* --------------------------------------------
          SILVER CARD
      --------------------------------------------- */}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">

        <div className="flex justify-between items-center">

          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Silver Rate (1 Tola)
          </span>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            SILVER
          </span>

        </div>

        <p className="text-2xl font-bold text-foreground">
          {formatMoney(
            rates.silverTola
          )}
        </p>

      </div>

      {/* --------------------------------------------
          PLATINUM + COPPER
      --------------------------------------------- */}

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">

          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platinum (1 Tola)
          </span>

          <p className="text-xl font-bold text-foreground">
            {formatMoney(
              rates.platinumTola
            )}
          </p>

        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">

          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Copper (1 Tola)
          </span>

          <p className="text-xl font-bold text-foreground">
            {formatMoney(
              rates.copperTola
            )}
          </p>

        </div>

      </div>

    </div>
  );
}