import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Loader2, Search } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

export default function History() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await base44.functions.invoke('fetchGoldHistory', { date });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rate History</h1>
        <p className="text-sm text-muted-foreground">Check gold & silver rates for any date</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#D4AF37]" />
          Select Date
        </label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
        />
        <button
          onClick={fetchRate}
          disabled={loading || !date}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-3 text-white font-semibold shadow-lg shadow-[#D4AF37]/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {loading ? 'Searching...' : 'Check Rate'}
        </button>
      </div>

      {/* Results */}
      {searched && !loading && result && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-5">
            <p className="text-sm text-muted-foreground">Gold per Tola</p>
            <p className="text-3xl font-bold mt-1">Rs {formatPKR(result.gold_per_tola_pkr)}</p>
          </div>
          <div className="rounded-2xl border border-[#C0C0C0]/20 bg-gradient-to-br from-[#C0C0C0]/10 to-transparent p-5">
            <p className="text-sm text-muted-foreground">Silver per Tola</p>
            <p className="text-3xl font-bold mt-1">Rs {formatPKR(result.silver_per_tola_pkr)}</p>
          </div>
          {result.usd_pkr && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">USD / PKR</p>
              <p className="text-xl font-bold mt-1">Rs {formatPKR(result.usd_pkr)}</p>
            </div>
          )}
          {result.note && (
            <p className="text-xs text-muted-foreground italic px-2">{result.note}</p>
          )}
        </div>
      )}

      {searched && !loading && !result && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No data found. Try another date.</p>
        </div>
      )}
    </div>
  );
}