import React from 'react';
import { Moon, Sun, RefreshCw, Star } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
];

export default function Settings() {
  const { theme, setTheme, autoRefresh, setAutoRefresh, favoriteMetal, setFavoriteMetal } = useSettings();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your experience</p>
      </div>

      {/* Theme */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Appearance</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-[#D4AF37] text-white' : 'bg-background border border-border'}`}>
            <Sun className="h-4 w-4" /> Light
          </button>
          <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-[#D4AF37] text-white' : 'bg-background border border-border'}`}>
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      </div>

      {/* Auto refresh */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-4 w-4 text-[#D4AF37]" />
          <p className="text-sm font-semibold">Auto Refresh</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REFRESH_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setAutoRefresh(opt.value)} className={`rounded-xl py-2.5 text-sm font-medium transition-colors ${autoRefresh === opt.value ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Favorite metal */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-[#D4AF37]" />
          <p className="text-sm font-semibold">Favorite Metal</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setFavoriteMetal('gold')} className={`rounded-xl py-3 text-sm font-medium transition-colors ${favoriteMetal === 'gold' ? 'bg-[#D4AF37] text-white' : 'bg-background border border-border'}`}>Gold</button>
          <button onClick={() => setFavoriteMetal('silver')} className={`rounded-xl py-3 text-sm font-medium transition-colors ${favoriteMetal === 'silver' ? 'bg-[#C0C0C0] text-white' : 'bg-background border border-border'}`}>Silver</button>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-border bg-card p-4 text-center">
        <p className="text-sm font-semibold">GoldRate PK</p>
        <p className="text-xs text-muted-foreground mt-1">Live precious metal rates in PKR per Tola</p>
      </div>
    </div>
  );
}
