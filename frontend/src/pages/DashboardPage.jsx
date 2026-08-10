import { useEffect, useState } from 'react';
import { fetchDashboardOrders, updateOrderStatus } from '../api';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', next: 'accepted', nextLabel: 'Accepter' },
  accepted: { label: 'Acceptée', color: 'bg-blue-100 text-blue-800', next: 'preparing', nextLabel: 'En préparation' },
  preparing: { label: 'En préparation', color: 'bg-amber-100 text-amber-800', next: 'ready', nextLabel: 'Prête' },
  ready: { label: 'Prête', color: 'bg-green-100 text-green-800', next: 'picked_up', nextLabel: 'Récupérée' },
  picked_up: { label: 'Récupérée', color: 'bg-gray-100 text-gray-600', next: null },
};

const FILTERS = [
  { value: 'active', label: 'Actives' },
  { value: 'pending', label: 'En attente' },
  { value: 'all', label: 'Toutes' },
];

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState({});

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    try {
      const data = await fetchDashboardOrders();
      setOrders(data);
    } catch {
      // silently retry on next interval
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
    } catch {
      // handle error silently
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return !['picked_up'].includes(o.status);
    if (filter === 'pending') return o.status === 'pending';
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
            {pendingCount > 0 && (
              <p className="text-sm text-orange-600 font-medium">
                {pendingCount} nouvelle{pendingCount > 1 ? 's' : ''} commande{pendingCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === f.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucune commande pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-lg text-gray-900 mr-2">
                        #{order.pickup_code}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-gray-700">
                      <span className="font-medium">{order.customer_name}</span>
                      {' — '}
                      <span className="text-gray-500">{order.customer_phone}</span>
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    {order.items.map((item) => (
                      <span key={item.id} className="mr-3">
                        {item.quantity}x {item.menu_item_name}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="font-bold text-orange-600">
                      {order.total.toLocaleString('fr-FR')} FCFA
                    </span>

                    {config.next && (
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
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
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                        )}
                        <button
                          onClick={() => handleStatusChange(order.id, config.next)}
                          className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium"
                        >
                          {config.nextLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
