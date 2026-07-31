import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button, Alert } from '@/components/ui';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 py-16 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-700 text-4xl mb-3">Get in touch</h1>
          <p className="text-brand-100 text-lg">Questions, feedback, or just want to say hello? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            {[
              { icon: MapPin, title: 'Visit us', lines: ['Bengaluru, India'] },
              { icon: Mail, title: 'Email', lines: ['hello@travelspark.app'] },
              { icon: Phone, title: 'Phone', lines: ['+91 90000 00000'] },
            ].map((c) => (
              <div key={c.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-card">
                <div className="grid place-items-center w-11 h-11 rounded-xl bg-brand-100 text-brand-600 shrink-0">
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-600 text-slate-900">{c.title}</h3>
                  {c.lines.map((l) => <p key={l} className="text-sm text-slate-500">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              {sent && <div className="mb-4"><Alert type="success">Thanks for reaching out! We'll get back to you soon.</Alert></div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="block mb-1.5 text-sm font-500 text-slate-700">Name</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" placeholder="Your name" />
                </div>
                <div>
                  <span className="block mb-1.5 text-sm font-500 text-slate-700">Email</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" placeholder="you@example.com" />
                </div>
                <div>
                  <span className="block mb-1.5 text-sm font-500 text-slate-700">Message</span>
                  <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" placeholder="How can we help?" />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4" /> Send message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
