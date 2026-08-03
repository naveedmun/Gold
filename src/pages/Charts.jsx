import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

const RANGES = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: '10Y', label: '10Y' },
];

export default function Charts() {
  const [range, setRange] = useState('1M');
  const [metal, setMetal] = useState('gold');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('fetchGoldHistory', { range });
      setData(res.data?.points || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = data.map(p => ({
    date: p.date,
    gold: p.gold,
    silver: p.silver,
  }));

  const lineColor = metal === 'gold' ? '#D4AF37' : '#C0C0C0';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Price Charts</h1>
        <p className="text-sm text-muted-foreground">Historical gold & silver trends</p>
      </div>

      {/* Metal toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMetal('gold')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${metal === 'gold' ? 'bg-[#D4AF37] text-white' : 'bg-card border border-border text-muted-foreground'}`}
        >
          Gold
        </button>
        <button
          onClick={() => setMetal('silver')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${metal === 'silver' ? 'bg-[#C0C0C0] text-white' : 'bg-card border border-border text-muted-foreground'}`}
        >
          Silver
        </button>
      </div>

      {/* Range selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${range === r.value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={30} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(v) => [`Rs ${v.toLocaleString()}`, metal === 'gold' ? 'Gold' : 'Silver']}
              />
              <Line type="monotone" dataKey={metal} stroke={lineColor} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">No data available</div>
        )}
      </div>

      {/* Stats */}
      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-sm font-bold mt-1">Rs {Math.max(...chartData.map(d => d[metal])).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-sm font-bold mt-1">Rs {Math.min(...chartData.map(d => d[metal])).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-sm font-bold mt-1 ${chartData[chartData.length-1][metal] >= chartData[0][metal] ? 'text-green-500' : 'text-red-500'}`}>
              {(((chartData[chartData.length-1][metal] - chartData[0][metal]) / chartData[0][metal]) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}