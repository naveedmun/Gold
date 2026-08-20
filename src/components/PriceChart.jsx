import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Sparkles,
} from 'lucide-react';

const historicalData = {
  '1D': [
    { time: '09:00', price: 454300 },
    { time: '10:00', price: 454850 },
    { time: '11:00', price: 455100 },
    { time: '12:00', price: 454650 },
    { time: '13:00', price: 454800 },
    { time: '14:00', price: 456200 },
    { time: '15:00', price: 457200 },
    { time: '16:00', price: 458300 },
    { time: '17:00', price: 459150 },
  ],

  '7D': [
    { time: 'Mon', price: 448500 },
    { time: 'Tue', price: 451200 },
    { time: 'Wed', price: 449800 },
    { time: 'Thu', price: 454600 },
    { time: 'Fri', price: 456300 },
    { time: 'Sat', price: 458100 },
    { time: 'Sun', price: 459150 },
  ],

  '30D': [
    { time: 'Week 1', price: 442000 },
    { time: 'Week 2', price: 448500 },
    { time: 'Week 3', price: 452000 },
    { time: 'Week 4', price: 459150 },
  ],

  '1Y': [
    { time: 'Q1', price: 390000 },
    { time: 'Q2', price: 415000 },
    { time: 'Q3', price: 435000 },
    { time: 'Q4', price: 459150 },
  ],

  '5Y': [
    { time: '2022', price: 150000 },
    { time: '2023', price: 220000 },
    { time: '2024', price: 285000 },
    { time: '2025', price: 420000 },
    { time: '2026', price: 459150 },
  ],

  MAX: [
    { time: '2016', price: 48000 },
    { time: '2018', price: 65000 },
    { time: '2020', price: 115000 },
    { time: '2022', price: 150000 },
    { time: '2024', price: 285000 },
    { time: '2025', price: 420000 },
    { time: '2026', price: 459150 },
  ],
};

/* ================= CUSTOM TOOLTIP ================= */
function LuxuryTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 backdrop-blur-xl border"
      style={{
        background: 'linear-gradient(145deg, rgba(20,18,12,0.96), rgba(10,9,6,0.96))',
        borderColor: 'rgba(212,175,55,0.35)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08)',
      }}
    >
      <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] mb-1">
        {label}
      </p>
      <p className="text-sm font-extrabold text-white">
        Rs {Number(payload[0].value).toLocaleString('en-PK')}
      </p>
      <p className="text-[9px] text-white/50 mt-0.5">per tola · 24K</p>
    </div>
  );
}

