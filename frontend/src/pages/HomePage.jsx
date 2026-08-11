import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconStore, IconPhone, IconShare, IconCheck, IconClock, IconSearch, IconPackage } from '../components/Icons';

export default function HomePage() {
  const navigate = useNavigate();
  const [trackCode, setTrackCode] = useState('');
  const recentOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');

  function handleTrack(e) {
    e.preventDefault();
    if (trackCode.trim()) {
      navigate(`/track/${trackCode.trim().toUpperCase()}`);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <IconStore className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AppliResto</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Inscrire mon resto
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-14">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={`${import.meta.env.BASE_URL}images/hero-food.jpg`}
              alt="Plat africain"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36">
            <div className="max-w-2xl animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600/90 text-white rounded-full text-xs font-semibold tracking-wide uppercase mb-6">
                <IconClock className="w-3.5 h-3.5" />
                Gratuit jusqu'a 50 commandes/mois
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
                Vos clients commandent<br />
                <span className="text-emerald-400">avant d'arriver</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
                Fini les longues files d'attente. Vos clients commandent depuis leur
                telephone et recuperent au bon moment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-semibold bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors text-base"
                >
                  <IconStore className="w-5 h-5" />
                  Inscrire mon restaurant
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-semibold bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-colors text-base"
                >
                  <IconSearch className="w-5 h-5" />
                  Explorer les restaurants
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="comment-ca-marche" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Comment ca marche ?
              </h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                4 etapes simples pour recevoir des commandes en ligne
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: IconStore,
                  color: 'bg-emerald-100 text-emerald-700',
                  title: 'Inscrivez-vous',
                  desc: 'Creez votre espace en 2 minutes. Ajoutez vos plats avec photos et prix.',
                },
                {
                  icon: IconShare,
                  color: 'bg-blue-100 text-blue-700',
                  title: 'Partagez le lien',
                  desc: 'Envoyez votre lien par WhatsApp, Facebook ou affichez le QR code.',
                },
                {
                  icon: IconPhone,
                  color: 'bg-violet-100 text-violet-700',
                  title: 'Recevez les commandes',
                  desc: 'Les clients commandent depuis leur telephone. Vous gerez tout depuis le tableau de bord.',
                },
                {
                  icon: IconCheck,
                  color: 'bg-amber-100 text-amber-700',
                  title: 'Le client recupere',
                  desc: "Il arrive au bon moment avec son code de retrait. Zero attente !",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Suivre ma commande
              </h2>
              <p className="text-gray-500">
                Entrez votre code de retrait pour voir l'etat de votre commande
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex gap-2 mb-6">
              <input
                type="text"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="Ex: ABC123"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-center font-mono text-lg tracking-widest uppercase placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-sans placeholder:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <IconSearch className="w-4 h-4" />
                Suivre
              </button>
            </form>

            {recentOrders.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Commandes recentes
                </p>
                <div className="space-y-2">
                  {recentOrders.map((order, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/track/${order.code}`)}
                      className="w-full flex items-center justify-between bg-gray-50 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-emerald-200 transition-colors">
                          <IconPackage className="w-4 h-4" />
                        </span>
                        <div className="text-left">
                          <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                            {order.code}
                          </span>
                          {order.restaurant && (
                            <p className="text-xs text-gray-400">{order.restaurant}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-emerald-600 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-3">
                Gratuit pour commencer
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-md mx-auto">
                Jusqu'a 50 commandes par mois, sans frais. Pas de carte bancaire requise.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold text-base hover:bg-emerald-50 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
                <IconStore className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">AppliResto</span>
            </div>
            <p className="text-sm text-gray-400">
              Simplifiez la gestion de votre restaurant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
