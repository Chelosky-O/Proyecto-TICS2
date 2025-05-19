// frontend/src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';

const AuthContext = createContext(null);

/* --------  Lee token al instante (sin useEffect) -------- */
function getInitialUser() {
  const t = localStorage.getItem('token');
  if (!t) return null;

  try {
    return jwtDecode(t);                // { id, name, role, area, exp, … }
  } catch {
    localStorage.removeItem('token');   // token corrupto o expirado
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  /*  Mantener sesión abierta en otras pestañas  */
  useEffect(() => {
    const sync = (e) => e.key === 'token' && setUser(getInitialUser());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(jwtDecode(data.token));
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
