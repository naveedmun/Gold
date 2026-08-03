import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { UNITS, convertFromTola, formatPKR, formatNumber } from '@/lib/conversions';

export default function Calculator() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metal, setMetal] = useState('gold');
  const [unit, setUnit] = useState('tola');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('weight');

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('fetchLiveRates', {});
        setLiveData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const perTola = metal === 'gold' ? liveData?.gold_per_tola_pkr : liveData?.silver_per_tola_pkr;
  const unitPrice = perTola ? convertFromTola(perTola, unit) : 0;

  let totalValue = 0;
  let calculatedWeight = 0;

  if (mode === 'weight' && quantity && perTola) {
    totalValue = unitPrice * parseFloat(quantity);
  } else if (mode === 'amount' && amount && perTola) {
    calculatedWeight = parseFloat(amount) / unitPrice;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calculator</h1>
        <p className="text-sm text-muted-foreground">Calculate gold & silver value</p>
      </div>

      {/* Metal toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMetal('gold')} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${metal === 'gold' ? 'bg-[#D4AF37] text-white' : 'bg-card border border-border'}`}>Gold</button>
        <button onClick={() => setMetal('silver')} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${metal === 'silver' ? 'bg-[#C0C0C0] text-white' : 'bg-card border border-border'}`}>Silver</button>
      </div>

      {/* Live rate display */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Current {metal} rate</p>
        {loading ? (
          <div className="h-7 w-32 mt-1 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-xl font-bold mt-1">Rs {formatPKR(perTola)} <span className="text-sm text-muted-foreground font-normal">/ Tola</span></p>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setMode('weight')} className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${mode === 'weight' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>Weight → Value</button>
        <button onClick={() => setMode('amount')} className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${mode === 'amount' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>Value → Weight</button>
      </div>

      {/* Unit selector */}
      <div className="grid grid-cols-4 gap-1.5">
        {UNITS.map(u => (
          <button key={u.value} onClick={() => setUnit(u.value)} className={`rounded-lg py-2 text-xs font-semibold transition-colors ${unit === u.value ? 'bg-[#D4AF37] text-white' : 'bg-card border border-border text-muted-foreground'}`}>
            {u.label.replace('Per ', '')}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="text-sm font-medium">
          {mode === 'weight' ? `Weight (${UNITS.find(u => u.value === unit)?.label})` : 'Amount (PKR)'}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={mode === 'weight' ? quantity : amount}
          onChange={(e) => mode === 'weight' ? setQuantity(e.target.value) : setAmount(e.target.value)}
          placeholder={mode === 'weight' ? 'Enter weight' : 'Enter amount in PKR'}
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
        />
      </div>

      {/* Result */}
      {mode === 'weight' && quantity && (
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-5">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold mt-1">Rs {formatPKR(totalValue)}</p>
          <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Per Gram:</span> Rs {formatPKR(convertFromTola(perTola, 'gram'))}</div>
            <div><span className="text-muted-foreground">Per Tola:</span> Rs {formatPKR(perTola)}</div>
            <div><span className="text-muted-foreground">Per 10g:</span> Rs {formatPKR(convertFromTola(perTola, '10gram'))}</div>
            <div><span className="text-muted-foreground">Per Ounce:</span> Rs {formatPKR(convertFromTola(perTola, 'ounce'))}</div>
          </div>
        </div>
      )}

      {mode === 'amount' && amount && (
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-5">
          <p className="text-sm text-muted-foreground">Equivalent Weight</p>
          <p className="text-3xl font-bold mt-1">{formatNumber(calculatedWeight, 4)} <span className="text-lg text-muted-foreground font-normal">{UNITS.find(u => u.value === unit)?.label.replace('Per ', '').toLowerCase()}</span></p>
          <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">In Grams:</span> {formatNumber(calculatedWeight * (unit === 'tola' ? 11.6638 : unit === '10gram' ? 10 : unit === 'ounce' ? 31.1035 : 1), 3)}g</div>
            <div><span className="text-muted-foreground">In Tola:</span> {formatNumber(calculatedWeight * (unit === 'gram' ? 1/11.6638 : unit === '10gram' ? 0.1 : unit === 'ounce' ? 1/2.6667 : 1), 4)}</div>
          </div>
        </div>
      )}
    </div>
  );
}