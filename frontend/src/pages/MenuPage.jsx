import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMenu } from '../api';
import { IconCart, IconClock, IconMapPin, IconMinus, IconPlus, IconArrowLeft } from '../components/Icons';

function PlaceholderImage({ name }) {
  const colors = [
    'from-emerald-400 to-teal-300',
    'from-amber-400 to-orange-300',
    'from-rose-400 to-pink-300',
    'from-blue-400 to-indigo-300',
    'from-violet-400 to-purple-300',
    'from-cyan-400 to-sky-300',
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center`}>
      <span className="text-3xl font-bold text-white/70">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function MenuPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetchMenu(slug)
      .then((data) => {
        setRestaurant(data.restaurant);
        setItems(data.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  function addToCart(itemId) {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  }

  function removeFromCart(itemId) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) next[itemId]--;
      else delete next[itemId];
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = items.find((i) => i.id === Number(id));
    return total + (item ? item.price * qty : 0);
  }, 0);

  const categories = [...new Set(items.map((i) => i.category || 'Autres'))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <svg className="animate-spin w-6 h-6 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-gray-900 font-semibold mb-1">{error}</p>
          <p className="text-gray-400 text-sm">Verifiez le lien du restaurant.</p>
        </div>
      </div>
    );
  }

  if (!restaurant.is_open) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconClock className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-500 mb-1">Ce restaurant est actuellement ferme.</p>
          <p className="text-gray-400 text-sm">Revenez plus tard pour commander.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {restaurant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 truncate">{restaurant.name}</h1>
              {restaurant.address && (
                <div className="flex items-center gap-1 text-gray-400">
                  <IconMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs truncate">{restaurant.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="border-t border-gray-50">
            <div className="max-w-lg mx-auto flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        {categories.map((cat) => (
          <div key={cat} id={`cat-${cat}`} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {cat}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {items
                .filter((i) => (i.category || 'Autres') === cat)
                .map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <PlaceholderImage name={item.name} />
                        )}
                        {qty > 0 && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{qty}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">
                            {item.price.toLocaleString('fr-FR')} F
                          </span>
                          {qty > 0 ? (
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                              >
                                <IconMinus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 text-xs">
                                {qty}
                              </span>
                              <button
                                onClick={() => addToCart(item.id)}
                                className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700"
                              >
                                <IconPlus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-colors"
                            >
                              <IconPlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 animate-slide-up z-20">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() =>
                navigate(`/${slug}/order`, { state: { cart, items, restaurant } })
              }
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold flex justify-between items-center px-5 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <IconCart className="w-5 h-5" />
                Voir ma commande
              </span>
              <span className="flex items-center gap-3">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{cartCount}</span>
                <span className="font-bold">{cartTotal.toLocaleString('fr-FR')} F</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
