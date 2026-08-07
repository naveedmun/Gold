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
    copper_per_tola_pkr: 3500,
    gold_change_pct: 0.45,
    silver_change_pct: 1.20,
    platinum_change_pct: 0.80,
    copper_change_pct: -0.50,
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
      let copperOunceUSD = 4.20; // USD per Ounce equivalent
      
      try {
        // Fetch Gold, Silver, Platinum & Copper concurrently
        const [metalRes, silverRes, platRes, copperRes] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU'),
          fetch('https://api.gold-api.com/price/XAG'),
          fetch('https://api.gold-api.com/price/XPT'),
          fetch('https://api.gold-api.com/price/XCU')
        ]);

        const metalJson = await metalRes.json();
        const silverJson = await silverRes.json();
        const platJson = await platRes.json();
        const copperJson = await copperRes.json();

        if (metalJson?.price) goldOunceUSD = metalJson.price;
        if (silverJson?.price) silverOunceUSD = silverJson.price;
        if (platJson?.price) platinumOunceUSD = platJson.price;
        if (copperJson?.price) copperOunceUSD = copperJson.price;
      } catch (err) {
        console.log("Using fallback metal prices due to network error", err);
      }

      // Calculations for Tola (1 Tola = 11.664 grams, 1 Ounce = 31.1035 grams)
      const tolaMultiplier = (11.664 / 31.1035) * liveUsdPkr;

      const calculatedGoldTola = Math.round(goldOunceUSD * tolaMultiplier);
      const calculatedSilverTola = Math.round(silverOunceUSD * tolaMultiplier);
      const calculatedPlatinumTola = Math.round(platinumOunceUSD * tolaMultiplier);
      const calculatedCopperTola = Math.round(copperOunceUSD * tolaMultiplier);

      setData({
        gold_per_tola_pkr: calculatedGoldTola,
        silver_per_tola_pkr: calculatedSilverTola,
        platinum_per_tola_pkr: calculatedPlatinumTola,
        copper_per_tola_pkr: calculatedCopperTola,
        gold_change_pct: 0.45,
        silver_change_pct: 1.20,
        platinum_change_pct: 0.80,
        copper_change_pct: -0.50,
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
      {/* Hero rates: Gold, Silver, Platinum, Copper */}
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
        <RateCard
          metal="copper"
          pricePerTola={data?.copper_per_tola_pkr}
          changePct={data?.copper_change_pct}
          isFavorite={favoriteMetal === 'copper'}
          onToggleFavorite={() => toggleFavorite('copper')}
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
