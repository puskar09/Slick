import axios from 'axios';

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const apiClient = api;

export const subscribeToOrders = (onUpdate) => {
  let es = null;
  let reconnectTimer = null;

  const connect = () => {
    if (es) {
      es.close();
      es = null;
    }
    es = new EventSource(`${BASE_URL}/orders/stream`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) onUpdate(data);
      } catch {
        onUpdate(e.data);
      }
    };
    es.onerror = () => {
      if (es) { es.close(); es = null; }
      reconnectTimer = setTimeout(connect, 2000);
    };
  };

  connect();
  return {
    close: () => {
      clearTimeout(reconnectTimer);
      if (es) { es.close(); es = null; }
    }
  };
};

export const getMenu = () => api.get('/menu').then((r) => r.data);

export const createOrder = (items, rollNumber, paymentMethod) =>
  api.post('/orders', items, { params: { roll_number: rollNumber } }).then((r) => r.data);

export const getOrders = () => api.get('/orders').then((r) => r.data);

export const getOrderHistory = (rollNumber) =>
  api.get(`/auth/history/${rollNumber}`).then((r) => r.data);

export const login = (rollNumber, password) =>
  api.post('/auth/login', { roll_number: rollNumber, password }).then((r) => r.data);

export const confirmPayment = (token) => api.patch(`/orders/${token}/confirm`).then((r) => r.data);

export const markReady = (token) => api.patch(`/orders/${token}/ready`).then((r) => r.data);

export const markPickedUp = (token) => api.patch(`/orders/${token}/pickup`).then((r) => r.data);

export const getRatingSummary = () => api.get('/ratings/summary').then((r) => r.data);

export const submitRating = (menuItemId, tokenNumber, rating, name) =>
  api.post('/ratings', { menu_item_id: menuItemId, token_number: tokenNumber, rating, name: name || null }).then((r) => r.data);