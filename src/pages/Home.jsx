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
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function Home() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';

  // --------------------------------------------------
  // RATES
  // --------------------------------------------------

  const [rates, setRates] = useState({
    goldTola: 0,
    silverTola: 0,
    platinumTola: 0,
    copperTola: 0,
    usdPkr: 0,
  });

  // --------------------------------------------------
  // CHANGES
  // --------------------------------------------------

  const [changes, setChanges] = useState({
    gold: { usd: 0, percent: 0 },
    silver: { usd: 0, percent: 0 },
    platinum: { usd: 0, percent: 0 },
    copper: { usd: 0, percent: 0 },
  });

  // --------------------------------------------------
  // GENERAL STATE
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const formatMoney = useCallback(
    (amount) => {
      if (!amount || amount <= 0) {
        return loading ? 'Loading...' : 'Unavailable';
      }

      if (currency === 'USD' && rates.usdPkr > 0) {
        return `$ ${(amount / rates.usdPkr).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
    },
    [currency, rates.usdPkr, loading]
  );

  // --------------------------------------------------
  // FETCH LIVE RATES
  // --------------------------------------------------

  const fetchLiveRates = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/market-rates', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error || 'Live market rates unavailable'
        );
      }

      setRates({
        goldTola: Number(data?.calculatedPkr?.goldTola) || 0,
        silverTola: Number(data?.calculatedPkr?.silverTola) || 0,
        platinumTola: Number(data?.calculatedPkr?.platinumTola) || 0,
        copperTola: Number(data?.calculatedPkr?.copperTola) || 0,
        usdPkr: Number(data?.usdPkr) || 0,
      });

      setChanges({
        gold: {
          usd: Number(data?.changes?.gold?.amount) || 0,
          percent: Number(data?.changes?.gold?.percent) || 0,
        },
        silver: {
          usd: Number(data?.changes?.silver?.amount) || 0,
          percent: Number(data?.changes?.silver?.percent) || 0,
        },
        platinum: {
          usd: Number(data?.changes?.platinum?.amount) || 0,
          percent: Number(data?.changes?.platinum?.percent) || 0,
        },
        copper: {
          usd: Number(data?.changes?.copper?.amount) || 0,
          percent: Number(data?.changes?.copper?.percent) || 0,
        },
      });

      setLastUpdated(
        data?.timestamp ? new Date(data.timestamp) : new Date()
      );
    } catch (err) {
      console.error('Failed to fetch live rates:', err);
      setError('Live rate fetch karne mein masla aa raha hai. Please refresh karein.');
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveRates]);

  // --------------------------------------------------
  // CHANGE CALCULATION
  // --------------------------------------------------

  const getChangeData = (metal) => {
    const percent = Number(changes?.[metal]?.percent) || 0;
    const usdChange = Number(changes?.[metal]?.usd) || 0;
    const isPositive = percent > 0;
    const isNegative = percent < 0;

    // Direct PKR change coming from backend API calculation
    const changePkr = usdChange || 0;

    return {
      percent,
      usdChange,
      changePkr,
      isPositive,
      isNegative,
    };
  };

  // --------------------------------------------------
  // CHANGE BADGE COMPONENT
  // --------------------------------------------------

  const ChangeBadge = ({ metal, showAmount = true }) => {
    const change = getChangeData(metal);

    if (!change.percent && !change.changePkr) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
          <Activity className="h-3 w-3" />
          No change data
        </div>
      );
    }

    const positive = change.isPositive;
    const negative = change.isNegative;

    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide shadow-sm transition-all ${
          positive
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            : negative
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {positive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : negative ? (
          <TrendingDown className="h-3.5 w-3.5" />
        ) : (
          <Activity className="h-3.5 w-3.5" />
        )}

        {showAmount && change.changePkr !== 0 && (
          <span>
            {positive ? '+' : '-'} Rs{' '}
            {Math.abs(Math.round(change.changePkr)).toLocaleString('en-PK')}
          </span>
        )}

        <span>
          ({positive ? '+' : ''}
          {change.percent.toFixed(2)}%)
        </span>
      </div>
    );
  };

  // --------------------------------------------------
  // METAL CARD COMPONENT
  // --------------------------------------------------

  const MetalCard = ({
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
      className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card/90 to-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardClass}`}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-2xl transition-all group-hover:scale-125" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${iconClass}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {subtitle}
            </p>
          </div>
        </div>

        {badge && (
          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {formatMoney(amount)}
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Current Rate • Per Tola
        </p>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-border/50 pt-4">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            24H Movement
          </p>
          <ChangeBadge metal={metal} />
        </div>

        <div className="text-right">
          <p className="text-[10px] font-medium text-muted-foreground">
            Market Status
          </p>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Live Feed
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
    <div className="mx-auto max-w-xl space-y-5 px-3 sm:px-0 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-card via-card/90 to-amber-500/5 p-5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30">
              <span className="absolute h-4 w-4 animate-ping rounded-full bg-emerald-500 opacity-40" />
              <ShieldCheck className="relative h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-foreground">
                  {currency === 'USD'
                    ? 'Global Bullion Exchange'
                    : 'Pakistani Sarafa Market'}
                </h1>
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                Secured Live Stream • Synced{' '}
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Connecting...'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchLiveRates}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/80 border border-border/60 transition-all hover:bg-secondary hover:scale-105 active:scale-95 disabled:opacity-60 shadow-sm"
            title="Refresh Rates"
          >
            <RefreshCw
              className={`h-4 w-4 text-foreground ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/40 border border-border/40 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Interbank USD / PKR
            </span>
          </div>
          <span className="text-xs font-black tracking-wide text-foreground">
            {rates.usdPkr > 0 ? `Rs ${rates.usdPkr.toFixed(2)}` : '---'}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 shadow-md">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="px-1 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
              Verified Real-Time Data
            </p>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Precious Metals Ticker
            </h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Coins className="h-5 w-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* GOLD */}
      <MetalCard
        title="Gold"
        subtitle="24K Pure Gold • 1 Tola"
        amount={rates.goldTola}
        icon={Coins}
        iconClass="bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
        cardClass="border-amber-500/40 shadow-amber-500/5"
        metal="gold"
        badge="24 KARAT"
      />

      {/* SILVER */}
      <MetalCard
        title="Silver"
        subtitle="Pure Bullion Silver • 1 Tola"
        amount={rates.silverTola}
        icon={CircleDollarSign}
        iconClass="bg-gradient-to-br from-slate-400/20 to-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-400/30"
        cardClass="border-slate-300/60 dark:border-slate-700/60"
        metal="silver"
        badge="SILVER"
      />

      {/* PLATINUM */}
      <MetalCard
        title="Platinum"
        subtitle="Precious Metal • 1 Tola"
        amount={rates.platinumTola}
        icon={Gem}
        iconClass="bg-gradient-to-br from-teal-500/20 to-cyan-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30"
        cardClass="border-teal-500/30"
        metal="platinum"
        badge="PLATINUM"
      />

      {/* COPPER */}
      <MetalCard
        title="Copper"
        subtitle="Industrial Metal • 1 Tola"
        amount={rates.copperTola}
        icon={Activity}
        iconClass="bg-gradient-to-br from-orange-500/20 to-amber-600/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
        cardClass="border-orange-500/30"
        metal="copper"
        badge="COPPER"
      />

      <div className="rounded-3xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Automated Sync Active
              </p>
              <p className="text-[10px] text-muted-foreground">
                Market rates update automatically every minute.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Refresh Interval
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              60 Seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}