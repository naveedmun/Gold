import { fetchLiveMarketRates } from '@/lib/conversions';
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { LATEST_RATES } from '@/lib/conversions';

export default function Home() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';

  // Use fixed/static latest rates as requested (Fixed at 418,599 PKR per tola)
  const [rates, setRates] = useState({
    goldTola: LATEST_RATES.gold,
    silverTola: LATEST_RATES.silver,
    platinumTola: LATEST_RATES.platinum,
    copperTola: LATEST_RATES.copper,
    usdPkr: LATEST_RATES.usdPkr,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  // Market status
  useEffect(() => {
    const checkMarket = () => {
      const now = new Date();
      const day = now.getDay();
      setIsMarketOpen(day !== 0 && day !== 6);
    };
    checkMarket();
    const marketTimer = setInterval(checkMarket, 60 * 1000);
    return () => clearInterval(marketTimer);
  }, []);

  // Fetch rates (Using static/fixed rates fallback)
  const fetchLatestRates = useCallback(async () => {
    setLoading(true);
    setError('');
    
    // Simulate a brief smooth refresh action
    setTimeout(() => {
      setRates({
        goldTola: LATEST_RATES.gold,
        silverTola: LATEST_RATES.silver,
        platinumTola: LATEST_RATES.platinum,
        copperTola: LATEST_RATES.copper,
        usdPkr: LATEST_RATES.usdPkr,
      });
      setLastUpdated(new Date());
      setLoading(false);
    }, 400);
  }, []);

  // Format PKR / USD
  const formatValue = (amountInPKR) => {
    const amount = Number(amountInPKR);

    if (!Number.isFinite(amount) || amount <= 0) {
      return loading ? 'Loading...' : 'Unavailable';
    }

    if (currency === 'USD' && rates.usdPkr > 0) {
      const usdAmount = amount / rates.usdPkr;
      return `$ ${usdAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `Rs ${amount.toLocaleString('en-PK', {
      maximumFractionDigits: 0,
    })}`;
  };

  // USD subtext
  const getUsdSubtext = (amountInPKR) => {
    const amount = Number(amountInPKR);

    if (!Number.isFinite(amount) || amount <= 0 || rates.usdPkr <= 0) {
      return null;
    }

    if (currency === 'PKR') {
      const usdAmount = amount / rates.usdPkr;
      return `(~ $${usdAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD)`;
    }

    return null;
  };

  const formattedUpdatedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString()
    : 'Fixed Rates Active';

  return (
    <div className="space-y-4">

      {/* TOP STATUS HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-3 w-3 rounded-full flex-shrink-0 bg-emerald-500 animate-pulse" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">
                Pakistani Sarafa Rates
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                FIXED RATES ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Updated: {formattedUpdatedTime}
              {rates.usdPkr > 0 &&
                ` | USD/PKR: Rs ${rates.usdPkr.toLocaleString('en-PK', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
            </p>
          </div>
        </div>

        {/* Manual Refresh */}
        <button
          onClick={fetchLatestRates}
          disabled={loading}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors flex items-center justify-center flex-shrink-0"
          title="Refresh Rates"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              loading ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {/* GOLD */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/15 via-card to-card p-5 space-y-2 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">
            Gold Rate (24K - 1 Tola)
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B8860B]">
            24 KARAT
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatValue(rates.goldTola)}
            </p>
            {getUsdSubtext(rates.goldTola) && (
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                {getUsdSubtext(rates.goldTola)}
              </p>
            )}
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Stable Spot
          </span>
        </div>
      </div>

      {/* SILVER */}
      <div className="rounded-2xl border border-[#C0C0C0]/40 bg-gradient-to-br from-[#C0C0C0]/10 via-card to-card p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Silver Rate (1 Tola)
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            SILVER
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">
          {formatValue(rates.silverTola)}
        </p>
        {getUsdSubtext(rates.silverTola) && (
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {getUsdSubtext(rates.silverTola)}
          </p>
        )}
      </div>

      {/* PLATINUM + COPPER */}
      <div className="grid grid-cols-2 gap-3">
        {/* Platinum */}
        <div className="rounded-2xl border border-[#008B8B]/30 bg-gradient-to-br from-[#008B8B]/10 to-card p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platinum (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground mt-1">
            {formatValue(rates.platinumTola)}
          </p>
          {getUsdSubtext(rates.platinumTola) && (
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              {getUsdSubtext(rates.platinumTola)}
            </p>
          )}
        </div>

        {/* Copper */}
        <div className="rounded-2xl border border-[#D2691E]/30 bg-gradient-to-br from-[#D2691E]/10 to-card p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Copper (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground mt-1">
            {formatValue(rates.copperTola)}
          </p>
          {getUsdSubtext(rates.copperTola) && (
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              {getUsdSubtext(rates.copperTola)}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}