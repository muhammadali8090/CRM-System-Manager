import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export async function loginUser(email, password) {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data.data;
}

export async function registerUser(name, email, password, role) {
  const res = await axios.post(`${API}/auth/register`, { name, email, password, role });
  return res.data.data;
}
