import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createOrder } from '../api';
import { IconArrowLeft, IconCheck } from '../components/Icons';

export default function OrderPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cart, items, restaurant } = state || {};

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!cart || !items) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <p className="text-gray-900 font-semibold mb-2">Aucune commande en cours</p>
          <button
            onClick={() => navigate(`/${slug}`)}
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = items.find((i) => i.id === Number(id));
    return { ...item, quantity: qty };
  });
  const total = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(slug, {
        customer_name: name,
        customer_phone: phone,
        items: cartItems.map((i) => ({ menu_item: i.id, quantity: i.quantity })),
      });
      navigate(`/track/${order.pickup_code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Confirmer la commande</h1>
            <p className="text-xs text-gray-400">{restaurant?.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 animate-fade-in">
        <div className="bg-white rounded-xl border border-gray-100 mb-4">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Votre commande</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cartItems.map((item) => (
              <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-50 text-emerald-700 rounded flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-gray-800 text-sm">{item.name}</span>
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {(item.price * item.quantity).toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900 text-lg">
              {total.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Vos coordonnees</h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre nom</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Amadou Ouedraogo"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Numero de telephone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 70 12 34 56"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="p-4 pt-0">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  Confirmer — {total.toLocaleString('fr-FR')} F
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Paiement sur place (especes ou mobile money)
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
