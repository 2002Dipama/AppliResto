import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconStore, IconCheck, IconEye, IconEyeOff } from '../components/Icons';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurant_name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
      navigate('/dashboard/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-5/12 bg-emerald-600 p-10 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <IconStore className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AppliResto</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Rejoignez les restaurants qui simplifient leurs commandes
          </h2>
          <p className="text-emerald-100 text-base mb-10 leading-relaxed">
            Creez votre espace en ligne et commencez a recevoir des commandes
            depuis le telephone de vos clients.
          </p>

          <div className="space-y-3">
            {[
              'Menu en ligne en 2 minutes',
              'Commandes par telephone',
              'Tableau de bord en temps reel',
              'Gratuit jusqu\'a 50 commandes/mois',
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconCheck className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/90 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-emerald-200/60 text-sm">
          Deja plus de 100 restaurants nous font confiance
        </p>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/50 rounded-full" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/30 rounded-full" />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <IconStore className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AppliResto</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Inscrire mon restaurant
            </h1>
            <p className="text-gray-500 mb-8">
              Creez votre espace en 2 minutes, c'est gratuit
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du restaurant
                </label>
                <input
                  type="text"
                  required
                  value={form.restaurant_name}
                  onChange={(e) => update('restaurant_name', e.target.value)}
                  placeholder="Ex: Chez Ali"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  required
                  value={form.owner_name}
                  onChange={(e) => update('owner_name', e.target.value)}
                  placeholder="Ex: Ali Ouedraogo"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telephone
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="Ex: 70 12 34 56"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="Ex: ali@email.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="6 caracteres minimum"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Inscription...
                  </span>
                ) : (
                  "Creer mon espace"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Deja inscrit ?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
