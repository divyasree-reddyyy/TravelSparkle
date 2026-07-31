import { Compass, Heart, Wallet, Users, Leaf, Plane } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Compass className="w-12 h-12 text-brand-200 mx-auto mb-6" />
          <h1 className="font-display font-700 text-4xl sm:text-5xl mb-4">About TravelSpark</h1>
          <p className="text-brand-100 text-lg leading-relaxed max-w-2xl mx-auto">
            We believe travel planning should feel like the start of an adventure — not a chore. TravelSpark brings destination discovery, trip planning, and budget tracking together in one beautiful place.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Our mission', desc: 'Make travel planning joyful and accessible for everyone, from first-time explorers to seasoned nomads.' },
              { icon: Wallet, title: 'Transparent budgets', desc: 'Know what every trip costs before you go. No hidden surprises, just clear category-wise breakdowns.' },
              { icon: Leaf, title: 'Sustainable travel', desc: 'We encourage mindful itineraries that respect local cultures and environments.' },
            ].map((v) => (
              <div key={v.title} className="p-8 rounded-2xl bg-white shadow-card text-center">
                <div className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 mx-auto mb-5">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-600 text-xl text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-700 text-3xl text-slate-900 mb-4">Built for every kind of traveler</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Whether you're chasing mountain summits, relaxing on hidden beaches, or wandering through ancient cities, TravelSpark adapts to your style. Mix and match categories, build flexible itineraries, and keep all your plans in one dashboard.
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              {[
                { icon: Plane, text: 'Curated destinations across 6 categories' },
                { icon: Users, text: 'Plan solo trips or group adventures' },
                { icon: Wallet, text: 'Budget tracking that actually makes sense' },
              ].map((i) => (
                <li key={i.text} className="flex items-center gap-3">
                  <i.icon className="w-5 h-5 text-brand-600" />
                  {i.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-card-hover">
            <img src="https://images.pexels.com/photos/3098647/pexels-photo-3098647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Mountain adventure" className="w-full h-80 object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
