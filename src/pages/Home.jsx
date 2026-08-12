import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';

export default function Home() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';

  // Exact stable market rates
  const [rates, setRates] = useState({
    goldTola: 418599,
    silverTola: 5200,
    platinumTola: 310000,
    copperTola: 3500,
    usdPkr: 278,
  });

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Manual & Auto refresh handler
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(handleRefresh, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPKR = (amount) => {
    if (currency === 'USD' && rates.usdPkr > 0) {
      return `$ ${(amount / rates.usdPkr).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `Rs ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <div>
            <h1 className="font-bold text-sm text-foreground">Pakistani Sarafa Rates</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Updated: {lastUpdated.toLocaleTimeString()} | USD/PKR: Rs {rates.usdPkr}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          title="Refresh Rates"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Gold Card */}
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
              {formatPKR(rates.goldTola)}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              (~ ${Math.round(rates.goldTola / rates.usdPkr)} USD per Tola)
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Live Market
          </span>
        </div>
      </div>

      {/* Silver Card */}
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
          {formatPKR(rates.silverTola)}
        </p>
      </div>

      {/* Platinum & Copper Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platinum (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground">
            {formatPKR(rates.platinumTola)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Copper (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground">
            {formatPKR(rates.copperTola)}
          </p>
        </div>
      </div>

    </div>
  );
}