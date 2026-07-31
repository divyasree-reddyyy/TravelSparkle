import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Plus, MapPin, CalendarDays, Users, Wallet, Pencil, Trash2, ListChecks, ArrowRight, Heart, LayoutDashboard, Plane } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Trip, Favorite, Destination } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button, Spinner, EmptyState } from '@/components/ui';

export default function DashboardPage() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    (async () => {
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*, destination:destinations(*)')
        .order('created_at', { ascending: false });
      setTrips((tripsData as Trip[]) ?? []);

      const { data: favData } = await supabase
        .from('favorites')
        .select('id, user_id, destination_id, created_at, destination:destinations(*)')
        .order('created_at', { ascending: false });
      setFavorites((favData as unknown as Favorite[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip and all its itinerary items?')) return;
    await supabase.from('trips').delete().eq('id', id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const removeFav = async (id: string) => {
    await supabase.from('favorites').delete().eq('id', id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;

  const upcoming = trips.filter((t) => !t.start_date || new Date(t.start_date) >= new Date());
  const past = trips.filter((t) => t.start_date && new Date(t.start_date) < new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-700 text-3xl text-slate-900">Welcome back, {profile?.display_name?.split(' ')[0] ?? 'traveler'}</h1>
          <p className="text-slate-500 mt-1">Here's a snapshot of your travel plans</p>
        </div>
        <Button onClick={() => navigate('/dashboard/trips/new')} size="lg">
          <Plus className="w-4 h-4" /> New trip
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Plane, label: 'Total trips', value: trips.length, color: 'bg-brand-50 text-brand-600' },
          { icon: CalendarDays, label: 'Upcoming', value: upcoming.length, color: 'bg-leaf-50 text-leaf-600' },
          { icon: Heart, label: 'Favorites', value: favorites.length, color: 'bg-red-50 text-red-500' },
          { icon: Wallet, label: 'Budget planned', value: `$${trips.reduce((s, t) => s + Number(t.budget), 0).toLocaleString()}`, color: 'bg-accent-50 text-accent-600' },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white shadow-card">
            <div className={`grid place-items-center w-10 h-10 rounded-xl mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-display font-700 text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-xl text-slate-900">Your trips</h2>
            <Link to="/dashboard/trips" className="text-sm text-brand-600 font-600 hover:underline">View all</Link>
          </div>

          {trips.length === 0 ? (
            <EmptyState
              icon={<Plane className="w-12 h-12" />}
              title="No trips yet"
              description="Create your first trip and start building an itinerary."
              action={<Button onClick={() => navigate('/dashboard/trips/new')}><Plus className="w-4 h-4" /> Create trip</Button>}
            />
          ) : (
            <div className="space-y-4">
              {[...upcoming, ...past].slice(0, 4).map((trip) => (
                <div key={trip.id} className="group p-5 rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-600 text-slate-900 text-lg">{trip.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                        {trip.destination && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.destination.title}</span>}
                        {trip.start_date && <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(trip.start_date).toLocaleDateString()}</span>}
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
                    View itinerary <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div>
          <h2 className="font-display font-600 text-xl text-slate-900 mb-4">Favorite destinations</h2>
          {favorites.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white shadow-card text-center">
              <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-3">No favorites yet.</p>
              <Link to="/destinations" className="text-sm text-brand-600 font-600">Browse destinations</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.slice(0, 5).map((fav) => (
                <div key={fav.id} className="group flex items-center gap-3 p-3 rounded-xl bg-white shadow-card">
                  <img src={fav.destination?.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/destinations/${fav.destination_id}`} className="font-600 text-slate-900 text-sm hover:text-brand-600 line-clamp-1">{fav.destination?.title}</Link>
                    <p className="text-xs text-slate-500">{fav.destination?.country}</p>
                  </div>
                  <button onClick={() => removeFav(fav.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
