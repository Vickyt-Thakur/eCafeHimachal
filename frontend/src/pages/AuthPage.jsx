import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const inputStyle = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

function Message({ message, error }) { return message ? <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message}</p> : null; }

export function LoginPage({ intendedRole, title = 'Welcome back' }) {
  const { login } = useAuth(); const { showToast } = useToast(); const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' }); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    try {
      const user = await login(form.identifier, form.password);
      if (intendedRole && user.role !== intendedRole) { setMessage(`This is not a ${intendedRole.toLowerCase()} account. Use the correct login page.`); return; }
      showToast('Logged in successfully.'); navigate(user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'PARTNER' ? '/partner/dashboard' : '/customer/dashboard');
    } catch (error) { setMessage(error.response?.data?.message || 'Unable to log in. Please try again.'); } finally { setLoading(false); }
  }
  return <AuthShell title={title}><form onSubmit={submit}><Message message={message} error /><label className="block text-sm font-medium">Mobile number or email<input required name="identifier" value={form.identifier} onChange={update} className={inputStyle} /></label><label className="mt-4 block text-sm font-medium">Password<input required type="password" name="password" value={form.password} onChange={update} className={inputStyle} /></label><button disabled={loading} className="mt-6 w-full rounded-lg bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{loading ? 'Logging in…' : 'Login'}</button></form>{!intendedRole && <p className="mt-5 text-center text-sm text-slate-600">New customer? <Link className="font-semibold text-blue-700" to="/register">Create an account</Link></p>}{intendedRole === 'PARTNER' && <p className="mt-5 text-center text-sm text-slate-600">New partner? <Link className="font-semibold text-blue-700" to="/partner/register">Apply here</Link></p>}</AuthShell>;
}

export function CustomerRegisterPage() {
  const { setUser } = useAuth(); const { showToast } = useToast(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirmPassword: '' }); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) { event.preventDefault(); setLoading(true); setMessage(''); try { const { data } = await api.post('/auth/register/customer', form); setUser(data.user); showToast('Your account is ready.'); navigate('/customer/dashboard'); } catch (error) { setMessage(error.response?.data?.message || 'Unable to create your account.'); } finally { setLoading(false); } }
  return <AuthShell title="Create your account"><form onSubmit={submit}><Message message={message} error /><Field label="Full name" name="name" value={form.name} onChange={update} /><Field label="Mobile number" name="mobile" value={form.mobile} onChange={update} inputMode="numeric" /><Field label="Email (optional)" name="email" value={form.email} onChange={update} type="email" /><Field label="Password" name="password" value={form.password} onChange={update} type="password" /><Field label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={update} type="password" /><button disabled={loading} className="mt-6 w-full rounded-lg bg-blue-700 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button></form><p className="mt-5 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-blue-700" to="/login">Login</Link></p></AuthShell>;
}

export function PartnerRegisterPage() {
  const { showToast } = useToast(); const [form, setForm] = useState({ name: '', businessName: '', mobile: '', email: '', address: '', city: '', state: '', password: '', confirmPassword: '' }); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) { event.preventDefault(); setLoading(true); setMessage(''); try { const { data } = await api.post('/auth/register/partner', form); setMessage(data.message); showToast('Partner request submitted.'); event.target.reset(); } catch (error) { setMessage(error.response?.data?.message || 'Unable to submit your request.'); } finally { setLoading(false); } }
  return <AuthShell title="Become a partner"><p className="mb-5 text-sm text-slate-600">Submit your business details. You can log in after an admin approves your request.</p><form onSubmit={submit}><Message message={message} error={message && !message.includes('submitted')} /><Field label="Owner name" name="name" value={form.name} onChange={update} /><Field label="Cyber cafe / business name" name="businessName" value={form.businessName} onChange={update} /><Field label="Mobile number" name="mobile" value={form.mobile} onChange={update} inputMode="numeric" /><Field label="Email" name="email" value={form.email} onChange={update} type="email" /><Field label="Address" name="address" value={form.address} onChange={update} /><div className="grid grid-cols-2 gap-3"><Field label="City" name="city" value={form.city} onChange={update} /><Field label="State" name="state" value={form.state} onChange={update} /></div><Field label="Password" name="password" value={form.password} onChange={update} type="password" /><Field label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={update} type="password" /><button disabled={loading} className="mt-6 w-full rounded-lg bg-blue-700 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Submitting…' : 'Submit partner request'}</button></form></AuthShell>;
}

function Field({ label, name, type = 'text', ...props }) { return <label className="mt-4 block text-sm font-medium">{label}<input required name={name} type={type} className={inputStyle} {...props} /></label>; }
function AuthShell({ title, children }) { return <main className="mx-auto max-w-md px-5 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold text-slate-900">{title}</h1><div className="mt-6">{children}</div></section></main>; }
