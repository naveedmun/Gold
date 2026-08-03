import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home as HomeIcon, LineChart, Calendar, Calculator, Bell, Settings as SettingsIcon } from 'lucide-react';
import { SettingsProvider } from '@/lib/SettingsContext';

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/charts', icon: LineChart, label: 'Charts' },
  { to: '/history', icon: Calendar, label: 'History' },
  { to: '/calculator', icon: Calculator, label: 'Calc' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

export default function Layout() {
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-sm">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">
                GoldRate<span className="text-[#D4AF37]">PK</span>
              </span>
            </Link>
            <Link to="/settings" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <SettingsIcon className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4 pb-24">
          <Outlet />
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="mx-auto max-w-2xl flex items-center justify-around px-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-muted-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </SettingsProvider>
  );
}