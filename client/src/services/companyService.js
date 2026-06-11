import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem('crm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCompanies() {
  const res = await axios.get(`${API}/companies`, { headers: authHeader() });
  return res.data.data;
}

export async function createCompany(data) {
  const res = await axios.post(`${API}/companies`, data, { headers: authHeader() });
  return res.data.data;
}

export async function updateCompany(id, data) {
  const res = await axios.put(`${API}/companies/${id}`, data, { headers: authHeader() });
  return res.data.data;
}

export async function deleteCompany(id) {
  const res = await axios.delete(`${API}/companies/${id}`, { headers: authHeader() });
  return res.data.data;
}

export async function mergeCompanies(keepId, deleteId) {
  const res = await axios.post(`${API}/companies/merge`, { keepId, deleteId }, { headers: authHeader() });
  return res.data.data;
}

export function exportCompaniesUrl() {
  return `${API}/export/companies`;
}
