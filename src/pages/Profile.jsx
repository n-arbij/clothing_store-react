import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MyOrders from '../components/MyOrders';
import './Auth.css';
import './Profile.css';

const MIN_PASSWORD = 8;

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function Notice({ status }) {
  if (!status) return null;
  return (
    <p className={status.type === 'error' ? 'form-error' : 'form-success'} role="alert">
      {status.text}
    </p>
  );
}

function DetailsForm({ user, updateProfile }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    line1: user.address?.line1 ?? '',
    city: user.address?.city ?? '',
    postalCode: user.address?.postalCode ?? '',
    country: user.address?.country ?? '',
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setStatus(null);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone.trim(),
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
      });
      setStatus({ type: 'success', text: 'Profile saved.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form profile-form" onSubmit={onSubmit}>
      <Notice status={status} />

      <div className="profile-grid">
        <label className="field">
          Full name
          <input value={form.name} onChange={set('name')} autoComplete="name" required />
        </label>
        <label className="field">
          Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label className="field">
          Phone
          <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </label>
      </div>

      <h3 className="profile-subhead">Shipping address</h3>
      <div className="profile-grid">
        <label className="field profile-wide">
          Address
          <input value={form.line1} onChange={set('line1')} autoComplete="address-line1" />
        </label>
        <label className="field">
          City
          <input value={form.city} onChange={set('city')} autoComplete="address-level2" />
        </label>
        <label className="field">
          Postal code
          <input value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" />
        </label>
        <label className="field">
          Country
          <input value={form.country} onChange={set('country')} autoComplete="country-name" />
        </label>
      </div>

      <div>
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ changePassword }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setStatus(null);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.next.length < MIN_PASSWORD) {
      return setStatus({ type: 'error', text: `New password must be at least ${MIN_PASSWORD} characters.` });
    }
    if (form.next !== form.confirm) {
      return setStatus({ type: 'error', text: 'New passwords do not match.' });
    }
    setBusy(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setStatus({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form profile-form" onSubmit={onSubmit}>
      <Notice status={status} />
      <div className="profile-grid">
        <label className="field profile-wide">
          Current password
          <input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" required />
        </label>
        <label className="field">
          New password
          <input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" required />
        </label>
        <label className="field">
          Confirm new password
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
        </label>
      </div>
      <div>
        <button className="btn-secondary" disabled={busy}>
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <main className="profile">
      <header className="profile-head">
        <div className="profile-avatar" aria-hidden="true">{initials(user.name)}</div>
        <div className="profile-id">
          <h1>{user.name}</h1>
          <p>{user.email} · Member since {memberSince}</p>
        </div>
        <button className="btn-secondary profile-logout" onClick={onLogout}>
          <LogOut size={16} /> Log out
        </button>
      </header>

      <section className="profile-section">
        <h2>Your orders</h2>
        <MyOrders />
        <h2>Personal details</h2>
        {/* key remounts the form with fresh values if the user record changes */}
        <DetailsForm key={user.email + user.name} user={user} updateProfile={updateProfile} />
      </section>

      <section className="profile-section">
        <h2>Password</h2>
        <PasswordForm changePassword={changePassword} />
      </section>
    </main>
  );
}
