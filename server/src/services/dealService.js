import Deal from '../models/Deal.js';

export async function getAllDeals() {
  return Deal.find().sort({ createdAt: -1 });
}

export async function createDeal(data) {
  return Deal.create(data);
}

export async function updateDeal(id, data) {
  const deal = await Deal.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!deal) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    throw err;
  }
  return deal;
}

export async function deleteDeal(id) {
  const deal = await Deal.findByIdAndDelete(id);
  if (!deal) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    throw err;
  }
  return deal;
}
