import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra superior */}
      <nav className="flex justify-between items-center bg-slate-800 text-white px-4 py-2 shadow">
        <Link to="/" className="font-semibold">Inicio</Link>
        <button onClick={logout} className="text-sm underline">
          Cerrar sesión
        </button>
      </nav>

      {/* Contenido */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
