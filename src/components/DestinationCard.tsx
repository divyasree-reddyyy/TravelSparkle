import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Wallet, Heart } from 'lucide-react';
import type { Destination } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const categoryStyles: Record<string, string> = {
  beach: 'bg-sky-100 text-sky-700',
  mountain: 'bg-emerald-100 text-emerald-700',
  city: 'bg-violet-100 text-violet-700',
  adventure: 'bg-orange-100 text-orange-700',
  spiritual: 'bg-amber-100 text-amber-700',
  island: 'bg-teal-100 text-teal-700',
};

export function FavoriteButton({ destinationId, compact = false }: { destinationId: string; compact?: boolean }) {
  const { session } = useAuth();
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('destination_id', destinationId)
        .maybeSingle();
      if (active) setFav(!!data);
    })();
    return () => { active = false; };
  }, [session, destinationId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || loading) return;
    setLoading(true);
    if (fav) {
      await supabase.from('favorites').delete().eq('destination_id', destinationId);
      setFav(false);
    } else {
      await supabase.from('favorites').insert({ destination_id: destinationId });
      setFav(true);
    }
    setLoading(false);
  };

  if (!session) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`grid place-items-center rounded-full transition-all ${
        compact ? 'w-8 h-8' : 'w-9 h-9'
      } ${fav ? 'bg-white text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500'} backdrop-blur shadow-sm hover:scale-110`}
      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`w-4 h-4 ${fav ? 'fill-red-500' : ''}`} />
    </button>
  );
}

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to={`/destinations/${destination.id}`}
      className="group relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={destination.image_url}
          alt={destination.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-600 capitalize ${categoryStyles[destination.category] ?? 'bg-slate-100 text-slate-700'}`}>
          {destination.category}
        </span>
        {destination.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-600 bg-accent-500 text-white shadow">
            Featured
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-500 drop-shadow">{destination.country}</span>
        </div>
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="absolute bottom-3 right-3">
          <FavoriteButton destinationId={destination.id} compact />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-600 text-lg text-slate-900 leading-snug group-hover:text-brand-700 transition-colors">
            {destination.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-amber-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-600 text-slate-700">{destination.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {destination.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-500">{destination.duration_days} days</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-900">
            <Wallet className="w-4 h-4 text-leaf-600" />
            <span className="text-sm font-600">${destination.estimated_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
