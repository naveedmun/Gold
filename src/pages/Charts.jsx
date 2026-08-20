import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart2, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

const LUX_CARD = {
  background:
    'radial-gradient(120% 140% at 0% 0%, rgba(212,175,55,0.10) 0%, rgba(15,14,11,0.98) 45%), linear-gradient(160deg, #14120d 0%, #0a0908 100%)',
  borderColor: 'rgba(212,175,55,0.18)',
  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.55)',
};

const LUX_CARD_SM = {
  background: 'linear-gradient(160deg, #14120d 0%, #0a0908 100%)',
  borderColor: 'rgba(212,175,55,0.18)',
  boxShadow: '0 12px 40px -12px rgba(0,0,0,0.5)',
};

export default function Charts() {
  const context = useOutletContext() || {};
  const currency = context.currency || 'PKR';
  const USD_RATE = 278.70;

  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [timeframe, setTimeframe] = useState('10Y');
  const [chartType, setChartType] = useState('line');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const formatCurrency = (pkrAmount) => {
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

  const currentData = getHistoricalData();
  const prices = currentData.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const changePct = (((endPrice - startPrice) / startPrice) * 100).toFixed(1);
  const isPositive = Number(changePct) >= 0;

  const formatShortValue = (pkrAmount) => {
    if (currency === 'USD') {
      const usdVal = pkrAmount / USD_RATE;
      return `$${usdVal >= 1000 ? (usdVal / 1000).toFixed(1) + 'k' : usdVal.toFixed(0)}`;
    }
    return pkrAmount >= 100000 ? `${(pkrAmount / 1000).toFixed(0)}k` : pkrAmount;
  };

  const getPoints = () => {
    const width = 100;
    const height = 100;
    return currentData.map((item, index) => {
      const x = (index / (currentData.length - 1)) * width;
      const y = height - ((item.price - minPrice) / (maxPrice - minPrice || 1)) * 70 - 15;
      return { x, y, ...item };
    });
  };

  const points = getPoints();

  const generateSvgPath = () => {
    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  };

  const generateAreaPath = () => {
    if (!points.length) return '';
    const line = generateSvgPath();
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x},100 L ${first.x},100 Z`;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-2 pb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
            }}
          >
            <LineChart className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Price Charts</h1>
            <p className="text-sm text-white/40">Historical gold & silver trends</p>
          </div>
        </div>

        <div
          className="flex p-1 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.18)' }}
        >
          <button
            onClick={() => setChartType('line')}
            className="p-2 rounded-lg transition-all"
            style={
              chartType === 'line'
                ? { background: 'rgba(212,175,55,0.15)', color: '#E8C567' }
                : { color: 'rgba(255,255,255,0.35)' }
            }
            title="Line View"
          >
            <LineChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className="p-2 rounded-lg transition-all"
            style={
              chartType === 'bar'
                ? { background: 'rgba(212,175,55,0.15)', color: '#E8C567' }
                : { color: 'rgba(255,255,255,0.35)' }
            }
            title="Bar View"
          >
            <BarChart2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="flex p-1 rounded-xl max-w-xs mx-auto border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.18)' }}
      >
        {['gold', 'silver'].map((metal) => (
          <button
            key={metal}
            onClick={() => setSelectedMetal(metal)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all"
            style={
              selectedMetal === metal
                ? {
                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                    color: '#0a0908',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                  }
                : { color: 'rgba(255,255,255,0.45)' }
            }
          >
            {metal}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 pt-1 overflow-x-auto">
        {['1D', '1W', '1M', '1Y', '5Y', '10Y'].map((tf) => (
          <button
            key={tf}
            onClick={() => {
              setTimeframe(tf);
              setHoveredPoint(null);
            }}
            className="px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap"
            style={
              timeframe === tf
                ? {
                    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                    color: '#0a0908',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                  }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }
            }
          >
            {tf === '10Y' ? 'Since 2016' : tf}
          </button>
        ))}
      </div>

      <div className="relative rounded-3xl border p-5 space-y-4 overflow-hidden" style={LUX_CARD}>
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
        />

        <div
          className="min-h-[36px] flex items-center justify-between border-b pb-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {hoveredPoint ? (
            <div
              className="flex justify-between items-center w-full px-3 py-1.5 rounded-lg border transition-all"
              style={{ background: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.3)' }}
            >
              <span className="text-xs font-semibold text-white/50">
                {hoveredPoint.label}
              </span>
              <span className="text-sm font-black text-[#E8C567]">
                {formatCurrency(hoveredPoint.price)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-white/30 italic w-full text-center">
              Hover / touch graph points to view detailed rate
            </p>
          )}
        </div>

        {chartType === 'bar' ? (
          <div className="h-56 flex items-end justify-between gap-3 pt-4 pb-2 px-2">
            {currentData.map((item, idx) => {
              const heightPercent = Math.max(
                15,
                Math.round(((item.price - minPrice) / (maxPrice - minPrice || 1)) * 75 + 20)
              );
              const isHovered = hoveredPoint?.label === item.label;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end gap-2 cursor-pointer group"
                >
                  <span
                    className="text-[10px] font-bold transition-colors"
                    style={{ color: isHovered ? '#E8C567' : 'rgba(255,255,255,0.4)' }}
                  >
                    {formatShortValue(item.price)}
                  </span>
                  <div
                    style={{
                      height: `${heightPercent}%`,
                      background: isHovered
                        ? 'linear-gradient(180deg, #F4E4B0, #D4AF37)'
                        : 'linear-gradient(180deg, #D4AF37, #B8860B)',
                      opacity: isHovered ? 1 : 0.75,
                      boxShadow: isHovered ? '0 4px 20px rgba(212,175,55,0.4)' : 'none',
                    }}
                    className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-100"
                  />
                  <span className="text-[11px] text-white/35 font-semibold">{item.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-52 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <filter id="chartsGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path d={generateAreaPath()} fill="url(#chartsAreaGradient)" stroke="none" />

                <path
                  d={generateSvgPath()}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                  filter="url(#chartsGlow)"
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
                        r={isHovered ? '3' : '2'}
                        fill={isHovered ? '#F4E4B0' : '#D4AF37'}
                        stroke="#0a0908"
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
                  <p className="text-[11px] font-semibold text-white/35">{item.label}</p>
                  <p
                    className="text-[10px] font-bold"
                    style={{
                      color:
                        hoveredPoint?.label === item.label ? '#E8C567' : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {formatShortValue(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-3 text-center" style={LUX_CARD_SM}>
          <p className="text-xs text-white/40">High</p>
          <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(maxPrice)}</p>
        </div>
        <div className="rounded-xl border p-3 text-center" style={LUX_CARD_SM}>
          <p className="text-xs text-white/40">Low</p>
          <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(minPrice)}</p>
        </div>
        <div className="rounded-xl border p-3 text-center" style={LUX_CARD_SM}>
          <p className="text-xs text-white/40">Change</p>
          <p
            className={`text-sm font-bold mt-0.5 flex items-center justify-center gap-1 ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {changePct}%
          </p>
        </div>
      </div>
    </div>
  );
}
