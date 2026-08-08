import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LATEST_RATES, formatCurrency, getUsdSubtext } from '@/lib/conversions';

export default function Calculator() {
  const { currency = 'PKR' } = useOutletContext() || {};
  const [metal, setMetal] = useState('gold'); // 'gold' | 'silver'
  const [mode, setMode] = useState('weightToValue'); // 'weightToValue' | 'valueToWeight'
  const [unit, setUnit] = useState('tola'); // 'gram' | 'tenGram' | 'tola' | 'ounce'
  const [inputValue, setInputValue] = useState('');

  // Synchronized rates
  const DEFAULT_GOLD_TOLA = LATEST_RATES?.gold || 454300;
  const DEFAULT_SILVER_TOLA = LATEST_RATES?.silver || 6940;
  const USD_RATE = LATEST_RATES?.usdPkr || 285;

  const currentRatePerTola = metal === 'gold' ? DEFAULT_GOLD_TOLA : DEFAULT_SILVER_TOLA;

  // Conversions relative to 1 Tola (11.6638 grams)
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
      // Return total price in PKR base
      return val * pricePerUnit;
    } else {
      // Convert entered amount to PKR if input is in USD
      const amountInPKR = currency === 'USD' ? val * USD_RATE : val;
      return amountInPKR / pricePerUnit;
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
          {formatCurrency(currentRatePerTola, currency, USD_RATE)}{' '}
          <span className="text-xs font-normal text-muted-foreground">/ Tola</span>
        </p>
        {getUsdSubtext(currentRatePerTola, currency, USD_RATE) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {getUsdSubtext(currentRatePerTola, currency, USD_RATE)}
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
                <p>{formatCurrency(result, currency, USD_RATE)}</p>
                {getUsdSubtext(result, currency, USD_RATE) && (
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    {getUsdSubtext(result, currency, USD_RATE)}
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
