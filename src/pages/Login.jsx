import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import './Auth.css';

const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/profile');

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from ?? homeFor(user)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const signedIn = await login(form);
      navigate(from ?? homeFor(signedIn), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to see your profile and orders.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}

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
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn-primary" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup" state={location.state}>Create an account</Link>
        </p>

        {import.meta.env.DEV && (
          <div className="auth-sub" style={{ marginTop: 16, textAlign: 'center' }}>
            {DEMO_USERS.map((d) => (
              <p key={d.email}>
                {d.role}: {d.email} / {d.password}
              </p>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}