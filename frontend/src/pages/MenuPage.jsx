import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMenu } from '../api';

export default function MenuPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement du menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-gray-500">Vérifiez le lien du restaurant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
          {restaurant.address && (
            <p className="text-sm text-gray-500">{restaurant.address}</p>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
              {cat}
            </h2>
            <div className="space-y-3">
              {items
                .filter((i) => (i.category || 'Autres') === cat)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-orange-600 font-semibold mt-1">
                        {item.price.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {cart[item.id] ? (
                        <>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-semibold">
                            {cart[item.id]}
                          </span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToCart(item.id)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-lg mx-auto px-4 py-3">
            <button
              onClick={() =>
                navigate(`/${slug}/order`, { state: { cart, items, restaurant } })
              }
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold text-lg flex justify-between items-center px-6"
            >
              <span>Voir ma commande ({cartCount})</span>
              <span>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
