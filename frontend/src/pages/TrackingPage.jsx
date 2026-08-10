import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../api';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', step: 0 },
  accepted: { label: 'Acceptée', color: 'bg-blue-100 text-blue-800', step: 1 },
  preparing: { label: 'En préparation', color: 'bg-amber-100 text-amber-800', step: 2 },
  ready: { label: 'Prête !', color: 'bg-green-100 text-green-800', step: 3 },
  picked_up: { label: 'Récupérée', color: 'bg-gray-100 text-gray-600', step: 4 },
};

const STEPS = ['En attente', 'Acceptée', 'En préparation', 'Prête'];

export default function TrackingPage() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [code]);

  async function loadOrder() {
    try {
      const data = await trackOrder(code);
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-gray-500">Vérifiez votre code de retrait.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">Suivi de commande</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Code de retrait</p>
          <p className="text-4xl font-bold tracking-widest text-gray-900 mb-4">
            {order.pickup_code}
          </p>
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
          {order.estimated_minutes && order.status !== 'ready' && order.status !== 'picked_up' && (
            <p className="mt-3 text-gray-600">
              Temps estimé : <strong>{order.estimated_minutes} min</strong>
            </p>
          )}
          {order.status === 'ready' && (
            <p className="mt-3 text-green-700 font-semibold">
              Votre commande est prête ! Venez la récupérer.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= statusInfo.step
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      i < statusInfo.step ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {STEPS.map((step) => (
              <span key={step} className="w-16 text-center">{step}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Détails</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <span className="text-gray-800">
                {item.quantity}x {item.menu_item_name}
              </span>
              <span className="text-gray-600">
                {(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              {order.total.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Cette page se met à jour automatiquement.
        </p>
      </main>
    </div>
  );
}
