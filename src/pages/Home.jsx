import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

export default function Home() {
  // Real Market Benchmark Rates (Based on International Gold $4,342 / oz)
  const [rates] = useState({
    goldTola: 454300,     // Rs 454,300 per Tola (Exact $4,342/oz equivalent)
    silverTola: 6940,     // Rs 6,940 per Tola
    platinumTola: 123000, // Rs 123,000 per Tola
    copperTola: 3750,     // Rs 3,750 per Tola
    usdPkr: 278.70,       // USD to PKR
  });

  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    // Check Market Status (0 = Sunday, 6 = Saturday)
    const day = new Date().getDay();
    setIsMarketOpen(day !== 0 && day !== 6);
  }, []);

  return (
    <div className="space-y-4 max-w-xl mx-auto p-2">
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
                {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED (WEEKEND)'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              Closing Price: $4,342 / oz
            </p>
          </div>
        </div>
      </div>

      {!isMarketOpen && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>International market closed at $4,342/oz. Rates fixed till Monday morning.</span>
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
          <p className="text-3xl font-extrabold text-foreground tracking-tight">
            Rs {formatPKR(rates.goldTola)}
          </p>
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
          Rs {formatPKR(rates.silverTola)}
        </p>
      </div>

      {/* 3. PLATINUM & 4. COPPER GRID */}
      <div className="grid grid-cols-2 gap-3">
        {/* PLATINUM */}
        <div className="rounded-2xl border border-[#008B8B]/30 bg-gradient-to-br from-[#008B8B]/10 to-card p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Platinum (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground mt-1">
            Rs {formatPKR(rates.platinumTola)}
          </p>
        </div>

        {/* COPPER */}
        <div className="rounded-2xl border border-[#D2691E]/30 bg-gradient-to-br from-[#D2691E]/10 to-card p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Copper (1 Tola)
          </span>
          <p className="text-xl font-bold text-foreground mt-1">
            Rs {formatPKR(rates.copperTola)}
          </p>
        </div>
      </div>
    </div>
  );
}