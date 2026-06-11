import {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../services/dealService.js';

export async function getDeals(req, res, next) {
  try {
    const data = await getAllDeals();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addDeal(req, res, next) {
  try {
    const data = await createDeal(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function editDeal(req, res, next) {
  try {
    const data = await updateDeal(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function removeDeal(req, res, next) {
  try {
    await deleteDeal(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}