export default function PriceChart() {
  const [timeRange, setTimeRange] = useState('1D');

  const data = historicalData[timeRange];

  const currentPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;

  const change = currentPrice - firstPrice;
  const percentage =
    firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(2) : '0.00';

  const isPositive = change >= 0;

  const performanceStats = [
    { label: 'Today', value: '+1,850', percent: '+0.41%', positive: true },
    { label: '30 Days', value: '+17,150', percent: '+3.88%', positive: true },
    { label: '1 Year', value: '+69,150', percent: '+17.73%', positive: true },
  ];

  return (
    <div className="space-y-4 max-w-xl mx-auto p-2">

      {/* ================= CHART CARD ================= */}
      <div
        className="relative rounded-3xl overflow-hidden border"
        style={{
          background:
            'radial-gradient(120% 140% at 0% 0%, rgba(212,175,55,0.10) 0%, rgba(15,14,11,0.98) 45%), linear-gradient(160deg, #14120d 0%, #0a0908 100%)',
          borderColor: 'rgba(212,175,55,0.18)',
          boxShadow:
            '0 20px 60px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* faint gold sheen top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
          }}
        />

        {/* Header */}
        <div className="relative p-5 pb-3">

          <div className="flex items-start justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #D4AF37, #B8860B)',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
                  }}
                >
                  <Activity className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
                </div>

                <h3 className="text-sm font-bold text-white tracking-wide">
                  Gold Price
                </h3>

                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: 'rgba(212,175,55,0.12)',
                    color: '#E8C567',
                    border: '1px solid rgba(212,175,55,0.25)',
                  }}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  24K
                </span>
              </div>

              <p className="text-[11px] text-white/40 mt-1.5 ml-9">
                Gold price performance & market trend
              </p>
            </div>

            {/* Current Price */}
            <div className="text-right">
              <p
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #F4E4B0, #D4AF37 60%, #B8860B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Rs {currentPrice.toLocaleString('en-PK')}
              </p>

              <p
                className={`text-[11px] font-bold flex items-center justify-end gap-1 mt-0.5 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? '+' : ''}
                {percentage}%
              </p>
            </div>

          </div>

          {/* Time buttons */}
          <div className="flex items-center justify-between mt-5">

            <div
              className="flex p-1 rounded-xl gap-0.5 overflow-x-auto"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >

              {['1D', '7D', '30D', '1Y', '5Y', 'MAX'].map((range) => (

                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap"
                  style={
                    timeRange === range
                      ? {
                          background:
                            'linear-gradient(135deg, #D4AF37, #B8860B)',
                          color: '#0a0908',
                          boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                        }
                      : { color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  {range}
                </button>

              ))}

            </div>

            <span className="text-[10px] text-white/35">
              {timeRange === '1D'
                ? 'Today'
                : timeRange === '7D'
                ? 'Last 7 Days'
                : timeRange === '30D'
                ? 'Last 30 Days'
                : timeRange === '1Y'
                ? 'Last 12 Months'
                : timeRange === '5Y'
                ? 'Last 5 Years'
                : 'Since 2016'}
            </span>

          </div>
        </div>

        {/* ================= GRAPH ================= */}

        <div className="relative h-64 w-full px-2 pb-3">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 12,
                left: 0,
                bottom: 0,
              }}
            >

              <defs>

                <linearGradient
                  id="goldAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.55} />
                  <stop offset="45%" stopColor="#D4AF37" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>

                <linearGradient
                  id="goldLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#B8860B" />
                  <stop offset="50%" stopColor="#F4E4B0" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>

                <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#D4AF37"
                opacity={0.06}
              />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                tickMargin={8}
                stroke="rgba(255,255,255,0.4)"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={55}
                fontSize={9}
                stroke="rgba(255,255,255,0.4)"
                domain={[
                  (dataMin) => Math.floor(dataMin / 1000) * 1000 - 1000,
                  (dataMax) => Math.ceil(dataMax / 1000) * 1000 + 1000,
                ]}
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
              />

              <Tooltip
                cursor={{
                  stroke: '#D4AF37',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                content={<LuxuryTooltip />}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="url(#goldLineGradient)"
                strokeWidth={2.5}
                fill="url(#goldAreaGradient)"
                filter="url(#goldGlow)"
                dot={{
                  r: 2.5,
                  fill: '#D4AF37',
                  stroke: '#0a0908',
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 6,
                  fill: '#F4E4B0',
                  stroke: '#D4AF37',
                  strokeWidth: 2,
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

        {/* Bottom status */}
        <div
          className="relative px-5 py-3 flex items-center justify-between border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>

            <span className="text-[10px] font-medium text-white/40">
              Live Market
            </span>
          </div>

          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              isPositive
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-rose-400 bg-rose-400/10'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? 'Bullish' : 'Bearish'}
          </div>

        </div>

      </div>

      {/* ================= PERFORMANCE ================= */}

      <div
        className="rounded-2xl p-4 border"
        style={{
          background:
            'linear-gradient(160deg, #14120d 0%, #0a0908 100%)',
          borderColor: 'rgba(212,175,55,0.18)',
          boxShadow: '0 12px 40px -12px rgba(0,0,0,0.5)',
        }}
      >

        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
            Gold Price Performance
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {performanceStats.map((stat) => (
            <PerformanceCard key={stat.label} {...stat} />
          ))}
        </div>

      </div>

    </div>
  );
}

/* ================= PERFORMANCE CARD ================= */

function PerformanceCard({ label, value, percent, positive }) {
  return (
    <div
      className="p-3 rounded-xl text-center transition-transform hover:-translate-y-0.5"
      style={{
        background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.14)',
      }}
    >
      <span className="text-[10px] font-semibold text-white/40 block">
        {label}
      </span>

      <p className="text-sm font-extrabold text-white mt-1">{value}</p>

      <span
        className={`text-[10px] font-bold flex items-center justify-center gap-1 mt-1 ${
          positive ? 'text-emerald-400' : 'text-rose-400'
        }`}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {percent}
      </span>
    </div>
  );
}
