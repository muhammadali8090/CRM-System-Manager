import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { DEMO_USERS } from '../config/demoUsers.js';

export async function seedDemoUsers() {
  for (const u of DEMO_USERS) {
    const password = await bcrypt.hash(u.password, 10);
    await User.updateOne(
      { email: u.email },
      { $set: { name: u.name, email: u.email, password, role: u.role } },
      { upsert: true }
    );
  }
}

export async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: role || 'user' });
  const token = generateToken(user);
  return { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user);
  return { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } };
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
