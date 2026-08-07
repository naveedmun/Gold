import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import RateCard from '@/components/RateCard';
import { useSettings } from '@/lib/SettingsContext';

export default function Home() {
  const { autoRefresh } = useSettings();
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

  const [refreshing, setRefreshing] = useState(false);

  const fetchRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      // 1. Fetch USD to PKR Live Rate
      const currencyRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const currencyJson = await currencyRes.json();
      const liveUsdPkr = currencyJson?.rates?.PKR || 278.70;

      // 2. Default Prices (Ounce mein)
      let goldOunceUSD = 2450;
      let silverOunceUSD = 30;
      let platinumOunceUSD = 980;
      let copperOunceUSD = 4.20;

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
        console.log('Using fallback prices', err);
      }

      // Formula: USD/oz * USD_PKR * 0.375 = PKR/Tola
      const tolaFactor = 0.375;

      setData(prev => ({
        ...prev,
        gold_per_tola_pkr: Math.round(goldOunceUSD * liveUsdPkr * tolaFactor),
        silver_per_tola_pkr: Math.round(silverOunceUSD * liveUsdPkr * tolaFactor),
        platinum_per_tola_pkr: Math.round(platinumOunceUSD * liveUsdPkr * tolaFactor),
        copper_per_tola_pkr: Math.round(copperOunceUSD * liveUsdPkr * tolaFactor),
        usd_pkr: liveUsdPkr.toFixed(2),
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Har 5 second baad auto update
  useEffect(() => {
    fetchRates();
    const interval = setInterval(() => {
      fetchRates(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return (
    div className="p-4 bg-red-500 text-white font-bold text-center text-xl rounded-xl">
      {/* 4 Metals Grid */}
      <div className="space-y-3">
        <RateCard
          name="Gold"
          unit="per Tola"
          price={data.gold_per_tola_pkr}
          change={data.gold_change_pct}
          symbol="XAU"
        />

        <RateCard
          name="Silver"
          unit="per Tola"
          price={data.silver_per_tola_pkr}
          change={data.silver_change_pct}
          symbol="XAG"
        />

        <RateCard
          name="Platinum"
          unit="per Tola"
          price={data.platinum_per_tola_pkr}
          change={data.platinum_change_pct}
          symbol="XPT"
        />

        <RateCard
          name="Copper"
          unit="per Tola"
          price={data.copper_per_tola_pkr}
          change={data.copper_change_pct}
          symbol="XCU"
        />
      </div>

      {/* Info Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <span className="text-xs text-gray-500">$ USD / PKR</span>
          <p className="text-lg font-bold">{data.usd_pkr}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <span className="text-xs text-gray-500">Last Updated</span>
          <p className="text-sm font-semibold">{new Date(data.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => fetchRates(true)}
        disabled={refreshing}
        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh Rates
      </button>
    </div>
  );
}
