import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Wallet, ArrowLeft, CalendarPlus, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination, Review } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { FavoriteButton } from '@/components/DestinationCard';
import { Spinner, EmptyState, Button, Textarea } from '@/components/ui';

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setDestination(data as Destination | null);

      const { data: revData } = await supabase
        .from('reviews')
        .select('id, user_id, destination_id, rating, comment, created_at, profiles!inner(display_name)')
        .eq('destination_id', id)
        .order('created_at', { ascending: false });
      setReviews((revData as unknown as Review[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !id) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('reviews')
      .insert({ destination_id: id, rating, comment: comment.trim() })
      .select('id, user_id, destination_id, rating, comment, created_at, profiles!inner(display_name)')
      .single();
    if (data) {
      setReviews((prev) => [data as unknown as Review, ...prev]);
      setComment('');
      setRating(5);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;
  if (!destination) return <EmptyState title="Destination not found" description="This place may have been removed." action={<Link to="/destinations" className="text-brand-600 font-600">Back to destinations</Link>} />;

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <img src={destination.image_url} alt={destination.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link to="/destinations" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to destinations
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-600 capitalize bg-white/20 text-white backdrop-blur mb-3">{destination.category}</span>
                <h1 className="font-display font-700 text-3xl sm:text-4xl text-white mb-2">{destination.title}</h1>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {destination.country}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {destination.rating.toFixed(1)}</span>
                </div>
              </div>
              <FavoriteButton destinationId={destination.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Clock, label: 'Duration', value: `${destination.duration_days} days` },
            { icon: Wallet, label: 'Estimated budget', value: `$${destination.estimated_budget.toLocaleString()}` },
            { icon: Star, label: 'Rating', value: `${destination.rating.toFixed(1)} / 5` },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-card">
              <div className="grid place-items-center w-11 h-11 rounded-xl bg-brand-50 text-brand-600"><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="font-600 text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-10">
          <h2 className="font-display font-600 text-2xl text-slate-900 mb-3">About this destination</h2>
          <p className="text-slate-600 leading-relaxed text-lg">{destination.description}</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-leaf-50 border border-brand-100 mb-12">
          <div className="flex-1">
            <h3 className="font-display font-600 text-lg text-slate-900 mb-1">Ready to visit {destination.title}?</h3>
            <p className="text-sm text-slate-600">Create a trip and start building your itinerary today.</p>
          </div>
          <Button onClick={() => navigate(session ? `/dashboard/trips/new?destination=${destination.id}` : '/login')} size="lg">
            <CalendarPlus className="w-4 h-4" /> Plan this trip
          </Button>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="font-display font-600 text-2xl text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-600" /> Reviews ({reviews.length})
          </h2>

          {session ? (
            <form onSubmit={submitReview} className="p-5 rounded-2xl bg-white shadow-card mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-500 text-slate-700">Your rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="mb-3"
              />
              <Button type="submit" loading={submitting} size="sm">Post review</Button>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 text-center mb-6">
              <p className="text-sm text-slate-600"><Link to="/login" className="text-brand-600 font-600">Sign in</Link> to leave a review.</p>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-5 rounded-2xl bg-white shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-600 text-sm">
                        {(r.profile?.display_name ?? 'A').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-600 text-slate-900 text-sm">{r.profile?.display_name ?? 'Anonymous'}</p>
                        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
