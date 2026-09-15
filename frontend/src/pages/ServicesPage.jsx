import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCards from '../components/ServiceCards.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function PublicServicesPage() { return <ServicesPage title="Services" endpoint="/services/public" />; }

export function MemberServicesPage() {
  const { user } = useAuth();
  return <ServicesPage title={user.role === 'PARTNER' ? 'Partner services' : 'Available services'} endpoint="/services/mine" member />;
}

function ServicesPage({ title, endpoint, member = false }) {
  const navigate = useNavigate(); const { user } = useAuth(); const [services, setServices] = useState([]); const [message, setMessage] = useState('Loading services…');
  useEffect(() => { api.get(endpoint).then(({ data }) => { setServices(data.services); setMessage(''); }).catch((error) => setMessage(error.response?.data?.message || 'Unable to load services.')); }, [endpoint]);
  const apply = async (service) => {
    if (!user) return navigate('/login');
    if (!member) return navigate('/login');
    try { const { data } = await api.post('/orders', { serviceId: service.id }); navigate(`/${user.role.toLowerCase()}/orders/${data.order.id}`); } catch (error) { setMessage(error.response?.data?.message || 'Unable to create your order.'); }
  };
  const groups = services.reduce((result, service) => ({ ...result, [service.category || 'Digital Services']: [...(result[service.category || 'Digital Services'] || []), service] }), {});
  return <main className="mx-auto max-w-6xl px-5 py-12"><p className="text-sm font-bold uppercase tracking-wider text-[#276052]">E CAFE HIMACHAL</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-3 text-slate-600">Official service charges are shown below. Send details and documents through WhatsApp after successful payment.</p><p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><strong>Important notice:</strong> E CAFE HIMACHAL is a private digital service platform, not an official government website. Use official and authorized platforms only; we do not promise government approval, jobs, benefits or other outcomes. Never share OTPs, PINs or passwords.</p>{message && <p className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<div className="mt-8 space-y-12">{Object.entries(groups).map(([category, categoryServices]) => <section key={category}><h2 className="mb-5 text-xl font-bold text-slate-900">{category}</h2><ServiceCards services={categoryServices} actionLabel={member ? 'Create order' : 'Login to apply'} onAction={apply} /></section>)}</div></main>;
}
