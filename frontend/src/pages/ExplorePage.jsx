import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRestaurants } from '../api';
import { IconMapPin, IconStore } from '../components/Icons';

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <IconStore className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AppliResto</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explorer les restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">
            {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} disponible{restaurants.length > 1 ? 's' : ''}
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconStore className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Aucun restaurant pour le moment</p>
            <p className="text-gray-400 text-sm">Revenez bientot !</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {restaurants.map((r) => (
              <Link
                key={r.slug}
                to={`/${r.slug}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconStore className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    r.is_open
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {r.is_open ? 'Ouvert' : 'Ferme'}
                  </span>
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {r.name}
                  </h2>
                  {r.address && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <IconMapPin className="w-3 h-3" />
                      {r.address}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {r.dish_count} plat{r.dish_count > 1 ? 's' : ''} disponible{r.dish_count > 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
