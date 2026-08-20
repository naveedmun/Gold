import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart2, LineChart } from 'lucide-react';

export default function Charts() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';
  const USD_RATE = context.usdRate || 278.70;

  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [timeframe, setTimeframe] = useState('10Y');
  const [chartType, setChartType] = useState('line');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const formatCurrency = (pkrAmount) => {
    if (!pkrAmount || isNaN(pkrAmount)) return 'N/A';
    if (currency === 'USD') {
      const usdVal = pkrAmount / USD_RATE;
      return `$ ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rs ${pkrAmount.toLocaleString('en-PK')}`;
  };

  const getHistoricalData = () => {
    const isGold = selectedMetal === 'gold';
    switch (timeframe) {
      case '1D':
        return [
          { label: '9 AM', price: isGold ? 450000 : 6850 },
          { label: '12 PM', price: isGold ? 451800 : 6880 },
          { label: '3 PM', price: isGold ? 453200 : 6910 },
          { label: '6 PM', price: isGold ? 454300 : 6940 },
        ];
      case '1W':
        return [
          { label: 'Mon', price: isGold ? 448000 : 6750 },
          { label: 'Wed', price: isGold ? 450500 : 6820 },
          { label: 'Fri', price: isGold ? 452800 : 6890 },
          { label: 'Today', price: isGold ? 454300 : 6940 },
        ];
      case '1M':
        return [
          { label: 'Week 1', price: isGold ? 442000 : 6650 },
          { label: 'Week 2', price: isGold ? 446000 : 6740 },
          { label: 'Week 3', price: isGold ? 450000 : 6850 },
          { label: 'Week 4', price: isGold ? 454300 : 6940 },
        ];
      case '1Y':
        return [
          { label: '2025 Q3', price: isGold ? 360000 : 4900 },
          { label: '2025 Q4', price: isGold ? 520000 : 7100 },
          { label: '2026 Q1', price: isGold ? 410000 : 5600 },
          { label: '2026 Q3', price: isGold ? 454300 : 6940 },
        ];
      case '5Y':
        return [
          { label: '2022', price: isGold ? 150000 : 1800 },
          { label: '2023', price: isGold ? 220000 : 2500 },
          { label: '2024', price: isGold ? 285000 : 3400 },
          { label: '2025 Peak', price: isGold ? 520000 : 7100 },
          { label: '2026', price: isGold ? 454300 : 6940 },
        ];
      case '10Y':
      default:
        return [
          { label: '2016', price: isGold ? 48000 : 700 },
          { label: '2018', price: isGold ? 65000 : 900 },
          { label: '2020', price: isGold ? 115000 : 1400 },
          { label: '2022', price: isGold ? 150000 : 1800 },
          { label: '2024', price: isGold ? 285000 : 3400 },
          { label: '2025 High', price: isGold ? 520000 : 7100 },
          { label: '2026', price: isGold ? 454300 : 6940 },
        ];
    }
  };

  const currentData = getHistoricalData() || [];
  const prices = currentData.map((d) => d.price);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;
  const startPrice = prices[0] || 1;
  const endPrice = prices[prices.length - 1] || 1;
  const changePct = (((endPrice - startPrice) / startPrice) * 100).toFixed(1);

  const formatShortValue = (pkrAmount) => {
    if (!pkrAmount || isNaN(pkrAmount)) return '0';
    if (currency === 'USD') {
      const usdVal = pkrAmount / USD_RATE;
      return `$${usdVal >= 1000 ? (usdVal / 1000).toFixed(1) + 'k' : usdVal.toFixed(0)}`;
    }
    return pkrAmount >= 100000 ? `${(pkrAmount / 1000).toFixed(0)}k` : pkrAmount.toString();
  };

  const getPoints = () => {
    const width = 100;
    const height = 100;
    const totalItems = currentData.length;

    return currentData.map((item, index) => {
      const x = totalItems > 1 ? (index / (totalItems - 1)) * width : 50;
      const y = height - ((item.price - minPrice) / priceRange) * 70 - 15;
      return { x, y, ...item };
    });
  };

  const points = getPoints();

  const generateSvgPath = () => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-2 pb-6">
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
            onClick={() => {
              setTimeframe(tf);
              setHoveredPoint(null);
            }}
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

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 relative">
        <div className="min-h-[32px] flex items-center justify-between border-b border-border/50 pb-2">
          {hoveredPoint ? (
            <div className="flex justify-between items-center w-full bg-muted/60 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 transition-all">
              <span className="text-xs font-semibold text-muted-foreground">
                Time: <strong className="text-foreground">{hoveredPoint.label}</strong>
              </span>
              <span className="text-sm font-black text-[#D4AF37]">
                {formatCurrency(hoveredPoint.price)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic w-full text-center">
              Hover / touch graph points to view detailed rate
            </p>
          )}
        </div>

        {chartType === 'bar' ? (
          <div className="h-56 flex items-end justify-between gap-3 pt-4 pb-2 px-2">
            {currentData.map((item, idx) => {
              const heightPercent = Math.max(
                15,
                Math.round(((item.price - minPrice) / priceRange) * 75 + 20)
              );
              const isHovered = hoveredPoint?.label === item.label;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end gap-2 cursor-pointer group"
                >
                  <span className={`text-[10px] font-bold transition-colors ${
                    isHovered ? 'text-[#D4AF37]' : 'text-muted-foreground'
                  }`}>
                    {formatShortValue(item.price)}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/30 scale-105'
                        : 'bg-gradient-to-t from-[#B8860B] to-[#D4AF37] opacity-80 group-hover:opacity-100'
                    }`}
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
                {points.map((pt, idx) => {
                  const isHovered = hoveredPoint?.label === pt.label;
                  return (
                    <g key={idx}>
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill="#D4AF37"
                          fillOpacity="0.4"
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? "3" : "2"}
                        fill={isHovered ? "#ffffff" : "#D4AF37"}
                        stroke="#B8860B"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onTouchStart={() => setHoveredPoint(pt)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between items-center px-1">
              {currentData.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground">{item.label}</p>
                  <p className={`text-[10px] font-bold ${
                    hoveredPoint?.label === item.label ? 'text-[#D4AF37]' : 'text-foreground'
                  }`}>
                    {formatShortValue(item.price)}
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
          <p className="text-sm font-bold text-foreground mt-0.5">
            {formatCurrency(maxPrice)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Low</p>
          <p className="text-sm font-bold text-foreground mt-0.5">
            {formatCurrency(minPrice)}
          </p>
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