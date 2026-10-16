import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const MIN_PASSWORD = 8;

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/profile';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < MIN_PASSWORD) {
      return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    setBusy(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-sub">Save your details for faster checkout.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}

          <label className="field">
            Full name
            <input value={form.name} onChange={set('name')} autoComplete="name" required />
          </label>

          <label className="field">
            Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>

          <label className="field">
            Password
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              required
            />
            <span className="field-hint">At least {MIN_PASSWORD} characters.</span>
          </label>

          <label className="field">
            Confirm password
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              required
            />
          </label>

          <button className="btn-primary" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </div>
    </main>
  );
}