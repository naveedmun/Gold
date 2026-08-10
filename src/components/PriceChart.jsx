import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const historicalData = {
  '1D': [
    { time: '09:00', price: 454300 },
    { time: '11:00', price: 455100 },
    { time: '13:00', price: 454800 },
    { time: '15:00', price: 457200 },
    { time: '17:00', price: 459150 },
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
  ]
};

const performanceStats = [
  { label: 'Today', change: '+1,850', percent: '+0.41%', isPositive: true },
  { label: '30 Days', change: '+17,150', percent: '+3.88%', isPositive: true },
  { label: '1 Year', change: '+69,150', percent: '+17.73%', isPositive: true },
];

export default function PriceChart() {
  const [timeRange, setTimeRange] = useState('1D');
  const data = historicalData[timeRange];

  return (
    <div className="space-y-4 max-w-xl mx-auto p-2">
      {/* Chart Card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Gold Price Performance (24K)</h3>
            <p className="text-xs text-muted-foreground">Interactive market trend & analysis</p>
          </div>
          {/* Timeframe Toggle Buttons */}
          <div className="flex bg-muted/60 p-1 rounded-xl gap-1">
            {['1D', '30D', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Graph */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 1000', 'dataMax + 1000']}
                tickFormatter={(val) => `Rs ${(val/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Rate']}
              />
              <Area type="monotone" dataKey="price" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics Table (Like the Screenshot) */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" /> Gold Price Performance Summary
        </h4>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {performanceStats.map((stat, idx) => (
            <div key={idx} className="bg-muted/40 p-3 rounded-xl border border-border/50 text-center space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">{stat.label}</span>
              <p className="text-sm font-extrabold text-foreground">{stat.change}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 ${
                stat.isPositive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
              }`}>
                {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.percent}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
