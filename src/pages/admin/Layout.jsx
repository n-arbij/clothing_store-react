import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Package, Receipt, Users, LayoutDashboard } from 'lucide-react';
import '../Auth.css';
import './Admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className="admin">
      <aside className="admin-nav">
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  );
}