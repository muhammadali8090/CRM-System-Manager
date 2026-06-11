import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem('crm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDashboardData() {
  const [prospectsRes, companiesRes, dealsRes] = await Promise.all([
    axios.get(`${API}/prospects`, { headers: authHeader() }),
    axios.get(`${API}/companies`, { headers: authHeader() }),
    axios.get(`${API}/deals`, { headers: authHeader() }),
  ]);
  return {
    prospects: prospectsRes.data.data,
    companies: companiesRes.data.data,
    deals: dealsRes.data.data,
  };
}
