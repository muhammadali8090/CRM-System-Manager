import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Prospect from '../models/Prospect.js';
import Company from '../models/Company.js';
import Deal from '../models/Deal.js';

const router = Router();

router.use(protect, adminOnly);

function toCsv(headers, rows) {
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

router.get('/prospects', async (req, res, next) => {
  try {
    const prospects = await Prospect.find().populate('company').lean();
    const headers = ['name', 'email', 'phone', 'jobTitle', 'company', 'city', 'state', 'country', 'linkedInUrl', 'salesRepOwner', 'notes', 'createdAt'];
    const rows = prospects.map((p) => ({
      ...p,
      company: p.company?.companyName || '',
      createdAt: p.createdAt?.toISOString() || '',
    }));
    const csv = toCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="prospects.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await Company.find().lean();
    const headers = ['companyName', 'industry', 'revenue', 'phone', 'websiteUrl', 'city', 'state', 'country', 'salesRepOwner', 'createdAt'];
    const rows = companies.map((c) => ({
      ...c,
      createdAt: c.createdAt?.toISOString() || '',
    }));
    const csv = toCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="companies.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/deals', async (req, res, next) => {
  try {
    const deals = await Deal.find().lean();
    const headers = ['companyName', 'prospectName', 'serviceType', 'dollarAmount', 'stage', 'percentLikelihood', 'createdAt'];
    const rows = deals.map((d) => ({
      ...d,
      createdAt: d.createdAt?.toISOString() || '',
    }));
    const csv = toCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="deals.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
