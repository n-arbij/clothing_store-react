import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/*
 * FRONT-END ONLY auth (localStorage). Good for building/testing the UI flows;
 * NOT secure — roles are enforced in the browser only, so anyone can edit them in
 * DevTools. When a backend exists, keep this context API, move every check to the
 * server, and replace the function bodies with fetch calls.
 */

const USERS_KEY = 'epicthrift-users';
const SESSION_KEY = 'epicthrift-session';

// eslint-disable-next-line react-refresh/only-export-components
export const ROLES = { CUSTOMER: 'customer', ADMIN: 'admin' };

// Default accounts for development/testing. Remove before going to production.
// eslint-disable-next-line react-refresh/only-export-components
export const DEMO_USERS = [
  { name: 'Demo User', email: 'demo@epicthrift.com', password: 'demo1234', role: ROLES.CUSTOMER },
  { name: 'Store Admin', email: 'admin@epicthrift.com', password: 'admin1234', role: ROLES.ADMIN },
];

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

// accounts created before roles existed become customers
const loadUsers = () =>
  readJSON(USERS_KEY, []).map((u) => (u.role ? u : { ...u, role: ROLES.CUSTOMER }));
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

async function buildRecord({ name, email, password, role }) {
  const salt = randomSalt();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normEmail(email),
    role,
    phone: '',
    address: { line1: '', city: '', postalCode: '', country: '' },
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(password, salt),
  };
}

async function seedDemoUsers() {
  // hash first, then read + save synchronously (avoids double inserts in StrictMode)
  const records = await Promise.all(DEMO_USERS.map(buildRecord));
  const users = loadUsers();
  const missing = records.filter((r) => !users.some((u) => u.email === r.email));
  if (missing.length) saveUsers([...users, ...missing]);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => localStorage.getItem(SESSION_KEY));
  // bump to re-read the user record after profile edits
  const [version, setVersion] = useState(0);

  useEffect(() => {
    seedDemoUsers();
  }, []);

  const user = useMemo(() => {
    if (!userId) return null;
    const found = loadUsers().find((u) => u.id === userId);
    return found ? publicUser(found) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, version]);

  const isAdmin = user?.role === ROLES.ADMIN;

  const startSession = (id) => {
    localStorage.setItem(SESSION_KEY, id);
    setUserId(id);
  };

  // public sign-up always creates a customer
  const signup = useCallback(async ({ name, email, password }) => {
    const users = loadUsers();
    if (users.some((u) => u.email === normEmail(email))) {
      throw new Error('An account with this email already exists.');
    }
    const record = await buildRecord({ name, email, password, role: ROLES.CUSTOMER });
    saveUsers([...users, record]);
    startSession(record.id);
    return publicUser(record);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const found = loadUsers().find((u) => u.email === normEmail(email));
    // same message for unknown email / wrong password
    const fail = () => new Error('Incorrect email or password.');
    if (!found) throw fail();
    if ((await hashPassword(password, found.salt)) !== found.passwordHash) throw fail();
    startSession(found.id);
    return publicUser(found);
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

      // role is never editable through the profile form
      const next = { ...users[idx], ...changes, role: users[idx].role };
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

  // ---- admin-only ----
  const listUsers = useCallback(() => {
    if (!isAdmin) throw new Error('Not authorized.');
    return loadUsers().map(publicUser);
  }, [isAdmin]);

  const setUserRole = useCallback(
    async (id, role) => {
      if (!isAdmin) throw new Error('Not authorized.');
      if (id === userId) throw new Error("You can't change your own role.");
      if (!Object.values(ROLES).includes(role)) throw new Error('Unknown role.');
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('User not found.');
      users[idx] = { ...users[idx], role };
      saveUsers(users);
    },
    [isAdmin, userId]
  );

  const value = useMemo(
    () => ({ user, isAdmin, signup, login, logout, updateProfile, changePassword, listUsers, setUserRole }),
    [user, isAdmin, signup, login, logout, updateProfile, changePassword, listUsers, setUserRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}