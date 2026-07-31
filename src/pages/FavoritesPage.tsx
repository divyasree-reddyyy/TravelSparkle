import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination } from '@/types';
import { useAuth } from '@/context/AuthContext';
import DestinationCard from '@/components/DestinationCard';
import { Spinner, EmptyState } from '@/components/ui';

export default function FavoritesPage() {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('destination:destinations(*)')
        .order('created_at', { ascending: false });
      setFavorites((data?.map((f: any) => f.destination) as Destination[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-700 text-3xl text-slate-900 mb-2">Saved destinations</h1>
      <p className="text-slate-500 mb-8">{favorites.length} saved destination{favorites.length !== 1 && 's'}</p>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="No saved destinations"
          description="Tap the heart icon on any destination to save it here."
          action={<Link to="/destinations" className="text-brand-600 font-600">Browse destinations</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((d) => d && <DestinationCard key={d.id} destination={d} />)}
        </div>
      )}
    </div>
  );
}
