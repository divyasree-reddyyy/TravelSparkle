import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Plane, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Alert } from '@/components/ui';

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-50 via-white to-leaf-50">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
              <Plane className="w-6 h-6" />
            </span>
            <span className="font-display font-700 text-2xl text-slate-900">Travel<span className="text-brand-600">Spark</span></span>
          </Link>
          <h1 className="font-display font-700 text-2xl text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue planning your adventures</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="block mb-1.5 text-sm font-500 text-slate-700">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>
            <div>
              <span className="block mb-1.5 text-sm font-500 text-slate-700">Password</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-600 text-brand-600 hover:text-brand-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
