import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LATEST_RATES, formatCurrency, getUsdSubtext } from '@/lib/conversions';

export default function Calculator() {
  const { currency = 'PKR' } = useOutletContext() || {};
  const [metal, setMetal] = useState('gold');
  const [mode, setMode] = useState('weightToValue');
  const [unit, setUnit] = useState('tola');
  const [inputValue, setInputValue] = useState('');

  const currentRatePerTola = metal === 'gold' ? LATEST_RATES.gold : LATEST_RATES.silver;

  const getFactor = (selectedUnit) => {
    switch (selectedUnit) {
      case 'gram':
        return 1 / 11.6638;
      case 'tenGram':
        return 10 / 11.6638;
      case 'tola':
        return 1;
      case 'ounce':
        return 31.1035 / 11.6638;
      default:
        return 1;
    }
  };

  const calculateResult = () => {
    const val = parseFloat(inputValue);
    if (!val || isNaN(val)) return 0;

    const factor = getFactor(unit);
    const pricePerUnit = currentRatePerTola * factor;

    if (mode === 'weightToValue') {
      return val * pricePerUnit; // Total price in PKR
    } else {
      // Input is in active currency, convert back to PKR if needed
      const amountInPKR = currency === 'USD' ? val * LATEST_RATES.usdPkr : val;
      return amountInPKR / pricePerUnit; // Weight in chosen unit
    }
  };

  const result = calculateResult();

  return (
    <div className="space-y-4 max-w-xl mx-auto p-4 pb-6">
      <div>
        <h2 className="text-xl font-black text-foreground">Calculator</h2>
        <p className="text-xs text-muted-foreground">Calculate gold & silver value quickly</p>
      </div>

      {/* Metal Selection */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setMetal('gold')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            metal === 'gold' ? 'bg-amber-500 text-black shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Gold
        </button>
        <button
          onClick={() => setMetal('silver')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            metal === 'silver' ? 'bg-slate-400 text-black shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Silver
        </button>
      </div>

      {/* Current Rate Card */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <p className="text-xs text-muted-foreground">Current {metal} rate</p>
        <p className="text-xl font-extrabold text-foreground mt-0.5">
          {formatCurrency(currentRatePerTola, currency)}{' '}
          <span className="text-xs font-normal text-muted-foreground">/ Tola</span>
        </p>
        {getUsdSubtext(currentRatePerTola, currency) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {getUsdSubtext(currentRatePerTola, currency)}
          </p>
        )}
      </div>

      {/* Calculation Mode */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setMode('weightToValue')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'weightToValue' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Weight → Value
        </button>
        <button
          onClick={() => setMode('valueToWeight')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'valueToWeight' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Value → Weight
        </button>
      </div>

      {/* Unit Selection */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-xl">
        {['gram', 'tenGram', 'tola', 'ounce'].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize ${
              unit === u ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'text-muted-foreground'
            }`}
          >
            {u === 'tenGram' ? '10 Gram' : u}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground">
          {mode === 'weightToValue' 
            ? `Weight (${unit.toUpperCase()})` 
            : `Amount (${currency === 'USD' ? 'USD $' : 'PKR Rs'})`}
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            mode === 'weightToValue' 
              ? 'Enter weight' 
              : `Enter amount in ${currency === 'USD' ? 'USD' : 'PKR'}`
          }
          className="w-full p-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      {/* Calculation Output */}
      {inputValue && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-center space-y-1">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Estimated Total</p>
          <div className="text-2xl font-black text-foreground">
            {mode === 'weightToValue' ? (
              <>
                <p>{formatCurrency(result, currency)}</p>
                {getUsdSubtext(result, currency) && (
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    {getUsdSubtext(result, currency)}
                  </p>
                )}
              </>
            ) : (
              <p>{result.toFixed(4)} {unit.toUpperCase()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
