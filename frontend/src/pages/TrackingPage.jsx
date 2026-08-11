import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../api';
import { IconCheck, IconClock, IconPackage } from '../components/Icons';

const STATUS_CONFIG = {
  pending: { label: 'En attente', step: 0 },
  accepted: { label: 'Acceptee', step: 1 },
  preparing: { label: 'En preparation', step: 2 },
  ready: { label: 'Prete !', step: 3 },
  picked_up: { label: 'Recuperee', step: 4 },
};

const STEPS = [
  { key: 'pending', label: 'Recue', icon: IconClock },
  { key: 'accepted', label: 'Acceptee', icon: IconCheck },
  { key: 'preparing', label: 'Preparation', icon: IconPackage },
  { key: 'ready', label: 'Prete', icon: IconCheck },
];

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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-gray-900 font-semibold mb-1">{error}</p>
          <p className="text-gray-400 text-sm">Verifiez votre code de retrait.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <svg className="animate-spin w-6 h-6 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status];
  const isReady = order.status === 'ready';
  const isPickedUp = order.status === 'picked_up';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${isReady ? 'bg-emerald-600' : 'bg-gray-900'} text-white transition-colors duration-500`}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <p className="text-xs text-white/60 uppercase tracking-wider font-medium mb-4">
            Code de retrait
          </p>
          <p className="text-4xl font-black tracking-[0.25em] font-mono mb-4">
            {order.pickup_code}
          </p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isReady ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isReady ? 'bg-emerald-300 animate-pulse' : order.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-white/60'
            }`} />
            {statusInfo.label}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 -mt-3 pb-8">
        {isReady && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 animate-scale-in">
            <p className="text-emerald-800 font-semibold text-sm text-center">
              Presentez votre code au restaurant pour recuperer votre commande
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 animate-fade-in">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const active = i <= statusInfo.step;
              const current = i === statusInfo.step;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      active
                        ? current
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-300'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium ${active ? 'text-gray-900' : 'text-gray-300'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      i < statusInfo.step ? 'bg-emerald-600' : 'bg-gray-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {order.estimated_minutes && !isReady && !isPickedUp && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-sm text-gray-500">
              <IconClock className="w-4 h-4 text-gray-400" />
              Temps estime : <strong className="text-gray-900">{order.estimated_minutes} min</strong>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 animate-fade-in stagger-1">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Details de la commande</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-gray-800 text-sm">{item.menu_item_name}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {(item.unit_price * item.quantity).toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-sm">Total</span>
            <span className="font-bold text-gray-900">
              {order.total.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Mise a jour automatique
        </p>
      </main>
    </div>
  );
}
