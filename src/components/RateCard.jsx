import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

export default function RateCard({
  metal = 'gold',
  pricePerTola,
  changePct,
  isFavorite,
  onToggleFavorite,
  loading
}) {
  const isGold = metal === 'gold';
  const gradient = isGold
    ? 'from-[#D4AF37]/10 to-[#B8860B]/5 dark:from-[#D4AF37]/15 dark:to-[#B8860B]/5'
    : 'from-[#C0C0C0]/10 to-[#A0A0A0]/5 dark:from-[#C0C0C0]/15 dark:to-[#808080]/5';

  const accent = isGold ? 'text-[#D4AF37]' : 'text-[#C0C0C0]';
  const iconBg = isGold
    ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B]'
    : 'bg-gradient-to-br from-[#C0C0C0] to-[#808080]';
  const isPositive = changePct >= 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${gradient} p-5`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shadow-md`}>
            {isGold ? (
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9 8L2 9L7 14L5.5 21L12 17.5L18.5 21L17 14L22 9L15 8L12 2Z"/></svg>
            ) : (
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>
            )}
          </div>
          <div>
            <p className="font-heading font-semibold text-base">{isGold ? 'Gold' : 'Silver'}</p>
            <p className="text-xs text-muted-foreground">per Tola</p>
          </div>
        </div>
        <button onClick={onToggleFavorite} className="p-1.5 rounded-lg hover:bg-background/50 transition-colors">
          <Star className={`h-5 w-5 ${isFavorite ? accent + ' fill-current' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">
            <span className="text-muted-foreground text-lg">Rs </span>
            {formatPKR(pricePerTola)}
          </p>
        )}
      </div>

      {changePct != null && !loading && (
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{changePct.toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      )}
    </div>
  );
}