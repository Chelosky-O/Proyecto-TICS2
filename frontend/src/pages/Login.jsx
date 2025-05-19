import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPwd] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  async function handle(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch {
      setErr('Credenciales inválidas');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handle} className="space-y-4 w-80">
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

        <input
          className="w-full p-2 rounded border"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 rounded border"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPwd(e.target.value)}
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="w-full py-2 rounded bg-blue-600 text-white">
          Entrar
        </button>
      </form>
    </div>
  );
}
