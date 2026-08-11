import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../api';
import { IconCheck, IconClock, IconPackage } from '../components/Icons';

function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', step: 0 },
  accepted: { label: 'Acceptee', step: 1 },
  preparing: { label: 'En preparation', step: 2 },
  ready: { label: 'Prete !', step: 3 },
  picked_up: { label: 'Recuperee', step: 4 },
};

const STATUS_MESSAGES = {
  accepted: 'Votre commande a ete acceptee !',
  preparing: 'Votre commande est en preparation...',
  ready: 'Votre commande est PRETE ! Allez la recuperer !',
};

const STEPS = [
  { key: 'pending', label: 'Recue', icon: IconClock },
  { key: 'accepted', label: 'Acceptee', icon: IconCheck },
  { key: 'preparing', label: 'Preparation', icon: IconPackage },
  { key: 'ready', label: 'Prete', icon: IconCheck },
];

function playStatusSound(status) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;
    if (status === 'ready') {
      osc.frequency.value = 880;
      osc.type = 'sine';
      osc.start();
      setTimeout(() => { osc.frequency.value = 1100; }, 150);
      setTimeout(() => { osc.frequency.value = 1320; }, 300);
      setTimeout(() => { gain.gain.value = 0; osc.stop(); ctx.close(); }, 500);
    } else {
      osc.frequency.value = 660;
      osc.type = 'sine';
      osc.start();
      setTimeout(() => { gain.gain.value = 0; osc.stop(); ctx.close(); }, 200);
    }
  } catch {}
}

export default function TrackingPage() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [statusAlert, setStatusAlert] = useState(null);
  const prevStatusRef = useRef(null);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [code]);

  async function loadOrder() {
    try {
      const data = await trackOrder(code);
      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        const msg = STATUS_MESSAGES[data.status];
        if (msg) {
          setStatusAlert(msg);
          playStatusSound(data.status);
          setTimeout(() => setStatusAlert(null), 5000);
        }
      }
      prevStatusRef.current = data.status;
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function shareWhatsApp() {
    const url = window.location.href;
    const text = `Ma commande AppliResto\nCode de retrait : ${order.pickup_code}\nSuivre ici : ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
      {statusAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
          <div className={`max-w-lg mx-auto m-3 px-4 py-3 rounded-xl text-sm font-semibold text-center shadow-lg ${
            isReady ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {statusAlert}
          </div>
        </div>
      )}

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

        <button
          onClick={shareWhatsApp}
          className="w-full mt-4 bg-[#25D366] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
        >
          <IconWhatsApp className="w-5 h-5" />
          Partager sur WhatsApp
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-5 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Mise a jour automatique
        </p>
      </main>
    </div>
  );
}
