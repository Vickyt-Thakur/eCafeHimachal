import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MessageCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';

const label = (value) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const date = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function MemberOrdersPage({ role }) {
  const [orders, setOrders] = useState([]); const [message, setMessage] = useState('Loading orders…');
  useEffect(() => { api.get('/orders/mine').then(({ data }) => { setOrders(data.orders); setMessage(''); }).catch((error) => setMessage(error.response?.data?.message || 'Unable to load orders.')); }, []);
  return <main className="mx-auto max-w-6xl px-5 py-12"><h1 className="text-3xl font-bold text-slate-900">My orders</h1>{message && <p className="mt-5 text-slate-600">{message}</p>}<div className="mt-7 grid gap-4">{orders.map((order) => <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between"><div><p className="font-bold text-slate-900">{order.orderNumber}</p><p className="mt-1 text-slate-700">{order.service?.name}</p><div className="mt-3 flex flex-wrap gap-2"><span className="text-sm font-semibold text-slate-700">₹{order.amount}</span><StatusBadge status={order.paymentStatus} /><StatusBadge status={order.orderStatus} /></div></div><Link className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white sm:mt-0" to={`/${role}/orders/${order.id}`}>View order</Link></article>)}{orders.length === 0 && !message && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">Your orders will appear here.</p>}</div></main>;
}

export function MemberOrderDetailPage() {
  const { id } = useParams(); const location = useLocation(); const { user } = useAuth(); const { showToast } = useToast(); const [data, setData] = useState(null); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true); const [paying, setPaying] = useState(false);
  useEffect(() => { api.get(`/orders/mine/${id}`).then(({ data: response }) => setData(response)).catch((error) => setMessage(error.response?.data?.message || 'Unable to load order.')).finally(() => setLoading(false)); }, [id]);
  if (loading) return <main className="mx-auto max-w-3xl px-5 py-12 text-slate-600">Loading order…</main>;
  if (!data) return <main className="mx-auto max-w-3xl px-5 py-12 text-slate-600">{message || 'Order not found.'}</main>;
  const { order, history } = data;
  const listPath = location.pathname.startsWith('/partner/') ? '/partner/orders' : '/customer/orders';
  async function payNow() {
    setPaying(true); setMessage('');
    try {
      await loadRazorpay();
      const { data: paymentData } = await api.post('/payments/create-order', { orderId: order.id });
      const checkout = new window.Razorpay({
        key: paymentData.keyId,
        amount: Math.round(paymentData.payment.amount * 100),
        currency: paymentData.payment.currency,
        name: 'eCafeHimachal',
        description: paymentData.order.serviceName,
        order_id: paymentData.payment.razorpayOrderId,
        prefill: { name: user.name, email: user.email || '', contact: user.mobile },
        theme: { color: '#1d4ed8' },
        handler: async (response) => {
          try { await api.post('/payments/verify', { orderId: order.id, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }); const refreshed = await api.get(`/orders/mine/${id}`); setData(refreshed.data); setMessage('Payment successful and verified.'); showToast('Payment verified successfully.'); } catch (error) { setMessage(error.response?.data?.message || 'Payment was received but could not be verified. Please contact support.'); } finally { setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      checkout.open();
    } catch (error) { setMessage(error.response?.data?.message || error.message || 'Unable to start payment.'); setPaying(false); }
  }
  return <main className="mx-auto max-w-3xl px-5 py-12"><Link className="text-sm font-semibold text-blue-700" to={listPath}>← My orders</Link><h1 className="mt-4 text-2xl font-bold text-slate-900">{order.orderNumber}</h1>{message && <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6"><p className="text-lg font-bold">{order.service?.name}</p><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Amount" value={`₹${order.amount}`} /><Detail label="Payment" value={label(order.paymentStatus)} /><Detail label="Order status" value={label(order.orderStatus)} /><Detail label="Created" value={date(order.createdAt)} /></dl>{order.paymentStatus !== 'SUCCESS' && <button onClick={payNow} disabled={paying} className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{paying ? 'Opening secure payment…' : `Pay ₹${order.amount}`}</button>}{order.paymentStatus === 'SUCCESS' && order.whatsappUrl && <section className="mt-6 rounded-xl bg-emerald-50 p-5"><p className="font-bold text-emerald-900">Payment successful</p><p className="mt-1 text-sm leading-6 text-emerald-800">Send your required details and documents directly to eCafeHimachal on WhatsApp.</p><a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700"><MessageCircle size={18} /> Contact on WhatsApp</a></section>}{order.adminNote && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Admin note: {order.adminNote}</p>}</section><h2 className="mt-8 text-xl font-bold">Order timeline</h2><ol className="mt-4 space-y-3">{history.map((item) => <li key={item._id} className="rounded-lg border border-slate-200 bg-white p-4"><p className="font-semibold">{label(item.newStatus)}</p><p className="mt-1 text-sm text-slate-600">{item.note || 'Status updated'} · {date(item.createdAt)}</p></li>)}</ol></main>;
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Unable to load Razorpay Checkout. Check your internet connection.')); document.body.appendChild(script); });
}

export function AdminOrdersPage() {
  const { showToast } = useToast(); const [orders, setOrders] = useState([]); const [message, setMessage] = useState('Loading orders…');
  const load = () => api.get('/orders/admin/all').then(({ data }) => { setOrders(data.orders); setMessage(''); }).catch((error) => setMessage(error.response?.data?.message || 'Unable to load orders.'));
  useEffect(() => { load(); }, []);
  async function status(id, value) { try { await api.patch(`/orders/admin/${id}/status`, { status: value }); showToast('Order status updated.'); load(); } catch (error) { setMessage(error.response?.data?.message || 'Unable to update order.'); } }
  return <main className="mx-auto max-w-6xl px-5 py-12"><h1 className="text-3xl font-bold text-slate-900">Orders</h1>{message && <p className="mt-5 text-slate-600">{message}</p>}<section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Buyer</th><th className="px-5 py-3">Service</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{order.orderNumber}</td><td className="px-5 py-4">{order.buyer?.name}<br /><span className="text-xs text-slate-500">{order.buyerType}</span></td><td className="px-5 py-4">{order.service?.name}</td><td className="px-5 py-4">₹{order.amount}</td><td className="px-5 py-4">{label(order.paymentStatus)}</td><td className="px-5 py-4"><select value={order.orderStatus} onChange={(event) => status(order.id, event.target.value)} className="rounded border border-slate-300 p-2">{['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED'].map((item) => <option key={item}>{item}</option>)}</select></td></tr>)}{orders.length === 0 && !message && <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">No orders yet.</td></tr>}</tbody></table></div></section></main>;
}
function Detail({ label: title, value }) { return <div><dt className="text-slate-500">{title}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>; }
