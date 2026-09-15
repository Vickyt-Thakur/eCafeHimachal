import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  return <main className="mx-auto max-w-3xl px-5 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wide text-[#276052]">{user?.role?.toLowerCase()} profile</p><h1 className="mt-2 text-3xl font-bold text-slate-900">My Profile</h1><dl className="mt-7 grid gap-5 sm:grid-cols-2"><ProfileField label="Name" value={user?.name} /><ProfileField label="Mobile" value={user?.mobile} /><ProfileField label="Email" value={user?.email || 'Not provided'} /><ProfileField label="Account status" value={user?.status} /></dl></section></main>;
}

function ProfileField({ label, value }) { return <div><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value || '—'}</dd></div>; }
