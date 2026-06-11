import { registerUser, loginUser } from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required', statusCode: 400 });
    }
    const result = await registerUser({ name, email, password, role });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message, statusCode: err.statusCode || 500 });
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required', statusCode: 400 });
    }
    const result = await loginUser({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message, statusCode: err.statusCode || 500 });
  }
}
