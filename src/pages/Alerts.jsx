import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { formatPKR } from '@/lib/conversions';

const STORAGE_KEY = 'gold_rates_price_alerts';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    metal: 'gold',
    direction: 'above',
    target_price: '',
  });

  // Load alerts from browser storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save alerts
  const saveAlerts = (updatedAlerts) => {
    setAlerts(updatedAlerts);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedAlerts)
    );
  };

  // Create alert
  const createAlert = () => {
    const price = Number(form.target_price);

    if (!price || price <= 0) {
      return;
    }

    const newAlert = {
      id: Date.now().toString(),
      metal: form.metal,
      direction: form.direction,
      target_price: price,
      active: true,
      triggered: false,
      created_at: new Date().toISOString(),
    };

    saveAlerts([newAlert, ...alerts]);

    setForm({
      metal: 'gold',
      direction: 'above',
      target_price: '',
    });

    setShowForm(false);
  };

  // Enable / disable alert
  const toggleAlert = (alertId) => {
    const updated = alerts.map((alert) =>
      alert.id === alertId
        ? {
            ...alert,
            active: !alert.active,
          }
        : alert
    );

    saveAlerts(updated);
  };

  // Delete alert
  const deleteAlert = (alertId) => {
    const updated = alerts.filter(
      (alert) => alert.id !== alertId
    );

    saveAlerts(updated);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Price Alerts
          </h1>

          <p className="text-sm text-muted-foreground">
            Set alerts for Gold and Silver prices
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-lg shadow-[#D4AF37]/20"
          title="Create Price Alert"
        >
          {showForm ? (
            <X className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">

          {/* Metal */}
          <div>
            <label className="text-sm font-medium">
              Metal
            </label>

            <div className="grid grid-cols-2 gap-2 mt-2">

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    metal: 'gold',
                  })
                }
                className={`rounded-lg py-2.5 text-sm font-semibold ${
                  form.metal === 'gold'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-background border border-border'
                }`}
              >
                Gold
              </button>

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    metal: 'silver',
                  })
                }
                className={`rounded-lg py-2.5 text-sm font-semibold ${
                  form.metal === 'silver'
                    ? 'bg-[#C0C0C0] text-white'
                    : 'bg-background border border-border'
                }`}
              >
                Silver
              </button>

            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="text-sm font-medium">
              Alert When Price Goes
            </label>

            <div className="grid grid-cols-2 gap-2 mt-2">

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    direction: 'above',
                  })
                }
                className={`rounded-lg py-2.5 text-sm font-semibold ${
                  form.direction === 'above'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border'
                }`}
              >
                Above ↑
              </button>

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    direction: 'below',
                  })
                }
                className={`rounded-lg py-2.5 text-sm font-semibold ${
                  form.direction === 'below'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border'
                }`}
              >
                Below ↓
              </button>

            </div>
          </div>

          {/* Target Price */}
          <div>
            <label className="text-sm font-medium">
              Target Price (PKR per Tola)
            </label>

            <input
              type="number"
              value={form.target_price}
              onChange={(e) =>
                setForm({
                  ...form,
                  target_price: e.target.value,
                })
              }
              placeholder="e.g. 250000"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
            />
          </div>

          {/* Create */}
          <button
            onClick={createAlert}
            className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] py-3 text-white font-semibold shadow-lg shadow-[#D4AF37]/20"
          >
            Create Alert
          </button>

        </div>
      )}

      {/* Alerts */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : alerts.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-border p-8 text-center">

          <Bell className="h-10 w-10 mx-auto text-muted-foreground/50" />

          <p className="mt-3 text-sm text-muted-foreground">
            No alerts yet. Create one to get started.
          </p>

        </div>

      ) : (

        <div className="space-y-2">

          {alerts.map((alert) => (

            <div
              key={alert.id}
              className={`rounded-2xl border p-4 ${
                alert.active
                  ? 'border-border bg-card'
                  : 'border-border bg-muted/30 opacity-60'
              }`}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      alert.metal === 'gold'
                        ? 'bg-[#D4AF37]'
                        : 'bg-[#C0C0C0]'
                    }`}
                  >
                    <Bell className="h-4 w-4 text-white" />
                  </div>

                  <div>

                    <p className="font-semibold text-sm">
                      {alert.metal === 'gold'
                        ? 'Gold'
                        : 'Silver'}{' '}
                      {alert.direction === 'above'
                        ? '↑'
                        : '↓'}{' '}
                      Rs {formatPKR(alert.target_price)}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {alert.metal} per Tola ·{' '}
                      {alert.direction === 'above'
                        ? 'Above'
                        : 'Below'}{' '}
                      Rs {formatPKR(alert.target_price)}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-1">

                  {/* Toggle */}
                  <button
                    onClick={() =>
                      toggleAlert(alert.id)
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      alert.active
                        ? 'bg-[#D4AF37]'
                        : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        alert.active
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      deleteAlert(alert.id)
                    }
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}
