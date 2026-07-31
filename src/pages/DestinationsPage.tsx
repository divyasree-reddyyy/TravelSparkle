import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination, DestinationCategory } from '@/types';
import DestinationCard from '@/components/DestinationCard';
import { Spinner, EmptyState, Select } from '@/components/ui';

const categories: DestinationCategory[] = ['beach', 'mountain', 'city', 'adventure', 'spiritual', 'island'];

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? 'all');
  const [maxBudget, setMaxBudget] = useState<string>('all');
  const [sort, setSort] = useState<string>('rating');

  useEffect(() => {
    if (searchParams.get('featured')) {
      setCategory('all');
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('destinations').select('*');
      if (searchParams.get('featured')) {
        q = q.eq('featured', true);
      }
      const { data } = await q.order('rating', { ascending: false });
      setDestinations((data as Destination[]) ?? []);
      setLoading(false);
    })();
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = destinations;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    if (category !== 'all') list = list.filter((d) => d.category === category);
    if (maxBudget !== 'all') {
      const cap = Number(maxBudget);
      list = list.filter((d) => d.estimated_budget <= cap);
    }
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'budget-low') list = [...list].sort((a, b) => a.estimated_budget - b.estimated_budget);
    if (sort === 'budget-high') list = [...list].sort((a, b) => b.estimated_budget - a.estimated_budget);
    if (sort === 'duration') list = [...list].sort((a, b) => a.duration_days - b.duration_days);
    return list;
  }, [destinations, query, category, maxBudget, sort]);

  const setCat = (c: string) => {
    setCategory(c);
    const next = new URLSearchParams(searchParams);
    if (c !== 'all') next.set('category', c); else next.delete('category');
    setSearchParams(next);
  };

  const hasFilters = query || category !== 'all' || maxBudget !== 'all';

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-700 text-4xl mb-2">Explore destinations</h1>
          <p className="text-brand-100">Find your next adventure across {destinations.length} curated places</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + filters */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, country, or keyword..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <div className="flex gap-3">
              <Select value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="min-w-[140px]">
                <option value="all">Any budget</option>
                <option value="1000">Up to $1,000</option>
                <option value="2000">Up to $2,000</option>
                <option value="3000">Up to $3,000</option>
                <option value="5000">Up to $5,000</option>
              </Select>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} className="min-w-[140px]">
                <option value="rating">Top rated</option>
                <option value="budget-low">Budget: low to high</option>
                <option value="budget-high">Budget: high to low</option>
                <option value="duration">Shortest trip</option>
              </Select>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => setCat('all')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-500 transition-colors ${category === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-500 capitalize transition-colors ${category === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c}
              </button>
            ))}
            {hasFilters && (
              <button onClick={() => { setQuery(''); setCat('all'); setMaxBudget('all'); }} className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-brand-500" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No destinations found" description="Try adjusting your filters or search query." />
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{filtered.length} destination{filtered.length !== 1 && 's'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
