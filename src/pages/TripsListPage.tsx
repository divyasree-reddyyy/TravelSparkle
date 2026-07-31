import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Plus, MapPin, CalendarDays, Users, Wallet, Pencil, Trash2, ListChecks, Plane } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Trip } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button, Spinner, EmptyState } from '@/components/ui';

export default function TripsListPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('trips')
        .select('*, destination:destinations(*)')
        .order('created_at', { ascending: false });
      setTrips((data as Trip[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip and all its itinerary items?')) return;
    await supabase.from('trips').delete().eq('id', id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;

  const upcoming = trips.filter((t) => !t.start_date || new Date(t.start_date) >= new Date());
  const past = trips.filter((t) => t.start_date && new Date(t.start_date) < new Date());

  const renderTrip = (trip: Trip) => (
    <div key={trip.id} className="group p-5 rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-600 text-slate-900 text-lg">{trip.name}</h3>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
            {trip.destination && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.destination.title}</span>}
            {trip.start_date && <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(trip.start_date).toLocaleDateString()}{trip.end_date && ` → ${new Date(trip.end_date).toLocaleDateString()}`}</span>}
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.travelers}</span>
            <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> ${Number(trip.budget).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => navigate(`/dashboard/trips/${trip.id}/itinerary`)} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50" title="Itinerary"><ListChecks className="w-4 h-4" /></button>
          <button onClick={() => navigate(`/dashboard/trips/${trip.id}/edit`)} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => deleteTrip(trip.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <Link to={`/dashboard/trips/${trip.id}/itinerary`} className="inline-flex items-center gap-1 text-sm text-brand-600 font-600 mt-3 hover:gap-2 transition-all">
        View itinerary →
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-700 text-3xl text-slate-900">My trips</h1>
          <p className="text-slate-500 mt-1">{trips.length} trip{trips.length !== 1 && 's'} total</p>
        </div>
        <Button onClick={() => navigate('/dashboard/trips/new')}><Plus className="w-4 h-4" /> New trip</Button>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={<Plane className="w-12 h-12" />}
          title="No trips yet"
          description="Create your first trip and start building an itinerary."
          action={<Button onClick={() => navigate('/dashboard/trips/new')}><Plus className="w-4 h-4" /> Create trip</Button>}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-600 text-slate-700 mb-3">Upcoming</h2>
              <div className="space-y-4">{upcoming.map(renderTrip)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-600 text-slate-700 mb-3">Past trips</h2>
              <div className="space-y-4">{past.map(renderTrip)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
