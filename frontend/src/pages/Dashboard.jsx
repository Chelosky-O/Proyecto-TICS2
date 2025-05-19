// frontend/src/pages/Dashboard.jsx
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const links = {
    solicitante: [
      { to: '/tasks',     label: 'Mis solicitudes' },
      { to: '/tasks/new', label: 'Nueva solicitud' }
    ],
    sg: [
      { to: '/calendar',  label: 'Mi calendario' }
    ],
    admin: [
      { to: '/tasks-admin', label: 'Todas las tareas' },
      { to: '/tasks/new',   label: 'Crear tarea' },
      { to: '/calendar',    label: 'Calendario (SG)' },
      { to: '/assign',      label: 'Asignar tareas' },
      { to: '/users',       label: 'Usuarios' },
      { to: '/reports',     label: 'Reportes' }
    ]
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Hola {user.name}</h1>

      <ul className="space-y-2">
        {links[user.role].map(l => (
          <li key={l.to}>
            <Link to={l.to} className="text-blue-600 underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
