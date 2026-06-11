import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { fetchDashboardData } from '../services/dashboardService';
import toast from 'react-hot-toast';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const STAGE_COLORS = {
  Prospecting: 'bg-indigo-500',
  Qualification: 'bg-violet-400',
  Proposal: 'bg-purple-500',
  Negotiation: 'bg-fuchsia-500',
  'Closed Won': 'bg-emerald-500',
  'Closed Lost': 'bg-red-500',
};

const SUMMARY_CARDS = [
  {
    key: 'prospects',
    label: 'Total Prospects',
    icon: Users,
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    border: 'border-l-4 border-indigo-500',
    delay: 0,
  },
  {
    key: 'companies',
    label: 'Total Companies',
    icon: Building2,
    gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
    border: 'border-l-4 border-violet-500',
    delay: 0.05,
  },
  {
    key: 'deals',
    label: 'Total Deals',
    icon: TrendingUp,
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    border: 'border-l-4 border-purple-500',
    delay: 0.1,
  },
  {
    key: 'value',
    label: 'Total Deal Value',
    icon: DollarSign,
    gradient: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
    border: 'border-l-4 border-fuchsia-500',
    delay: 0.15,
  },
];

function SummaryCard({ icon: Icon, label, value, gradient, border, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 ${border} p-5 flex items-center gap-4`}
    >
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({ prospects: [], companies: [], deals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const totalDealValue = data.deals.reduce((sum, d) => sum + (d.dollarAmount || 0), 0);

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = data.deals.filter((d) => d.stage === s).length;
    return acc;
  }, {});

  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  const recentProspects = [...data.prospects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentCompanies = [...data.companies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentDeals = [...data.deals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  const summaryValues = {
    prospects: data.prospects.length,
    companies: data.companies.length,
    deals: data.deals.length,
    value: formatCurrency(totalDealValue),
  };

  return (
    <Layout title="Dashboard">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {SUMMARY_CARDS.map((card) => (
          <SummaryCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={summaryValues[card.key]}
            gradient={card.gradient}
            border={card.border}
            delay={card.delay}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deals by stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 p-5"
        >
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Deals by Stage</h3>
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const count = stageCounts[stage];
              const pct = maxStageCount > 0 ? (count / maxStageCount) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{stage}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-indigo-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className={`h-full rounded-full ${STAGE_COLORS[stage]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 p-5"
        >
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Recent Deals</h3>
          {recentDeals.length === 0 ? (
            <p className="text-gray-400 text-sm">No deals yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <div key={deal._id} className="flex items-center justify-between py-2 border-b border-indigo-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deal.companyName}</p>
                    <p className="text-xs text-gray-400">{deal.serviceType || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {deal.dollarAmount ? formatCurrency(deal.dollarAmount) : '—'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      deal.stage === 'Closed Won' ? 'bg-emerald-100 text-emerald-700' :
                      deal.stage === 'Closed Lost' ? 'bg-red-100 text-red-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {deal.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 p-5"
        >
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Recent Prospects</h3>
          {recentProspects.length === 0 ? (
            <p className="text-gray-400 text-sm">No prospects yet.</p>
          ) : (
            <div className="space-y-2">
              {recentProspects.map((p) => (
                <div key={p._id} className="flex items-center gap-3 py-2 border-b border-indigo-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.jobTitle || p.email || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-indigo-100 p-5"
        >
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Recent Companies</h3>
          {recentCompanies.length === 0 ? (
            <p className="text-gray-400 text-sm">No companies yet.</p>
          ) : (
            <div className="space-y-2">
              {recentCompanies.map((c) => (
                <div key={c._id} className="flex items-center gap-3 py-2 border-b border-indigo-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {c.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.companyName}</p>
                    <p className="text-xs text-gray-400">{c.industry || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
