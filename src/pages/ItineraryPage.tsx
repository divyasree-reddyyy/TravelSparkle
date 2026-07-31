import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, CalendarDays, Users, Wallet, MapPin, ArrowRight, ListChecks } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Trip, ItineraryItem, ItineraryCategory } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button, Spinner, EmptyState, Alert } from '@/components/ui';

const categoryMeta: Record<ItineraryCategory, { label: string; color: string; icon: string }> = {
  hotel: { label: 'Stay', color: 'bg-violet-100 text-violet-700', icon: '🏨' },
  food: { label: 'Food', color: 'bg-orange-100 text-orange-700', icon: '🍽️' },
  transport: { label: 'Transport', color: 'bg-sky-100 text-sky-700', icon: '🚗' },
  sightseeing: { label: 'Sightseeing', color: 'bg-emerald-100 text-emerald-700', icon: '🏛️' },
  notes: { label: 'Notes', color: 'bg-amber-100 text-amber-700', icon: '📝' },
};

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [day, setDay] = useState('1');
  const [category, setCategory] = useState<ItineraryCategory>('sightseeing');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      const { data: tripData } = await supabase
        .from('trips')
        .select('*, destination:destinations(*)')
        .eq('id', tripId)
        .maybeSingle();
      setTrip(tripData as Trip | null);

      const { data: itemData } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('created_at', { ascending: true });
      setItems((itemData as ItineraryItem[]) ?? []);
      setLoading(false);
    })();
  }, [tripId]);

  const grouped = items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    (acc[item.day_number] ??= []).push(item);
    return acc;
  }, {});
  const days = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const totalCost = items.reduce((sum, i) => sum + Number(i.cost), 0);

  const resetForm = () => {
    setEditingId(null);
    setDay('1');
    setCategory('sightseeing');
    setTitle('');
    setDesc('');
    setCost('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !title.trim()) return;
    setSaving(true);
    setError(null);
    const payload = {
      trip_id: tripId,
      day_number: Number(day) || 1,
      category,
      title: title.trim(),
      description: desc.trim(),
      cost: Number(cost) || 0,
    };
    if (editingId) {
      const { error } = await supabase.from('itinerary_items').update(payload).eq('id', editingId);
      if (error) { setError(error.message); setSaving(false); return; }
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...payload } : i)));
    } else {
      const { data, error } = await supabase.from('itinerary_items').insert(payload).select('*').single();
      if (error) { setError(error.message); setSaving(false); return; }
      setItems((prev) => [...prev, data as ItineraryItem]);
    }
    resetForm();
    setSaving(false);
  };

  const handleEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setDay(String(item.day_number));
    setCategory(item.category);
    setTitle(item.title);
    setDesc(item.description);
    setCost(String(item.cost));
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    await supabase.from('itinerary_items').delete().eq('id', itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;
  if (!trip) return <EmptyState title="Trip not found" action={<Link to="/dashboard/trips" className="text-brand-600 font-600">Back to trips</Link>} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate('/dashboard/trips')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowRight className="w-4 h-4 rotate-180" /> Back to trips
      </button>

      {/* Trip header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white mb-6">
        <h1 className="font-display font-700 text-2xl mb-3">{trip.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-brand-100">
          {trip.destination && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination.title}</span>}
          {trip.start_date && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {new Date(trip.start_date).toLocaleDateString()}{trip.end_date && ` → ${new Date(trip.end_date).toLocaleDateString()}`}</span>}
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {trip.travelers} traveler{trip.travelers !== 1 && 's'}</span>
          <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> ${Number(trip.budget).toLocaleString()}</span>
        </div>
      </div>

      {/* Budget summary */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white shadow-card mb-6">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-leaf-50 text-leaf-600"><ListChecks className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-500">Itinerary spend</p>
            <p className="font-600 text-lg text-slate-900">${totalCost.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Trip budget</p>
          <p className={`font-600 text-lg ${totalCost > Number(trip.budget) ? 'text-red-600' : 'text-leaf-600'}`}>${Number(trip.budget).toLocaleString()}</p>
        </div>
      </div>

      {/* Add/edit form */}
      {showForm ? (
        <div className="p-6 rounded-2xl bg-white shadow-card mb-6 animate-scale-in">
          <h3 className="font-600 text-slate-900 mb-4">{editingId ? 'Edit activity' : 'Add activity'}</h3>
          {error && <div className="mb-3"><Alert type="error">{error}</Alert></div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="block">
                <span className="block mb-1 text-xs font-500 text-slate-600">Day</span>
                <input type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </label>
              <label className="block">
                <span className="block mb-1 text-xs font-500 text-slate-600">Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as ItineraryCategory)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500">
                  {(Object.keys(categoryMeta) as ItineraryCategory[]).map((c) => (
                    <option key={c} value={c}>{categoryMeta[c].label}</option>
                  ))}
                </select>
              </label>
              <label className="block col-span-2">
                <span className="block mb-1 text-xs font-500 text-slate-600">Cost ($)</span>
                <input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </label>
            </div>
            <label className="block">
              <span className="block mb-1 text-xs font-500 text-slate-600">Title</span>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunrise hike to Eagle Peak" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            </label>
            <label className="block">
              <span className="block mb-1 text-xs font-500 text-slate-600">Description</span>
              <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional details..." className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? 'Save' : 'Add activity'}</Button>
            </div>
          </form>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-6 w-full" variant="outline">
          <Plus className="w-4 h-4" /> Add activity
        </Button>
      )}

      {/* Itinerary by day */}
      {days.length === 0 ? (
        <EmptyState icon={<ListChecks className="w-12 h-12" />} title="No activities yet" description="Add your first activity to start building your day-by-day itinerary." />
      ) : (
        <div className="space-y-6">
          {days.map((d) => (
            <div key={d}>
              <h3 className="font-display font-600 text-lg text-slate-900 mb-3 flex items-center gap-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-100 text-brand-700 text-sm font-700">{d}</span>
                Day {d}
              </h3>
              <div className="space-y-3">
                {grouped[d].map((item) => {
                  const meta = categoryMeta[item.category];
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl bg-white shadow-card group">
                      <span className={`grid place-items-center w-9 h-9 rounded-lg text-lg shrink-0 ${meta.color}`}>{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-600 text-slate-900">{item.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-500 ${meta.color}`}>{meta.label}</span>
                        </div>
                        {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
                        {Number(item.cost) > 0 && <p className="text-sm font-600 text-leaf-600 mt-1">${Number(item.cost).toLocaleString()}</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
