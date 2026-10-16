import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

/*
 * FRONT-END ONLY auth (localStorage). Good for building/testing the UI flows;
 * NOT secure. When a backend exists, keep the same context API and replace the
 * bodies of signup / login / logout / updateProfile / changePassword with fetch calls.
 */

const USERS_KEY = 'nextgen-users';
const SESSION_KEY = 'nextgen-session';

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const loadUsers = () => readJSON(USERS_KEY, []);
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const randomSalt = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// never expose hash/salt to the UI
const publicUser = ({ passwordHash, salt, ...rest }) => rest; // eslint-disable-line no-unused-vars

const normEmail = (email) => email.trim().toLowerCase();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => localStorage.getItem(SESSION_KEY));
  // bump to re-read the user record after profile edits
  const [version, setVersion] = useState(0);
  useEffect(() => {
    seedDemoUser();
  }, []);

  const user = useMemo(() => {
    if (!userId) return null;
    const found = loadUsers().find((u) => u.id === userId);
    return found ? publicUser(found) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, version]);

  const startSession = (id) => {
    localStorage.setItem(SESSION_KEY, id);
    setUserId(id);
  };

  const signup = useCallback(async ({ name, email, password }) => {
    const users = loadUsers();
    const e = normEmail(email);
    if (users.some((u) => u.email === e)) {
      throw new Error('An account with this email already exists.');
    }
    const salt = randomSalt();
    const record = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: e,
      phone: '',
      address: { line1: '', city: '', postalCode: '', country: '' },
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: await hashPassword(password, salt),
    };
    saveUsers([...users, record]);
    startSession(record.id);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const found = loadUsers().find((u) => u.email === normEmail(email));
    // same message for unknown email / wrong password
    const fail = () => new Error('Incorrect email or password.');
    if (!found) throw fail();
    if ((await hashPassword(password, found.salt)) !== found.passwordHash) throw fail();
    startSession(found.id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUserId(null);
  }, []);

  const updateProfile = useCallback(
    async (changes) => {
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('Not signed in.');

      const next = { ...users[idx], ...changes };
      if (changes.email !== undefined) {
        next.email = normEmail(changes.email);
        if (users.some((u) => u.id !== userId && u.email === next.email)) {
          throw new Error('That email is already used by another account.');
        }
      }
      if (changes.name !== undefined) next.name = changes.name.trim();
      users[idx] = next;
      saveUsers(users);
      setVersion((v) => v + 1);
    },
    [userId]
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('Not signed in.');
      const cur = users[idx];
      if ((await hashPassword(currentPassword, cur.salt)) !== cur.passwordHash) {
        throw new Error('Current password is incorrect.');
      }
      const salt = randomSalt();
      users[idx] = { ...cur, salt, passwordHash: await hashPassword(newPassword, salt) };
      saveUsers(users);
    },
    [userId]
  );

  const value = useMemo(
    () => ({ user, signup, login, logout, updateProfile, changePassword }),
    [user, signup, login, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Default account for development/testing. Remove before going to production.
export const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@epicthrift.com',
  password: 'demo1234',
};

async function seedDemoUser() {
  // hash first, then check + save synchronously (avoids a double insert in StrictMode)
  const salt = randomSalt();
  const passwordHash = await hashPassword(DEMO_USER.password, salt);

  const users = loadUsers();
  if (users.some((u) => u.email === DEMO_USER.email)) return;

  saveUsers([
    ...users,
    {
      id: crypto.randomUUID(),
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      phone: '',
      address: { line1: '', city: '', postalCode: '', country: '' },
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    },
  ]);
}