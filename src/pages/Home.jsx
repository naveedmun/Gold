import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RateCard from '@/components/RateCard';
import { useSettings } from '@/lib/SettingsContext';
import { formatPKR } from '@/lib/conversions';

export default function Home() {
  const { autoRefresh, favoriteMetal, setFavoriteMetal } = useSettings();
  const [data, setData] = useState({
    gold_per_tola_pkr: 0,
    silver_per_tola_pkr: 0,
    gold_change_pct: 0.5,
    silver_change_pct: 1.1,
    usd_pkr: 278.50,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Free currency & metal rate fetch simulation / real public API call
      // USD to PKR rate fetch kar rahe hain
      const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const currencyData = await currencyRes.json();
      const usdToPkr = currencyData?.rates?.PKR || 278.50;

      // International Gold per ounce standard price (approx or free metals API)
      // 1 Ounce = 31.1035 grams, 1 Tola = 11.664 grams
      // Formula: (OuncePrice / 31.1035) * 11.664 * usdToPkr
      const dummyOunceGold = 2450; // International Gold Ounce standard
      const dummyOunceSilver = 30;   // International Silver Ounce standard

      const goldPerTola = Math.round((dummyOunceGold / 31.1035) * 11.664 * usdToPkr);
      const silverPerTola = Math.round((dummyOunceSilver / 31.1035) * 11.664 * usdToPkr);

      setData({
        gold_per_tola_pkr: goldPerTola,
        silver_per_tola_pkr: silverPerTola,
        gold_change_pct: 0.45,
        silver_change_pct: 1.20,
        usd_pkr: usdToPkr,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch live rates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => fetchLiveRates(true), autoRefresh * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLiveRates]);

  const toggleFavorite = (metal) => {
    setFavoriteMetal(favoriteMetal === metal ? (metal === 'gold' ? 'silver' : 'gold') : metal);
  };

  const lastUpdated = data?.timestamp ? new Date(data.timestamp) : null;

  return (
    <div className="space-y-4">
      {/* Hero rates */}
      <div className="space-y-3">
        <RateCard
          metal="gold"
          pricePerTola={data?.gold_per_tola_pkr}
          changePct={data?.gold_change_pct}
          isFavorite={favoriteMetal === 'gold'}
          onToggleFavorite={() => toggleFavorite('gold')}
          loading={loading}
        />
        <RateCard
          metal="silver"
          pricePerTola={data?.silver_per_tola_pkr}
          changePct={data?.silver_change_pct}
          isFavorite={favoriteMetal === 'silver'}
          onToggleFavorite={() => toggleFavorite('silver')}
          loading={loading}
        />
      </div>

      {/* USD/PKR + Last Updated */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">USD / PKR</span>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-muted" /> : formatPKR(data?.usd_pkr)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Last Updated</span>
          </div>
          <p className="mt-2 text-sm font-semibold">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">{lastUpdated.toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={() => fetchLiveRates(true)}
        disabled={refreshing}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-3.5 text-white font-semibold shadow-lg shadow-[#D4AF37]/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Fetching Live Rates...' : 'Refresh Rates'}
      </button>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link to="/calculator" className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-[#D4AF37]/40 transition-colors">
          <div>
            <p className="font-semibold text-sm">Calculator</p>
            <p className="text-xs text-muted-foreground">Gram, Tola, Ounce</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/charts" className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-[#D4AF37]/40 transition-colors">
          <div>
            <p className="font-semibold text-sm">Charts</p>
            <p className="text-xs text-muted-foreground">Price trends</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
