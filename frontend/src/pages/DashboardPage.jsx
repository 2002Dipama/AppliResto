import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardOrders, updateOrderStatus, logout, toggleRestaurant } from '../api';
import { IconBell, IconClock, IconLink, IconMenu, IconStore, IconUser } from '../components/Icons';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', bg: 'bg-amber-50', color: 'text-amber-700', dot: 'bg-amber-500', next: 'accepted', nextLabel: 'Accepter', nextBg: 'bg-blue-600 hover:bg-blue-700' },
  accepted: { label: 'Acceptee', bg: 'bg-blue-50', color: 'text-blue-700', dot: 'bg-blue-500', next: 'preparing', nextLabel: 'En preparation', nextBg: 'bg-violet-600 hover:bg-violet-700' },
  preparing: { label: 'En preparation', bg: 'bg-violet-50', color: 'text-violet-700', dot: 'bg-violet-500', next: 'ready', nextLabel: 'Prete !', nextBg: 'bg-emerald-600 hover:bg-emerald-700' },
  ready: { label: 'Prete', bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500', next: 'picked_up', nextLabel: 'Recuperee', nextBg: 'bg-gray-600 hover:bg-gray-700' },
  picked_up: { label: 'Recuperee', bg: 'bg-gray-50', color: 'text-gray-500', dot: 'bg-gray-400', next: null },
};

const FILTERS = [
  { value: 'active', label: 'Actives' },
  { value: 'pending', label: 'En attente' },
  { value: 'all', label: 'Toutes' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState({});
  const [toggling, setToggling] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const prevPendingCount = useRef(0);
  const isFirstLoad = useRef(true);

  const menuUrl = restaurant?.slug
    ? `${window.location.origin}/${restaurant.slug}`
    : '';

  async function openQR() {
    if (!qrDataUrl && menuUrl) {
      const url = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(url);
    }
    setShowQR(true);
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${restaurant.slug}.png`;
    a.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(menuUrl);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleToggle() {
    setToggling(true);
    try {
      const data = await toggleRestaurant();
      setRestaurant((prev) => ({ ...prev, is_open: data.is_open }));
    } catch {}
    finally { setToggling(false); }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    try {
      const data = await fetchDashboardOrders();
      const ordersList = data.orders;
      setRestaurant(data.restaurant);
      const newPending = ordersList.filter((o) => o.status === 'pending').length;
      if (!isFirstLoad.current && newPending > prevPendingCount.current) {
        playNotificationSound();
      }
      prevPendingCount.current = newPending;
      isFirstLoad.current = false;
      setOrders(ordersList);
    } catch {
      // retry on next interval
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    const data = { status: newStatus };
    if (newStatus === 'accepted' && estimatedMinutes[orderId]) {
      data.estimated_minutes = parseInt(estimatedMinutes[orderId]);
    }
    try {
      const updated = await updateOrderStatus(orderId, data);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } catch {}
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return !['picked_up'].includes(o.status);
    if (filter === 'pending') return o.status === 'pending';
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const isOpen = restaurant?.is_open ?? true;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {pendingCount > 0 && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center animate-pulse">
          <button
            onClick={() => setFilter('pending')}
            className="text-sm font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <IconBell className="w-4 h-4" />
            {pendingCount} commande{pendingCount > 1 ? 's' : ''} en attente !
          </button>
        </div>
      )}

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-14 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                <IconStore className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">
                  {restaurant?.name || 'Tableau de bord'}
                </h1>
                {pendingCount > 0 && (
                  <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    <IconBell className="w-3 h-3" />
                    {pendingCount} en attente
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isOpen
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {isOpen ? 'Ouvert' : 'Ferme'}
              </button>
              <button
                onClick={openQR}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <IconLink className="w-3.5 h-3.5" />
                QR Code
              </button>
              <Link
                to="/dashboard/menu"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                <IconMenu className="w-3.5 h-3.5" />
                Menu
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-gray-400 hover:text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
              >
                Deconnexion
              </button>
            </div>
          </div>

          {!isOpen && (
            <div className="pb-3">
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-medium text-center">
                Votre restaurant est ferme. Les clients ne peuvent pas commander.
              </div>
            </div>
          )}

          <div className="flex gap-1 pb-3">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f.label}
                {f.value === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-white w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconStore className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Aucune commande</p>
            <p className="text-gray-400 text-sm">Les nouvelles commandes apparaitront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const isPending = order.status === 'pending';
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">
                          #{order.pickup_code}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${config.bg} ${config.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${isPending ? 'animate-pulse' : ''}`} />
                          {config.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                        <IconUser className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-[11px] text-gray-400">{order.customer_phone}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {order.items.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-600">
                          <span className="font-semibold">{item.quantity}x</span> {item.menu_item_name}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <span className="font-bold text-gray-900">
                        {order.total.toLocaleString('fr-FR')} F
                      </span>

                      {config.next && (
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2">
                              <IconClock className="w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                placeholder="min"
                                min="1"
                                value={estimatedMinutes[order.id] || ''}
                                onChange={(e) =>
                                  setEstimatedMinutes((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                                className="w-10 bg-transparent py-1.5 text-xs text-gray-700 focus:outline-none"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleStatusChange(order.id, config.next)}
                            className={`px-4 py-1.5 ${config.nextBg} text-white rounded-lg text-xs font-semibold transition-colors`}
                          >
                            {config.nextLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
              QR Code de votre restaurant
            </h2>
            <p className="text-sm text-gray-500 text-center mb-5">
              Vos clients scannent pour voir le menu et commander
            </p>

            {qrDataUrl && (
              <div className="flex justify-center mb-5">
                <div className="bg-white p-3 rounded-xl border-2 border-gray-100">
                  <img src={qrDataUrl} alt="QR Code" className="w-52 h-52" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-5">
              <span className="text-xs text-gray-600 truncate flex-1 font-mono">{menuUrl}</span>
              <button
                onClick={copyLink}
                className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 whitespace-nowrap"
              >
                Copier
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                Telecharger le QR
              </button>
              <button
                onClick={() => {
                  const text = `Commandez en ligne chez ${restaurant.name} !\n${menuUrl}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#20bd5a] transition-colors"
              >
                Partager WhatsApp
              </button>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
