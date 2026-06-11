import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem('crm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProspects() {
  const res = await axios.get(`${API}/prospects`, { headers: authHeader() });
  return res.data.data;
}

export async function createProspect(data) {
  const res = await axios.post(`${API}/prospects`, data, { headers: authHeader() });
  return res.data.data;
}

export async function updateProspect(id, data) {
  const res = await axios.put(`${API}/prospects/${id}`, data, { headers: authHeader() });
  return res.data.data;
}

export async function deleteProspect(id) {
  const res = await axios.delete(`${API}/prospects/${id}`, { headers: authHeader() });
  return res.data.data;
}

export async function mergeProspects(keepId, deleteId) {
  const res = await axios.post(`${API}/prospects/merge`, { keepId, deleteId }, { headers: authHeader() });
  return res.data.data;
}

export function exportProspectsUrl() {
  return `${API}/export/prospects`;
}
