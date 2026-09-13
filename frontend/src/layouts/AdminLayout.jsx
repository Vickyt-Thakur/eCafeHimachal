import { LayoutDashboard, ClipboardList, Users, Handshake, FileText, ReceiptText, CreditCard, Settings, LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [[LayoutDashboard, 'Dashboard', '/admin/dashboard'], [ClipboardList, 'Orders', '/admin/orders'], [FileText, 'Services', '/admin/services'], [Users, 'Customers', '/admin/customers'], [Handshake, 'Partners', '/admin/partners'], [CreditCard, 'Payments', '/admin/payments'], [ReceiptText, 'Receipts', '/admin/receipts'], [Settings, 'Settings', '/admin/settings']];
export default function AdminLayout() {
  const { logout } = useAuth();
  return <div className="min-h-screen bg-slate-100 lg:flex"><aside className="bg-slate-950 text-slate-100 lg:fixed lg:inset-y-0 lg:w-64"><div className="px-6 py-6 text-xl font-bold text-white">eCafeHimachal <span className="block pt-1 text-xs font-normal text-slate-400">Admin panel</span></div><nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">{links.map(([Icon, name, path]) => <NavLink key={path} to={path} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><Icon size={18} />{name}</NavLink>)}</nav><button onClick={logout} className="mx-3 mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 lg:absolute lg:bottom-2"><LogOut size={18} />Log out</button></aside><section className="lg:ml-64"><Outlet /></section></div>;
}
