import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

import { useOutletContext } from 'react-router-dom';

import {
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';


const TOLA_IN_TROY_OUNCE =
  11.6638125 / 31.1034768;


// --------------------------------------------------
// RANGE DAYS
// --------------------------------------------------

const RANGE_DAYS = {
  '5D': 5,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365
};


// --------------------------------------------------
// DATE HELPERS
// --------------------------------------------------

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getStartDate(days) {
  const date = new Date();

  date.setDate(
    date.getDate() - days
  );

  return formatDate(date);
}

function formatChartDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric'
    }
  );
}


// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function Home() {

  const context =
    useOutletContext() || {};

  const currency =
    context.currency || 'PKR';


  // --------------------------------------------------
  // RATES
  // --------------------------------------------------

  const [rates, setRates] =
    useState({
      goldTola: 0,
      silverTola: 0,
      platinumTola: 0,
      copperTola: 0,
      usdPkr: 0
    });


  // --------------------------------------------------
  // CHART STATE
  // --------------------------------------------------

  const [selectedMetal, setSelectedMetal] =
    useState('gold');

  const [selectedRange, setSelectedRange] =
    useState('1D');

  const [chartData, setChartData] =
    useState([]);

  const [liveHistory, setLiveHistory] =
    useState([]);

  const [chartLoading, setChartLoading] =
    useState(true);


  // --------------------------------------------------
  // GENERAL STATE
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const formatMoney = useCallback(
    (amount) => {

      if (
        !amount ||
        amount <= 0
      ) {
        return loading
          ? 'Loading...'
          : 'Unavailable';
      }

      if (
        currency === 'USD' &&
        rates.usdPkr > 0
      ) {
        return `$ ${(
          amount /
          rates.usdPkr
        ).toLocaleString(
          'en-US',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }
        )}`;
      }

      return `Rs ${Math.round(
        amount
      ).toLocaleString(
        'en-PK'
      )}`;
    },
    [
      currency,
      rates.usdPkr,
      loading
    ]
  );


  // --------------------------------------------------
  // FETCH LIVE RATES
  // --------------------------------------------------

  const fetchLiveRates =
    useCallback(async () => {

      setLoading(true);
      setError('');

      try {

        // USD / PKR
        const pkrResponse =
          await fetch(
            'https://open.er-api.com/v6/latest/USD',
            {
              cache: 'no-store'
            }
          );

        if (!pkrResponse.ok) {
          throw new Error(
            'USD/PKR API failed'
          );
        }

        const pkrData =
          await pkrResponse.json();

        const usdPkr =
          Number(
            pkrData?.rates?.PKR
          );

        if (
          !usdPkr ||
          usdPkr <= 0
        ) {
          throw new Error(
            'USD/PKR unavailable'
          );
        }


        // Metals.Dev
        const response =
          await fetch(
            '/api/market-rates',
            {
              cache: 'no-store'
            }
          );

        if (!response.ok) {
          throw new Error(
            'Metals API failed'
          );
        }

        const result =
          await response.json();

        if (
          !result.success
        ) {
          throw new Error(
            result.error ||
            'Metals API unavailable'
          );
        }

        const metals =
          result.data?.metals || {};


        const goldUsdOz =
          Number(
            metals.gold
          );

        const silverUsdOz =
          Number(
            metals.silver
          );

        const platinumUsdOz =
          Number(
            metals.platinum
          );

        const copperUsdMt =
          Number(
            metals.copper
          );


        if (
          !goldUsdOz ||
          !silverUsdOz
        ) {
          throw new Error(
            'Gold/Silver data unavailable'
          );
        }


        // ------------------------------------------------
        // TO TOLA / PKR
        // ------------------------------------------------

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


        // Copper from Metals.Dev is metric tonne.
        // Convert tonne → gram → tola.
        const copperPerGramUsd =
          copperUsdMt /
          1000000;

        const copperTolaPkr =
          copperPerGramUsd *
          11.6638125 *
          usdPkr;


        setRates({
          goldTola:
            goldTolaPkr,

          silverTola:
            silverTolaPkr,

          platinumTola:
            platinumTolaPkr,

          copperTola:
            copperTolaPkr,

          usdPkr
        });


        setLastUpdated(
          new Date()
        );


        // ------------------------------------------------
        // ADD LIVE CHART POINT
        // ------------------------------------------------

        const now =
          new Date();

        const livePoint = {
          timestamp:
            now.getTime(),

          time:
            now.toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit'
              }
            ),

          gold:
            currency === 'USD'
              ? goldUsdOz *
                TOLA_IN_TROY_OUNCE
              : goldTolaPkr,

          silver:
            currency === 'USD'
              ? silverUsdOz *
                TOLA_IN_TROY_OUNCE
              : silverTolaPkr
        };


        setLiveHistory(
          previous => {

            const updated = [
              ...previous,
              livePoint
            ];

            // Keep maximum 100 points
            return updated.slice(
              -100
            );
          }
        );

      } catch (err) {

        console.error(
          'Live rate error:',
          err
        );

        setError(
          'Live rate fetch karne mein masla aa raha hai. Please refresh karein.'
        );

      } finally {

        setLoading(false);

      }

    }, [
      currency
    ]);


  // --------------------------------------------------
  // INITIAL LIVE LOAD
  // --------------------------------------------------

  useEffect(() => {

    fetchLiveRates();

    const interval =
      setInterval(
        fetchLiveRates,
        60 * 1000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [
    fetchLiveRates
  ]);


  // --------------------------------------------------
  // FETCH HISTORICAL DATA
  // --------------------------------------------------

  const fetchHistoricalData =
    useCallback(async () => {

      if (
        selectedRange === '1D'
      ) {

        setChartData(
          liveHistory.map(
            item => ({
              time:
                item.time,

              price:
                selectedMetal === 'gold'
                  ? item.gold
                  : item.silver
            })
          )
        );

        setChartLoading(false);

        return;
      }


      setChartLoading(true);


      try {

        const days =
          RANGE_DAYS[
            selectedRange
          ];


        const startDate =
          getStartDate(days);

        const endDate =
          formatDate(
            new Date()
          );


        const response =
          await fetch(
            `/api/market-rates?metal=${selectedMetal}&start_date=${startDate}&end_date=${endDate}`,
            {
              cache: 'no-store'
            }
          );


        if (!response.ok) {
          throw new Error(
            'Historical API failed'
          );
        }


        const result =
          await response.json();


        if (
          !result.success
        ) {
          throw new Error(
            result.error ||
            'Historical data unavailable'
          );
        }


        const ratesData =
          result.data?.rates || {};


        const points =
          Object.entries(
            ratesData
          )
          .map(
            ([date, item]) => {

              const usdPrice =
                Number(
                  item?.metals?.[
                    selectedMetal
                  ]
                );


              if (
                !usdPrice ||
                usdPrice <= 0
              ) {
                return null;
              }


              const price =
                currency === 'USD'
                  ? usdPrice *
                    TOLA_IN_TROY_OUNCE
                  : usdPrice *
                    TOLA_IN_TROY_OUNCE *
                    rates.usdPkr;


              return {
                time:
                  formatChartDate(
                    date
                  ),

                date,

                price
              };

            }
          )
          .filter(Boolean);


        setChartData(
          points
        );

      } catch (err) {

        console.error(
          'Historical chart error:',
          err
        );

        setChartData([]);

      } finally {

        setChartLoading(false);

      }

    }, [
      selectedRange,
      selectedMetal,
      currency,
      rates.usdPkr,
      liveHistory
    ]);


  // --------------------------------------------------
  // RUN CHART FETCH
  // --------------------------------------------------

  useEffect(() => {

    if (
      selectedRange === '1D'
    ) {

      setChartData(
        liveHistory.map(
          item => ({
            time:
              item.time,

            price:
              selectedMetal === 'gold'
                ? item.gold
                : item.silver
          })
        )
      );

      setChartLoading(false);

      return;
    }


    if (
      rates.usdPkr > 0
    ) {
      fetchHistoricalData();
    }

  }, [
    selectedRange,
    selectedMetal,
    currency,
    rates.usdPkr,
    liveHistory,
    fetchHistoricalData
  ]);


  // --------------------------------------------------
  // CURRENT PRICE
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
  // CHART COLOR
  // --------------------------------------------------

  const chartColor =
    selectedMetal === 'gold'
      ? '#D4AF37'
      : '#94A3B8';


  const gradientId =
    selectedMetal === 'gold'
      ? 'goldChartGradient'
      : 'silverChartGradient';


  // --------------------------------------------------
  // CHART TITLE
  // --------------------------------------------------

  const chartTitle =
    currency === 'USD'
      ? 'Global Market Price'
      : 'Pakistani Sarafa Rate';


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <div className="space-y-4 max-w-xl mx-auto pb-10">

      {/* ================================================
          HEADER
      ================================================= */}

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


      {/* ================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-600">

          <AlertCircle className="h-4 w-4 flex-shrink-0" />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ================================================
          MAIN CHART
      ================================================= */}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">


        {/* Chart Header */}

        <div className="p-4 pb-2">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-muted-foreground">

                {selectedMetal === 'gold'
                  ? 'Gold'
                  : 'Silver'}

                {' '}

                {chartTitle}

              </p>

              <p className="text-2xl font-extrabold text-foreground mt-1">

                {formatMoney(
                  currentChartPrice
                )}

              </p>

              <p className="text-[10px] text-muted-foreground mt-1">

                Per Tola

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
                setSelectedMetal('gold')
              }
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedMetal === 'gold'
                  ? 'bg-[#D4AF37] text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Gold
            </button>


            <button
              onClick={() =>
                setSelectedMetal('silver')
              }
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedMetal === 'silver'
                  ? 'bg-slate-500 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Silver
            </button>

          </div>

        </div>


        {/* Range Buttons */}

        <div className="px-4 pt-3">

          <div className="flex items-center gap-1 overflow-x-auto">

            {[
              '1D',
              '5D',
              '1M',
              '3M',
              '6M',
              '1Y'
            ].map(
              range => (

                <button
                  key={range}
                  onClick={() =>
                    setSelectedRange(
                      range
                    )
                  }
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                    selectedRange === range
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >

                  {range}

                </button>

              )
            )}

          </div>

        </div>


        {/* ================================================
            GRAPH
        ================================================= */}

        <div className="h-[310px] w-full px-2 pt-4 pb-2">

          {chartLoading ? (

            <div className="h-full flex flex-col items-center justify-center gap-2">

              <RefreshCw
                className="h-6 w-6 animate-spin"
                style={{
                  color: chartColor
                }}
              />

              <span className="text-xs text-muted-foreground">
                Loading market history...
              </span>

            </div>

          ) : chartData.length >= 2 ? (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 12,
                  left: 5,
                  bottom: 5
                }}
              >

                <defs>

                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor={chartColor}
                      stopOpacity={0.32}
                    />

                    <stop
                      offset="100%"
                      stopColor={chartColor}
                      stopOpacity={0.02}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  opacity={0.45}
                />


                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 10
                  }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={25}
                />


                <YAxis
                  domain={[
                    'dataMin',
                    'dataMax'
                  ]}
                  tick={{
                    fontSize: 10
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={62}
                  tickFormatter={
                    value =>
                      currency === 'USD'
                        ? `$${Math.round(
                            value
                          ).toLocaleString()}`
                        : `Rs ${Math.round(
                            value / 1000
                          )}k`
                  }
                />


                <Tooltip
                  cursor={{
                    stroke: chartColor,
                    strokeDasharray: '4 4'
                  }}
                  formatter={
                    value => [

                      currency === 'USD'
                        ? `$ ${Number(
                            value
                          ).toLocaleString(
                            'en-US',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }
                          )}
                        `
                        : `Rs ${Math.round(
                            value
                          ).toLocaleString(
                            'en-PK'
                          )}`,

                      selectedMetal === 'gold'
                        ? 'Gold'
                        : 'Silver'

                    ]
                  }
                  contentStyle={{
                    borderRadius:
                      '12px',

                    border:
                      `1px solid ${chartColor}`,

                    background:
                      'var(--card)',

                    boxShadow:
                      '0 8px 25px rgba(0,0,0,0.12)',

                    fontSize:
                      '12px'
                  }}
                />


                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={3}
                  fill={`url(#${gradientId})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2
                  }}
                  animationDuration={700}
                />

              </AreaChart>

            </ResponsiveContainer>

          ) : chartData.length === 1 ? (

            <div className="h-full flex flex-col items-center justify-center">

              <div
                className="h-3 w-3 rounded-full mb-3"
                style={{
                  backgroundColor:
                    chartColor,
                  boxShadow:
                    `0 0 0 6px ${chartColor}20`
                }}
              />

              <p className="text-xs font-medium text-foreground">
                Live price received
              </p>

              <p className="text-[10px] text-muted-foreground mt-1 text-center px-6">
                More live points will appear on the 1D chart automatically.
              </p>

            </div>

          ) : (

            <div className="h-full flex items-center justify-center">

              <p className="text-xs text-muted-foreground">
                Historical chart data unavailable
              </p>

            </div>

          )}

        </div>


        {/* ================================================
            CHART FOOTER
        ================================================= */}

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
                      maximumFractionDigits: 2
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


      {/* ================================================
          GOLD CARD
      ================================================= */}

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


      {/* ================================================
          SILVER CARD
      ================================================= */}

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


      {/* ================================================
          PLATINUM + COPPER
      ================================================= */}

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