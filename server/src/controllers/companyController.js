import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  mergeCompanies,
} from '../services/companyService.js';

export async function getCompanies(req, res, next) {
  try {
    const data = await getAllCompanies();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addCompany(req, res, next) {
  try {
    const data = await createCompany(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function editCompany(req, res, next) {
  try {
    const data = await updateCompany(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function removeCompany(req, res, next) {
  try {
    await deleteCompany(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

export async function mergeCompanyRecords(req, res, next) {
  try {
    const { keepId, deleteId } = req.body;
    const data = await mergeCompanies({ keepId, deleteId });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
