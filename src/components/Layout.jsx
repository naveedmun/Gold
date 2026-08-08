import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LineChart, History, Calculator, Bell, Settings, X, Moon, Sun, Coins, Scale } from 'lucide-react';

export default function Layout() {
  const [currency, setCurrency] = useState('PKR'); // 'PKR' | 'USD'
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [defaultMetal, setDefaultMetal] = useState('gold'); // 'gold' | 'silver'
  const [defaultUnit, setDefaultUnit] = useState('tola'); // 'tola' | 'gram' | '10gram' | 'ounce'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply Dark/Light Theme to Document Body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-xs">
            G
          </div>
          <h1 className="font-black text-base tracking-tight">
            GoldRate<span className="text-amber-500">PK</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Page Quick Currency Toggle */}
          <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border">
            <button
              onClick={() => setCurrency('PKR')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                currency === 'PKR' 
                  ? 'bg-amber-500 text-black shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PKR (Rs)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                currency === 'USD' 
                  ? 'bg-amber-500 text-black shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Settings Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            title="App Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 pb-28">
        <Outlet context={{ currency, setCurrency, defaultMetal, defaultUnit }} />
      </main>

      {/* Fixed Bottom Container (Branding + Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg">
        {/* PROMINENT BRANDING STRIP */}
        <div className="py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/20 text-center">
          <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1.5">
            <span>Developed by</span>
            <span className="text-sm font-black text-foreground tracking-wider bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent uppercase">
              MUN DEVELOPERS
            </span>
          </p>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="max-w-md mx-auto flex justify-around py-2">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink to="/charts" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            <LineChart className="h-4 w-4" />
            Charts
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            <History className="h-4 w-4" />
            History
          </NavLink>
          <NavLink to="/calculator" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            <Calculator className="h-4 w-4" />
            Calc
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
            <Bell className="h-4 w-4" />
            Alerts
          </NavLink>
        </nav>
      </div>

      {/* FULL APP SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground text-base">App Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />} App Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    theme === 'dark' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-muted/30 text-foreground'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark Mode
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    theme === 'light' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-muted/30 text-foreground'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light Mode
                </button>
              </div>
            </div>

            {/* 2. Default Preferred Metal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Preferred Metal
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDefaultMetal('gold')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    defaultMetal === 'gold' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-muted/30 text-foreground'
                  }`}
                >
                  🥇 Gold First
                </button>
                <button
                  onClick={() => setDefaultMetal('silver')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    defaultMetal === 'silver' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-muted/30 text-foreground'
                  }`}
                >
                  🥈 Silver First
                </button>
              </div>
            </div>

            {/* 3. Default Weight Unit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Preferred Unit
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['tola', 'gram', '10gram', 'ounce'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setDefaultUnit(u)}
                    className={`py-2 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                      defaultUnit === u ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    {u === '10gram' ? '10 Gram' : u}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl shadow-md hover:bg-amber-400 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
