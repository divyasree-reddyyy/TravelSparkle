import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, MapPin, Users, Plane, Shield, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Destination, DestinationCategory, Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Textarea, Select, Spinner, EmptyState, Alert } from '@/components/ui';

const categories: DestinationCategory[] = ['beach', 'mountain', 'city', 'adventure', 'spiritual', 'island'];

export default function AdminPage() {
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'destinations' | 'users'>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // form fields
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState<DestinationCategory>('beach');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('4.5');
  const [budget, setBudget] = useState('1000');
  const [duration, setDuration] = useState('3');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  if (authLoading) return <div className="flex justify-center py-32"><Spinner className="w-8 h-8 text-brand-500" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const { data: dests } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });
    setDestinations((dests as Destination[]) ?? []);
    const { data: userData } = await supabase.from('profiles').select('id, display_name, role, created_at').order('created_at', { ascending: false });
    setUsers((userData as Profile[]) ?? []);
    setLoading(false);
  };

  const resetForm = () => {
    setEditing(null);
    setTitle(''); setCountry(''); setCategory('beach'); setDescription('');
    setRating('4.5'); setBudget('1000'); setDuration('3'); setImageUrl(''); setFeatured(false);
    setShowForm(false);
  };

  const startEdit = (d: Destination) => {
    setEditing(d);
    setTitle(d.title); setCountry(d.country); setCategory(d.category);
    setDescription(d.description); setRating(String(d.rating)); setBudget(String(d.estimated_budget));
    setDuration(String(d.duration_days)); setImageUrl(d.image_url); setFeatured(d.featured);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      country: country.trim(),
      category,
      description: description.trim(),
      rating: Number(rating),
      estimated_budget: Number(budget),
      duration_days: Number(duration),
      image_url: imageUrl.trim(),
      featured,
    };
    let result;
    if (editing) {
      result = await supabase.from('destinations').update(payload).eq('id', editing.id);
    } else {
      result = await supabase.from('destinations').insert(payload);
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await loadAll();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    await supabase.from('destinations').delete().eq('id', id);
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-100 text-accent-600"><Shield className="w-6 h-6" /></div>
        <div>
          <h1 className="font-display font-700 text-3xl text-slate-900">Admin panel</h1>
          <p className="text-slate-500 text-sm">Manage destinations and view users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: MapPin, label: 'Destinations', value: destinations.length, color: 'bg-brand-50 text-brand-600' },
          { icon: Users, label: 'Users', value: users.length, color: 'bg-leaf-50 text-leaf-600' },
          { icon: Plane, label: 'Featured', value: destinations.filter((d) => d.featured).length, color: 'bg-accent-50 text-accent-600' },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white shadow-card">
            <div className={`grid place-items-center w-10 h-10 rounded-xl mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-display font-700 text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {(['destinations', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-600 capitalize border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8 text-brand-500" /></div>
      ) : tab === 'destinations' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-600 text-slate-800">Destinations</h2>
            <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4" /> Add destination</Button>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-600 text-lg text-slate-900">{editing ? 'Edit destination' : 'Add destination'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>
                {error && <div className="mb-3"><Alert type="error">{error}</Alert></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Country" required value={country} onChange={(e) => setCountry(e.target.value)} />
                    <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as DestinationCategory)}>
                      {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </Select>
                  </div>
                  <Textarea label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input label="Rating" type="number" min={0} max={5} step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} />
                    <Input label="Budget ($)" type="number" min={0} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
                    <Input label="Days" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
                    <label className="flex flex-col">
                      <span className="block mb-1.5 text-sm font-500 text-slate-700">Featured</span>
                      <button type="button" onClick={() => setFeatured(!featured)} className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-500 transition-colors ${featured ? 'bg-accent-50 border-accent-300 text-accent-700' : 'border-slate-300 text-slate-500'}`}>
                        {featured ? 'Yes' : 'No'}
                      </button>
                    </label>
                  </div>
                  <Input label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" loading={saving}>{editing ? 'Save' : 'Add'}</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {destinations.length === 0 ? (
            <EmptyState title="No destinations" description="Add your first destination." />
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-600">Destination</th>
                    <th className="px-4 py-3 font-600">Category</th>
                    <th className="px-4 py-3 font-600">Rating</th>
                    <th className="px-4 py-3 font-600">Budget</th>
                    <th className="px-4 py-3 font-600">Days</th>
                    <th className="px-4 py-3 font-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {destinations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={d.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-600 text-slate-900">{d.title}</p>
                            <p className="text-xs text-slate-500">{d.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">{d.category}</td>
                      <td className="px-4 py-3 text-slate-600">{d.rating.toFixed(1)}</td>
                      <td className="px-4 py-3 text-slate-600">${d.estimated_budget.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{d.duration_days}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEdit(d)} className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-600 text-slate-800 mb-4">Registered users</h2>
          {users.length === 0 ? (
            <EmptyState title="No users" />
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-600">Name</th>
                    <th className="px-4 py-3 font-600">Role</th>
                    <th className="px-4 py-3 font-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-600">{u.display_name?.charAt(0).toUpperCase() ?? '?'}</span>
                          <span className="font-600 text-slate-900">{u.display_name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-600 ${u.role === 'ADMIN' ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
