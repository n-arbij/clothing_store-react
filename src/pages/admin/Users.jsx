import { useState } from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { formatDate } from '../../util/format';

export default function Users() {
  const { user: me, listUsers, setUserRole } = useAuth();
  const [, refresh] = useState(0);
  const [error, setError] = useState('');

  const users = listUsers();

  const onRole = async (id, role) => {
    setError('');
    try {
      await setUserRole(id, role);
      refresh((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1 className="admin-h1">Users</h1>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === me.id && <span className="muted"> (you)</span>}</td>
                <td>{u.email}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u.id === me.id}
                    onChange={(e) => onRole(u.id, e.target.value)}
                    aria-label={`Role for ${u.name}`}
                  >
                    {Object.values(ROLES).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}