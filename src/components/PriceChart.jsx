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
  Calendar,
  Activity,
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
};

export default function PriceChart() {
  const [timeRange, setTimeRange] = useState('1D');

  const data = historicalData[timeRange];

  const currentPrice = data[data.length - 1]?.price || 0;
  const firstPrice = data[0]?.price || 0;

  const change = currentPrice - firstPrice;
  const percentage =
    firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(2) : '0.00';

  const isPositive = change >= 0;

  return (
    <div className="space-y-4 max-w-xl mx-auto p-2">

      {/* ================= CHART CARD ================= */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-5 pb-3">

          <div className="flex items-start justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#D4AF37]" />

                <h3 className="text-sm font-bold text-foreground">
                  Gold Price
                </h3>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B8860B]">
                  24K
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1">
                Gold price performance & market trend
              </p>
            </div>

            {/* Current Price */}
            <div className="text-right">
              <p className="text-xl font-extrabold text-foreground">
                Rs {currentPrice.toLocaleString('en-PK')}
              </p>

              <p
                className={`text-[11px] font-bold ${
                  isPositive
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {percentage}%
              </p>
            </div>

          </div>

          {/* Time buttons */}
          <div className="flex items-center justify-between mt-5">

            <div className="flex bg-muted/60 p-1 rounded-xl gap-1">

              {['1D', '7D', '30D', '1Y'].map((range) => (

                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>

              ))}

            </div>

            <span className="text-[10px] text-muted-foreground">
              {timeRange === '1D'
                ? 'Today'
                : timeRange === '7D'
                ? 'Last 7 Days'
                : timeRange === '30D'
                ? 'Last 30 Days'
                : 'Last 12 Months'}
            </span>

          </div>
        </div>

        {/* ================= GRAPH ================= */}

        <div className="h-64 w-full px-2 pb-3">

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
                  <stop
                    offset="0%"
                    stopColor="#D4AF37"
                    stopOpacity={0.45}
                  />

                  <stop
                    offset="55%"
                    stopColor="#D4AF37"
                    stopOpacity={0.15}
                  />

                  <stop
                    offset="100%"
                    stopColor="#D4AF37"
                    stopOpacity={0}
                  />
                </linearGradient>

              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                opacity={0.08}
              />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                tickMargin={8}
                stroke="currentColor"
                opacity={0.55}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={55}
                fontSize={9}
                stroke="currentColor"
                opacity={0.55}
                domain={[
                  (dataMin) => Math.floor(dataMin / 1000) * 1000 - 1000,
                  (dataMax) => Math.ceil(dataMax / 1000) * 1000 + 1000,
                ]}
                tickFormatter={(value) =>
                  `Rs ${(value / 1000).toFixed(0)}k`
                }
              />

              <Tooltip
                cursor={{
                  stroke: '#D4AF37',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #D4AF37',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#fff',
                  boxShadow:
                    '0 8px 25px rgba(0,0,0,0.25)',
                }}
                labelStyle={{
                  color: '#D4AF37',
                  fontWeight: 700,
                  marginBottom: '3px',
                }}
                formatter={(value) => [
                  `Rs ${Number(value).toLocaleString('en-PK')}`,
                  'Gold Rate',
                ]}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#D4AF37"
                strokeWidth={3}
                fill="url(#goldAreaGradient)"
                dot={{
                  r: 3,
                  fill: '#D4AF37',
                  stroke: '#fff',
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 6,
                  fill: '#D4AF37',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

        {/* Bottom status */}
        <div className="border-t border-border px-5 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

            <span className="text-[10px] font-medium text-muted-foreground">
              Market Trend
            </span>

          </div>

          <div className="flex items-center gap-1 text-emerald-600">

            <TrendingUp className="h-3.5 w-3.5" />

            <span className="text-[10px] font-bold">
              {isPositive ? 'Bullish' : 'Bearish'}
            </span>

          </div>

        </div>

      </div>

      {/* ================= PERFORMANCE ================= */}

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">

        <div className="flex items-center gap-2 mb-3">

          <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />

          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Gold Price Performance
          </h4>

        </div>

        <div className="grid grid-cols-3 gap-2">

          <PerformanceCard
            label="Today"
            value="+1,850"
            percent="+0.41%"
          />

          <PerformanceCard
            label="30 Days"
            value="+17,150"
            percent="+3.88%"
          />

          <PerformanceCard
            label="1 Year"
            value="+69,150"
            percent="+17.73%"
          />

        </div>

      </div>

    </div>
  );
}


/* ================= PERFORMANCE CARD ================= */

function PerformanceCard({ label, value, percent }) {
  return (
    <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-center">

      <span className="text-[10px] font-semibold text-muted-foreground block">
        {label}
      </span>

      <p className="text-sm font-extrabold text-foreground mt-1">
        {value}
      </p>

      <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
        <TrendingUp className="h-3 w-3" />
        {percent}
      </span>

    </div>
  );
}