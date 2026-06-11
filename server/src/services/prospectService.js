import Prospect from '../models/Prospect.js';

export async function getAllProspects() {
  return Prospect.find().populate('company').sort({ createdAt: -1 });
}

export async function createProspect(data) {
  return Prospect.create(data);
}

export async function updateProspect(id, data) {
  const prospect = await Prospect.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('company');
  if (!prospect) {
    const err = new Error('Prospect not found');
    err.statusCode = 404;
    throw err;
  }
  return prospect;
}

export async function deleteProspect(id) {
  const prospect = await Prospect.findByIdAndDelete(id);
  if (!prospect) {
    const err = new Error('Prospect not found');
    err.statusCode = 404;
    throw err;
  }
  return prospect;
}

export async function mergeProspects({ keepId, deleteId }) {
  const keep = await Prospect.findById(keepId);
  const toDelete = await Prospect.findById(deleteId);
  if (!keep || !toDelete) {
    const err = new Error('One or both prospects not found');
    err.statusCode = 404;
    throw err;
  }
  await Prospect.findByIdAndDelete(deleteId);
  return keep;
}
