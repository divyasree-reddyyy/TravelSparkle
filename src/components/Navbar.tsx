import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Plane, User as UserIcon, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm transition-transform group-hover:scale-105">
              <Plane className="w-5 h-5" />
            </span>
            <span className="font-display font-700 text-xl text-slate-900 tracking-tight">
              Travel<span className="text-brand-600">Spark</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-lg text-sm font-500 text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-500 text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-500 text-accent-700 hover:bg-accent-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-600">
                    {profile?.display_name?.charAt(0).toUpperCase() ?? <UserIcon className="w-4 h-4" />}
                  </span>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-slate-500 hover:text-error-600 hover:bg-red-50 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-600 text-slate-700 hover:text-brand-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-600 text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-500 text-slate-700 hover:bg-brand-50"
                >
                  {l.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-500 text-slate-700 hover:bg-brand-50">
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-500 text-accent-700 hover:bg-accent-50">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setOpen(false); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-500 text-red-600 hover:bg-red-50">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-500 text-slate-700 hover:bg-brand-50">
                    Sign in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-600 text-white bg-brand-600 text-center">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
