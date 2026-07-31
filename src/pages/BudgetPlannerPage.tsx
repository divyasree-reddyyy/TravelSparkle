import { useEffect, useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Trip, ItineraryItem, ItineraryCategory } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Spinner, EmptyState, Select } from '@/components/ui';

const categoryColors: Record<ItineraryCategory, string> = {
  hotel: 'bg-violet-500',
  food: 'bg-orange-500',
  transport: 'bg-sky-500',
  sightseeing: 'bg-emerald-500',
  notes: 'bg-amber-500',
};
const categoryLabels: Record<ItineraryCategory, string> = {
  hotel: 'Stay',
  food: 'Food',
  transport: 'Transport',
  sightseeing: 'Activities',
  notes: 'Miscellaneous',
};

export default function BudgetPlannerPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<string>('');

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
      setTrips((data as Trip[]) ?? []);
      if (data && data.length > 0) setSelectedTrip(data[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedTrip) return;
    (async () => {
      const { data } = await supabase.from('itinerary_items').select('*').eq('trip_id', selectedTrip);
      setItems((data as ItineraryItem[]) ?? []);
    })();
  }, [selectedTrip]);

  const breakdown = useMemo(() => {
    const cats: ItineraryCategory[] = ['hotel', 'food', 'transport', 'sightseeing', 'notes'];
    const totals = cats.map((c) => ({
      category: c,
      label: categoryLabels[c],
      amount: items.filter((i) => i.category === c).reduce((s, i) => s + Number(i.cost), 0),
    }));
    const total = totals.reduce((s, t) => s + t.amount, 0);
    return { totals, total };
  }, [items]);

  const trip = trips.find((t) => t.id === selectedTrip);
  const budget = trip ? Number(trip.budget) : 0;
  const remaining = budget - breakdown.total;
  const overBudget = remaining < 0;

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-700 text-3xl text-slate-900 mb-2">Budget planner</h1>
      <p className="text-slate-500 mb-8">Track spending across categories for any of your trips</p>

      {trips.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-12 h-12" />}
          title="No trips to budget"
          description="Create a trip first, then add itinerary items with costs to see your budget breakdown."
        />
      ) : (
        <>
          <div className="mb-6">
            <Select value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)}>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white shadow-card">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mb-3"><Wallet className="w-5 h-5" /></div>
              <p className="text-2xl font-display font-700 text-slate-900">${budget.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Trip budget</p>
            </div>
            <div className="p-5 rounded-2xl bg-white shadow-card">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-50 text-leaf-600 mb-3"><PieChart className="w-5 h-5" /></div>
              <p className="text-2xl font-display font-700 text-slate-900">${breakdown.total.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total spent</p>
            </div>
            <div className={`p-5 rounded-2xl bg-white shadow-card ${overBudget ? 'ring-2 ring-red-200' : ''}`}>
              <div className={`grid place-items-center w-10 h-10 rounded-xl mb-3 ${overBudget ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {overBudget ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
              <p className={`text-2xl font-display font-700 ${overBudget ? 'text-red-600' : 'text-leaf-600'}`}>${Math.abs(remaining).toLocaleString()}</p>
              <p className="text-sm text-slate-500">{overBudget ? 'Over budget' : 'Remaining'}</p>
            </div>
          </div>

          {/* Progress bar */}
          {budget > 0 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Budget used</span>
                <span className={`font-600 ${overBudget ? 'text-red-600' : 'text-slate-900'}`}>{Math.min(100, Math.round((breakdown.total / budget) * 100))}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overBudget ? 'bg-red-500' : 'bg-leaf-500'}`}
                  style={{ width: `${Math.min(100, (breakdown.total / budget) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-display font-600 text-lg text-slate-900 mb-5">Category breakdown</h2>
            {breakdown.total === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No costs added yet. Add activities with costs to your itinerary to see the breakdown.</p>
            ) : (
              <div className="space-y-4">
                {breakdown.totals.filter((t) => t.amount > 0).map((t) => {
                  const pct = breakdown.total > 0 ? (t.amount / breakdown.total) * 100 : 0;
                  return (
                    <div key={t.category}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-500 text-slate-700">{t.label}</span>
                        <span className="font-600 text-slate-900">${t.amount.toLocaleString()} <span className="text-slate-400 font-400">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${categoryColors[t.category]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="font-600 text-slate-900">Total</span>
                  <span className="font-700 text-slate-900 text-lg">${breakdown.total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
