import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LineChart, History, Calculator, Bell, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-xs">
            G
          </div>
          <h1 className="font-black text-base tracking-tight">GoldRate<span className="text-amber-500">PK</span></h1>
        </div>
        <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Fixed Bottom Container (Branding + Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        {/* BRANDING STRIP (Har Screen Ke Footer Par Dikhaye Gi) */}
        <div className="py-1 bg-amber-500/10 border-b border-amber-500/20 text-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            Developed by <span className="font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">MUN DEVELOPERS</span>
          </p>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="max-w-md mx-auto flex justify-around py-2">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink to="/charts" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <LineChart className="h-4 w-4" />
            Charts
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <History className="h-4 w-4" />
            History
          </NavLink>
          <NavLink to="/calc" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <Calculator className="h-4 w-4" />
            Calc
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <Bell className="h-4 w-4" />
            Alerts
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
