import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Globe, Phone, Building2,
  Download, Merge, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  mergeCompanies,
  exportCompaniesUrl,
} from '../services/companyService';

const emptyForm = {
  companyName: '', address: '', city: '', state: '', country: '',
  phone: '', websiteUrl: '', revenue: '', industry: '', salesRepOwner: '',
};

function CompanyForm({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        ['companyName', 'Company Name *', 'text', true, false],
        ['industry', 'Industry', 'text', false, false],
        ['revenue', 'Revenue ($)', 'number', false, false],
        ['phone', 'Phone', 'tel', false, false],
        ['websiteUrl', 'Website URL', 'url', false, false],
        ['salesRepOwner', 'Sales Rep Owner', 'text', false, false],
        ['address', 'Address', 'text', false, true],
        ['city', 'City', 'text', false, false],
        ['state', 'State', 'text', false, false],
        ['country', 'Country', 'text', false, false],
      ].map(([key, label, type, required, fullWidth]) => (
        <div key={key} className={fullWidth ? 'sm:col-span-2' : ''}>
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
    </div>
  );
}

export default function Companies() {
  const { isAdmin } = useAuth();
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
    fetchCompanies()
      .then(setCompanies)
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(company) {
    setEditTarget(company);
    setForm({
      companyName: company.companyName || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || '',
      phone: company.phone || '',
      websiteUrl: company.websiteUrl || '',
      revenue: company.revenue ?? '',
      industry: company.industry || '',
      salesRepOwner: company.salesRepOwner || '',
    });
    setEditOpen(true);
  }

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function buildPayload(f) {
    const payload = { ...f };
    if (payload.revenue === '' || payload.revenue === null) delete payload.revenue;
    else payload.revenue = Number(payload.revenue);
    return payload;
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createCompany(buildPayload(form));
      setCompanies([created, ...companies]);
      toast.success('Company added');
      setAddOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add company');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCompany(editTarget._id, buildPayload(form));
      setCompanies(companies.map((c) => (c._id === updated._id ? updated : c)));
      toast.success('Company updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteCompany(deleteTarget._id);
      setCompanies(companies.filter((c) => c._id !== deleteTarget._id));
      toast.success('Company deleted');
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete company');
    } finally {
      setSaving(false);
    }
  }

  async function handleMerge(e) {
    e.preventDefault();
    if (!mergeKeep || !mergeDelete || mergeKeep === mergeDelete) {
      toast.error('Select two different companies');
      return;
    }
    setSaving(true);
    try {
      const kept = await mergeCompanies(mergeKeep, mergeDelete);
      setCompanies(companies.filter((c) => c._id !== mergeDelete).map((c) => (c._id === kept._id ? kept : c)));
      toast.success('Companies merged');
      setMergeOpen(false);
      setMergeKeep('');
      setMergeDelete('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to merge companies');
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const url = exportCompaniesUrl();
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('crm_token')}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'companies.csv';
        link.click();
      })
      .catch(() => toast.error('Export failed'));
  }

  const formatRevenue = (n) =>
    n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n) : null;

  return (
    <Layout title="Companies">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
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
            <Plus size={15} /> Add Company
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-base">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100 p-5 flex flex-col gap-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {c.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900">{c.companyName}</h3>
                    {c.industry && <p className="text-xs text-gray-500">{c.industry}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {c.websiteUrl && (
                    <a
                      href={c.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                    >
                      <Globe size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={15} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setDeleteTarget(c); setDeleteOpen(true); }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                {c.revenue != null && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{formatRevenue(c.revenue)} revenue</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.salesRepOwner && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Rep:</span>
                    <span>{c.salesRepOwner}</span>
                  </div>
                )}
                {(c.city || c.country) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Location:</span>
                    <span>{[c.city, c.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Company">
        <form onSubmit={handleAdd}>
          <CompanyForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Company">
        <form onSubmit={handleEdit}>
          <CompanyForm form={form} onChange={(k, v) => setForm({ ...form, [k]: v })} />
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Company">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <strong>{deleteTarget?.companyName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Merge Modal */}
      <Modal isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge Companies">
        <form onSubmit={handleMerge} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-indigo-700 mb-1">Keep this company</label>
            <select
              value={mergeKeep}
              onChange={(e) => setMergeKeep(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Select —</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-700 mb-1">Delete this company</label>
            <select
              value={mergeDelete}
              onChange={(e) => setMergeDelete(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Select —</option>
              {companies.filter((c) => c._id !== mergeKeep).map((c) => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
            The second company will be permanently deleted. The first will be kept.
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
