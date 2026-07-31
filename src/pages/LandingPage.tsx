import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ArrowRight, Compass, Calendar, Wallet, Heart, Plane, Sparkles, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination } from '@/types';
import DestinationCard from '@/components/DestinationCard';
import { Spinner } from '@/components/ui';

export default function LandingPage() {
  const [featured, setFeatured] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(6);
      setFeatured((data as Destination[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/9149359/pexels-photo-9149359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-brand-900/60 to-slate-900/70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white text-sm font-500 border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent-400" />
              Your journey starts here
            </span>
            <h1 className="font-display font-800 text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              Discover the world,<br />one trip at a time
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed mb-8 max-w-xl">
              Explore breathtaking destinations, build day-by-day itineraries, track your budget, and turn travel dreams into plans — all in one place.
            </p>

            {/* Search bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Where to next?"
                  className="w-full py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') window.location.href = '/destinations';
                  }}
                />
              </div>
              <Link
                to="/destinations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-600 hover:bg-brand-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Explore
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-8 text-brand-100 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> 120+ destinations</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> 4.8 avg rating</span>
              <span className="flex items-center gap-1.5"><Compass className="w-4 h-4" /> 6 trip categories</span>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-12 fill-slate-50" preserveAspectRatio="none"><path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" /></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: MapPin, value: '120+', label: 'Destinations' },
              { icon: Calendar, value: '15K+', label: 'Trips planned' },
              { icon: Heart, value: '8K+', label: 'Saved favorites' },
              { icon: Star, value: '4.8', label: 'Average rating' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center p-5 rounded-2xl bg-white shadow-card">
                <s.icon className="w-7 h-7 text-brand-600 mb-2" />
                <span className="font-display font-700 text-2xl text-slate-900">{s.value}</span>
                <span className="text-sm text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display font-700 text-3xl sm:text-4xl text-slate-900">Featured destinations</h2>
              <p className="text-slate-500 mt-2">Hand-picked places travelers love right now</p>
            </div>
            <Link to="/destinations" className="inline-flex items-center gap-1 text-brand-600 font-600 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-brand-500" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-slate-900">How TravelSpark works</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Three simple steps from inspiration to departure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Compass, step: '01', title: 'Explore destinations', desc: 'Browse curated places by category, budget, and duration. Save the ones that catch your eye.' },
              { icon: Calendar, step: '02', title: 'Plan your trip', desc: 'Create a trip, set dates and budget, then build a day-by-day itinerary with activities and stays.' },
              { icon: Wallet, step: '03', title: 'Track your budget', desc: 'See a clear breakdown of costs across travel, stay, food, and activities — no surprises.' },
            ].map((f) => (
              <div key={f.step} className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <span className="absolute top-6 right-6 font-display font-800 text-4xl text-slate-200">{f.step}</span>
                <div className="grid place-items-center w-12 h-12 rounded-xl bg-brand-100 text-brand-600 mb-5">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-600 text-xl text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Plane className="w-12 h-12 text-white/80 mx-auto mb-6 animate-float" />
          <h2 className="font-display font-700 text-3xl sm:text-4xl text-white mb-4">Ready to plan your next adventure?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">Join thousands of travelers using TravelSpark to turn their wanderlust into well-planned journeys.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-700 font-600 hover:bg-brand-50 transition-colors">
              Plan Your Trip <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/destinations" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 text-white font-600 border border-white/30 hover:bg-white/20 transition-colors">
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-slate-900">Loved by travelers</h2>
            <p className="text-slate-500 mt-2">Don't just take our word for it</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Aarav Mehta', role: 'Backpacker', text: 'Planned my entire Nepal trek in an afternoon. The itinerary builder made it effortless to organize each day.' },
              { name: 'Sofia Rossi', role: 'City explorer', text: 'The budget planner is a lifesaver. I knew exactly what I was spending on each part of my Prague trip.' },
              { name: 'Liam Chen', role: 'Beach lover', text: 'Found the Maldives through TravelSpark and saved it instantly. Booking the trip was the easy part.' },
            ].map((t) => (
              <div key={t.name} className="p-7 rounded-2xl bg-white shadow-card">
                <Quote className="w-8 h-8 text-brand-200 mb-4" />
                <p className="text-slate-600 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-600">{t.name.charAt(0)}</span>
                  <div>
                    <p className="font-600 text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
