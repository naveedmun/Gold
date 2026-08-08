import React, { useState } from 'react';
import { BarChart2, LineChart } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

export default function Charts() {
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [timeframe, setTimeframe] = useState('10Y');
  const [chartType, setChartType] = useState('line');

  const getHistoricalData = () => {
    const isGold = selectedMetal === 'gold';

    switch (timeframe) {
      case '1D':
        return [
          { label: '9 AM', price: isGold ? 424000 : 6000 },
          { label: '12 PM', price: isGold ? 424800 : 6020 },
          { label: '3 PM', price: isGold ? 425200 : 6050 },
          { label: '6 PM', price: isGold ? 425734 : 6065 },
        ];
      case '1W':
        return [
          { label: 'Mon', price: isGold ? 421000 : 5850 },
          { label: 'Wed', price: isGold ? 422800 : 5960 },
          { label: 'Fri', price: isGold ? 423800 : 5990 },
          { label: 'Today', price: isGold ? 425734 : 6065 },
        ];
      case '1M':
        return [
          { label: 'Week 1', price: isGold ? 412000 : 5700 },
          { label: 'Week 2', price: isGold ? 418000 : 5820 },
          { label: 'Week 3', price: isGold ? 421500 : 5910 },
          { label: 'Week 4', price: isGold ? 425734 : 6065 },
        ];
      case '1Y':
        return [
          { label: '2025 Q3', price: isGold ? 360000 : 4900 },
          { label: '2025 Q4', price: isGold ? 520000 : 7100 },
          { label: '2026 Q1', price: isGold ? 410000 : 5600 },
          { label: '2026 Q3', price: isGold ? 425734 : 6065 },
        ];
      case '5Y':
        return [
          { label: '2022', price: isGold ? 150000 : 1800 },
          { label: '2023', price: isGold ? 220000 : 2500 },
          { label: '2024', price: isGold ? 285000 : 3400 },
          { label: '2025 Peak', price: isGold ? 520000 : 7100 }, // Exact Match 520k
          { label: '2026', price: isGold ? 425734 : 6065 },
        ];
      case '10Y':
      default:
        return [
          { label: '2016', price: isGold ? 48000 : 700 },
          { label: '2018', price: isGold ? 65000 : 900 },
          { label: '2020', price: isGold ? 115000 : 1400 },
          { label: '2022', price: isGold ? 150000 : 1800 },
          { label: '2024', price: isGold ? 285000 : 3400 },
          { label: '2025 High', price: isGold ? 520000 : 7100 }, // Exact Match 520k
          { label: '2026', price: isGold ? 425734 : 6065 },
        ];
    }
  };

  const currentData = getHistoricalData();
  const prices = currentData.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const changePct = (((endPrice - startPrice) / startPrice) * 100).toFixed(1);

  const generateSvgPath = () => {
    const width = 100;
    const height = 100;
    const points = currentData.map((item, index) => {
      const x = (index / (currentData.length - 1)) * width;
      const y = height - ((item.price - minPrice) / (maxPrice - minPrice || 1)) * 80 - 10;
      return { x, y };
    });

    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Charts</h1>
          <p className="text-sm text-muted-foreground">Historical gold & silver trends</p>
        </div>

        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'line' ? 'bg-card text-[#D4AF37] shadow-sm' : 'text-muted-foreground'
            }`}
            title="Line View"
          >
            <LineChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'bar' ? 'bg-card text-[#D4AF37] shadow-sm' : 'text-muted-foreground'
            }`}
            title="Bar View"
          >
            <BarChart2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex bg-muted p-1 rounded-xl max-w-xs mx-auto">
        <button
          onClick={() => setSelectedMetal('gold')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
            selectedMetal === 'gold' ? 'bg-[#D4AF37] text-white shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Gold
        </button>
        <button
          onClick={() => setSelectedMetal('silver')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
            selectedMetal === 'silver' ? 'bg-[#D4AF37] text-white shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Silver
        </button>
      </div>

      <div className="flex justify-center gap-1.5 pt-1">
        {['1D', '1W', '1M', '1Y', '5Y', '10Y'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              timeframe === tf
                ? 'bg-[#D4AF37] text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        {chartType === 'bar' ? (
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {currentData.map((item, idx) => {
              const heightPercent = Math.max(
                15,
                Math.round(((item.price - minPrice) / (maxPrice - minPrice || 1)) * 75 + 20)
              );

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {item.price >= 100000 ? `${(item.price / 1000).toFixed(0)}k` : item.price}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-[#B8860B] to-[#D4AF37] rounded-t-md transition-all duration-300"
                  />
                  <span className="text-[11px] text-muted-foreground font-semibold">{item.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-52 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={generateSvgPath()}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="flex justify-between items-center px-1">
              {currentData.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground">{item.label}</p>
                  <p className="text-[10px] font-bold text-foreground">
                    {item.price >= 100000 ? `${(item.price / 1000).toFixed(0)}k` : item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">High</p>
          <p className="text-sm font-bold text-foreground mt-0.5">Rs {formatPKR(maxPrice)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Low</p>
          <p className="text-sm font-bold text-foreground mt-0.5">Rs {formatPKR(minPrice)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Change</p>
          <p className={`text-sm font-bold mt-0.5 ${Number(changePct) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changePct}%
          </p>
        </div>
      </div>
    </div>
  );
}