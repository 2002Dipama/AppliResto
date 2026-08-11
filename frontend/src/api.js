const API = '/api';

export async function fetchMenu(slug) {
  const res = await fetch(`${API}/${slug}/menu/`);
  if (!res.ok) throw new Error('Restaurant introuvable');
  return res.json();
}

export async function createOrder(slug, orderData) {
  const res = await fetch(`${API}/${slug}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erreur lors de la commande');
  }
  return res.json();
}

export async function trackOrder(code) {
  const res = await fetch(`${API}/orders/${code}/`);
  if (!res.ok) throw new Error('Commande introuvable');
  return res.json();
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 403) throw new Error('Non autorisé');
  if (!res.ok) throw new Error('Erreur serveur');
  return res.json();
}

export async function fetchDashboardOrders() {
  return authFetch(`${API}/dashboard/orders/`);
}

export async function toggleRestaurant() {
  return authFetch(`${API}/dashboard/toggle/`, {
    method: 'POST',
  });
}

export async function updateOrderStatus(orderId, data) {
  return authFetch(`${API}/dashboard/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function login(username, password) {
  const res = await fetch('/api/auth/login/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Identifiants incorrects');
  return res.json();
}

export async function logout() {
  const res = await fetch('/api/auth/logout/', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Erreur');
  return res.json();
}

export async function register(data) {
  const res = await fetch('/api/auth/register/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erreur lors de l'inscription");
  return json;
}
