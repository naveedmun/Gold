import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RateCard from '@/components/RateCard';
import { useSettings } from '@/lib/SettingsContext';
import { formatPKR } from '@/lib/conversions';

export default function Home() {
  const { autoRefresh, favoriteMetal, setFavoriteMetal } = useSettings();
  const [data, setData] = useState({
    gold_per_tola_pkr: 425734,
    silver_per_tola_pkr: 6065,
    platinum_per_tola_pkr: 115000,
    gold_change_pct: 0.45,
    silver_change_pct: 1.20,
    platinum_change_pct: 0.80,
    usd_pkr: 278.70,
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // 1. Live USD to PKR rate
      const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const currencyJson = await currencyRes.json();
      const liveUsdPkr = currencyJson?.rates?.PKR || 278.70;

      // 2. Default fallback prices per ounce (USD)
      let goldOunceUSD = 2450;
      let silverOunceUSD = 30;
      let platinumOunceUSD = 980;
      
      try {
        // Fetch Gold
        const metalRes = await fetch('https://api.gold-api.com/price/XAU');
        const metalJson = await metalRes.json();
        if (metalJson && metalJson.price) {
          goldOunceUSD = metalJson.price;
        }

        // Fetch Silver
        const silverRes = await fetch('https://api.gold-api.com/price/XAG');
        const silverJson = await silverRes.json();
        if (silverJson && silverJson.price) {
          silverOunceUSD = silverJson.price;
        }

        // Fetch Platinum
        const platRes = await fetch('https://api.gold-api.com/price/XPT');
        const platJson = await platRes.json();
        if (platJson && platJson.price) {
          platinumOunceUSD = platJson.price;
        }
      } catch (err) {
        console.log("Using fallback metal prices due to network error", err);
      }

      // Calculations for Tola (1 Tola = 11.664 grams, 1 Ounce = 31.1035 grams)
      const calculatedGoldTola = Math.round((goldOunceUSD / 31.1035) * 11.664 * liveUsdPkr);
      const calculatedSilverTola = Math.round((silverOunceUSD / 31.1035) * 11.664 * liveUsdPkr);
      const calculatedPlatinumTola = Math.round((platinumOunceUSD / 31.1035) * 11.664 * liveUsdPkr);

      setData({
        gold_per_tola_pkr: calculatedGoldTola,
        silver_per_tola_pkr: calculatedSilverTola,
        platinum_per_tola_pkr: calculatedPlatinumTola,
        gold_change_pct: 0.45,
        silver_change_pct: 1.20,
        platinum_change_pct: 0.80,
        usd_pkr: liveUsdPkr,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching live rates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => fetchRates(true), autoRefresh * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchRates]);

  const toggleFavorite = (metal) => {
    setFavoriteMetal(favoriteMetal === metal ? 'gold' : metal);
  };

  const lastUpdated = data?.timestamp ? new Date(data.timestamp) : null;

  return (
    <div className="space-y-4">
      {/* Hero rates: Gold, Silver, Platinum */}
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
        <RateCard
          metal="platinum"
          pricePerTola={data?.platinum_per_tola_pkr}
          changePct={data?.platinum_change_pct}
          isFavorite={favoriteMetal === 'platinum'}
          onToggleFavorite={() => toggleFavorite('platinum')}
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
        onClick={() => fetchRates(true)}
        disabled={refreshing}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-3.5 text-white font-semibold shadow-lg shadow-[#D4AF37]/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh Rates'}
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
