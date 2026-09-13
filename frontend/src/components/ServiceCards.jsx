import { FileText } from 'lucide-react';

export default function ServiceCards({ services, actionLabel = 'Apply Now', onAction }) {
  if (services.length === 0) return <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No services available right now.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <article key={service.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><FileText size={22} /></span><h2 className="mt-4 text-lg font-bold text-slate-900">{service.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p><p className="mt-5 text-2xl font-bold text-blue-700">₹{service.price}</p><button onClick={() => onAction?.(service)} className="mt-5 w-full rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800">{actionLabel}</button></article>)}</div>;
}
