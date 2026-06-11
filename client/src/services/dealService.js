import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem('crm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDeals() {
  const res = await axios.get(`${API}/deals`, { headers: authHeader() });
  return res.data.data;
}

export async function createDeal(data) {
  const res = await axios.post(`${API}/deals`, data, { headers: authHeader() });
  return res.data.data;
}

export async function updateDeal(id, data) {
  const res = await axios.put(`${API}/deals/${id}`, data, { headers: authHeader() });
  return res.data.data;
}

export async function deleteDeal(id) {
  const res = await axios.delete(`${API}/deals/${id}`, { headers: authHeader() });
  return res.data.data;
}

export function exportDealsUrl() {
  return `${API}/export/deals`;
}
