import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createOrder } from '../api';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Aucune commande en cours.</p>
          <button
            onClick={() => navigate(`/${slug}`)}
            className="text-orange-500 font-medium"
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
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 text-2xl"
          >
            &larr;
          </button>
          <h1 className="text-xl font-bold text-gray-900">Votre commande</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Récapitulatif</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <span className="text-gray-800">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-600">
                {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-600">
              {total.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Vos coordonnées</h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Votre nom</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Amadou Ouédraogo"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 70 12 34 56"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
          >
            {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Paiement sur place (espèces ou mobile money)
          </p>
        </form>
      </main>
    </div>
  );
}
