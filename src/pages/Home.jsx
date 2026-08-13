import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useOutletContext } from 'react-router-dom';

import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Coins,
  CircleDollarSign,
  Gem,
  Activity,
} from 'lucide-react';


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
      usdPkr: 0,
    });


  // --------------------------------------------------
  // CHANGES
  // --------------------------------------------------

  const [changes, setChanges] =
    useState({
      gold: {
        usd: 0,
        percent: 0,
      },

      silver: {
        usd: 0,
        percent: 0,
      },
    });


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
            maximumFractionDigits: 2,
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
      loading,
    ]
  );


  // --------------------------------------------------
  // FETCH LIVE RATES
  // --------------------------------------------------

  const fetchLiveRates =
    useCallback(
      async () => {

        setLoading(true);
        setError('');

        try {

          const response =
            await fetch(
              '/api/market-rates',
              {
                cache: 'no-store',
              }
            );


          const data =
            await response.json();


          if (
            !response.ok ||
            !data.success
          ) {

            throw new Error(
              data?.error ||
              'Live market rates unavailable'
            );

          }


          // ------------------------------------------
          // RATES
          // ------------------------------------------

          setRates({

            goldTola:
              Number(
                data?.calculatedPkr?.goldTola
              ) || 0,

            silverTola:
              Number(
                data?.calculatedPkr?.silverTola
              ) || 0,

            platinumTola:
              Number(
                data?.calculatedPkr?.platinumTola
              ) || 0,

            copperTola:
              Number(
                data?.calculatedPkr?.copperTola
              ) || 0,

            usdPkr:
              Number(
                data?.usdPkr
              ) || 0,

          });


          // ------------------------------------------
          // DAILY CHANGE
          // ------------------------------------------

          setChanges({

            gold: {
              usd:
                Number(
                  data?.changes?.gold?.usd
                ) || 0,

              percent:
                Number(
                  data?.changes?.gold?.percent
                ) || 0,
            },

            silver: {
              usd:
                Number(
                  data?.changes?.silver?.usd
                ) || 0,

              percent:
                Number(
                  data?.changes?.silver?.percent
                ) || 0,
            },

          });


          // ------------------------------------------
          // LAST UPDATED
          // ------------------------------------------

          setLastUpdated(
            data?.timestamp
              ? new Date(
                  data.timestamp
                )
              : new Date()
          );


        } catch (err) {

          console.error(
            'Failed to fetch live rates:',
            err
          );

          setError(
            'Live rate fetch karne mein masla aa raha hai. Please refresh karein.'
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  // --------------------------------------------------
  // INITIAL LOAD
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
    fetchLiveRates,
  ]);


  // --------------------------------------------------
  // CHANGE CALCULATION
  // --------------------------------------------------

  const getChangeData =
    (metal) => {

      const percent =
        Number(
          changes?.[metal]?.percent
        ) || 0;


      const usdChange =
        Number(
          changes?.[metal]?.usd
        ) || 0;


      const isPositive =
        percent > 0;


      const isNegative =
        percent < 0;


      const changePkr =
        rates.usdPkr > 0
          ? usdChange *
            rates.usdPkr *
            (
              11.6638125 /
              31.1034768
            )
          : 0;


      return {
        percent,
        usdChange,
        changePkr,
        isPositive,
        isNegative,
      };

    };


  // --------------------------------------------------
  // CHANGE COMPONENT
  // --------------------------------------------------

  const ChangeBadge =
    ({
      metal,
      showAmount = true,
    }) => {

      const change =
        getChangeData(
          metal
        );


      if (
        !change.percent &&
        !change.changePkr
      ) {

        return (

          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">

            <Activity
              className="h-3 w-3"
            />

            No change data

          </div>

        );

      }


      const positive =
        change.isPositive;


      const negative =
        change.isNegative;


      return (

        <div
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            positive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : negative
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-muted text-muted-foreground'
          }`}
        >

          {positive ? (

            <TrendingUp
              className="h-3.5 w-3.5"
            />

          ) : negative ? (

            <TrendingDown
              className="h-3.5 w-3.5"
            />

          ) : (

            <Activity
              className="h-3.5 w-3.5"
            />

          )}


          {showAmount &&
            change.changePkr !== 0 && (
              <span>
                {positive
                  ? '+'
                  : '-'}
                Rs{' '}
                {Math.abs(
                  Math.round(
                    change.changePkr
                  )
                ).toLocaleString(
                  'en-PK'
                )}
              </span>
            )}


          <span>
            ({positive
              ? '+'
              : ''}
            {change.percent.toFixed(
              2
            )}
            %)
          </span>

        </div>

      );

    };


  // --------------------------------------------------
  // METAL CARD
  // --------------------------------------------------

  const MetalCard =
    ({
      title,
      subtitle,
      amount,
      icon: Icon,
      iconClass,
      cardClass,
      metal,
      badge,
    }) => (

      <div
        className={`relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
      >

        {/* Decorative Circle */}

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-current opacity-[0.035]" />


        {/* Header */}

        <div className="relative flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
            >

              <Icon
                className="h-5 w-5"
              />

            </div>


            <div>

              <p className="text-sm font-bold text-foreground">

                {title}

              </p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">

                {subtitle}

              </p>

            </div>

          </div>


          {badge && (

            <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">

              {badge}

            </span>

          )}

        </div>


        {/* Price */}

        <div className="relative mt-5">

          <p className="text-3xl font-extrabold tracking-tight text-foreground">

            {formatMoney(
              amount
            )}

          </p>

          <p className="mt-1 text-[10px] font-medium text-muted-foreground">

            Per Tola

          </p>

        </div>


        {/* Change */}

        <div className="relative mt-4 flex items-center justify-between">

          <div>

            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">

              24H Change

            </p>

            <ChangeBadge
              metal={metal}
            />

          </div>


          <div className="text-right">

            <p className="text-[9px] font-medium text-muted-foreground">

              Market Status

            </p>

            <div className="mt-1 flex items-center justify-end gap-1.5">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">

                Live

              </span>

            </div>

          </div>

        </div>

      </div>

    );


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <div className="mx-auto max-w-xl space-y-4 pb-10">


      {/* ==========================================
          LIVE HEADER
      ========================================== */}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

              <span className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-500 opacity-40" />

              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />

            </div>


            <div>

              <h1 className="text-sm font-extrabold text-foreground">

                {currency === 'USD'
                  ? 'Global Market Rates'
                  : 'Pakistani Sarafa Rates'}

              </h1>


              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">

                Live market data • Updated{' '}

                {lastUpdated
                  ? lastUpdated.toLocaleTimeString()
                  : 'Fetching...'}

              </p>

            </div>

          </div>


          <button
            onClick={
              fetchLiveRates
            }
            disabled={
              loading
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 transition hover:bg-muted disabled:opacity-60"
            title="Refresh Rates"
          >

            <RefreshCw
              className={`h-4 w-4 text-foreground ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

          </button>

        </div>


        {/* USD PKR */}

        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">

          <span className="text-[10px] font-semibold text-muted-foreground">

            USD / PKR

          </span>


          <span className="text-xs font-extrabold text-foreground">

            {rates.usdPkr > 0
              ? `Rs ${rates.usdPkr.toFixed(2)}`
              : '---'}

          </span>

        </div>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">

          <AlertCircle
            className="h-4 w-4 flex-shrink-0"
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==========================================
          MARKET SUMMARY
      ========================================== */}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">

              Market Overview

            </p>

            <h2 className="mt-1 text-lg font-extrabold text-foreground">

              Precious Metals

            </h2>

          </div>


          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10">

            <Coins
              className="h-5 w-5 text-[#D4AF37]"
            />

          </div>

        </div>


        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">

          Live metal prices with 24-hour market movement.

        </p>

      </div>


      {/* ==========================================
          GOLD
      ========================================== */}

      <MetalCard

        title="Gold"

        subtitle="24K • 1 Tola"

        amount={
          rates.goldTola
        }

        icon={Coins}

        iconClass="bg-[#D4AF37]/15 text-[#B8860B]"

        cardClass="border-[#D4AF37]/40"

        metal="gold"

        badge="24 KARAT"

      />


      {/* ==========================================
          SILVER
      ========================================== */}

      <MetalCard

        title="Silver"

        subtitle="Pure Silver • 1 Tola"

        amount={
          rates.silverTola
        }

        icon={CircleDollarSign}

        iconClass="bg-slate-500/10 text-slate-500"

        cardClass="border-slate-300/60 dark:border-slate-700"

        metal="silver"

        badge="SILVER"

      />


      {/* ==========================================
          PLATINUM
      ========================================== */}

      <MetalCard

        title="Platinum"

        subtitle="1 Tola"

        amount={
          rates.platinumTola
        }

        icon={Gem}

        iconClass="bg-teal-500/10 text-teal-600 dark:text-teal-400"

        cardClass="border-teal-500/20"

        badge="PLATINUM"

        metal="gold"

      />


      {/* ==========================================
          COPPER
      ========================================== */}

      <MetalCard

        title="Copper"

        subtitle="1 Tola"

        amount={
          rates.copperTola
        }

        icon={Activity}

        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"

        cardClass="border-amber-500/20"

        badge="COPPER"

        metal="silver"

      />


      {/* ==========================================
          MARKET FOOTER
      ========================================== */}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">

              <Activity
                className="h-4 w-4 text-emerald-600"
              />

            </div>


            <div>

              <p className="text-xs font-bold text-foreground">

                Live Market

              </p>

              <p className="text-[10px] text-muted-foreground">

                Rates refresh automatically

              </p>

            </div>

          </div>


          <div className="text-right">

            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">

              Next Update

            </p>

            <p className="mt-0.5 text-[10px] font-bold text-foreground">

              Within 60 sec

            </p>

          </div>

        </div>

      </div>


    </div>

  );

}