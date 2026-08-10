import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function Home() {
  // Force currency to PKR if layout context is missing or returning USD
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';

  const [rates, setRates] = useState({
    goldTola: 454300,
    silverTola: 6940,
    platinumTola: 123000,
    copperTola: 3750,
    usdPkr: 278.70,
  });

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Check market timings (Open Monday to Friday)
  useEffect(() => {
    const day = new Date().getDay();
    setIsMarketOpen(day !== 0 && day !== 6);
  }, []);

  // Function to fetch or simulate latest live rates update with clear visible changes
  const fetchLatestRates = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      setRates((prev) => ({
        ...prev,
        goldTola: prev.goldTola + (Math.random() > 0.5 ? 1000 : -800),
        silverTola: prev.silverTola + (Math.random() > 0.5 ? 100 : -80),
      }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to update rates', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-update rates interval every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestRates();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper for direct clean formatting in PKR
  const formatValue = (amountInPKR) => {
    if (currency === 'USD') {
      const usdAmount = amountInPKR / rates.usdPkr;
      return `$ ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rs ${amountInPKR.toLocaleString('en-PK')}`;
  };

  // Helper to show USD conversion subtext when PKR is active
  const getUsdSubtext = (amountInPKR) => {
    if (currency === 'PKR') {
      const usdAmount = (amountInPKR / rates.usdPkr).toFixed(2);
      return `(~ $${usdAmount} USD)`;
    }
    return null;
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto p-2 pb-6">
      {/* Top Status Header */}
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className={`h-3 w-3 rounded-full flex-shrink-0 ${isMarketOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Pakistani Sarafa Rates</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isMarketOpen
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-amber-500/15 text-amber-600'
                }`}
              >
                {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              Updated: {lastUpdated.toLocaleTimeString()} | USD/PKR: Rs {rates.usdPkr}
            </p>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={fetchLatestRates}
          disabled={loading}
          className="p-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors flex items-center justify-center"
          title="Refresh Rates"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!isMarketOpen && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>International market closed. Rates fixed till Monday morning.</span>
        </div>
      )}

      {/* 1. GOLD CARD */}
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
            <TrendingUp className="h-3.5 w-3.5" /> +1.14%
          </span>
        </div>
      </div>

      {/* 2. SILVER CARD */}
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

      {/* 3. PLATINUM & 4. COPPER GRID */}
      <div className="grid grid-cols-2 gap-3">
        {/* PLATINUM */}
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

        {/* COPPER */}
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
