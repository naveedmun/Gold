import React, { useState } from 'react';
import { History as HistoryIcon, Calendar, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

export default function History() {
  const [selectedMetal, setSelectedMetal] = useState('all');

  // Dummy / Initial History Data (Gold, Silver, Platinum, Copper)
  const historyData = [
    { id: 1, date: '2026-08-07', metal: 'Gold', pricePerTola: 425734, change: +0.45, type: 'up' },
    { id: 2, date: '2026-08-07', metal: 'Silver', pricePerTola: 6065, change: +1.20, type: 'up' },
    { id: 3, date: '2026-08-07', metal: 'Platinum', pricePerTola: 115000, change: +0.80, type: 'up' },
    { id: 4, date: '2026-08-07', metal: 'Copper', pricePerTola: 3500, change: -0.50, type: 'down' },
    
    { id: 5, date: '2026-08-06', metal: 'Gold', pricePerTola: 423800, change: -0.20, type: 'down' },
    { id: 6, date: '2026-08-06', metal: 'Silver', pricePerTola: 5990, change: +0.50, type: 'up' },
    { id: 7, date: '2026-08-06', metal: 'Platinum', pricePerTola: 114100, change: -0.30, type: 'down' },
    { id: 8, date: '2026-08-06', metal: 'Copper', pricePerTola: 3518, change: +0.10, type: 'up' },

    { id: 9, date: '2026-08-05', metal: 'Gold', pricePerTola: 424650, change: +0.90, type: 'up' },
    { id: 10, date: '2026-08-05', metal: 'Silver', pricePerTola: 5960, change: -0.80, type: 'down' },
    { id: 11, date: '2026-08-05', metal: 'Platinum', pricePerTola: 114450, change: +0.40, type: 'up' },
    { id: 12, date: '2026-08-05', metal: 'Copper', pricePerTola: 3515, change: -0.20, type: 'down' },
  ];

  const filteredData = selectedMetal === 'all'
    ? historyData
    : historyData.filter(item => item.metal.toLowerCase() === selectedMetal.toLowerCase());

  return (
    <div className="space-y-4">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-[#D4AF37]" />
          <h1 className="text-xl font-bold text-foreground">Rate History</h1>
        </div>
        <span className="text-xs text-muted-foreground">PKR per Tola</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'gold', 'silver', 'platinum', 'copper'].map((metal) => (
          <button
            key={metal}
            onClick={() => setSelectedMetal(metal)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              selectedMetal === metal
                ? 'bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20'
                : 'bg-card border border-border text-muted-foreground hover:border-[#D4AF37]/40'
            }`}
          >
            {metal}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-2.5">
        {filteredData.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-[#D4AF37]/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                row.metal === 'Gold' ? 'bg-amber-500/10 text-amber-600' :
                row.metal === 'Silver' ? 'bg-slate-500/10 text-slate-600' :
                row.metal === 'Platinum' ? 'bg-cyan-500/10 text-cyan-600' :
                'bg-orange-500/10 text-orange-600'
              }`}>
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{row.metal}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-base text-foreground">
                Rs {row.pricePerTola.toLocaleString()}
              </p>
              <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                row.type === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {row.type === 'up' ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span>{Math.abs(row.change)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
