import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination, Trip } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Textarea, Select, Alert, Spinner } from '@/components/ui';

export default function TripFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [destinationId, setDestinationId] = useState<string>(searchParams.get('destination') ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  if (!session) return <Navigate to="/login" replace />;

  useEffect(() => {
    (async () => {
      const { data: dests } = await supabase.from('destinations').select('*').order('title');
      setDestinations((dests as Destination[]) ?? []);

      if (isEdit && id) {
        const { data } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
        const trip = data as Trip | null;
        if (trip) {
          setName(trip.name);
          setDestinationId(trip.destination_id ?? '');
          setStartDate(trip.start_date ?? '');
          setEndDate(trip.end_date ?? '');
          setTravelers(String(trip.travelers));
          setBudget(String(trip.budget));
          setNotes(trip.notes);
        }
      }
      setLoading(false);
    })();
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please give your trip a name.');
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      destination_id: destinationId || null,
      start_date: startDate || null,
      end_date: endDate || null,
      travelers: Number(travelers) || 1,
      budget: Number(budget) || 0,
      notes: notes.trim(),
    };
    let result;
    if (isEdit && id) {
      result = await supabase.from('trips').update(payload).eq('id', id).select().single();
    } else {
      result = await supabase.from('trips').insert(payload).select().single();
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    navigate(isEdit ? `/dashboard/trips/${id}/itinerary` : `/dashboard/trips/${result.data.id}/itinerary`);
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="font-display font-700 text-3xl text-slate-900 mb-2">{isEdit ? 'Edit trip' : 'Create a new trip'}</h1>
      <p className="text-slate-500 mb-8">Fill in the details below. You can build the itinerary next.</p>

      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Trip name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer in the Alps" />
          <Select label="Destination" value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
            <option value="">Select a destination (optional)</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.title}, {d.country}</option>
            ))}
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Travelers" type="number" min={1} value={travelers} onChange={(e) => setTravelers(e.target.value)} />
            <Input label="Budget ($)" type="number" min={0} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />
          </div>
          <Textarea label="Notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything to remember for this trip..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={saving}><Save className="w-4 h-4" /> {isEdit ? 'Save changes' : 'Create trip'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
