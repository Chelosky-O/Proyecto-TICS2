import { Outlet, NavLink } from 'react-router-dom';

export default function MainLayout() {
  const link =
    'text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-100 transition';
  const active = 'bg-slate-200';

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex gap-4 p-4 shadow">
        <NavLink to="/" end className={({ isActive }) => `${link} ${isActive ? active : ''}`}>Inicio</NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `${link} ${isActive ? active : ''}`}>Tareas</NavLink>
      </nav>
      <main className="flex-1 container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
