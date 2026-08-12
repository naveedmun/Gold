import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Constants for Tola conversion
  // 1 Tola = 11.6638125 grams
  // 1 Troy Ounce = 31.1034768 grams
  const TOLA_IN_TROY_OUNCE = 11.6638125 / 31.1034768;

  const fetchLiveRates = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch live USD/PKR rate
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

      const usdPkr = Number(pkrData?.rates?.PKR);

      if (!usdPkr || usdPkr <= 0) {
        throw new Error('USD/PKR rate unavailable');
      }

      // 2. Fetch live Gold price
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
      const goldUsdOz = Number(goldData?.price);

      if (!goldUsdOz || goldUsdOz <= 0) {
        throw new Error('Gold price unavailable');
      }

      // 3. Fetch live Silver price
      const silverRes = await fetch(
        'https://api.gold-api.com/price/XAG',
        {
          cache: 'no-store',
        }
      );

      if (!silverRes.ok) {
        throw new Error('Silver API failed');
      }

      const silverData = await silverRes.json();
      const silverUsdOz = Number(silverData?.price);

      if (!silverUsdOz || silverUsdOz <= 0) {
        throw new Error('Silver price unavailable');
      }

      // 4. Convert Troy Ounce → Tola → PKR
      const goldTolaPkr =
        goldUsdOz *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      const silverTolaPkr =
        silverUsdOz *
        TOLA_IN_TROY_OUNCE *
        usdPkr;

      // Estimated values for Platinum and Copper
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
        usdPkr: usdPkr,
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch live rates:', err);

      setError(
        'Live rate fetch karne mein masla aa raha hai. Internet connection check karein.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on page load and every 60 seconds
  useEffect(() => {
    fetchLiveRates();

    const interval = setInterval(() => {
      fetchLiveRates();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchLiveRates]);

  // Format PKR / USD
  const formatPKR = (amount) => {
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

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">

      {/* Top Header */}
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

        {/* Refresh Button */}
        <button
          onClick={fetchLiveRates}
          disabled={loading}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          title="Refresh Rates"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              loading ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

      {/* Platinum & Copper */}
      <div className="grid grid-cols-2 gap-3">

        {/* Platinum */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1">

          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platinum (1 Tola)
          </span>

          <p className="text-xl font-bold text-foreground">
            {formatPKR(rates.platinumTola)}
          </p>

        </div>

        {/* Copper */}
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