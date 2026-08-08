import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LineChart, History, Calculator, Bell, Settings, X, Globe } from 'lucide-react';

export default function Layout() {
  const [currency, setCurrency] = useState('PKR'); // 'PKR' | 'USD'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-xs">
            G
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="font-black text-base tracking-tight">
              GoldRate<span className="text-amber-500">PK</span>
            </h1>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              {currency}
            </span>
          </div>
        </div>

        {/* Working Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 pb-28">
        <Outlet context={{ currency, setCurrency }} />
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

      {/* SETTINGS POPUP MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground text-base">Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Select Display Currency
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setCurrency('PKR'); setIsSettingsOpen(false); }}
                  className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all ${
                    currency === 'PKR' 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                      : 'border-border bg-muted/30 text-foreground hover:bg-muted'
                  }`}
                >
                  <span>Pakistani Rupee</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">PKR</span>
                </button>

                <button
                  onClick={() => { setCurrency('USD'); setIsSettingsOpen(false); }}
                  className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all ${
                    currency === 'USD' 
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                      : 'border-border bg-muted/30 text-foreground hover:bg-muted'
                  }`}
                >
                  <span>US Dollar</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">USD ($)</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-xl">
              💡 Selecting USD option allows international users to track prices in US Dollars.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
