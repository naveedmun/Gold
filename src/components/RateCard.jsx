import React from 'react';

export default function RateCard({ name, unit, price, change, symbol }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
          {symbol ? symbol.substring(0, 2) : name.substring(0, 2)}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500">{unit}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">
          Rs <span className="text-xl">{price ? price.toLocaleString() : '---'}</span>
        </p>
        <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}% <span className="text-gray-400">today</span>
        </p>
      </div>
    </div>
  );
}
