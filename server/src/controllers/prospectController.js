import {
  getAllProspects,
  createProspect,
  updateProspect,
  deleteProspect,
  mergeProspects,
} from '../services/prospectService.js';

export async function getProspects(req, res, next) {
  try {
    const data = await getAllProspects();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addProspect(req, res, next) {
  try {
    const data = await createProspect(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function editProspect(req, res, next) {
  try {
    const data = await updateProspect(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function removeProspect(req, res, next) {
  try {
    await deleteProspect(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

export async function mergeProspectRecords(req, res, next) {
  try {
    const { keepId, deleteId } = req.body;
    const data = await mergeProspects({ keepId, deleteId });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
