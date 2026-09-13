import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Link } from 'react-router-dom';

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const servicesPath = user.role === 'ADMIN' ? '/admin/services' : user.role === 'PARTNER' ? '/partner/services' : '/customer/services'; const ordersPath = user.role === 'ADMIN' ? '/admin/orders' : user.role === 'PARTNER' ? '/partner/orders' : '/customer/orders'; const paymentsPath = user.role === 'ADMIN' ? '/admin/receipts' : user.role === 'PARTNER' ? '/partner/payments' : '/customer/payments';
  return <main className="mx-auto max-w-6xl px-5 py-12"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">{role} dashboard</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Welcome, {user.name}</h1><p className="mt-2 text-slate-600">Your secure account is ready. Browse services to get started.</p></div><button onClick={logout} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Log out</button></div><div className="mt-8 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-6 text-slate-600"><Link className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" to={servicesPath}>{user.role === 'ADMIN' ? 'Manage services' : 'Browse services'}</Link><Link className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" to={ordersPath}>{user.role === 'ADMIN' ? 'View orders' : 'My orders'}</Link><Link className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" to={paymentsPath}>{user.role === 'ADMIN' ? 'Receipts' : 'My payments'}</Link></div>{user.role === 'ADMIN' && <PartnerRequests />}</main>;
}

function PartnerRequests() {
  const [partners, setPartners] = useState([]); const [message, setMessage] = useState('');
  const load = () => api.get('/admin/partners').then(({ data }) => setPartners(data.partners)).catch((error) => setMessage(error.response?.data?.message || 'Unable to load partner requests.'));
  useEffect(() => { load(); }, []);
  async function changeStatus(id, status) { try { const { data } = await api.patch(`/admin/partners/${id}/status`, { status }); setMessage(data.message); load(); } catch (error) { setMessage(error.response?.data?.message || 'Unable to update partner.'); } }
  return <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-slate-900">Partner requests</h2>{message && <p className="mt-3 text-sm text-slate-600">{message}</p>}<div className="mt-4 space-y-3">{partners.length === 0 ? <p className="text-slate-600">No partner requests yet.</p> : partners.map((partner) => <div key={partner.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4"><div><p className="font-semibold text-slate-900">{partner.businessName}</p><p className="text-sm text-slate-600">{partner.user?.name} · {partner.city}, {partner.state} · {partner.status}</p></div>{partner.status === 'PENDING' && <div className="flex gap-2"><button onClick={() => changeStatus(partner.id, 'APPROVED')} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button><button onClick={() => changeStatus(partner.id, 'REJECTED')} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Reject</button></div>}</div>)}</div></section>;
}
