import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconEdit, IconLink, IconPlus, IconStore, IconTrash } from '../components/Icons';
import { EmptyPlateIllustration } from '../components/Icons';

function ImageIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default function MenuManagePage() {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', is_available: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { loadMenu(); }, []);

  async function loadMenu() {
    try {
      const res = await fetch('/api/dashboard/menu/', { credentials: 'include' });
      const data = await res.json();
      setRestaurant(data.restaurant);
      setItems(data.items);
    } catch { /* retry on next load */ }
    finally { setLoading(false); }
  }

  function resetForm() {
    setForm({ name: '', description: '', price: '', category: '', is_available: true });
    setEditItem(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function startEdit(item) {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      is_available: item.is_available,
    });
    setEditItem(item);
    setImageFile(null);
    setImagePreview(item.image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', parseInt(form.price) || 0);
      formData.append('category', form.category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editItem
        ? `/api/dashboard/menu/${editItem.id}/`
        : '/api/dashboard/menu/create/';
      const method = editItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        resetForm();
        loadMenu();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.detail || Object.values(data).flat().join(', ') || `Erreur ${res.status}`;
        setSubmitError(msg);
      }
    } catch {
      setSubmitError('Erreur reseau. Verifiez votre connexion.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce plat ?')) return;
    await fetch(`/api/dashboard/menu/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    loadMenu();
  }

  async function toggleAvailable(item) {
    await fetch(`/api/dashboard/menu/${item.id}/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    loadMenu();
  }

  function copyLink() {
    if (!restaurant) return;
    navigator.clipboard.writeText(`${window.location.origin}/${restaurant.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

  const categories = [...new Set(items.map((i) => i.category || 'Sans categorie'))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Mon menu</h1>
              {restaurant && (
                <p className="text-xs text-gray-400">{restaurant.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4">
        {restaurant && (
          <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconLink className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-medium">Lien de votre menu</p>
                <p className="font-mono text-xs text-gray-700 truncate">
                  {window.location.origin}/{restaurant.slug}
                </p>
              </div>
            </div>
            <button
              onClick={copyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                copied
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {copied ? 'Copie !' : 'Copier'}
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 mb-4 animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm">
                {editItem ? 'Modifier le plat' : 'Nouveau plat'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo du plat</label>
                <div className="flex items-start gap-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Apercu"
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Ajouter</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-xs text-gray-400 pt-2">
                    <p>Format : JPG, PNG</p>
                    <p>Taille max : 5 Mo</p>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-emerald-600 font-medium mt-1 hover:text-emerald-700"
                      >
                        Changer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du plat</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Riz gras au poulet"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Ex: 2500"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Decrivez le plat en quelques mots"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorie</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ex: Plats principaux, Boissons..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              {submitError && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                  {submitError}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : editItem ? 'Enregistrer' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <EmptyPlateIllustration className="w-24 h-24 mx-auto mb-4 opacity-60" />
            <p className="text-gray-700 font-semibold mb-1">Votre menu est vide</p>
            <p className="text-gray-400 text-sm mb-6">Ajoutez vos plats pour que vos clients puissent commander</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Ajouter mon premier plat
              </button>
            )}
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat} className="mb-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                {cat}
                <span className="text-gray-300 font-normal normal-case">
                  ({items.filter((i) => (i.category || 'Sans categorie') === cat).length})
                </span>
              </h3>
              <div className="space-y-2">
                {items
                  .filter((i) => (i.category || 'Sans categorie') === cat)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center transition-all hover:border-gray-200 ${
                        !item.is_available ? 'opacity-50' : ''
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                          {!item.is_available && (
                            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                              Off
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                        )}
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {item.price.toLocaleString('fr-FR')} F
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleAvailable(item)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            item.is_available
                              ? 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={item.is_available ? 'Desactiver' : 'Activer'}
                        >
                          <IconStore className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <IconEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
