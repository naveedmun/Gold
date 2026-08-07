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
    platinum_per_tola_pkr: 310000,
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
      // 1. Fetch USD to PKR Rate
      const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const currencyJson = await currencyRes.json();
      const liveUsdPkr = currencyJson?.rates?.PKR || 278.70;

      // Default/Fallback values in USD Ounce
      let goldOunceUSD = 2450;
      let silverOunceUSD = 30;
      let platinumOunceUSD = 980;
      let copperOunceUSD = 4.20; // Copper / lb converted

      try {
        const [goldRes, silverRes, platRes, copperRes] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU'),
          fetch('https://api.gold-api.com/price/XAG'),
          fetch('https://api.gold-api.com/price/XPT'),
          fetch('https://api.gold-api.com/price/XCU')
        ]);

        const goldJson = await goldRes.json();
        const silverJson = await silverRes.json();
        const platJson = await platRes.json();
        const copperJson = await copperRes.json();

        if (goldJson?.price) goldOunceUSD = goldJson.price;
        if (silverJson?.price) silverOunceUSD = silverJson.price;
        if (platJson?.price) platinumOunceUSD = platJson.price;
        if (copperJson?.price) copperOunceUSD = copperJson.price;
      } catch (err) {
        console.log('Using fallback metal prices', err);
      }

      // Formula: USD/oz * USD_PKR * 0.375 = PKR per Tola
      const tolaFactor = 0.375;

      setData(prev => ({
        ...prev,
        gold_per_tola_pkr: Math.round(goldOunceUSD * liveUsdPkr * tolaFactor),
        silver_per_tola_pkr: Math.round(silverOunceUSD * liveUsdPkr * tolaFactor),
        platinum_per_tola_pkr: Math.round(platinumOunceUSD * liveUsdPkr * tolaFactor),
        copper_per_tola_pkr: Math.round(copperOunceUSD * liveUsdPkr * tolaFactor),
        usd_pkr: liveUsdPkr,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Live Auto Refresh (Har 10 Seconds baad)
  useEffect(() => {
    fetchRates();
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRates(true);
      }, 10000); // 10 seconds
      return () => clearInterval(interval);
    }
  }, [fetchRates, autoRefresh]);

  return (
    <div className="space-y-4">
      {/* Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GOLD */}
        <RateCard
          name="Gold"
          unit="per Tola"
          price={data.gold_per_tola_pkr}
          change={data.gold_change_pct}
          symbol="XAU"
        />

        {/* SILVER */}
        <RateCard
          name="Silver"
          unit="per Tola"
          price={data.silver_per_tola_pkr}
          change={data.silver_change_pct}
          symbol="XAG"
        />

        {/* PLATINUM */}
        <RateCard
          name="Platinum"
          unit="per Tola"
          price={data.platinum_per_tola_pkr}
          change={data.platinum_change_pct}
          symbol="XPT"
        />

        {/* COPPER */}
        <RateCard
          name="Copper"
          unit="per Tola"
          price={data.copper_per_tola_pkr}
          change={data.copper_change_pct}
          symbol="XCU"
        />
      </div>

      {/* Info Bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <span className="text-xs text-gray-500">$ USD / PKR</span>
          <p className="text-xl font-bold">{data.usd_pkr}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <span className="text-xs text-gray-500">Last Updated</span>
          <p className="text-sm font-semibold">{new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => fetchRates(true)}
        disabled={refreshing}
        className="w-full py-3 bg-amber-600 text-white font-medium rounded-xl flex items-center justify-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh Rates
      </button>
    </div>
  );
}
