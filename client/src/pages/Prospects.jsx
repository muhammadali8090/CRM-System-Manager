import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Linkedin, Phone, Mail,
  Download, Merge, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import {
  fetchProspects,
  createProspect,
  updateProspect,
  deleteProspect,
  mergeProspects,
  exportProspectsUrl,
} from '../services/prospectService';
import { fetchCompanies } from '../services/companyService';

const emptyForm = {
  name: '', address: '', city: '', state: '', country: '',
  phone: '', email: '', company: '', jobTitle: '', linkedInUrl: '',
  notes: '', salesRepOwner: '',
};

function ProspectForm({ form, onChange, companies }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        ['name', 'Full Name *', 'text', true],
        ['email', 'Email', 'email', false],
        ['phone', 'Phone', 'tel', false],
        ['jobTitle', 'Job Title', 'text', false],
        ['address', 'Address', 'text', false],
        ['city', 'City', 'text', false],
        ['state', 'State', 'text', false],
        ['country', 'Country', 'text', false],
        ['linkedInUrl', 'LinkedIn URL', 'url', false],
        ['salesRepOwner', 'Sales Rep Owner', 'text', false],
      ].map(([key, label, type, required]) => (
        <div key={key} className={key === 'address' || key === 'linkedInUrl' || key === 'salesRepOwner' ? 'sm:col-span-2' : ''}>
          <label className="block text-xs font-semibold text-indigo-700 mb-1">{label}</label>
          <input
            type={type}
            required={required}
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Company</label>
        <select
          value={form.company}
          onChange={(e) => onChange('company', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">— None —</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>{c.companyName}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-indigo-700 mb-1">Notes (max 500 chars)</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">{form.notes.length}/500</p>
      </div>
    </div>
  );
}

export default function Prospects() {
  const { isAdmin, token } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mergeKeep, setMergeKeep] = useState('');
  const [mergeDelete, setMergeDelete] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchProspects(), fetchCompanies()])
      .then(([p, c]) => { setProspects(p); setCompanies(c); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prospects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.company?.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(prospect) {
    setEditTarget(prospect);
    setForm({
      name: prospect.name || '',
      address: prospect.address || '',
      city: prospect.city || '',
      state: prospect.state || '',
      country: prospect.country || '',
      phone: prospect.phone || '',
      email: prospect.email || '',
      company: prospect.company?._id || prospect.company || '',
      jobTitle: prospect.jobTitle || '',
      linkedInUrl: prospect.linkedInUrl || '',
      notes: prospect.notes || '',
      salesRepOwner: prospect.salesRepOwner || '',
    });
    setEditOpen(true);
  }

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.company) delete payload.company;
      const created = await createProspect(payload);
      setProspects([created, ...prospects]);
      toast.success('Prospect added');
      setAddOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add prospect');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.company) delete payload.company;
      const updated = await updateProspect(editTarget._id, payload);
      setProspects(prospects.map((p) => (p._id === updated._id ? updated : p)));
      toast.success('Prospect updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update prospect');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteProspect(deleteTarget._id);
      setProspects(prospects.filter((p) => p._id !== deleteTarget._id));
      toast.success('Prospect deleted');
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete prospect');
    } finally {
      setSaving(false);
    }
  }

  async function handleMerge(e) {
    e.preventDefault();
    if (!mergeKeep || !mergeDelete || mergeKeep === mergeDelete) {
      toast.error('Select two different prospects');
      return;
    }
    setSaving(true);
    try {
      const kept = await mergeProspects(mergeKeep, mergeDelete);
      setProspects(prospects.filter((p) => p._id !== mergeDelete).map((p) => (p._id === kept._id ? kept : p)));
      toast.success('Prospects merged');
      setMergeOpen(false);
      setMergeKeep('');
      setMergeDelete('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to merge prospects');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const url = exportProspectsUrl();
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('Authorization', `Bearer ${token}`);
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('crm_token')}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prospects.csv';
        link.click();
      })
      .catch(() => toast.error('Export failed'));
  }

  return (
    <Layout title="Prospects">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prospects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={() => setMergeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
              >
                <Merge size={15} /> Merge
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download size={15} /> Export CSV
              </button>
            </>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Prospect
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-base">No prospects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100 p-5 flex flex-col gap-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900">{p.name}</h3>
                    {p.jobTitle && <p className="text-xs text-gray-500">{p.jobTitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {p.linkedInUrl && (
                    <a
                      href={p.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                    >
                      <Linkedin size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={15} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setDeleteTarget(p); setDeleteOpen(true); }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                {p.company?.companyName && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium w-16">Company</span>
                    <span>{p.company.companyName}</span>
                  </div>
                )}
                {p.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.salesRepOwner && (
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{p.salesRepOwner}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Prospect">
        <form onSubmit={handleAdd}>
          <ProspectForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} companies={companies} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Prospect">
        <form onSubmit={handleEdit}>
          <ProspectForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} companies={companies} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Prospect">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Merge Modal */}
      <Modal isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge Prospects">
        <form onSubmit={handleMerge} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-indigo-700 mb-1">Keep this prospect</label>
            <select
              value={mergeKeep}
              onChange={(e) => setMergeKeep(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Select —</option>
              {prospects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-700 mb-1">Delete this prospect</label>
            <select
              value={mergeDelete}
              onChange={(e) => setMergeDelete(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Select —</option>
              {prospects.filter((p) => p._id !== mergeKeep).map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
            The second prospect will be permanently deleted. The first will be kept.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setMergeOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Merging...' : 'Merge'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
