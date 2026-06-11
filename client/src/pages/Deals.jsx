import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Download, TrendingUp, LayoutGrid, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import {
  fetchDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  exportDealsUrl,
} from '../services/dealService';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const STAGE_STYLES = {
  Prospecting: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', header: 'bg-indigo-500' },
  Qualification: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', header: 'bg-violet-500' },
  Proposal: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', header: 'bg-purple-500' },
  Negotiation: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', header: 'bg-fuchsia-500' },
  'Closed Won': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', header: 'bg-emerald-500' },
  'Closed Lost': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', header: 'bg-red-500' },
};

const emptyForm = {
  companyName: '', prospectName: '', serviceType: '',
  dollarAmount: '', stage: 'Prospecting', percentLikelihood: '',
};

function DealForm({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Company Name *</label>
        <input
          type="text"
          required
          value={form.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Prospect Name</label>
        <input
          type="text"
          value={form.prospectName}
          onChange={(e) => onChange('prospectName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Service Type</label>
        <input
          type="text"
          value={form.serviceType}
          onChange={(e) => onChange('serviceType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Dollar Amount ($)</label>
        <input
          type="number"
          value={form.dollarAmount}
          onChange={(e) => onChange('dollarAmount', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Likelihood (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.percentLikelihood}
          onChange={(e) => onChange('percentLikelihood', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Stage</label>
        <select
          value={form.stage}
          onChange={(e) => onChange('stage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

function DealCard({ deal, onEdit, onDelete, isAdmin }) {
  const styles = STAGE_STYLES[deal.stage] || STAGE_STYLES.Prospecting;
  const fmt = (n) => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-indigo-100 hover:border-indigo-300 p-4 flex flex-col gap-2 transition-all"
    >
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-bold text-indigo-900">{deal.companyName}</h4>
        <div className="flex gap-1">
          <button onClick={() => onEdit(deal)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <Edit2 size={13} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(deal)} className="p-1 text-red-400 hover:text-red-600 rounded">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      {deal.prospectName && <p className="text-xs text-gray-500">{deal.prospectName}</p>}
      {deal.serviceType && <p className="text-xs text-gray-400">{deal.serviceType}</p>}
      <div className="flex items-center justify-between mt-1">
        {deal.dollarAmount != null ? (
          <span className="text-sm font-bold text-gray-900">{fmt(deal.dollarAmount)}</span>
        ) : <span />}
        {deal.percentLikelihood != null && (
          <span className="text-xs text-gray-500">{deal.percentLikelihood}% likely</span>
        )}
      </div>
      <span className={`self-start text-xs px-2 py-0.5 rounded-full font-medium ${styles.bg} ${styles.text}`}>
        {deal.stage}
      </span>
    </motion.div>
  );
}

export default function Deals() {
  const { isAdmin } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeals()
      .then(setDeals)
      .catch(() => toast.error('Failed to load deals'))
      .finally(() => setLoading(false));
  }, []);

  function openEdit(deal) {
    setEditTarget(deal);
    setForm({
      companyName: deal.companyName || '',
      prospectName: deal.prospectName || '',
      serviceType: deal.serviceType || '',
      dollarAmount: deal.dollarAmount ?? '',
      stage: deal.stage || 'Prospecting',
      percentLikelihood: deal.percentLikelihood ?? '',
    });
    setEditOpen(true);
  }

  function buildPayload(f) {
    const p = { ...f };
    if (p.dollarAmount === '' || p.dollarAmount === null) delete p.dollarAmount;
    else p.dollarAmount = Number(p.dollarAmount);
    if (p.percentLikelihood === '' || p.percentLikelihood === null) delete p.percentLikelihood;
    else p.percentLikelihood = Number(p.percentLikelihood);
    return p;
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createDeal(buildPayload(form));
      setDeals([created, ...deals]);
      toast.success('Deal added');
      setAddOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add deal');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateDeal(editTarget._id, buildPayload(form));
      setDeals(deals.map((d) => (d._id === updated._id ? updated : d)));
      toast.success('Deal updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update deal');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteDeal(deleteTarget._id);
      setDeals(deals.filter((d) => d._id !== deleteTarget._id));
      toast.success('Deal deleted');
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete deal');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const url = exportDealsUrl();
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('crm_token')}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'deals.csv';
        link.click();
      })
      .catch(() => toast.error('Export failed'));
  }

  const fmt = (n) => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : '—';

  return (
    <Layout title="Deals">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1 bg-indigo-50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-white shadow text-indigo-900' : 'text-indigo-400 hover:text-indigo-700'}`}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white shadow text-indigo-900' : 'text-indigo-400 hover:text-indigo-700'}`}
          >
            <List size={14} /> Table
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download size={15} /> Export CSV
            </button>
          )}
          <button
            onClick={() => { setForm(emptyForm); setAddOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Deal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const styles = STAGE_STYLES[stage];
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className={`${styles.header} text-white rounded-t-lg px-3 py-2 flex items-center justify-between`}>
                  <span className="text-xs font-semibold">{stage}</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <div className="bg-indigo-50/60 rounded-b-lg p-2 space-y-2 min-h-[120px]">
                  {stageDeals.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No deals</p>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard
                        key={deal._id}
                        deal={deal}
                        onEdit={openEdit}
                        onDelete={(d) => { setDeleteTarget(d); setDeleteOpen(true); }}
                        isAdmin={isAdmin}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 overflow-hidden">
          {deals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
              <p>No deals yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 border-b border-indigo-100">
                <tr>
                  {['Company', 'Prospect', 'Service', 'Amount', 'Stage', 'Likelihood', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {deals.map((deal) => {
                  const styles = STAGE_STYLES[deal.stage] || STAGE_STYLES.Prospecting;
                  return (
                    <motion.tr
                      key={deal._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-indigo-900">{deal.companyName}</td>
                      <td className="px-4 py-3 text-gray-600">{deal.prospectName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{deal.serviceType || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(deal.dollarAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {deal.percentLikelihood != null ? `${deal.percentLikelihood}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(deal)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                            <Edit2 size={14} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => { setDeleteTarget(deal); setDeleteOpen(true); }} className="p-1.5 text-red-400 hover:text-red-600 rounded">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Deal">
        <form onSubmit={handleAdd}>
          <DealForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Deal">
        <form onSubmit={handleEdit}>
          <DealForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Deal">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete the deal with <strong>{deleteTarget?.companyName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
