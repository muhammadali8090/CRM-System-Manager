import Company from '../models/Company.js';

export async function getAllCompanies() {
  return Company.find().sort({ createdAt: -1 });
}

export async function createCompany(data) {
  return Company.create(data);
}

export async function updateCompany(id, data) {
  const company = await Company.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!company) {
    const err = new Error('Company not found');
    err.statusCode = 404;
    throw err;
  }
  return company;
}

export async function deleteCompany(id) {
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    const err = new Error('Company not found');
    err.statusCode = 404;
    throw err;
  }
  return company;
}

export async function mergeCompanies({ keepId, deleteId }) {
  const keep = await Company.findById(keepId);
  const toDelete = await Company.findById(deleteId);
  if (!keep || !toDelete) {
    const err = new Error('One or both companies not found');
    err.statusCode = 404;
    throw err;
  }
  await Company.findByIdAndDelete(deleteId);
  return keep;
}
