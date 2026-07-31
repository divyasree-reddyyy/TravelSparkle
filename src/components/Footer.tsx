import { Link } from 'react-router-dom';
import { Plane, Mail, MapPin, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                <Plane className="w-5 h-5" />
              </span>
              <span className="font-display font-700 text-xl text-white">
                Travel<span className="text-brand-400">Spark</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your companion for discovering destinations, planning trips, and building unforgettable itineraries.
            </p>
          </div>

          <div>
            <h4 className="font-display font-600 text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/destinations" className="hover:text-brand-400 transition-colors">Destinations</Link></li>
              <li><Link to="/destinations?featured=1" className="hover:text-brand-400 transition-colors">Featured</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-600 text-white mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Create account</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">My dashboard</Link></li>
              <li><Link to="/dashboard/trips" className="hover:text-brand-400 transition-colors">My trips</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-600 text-white mb-4">Get in touch</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400" /> Bengaluru, India</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400" /> hello@travelspark.app</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-400" /> +91 90000 00000</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="grid place-items-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="grid place-items-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 transition-colors" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="grid place-items-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelSpark. All rights reserved.</p>
          <p>Crafted for explorers, by explorers.</p>
        </div>
      </div>
    </footer>
  );
}
