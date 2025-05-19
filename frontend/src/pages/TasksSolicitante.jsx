import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTasks } from '../api/tasks';
import { format } from 'date-fns';

export default function TasksSolicitante() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getMyTasks().then(r => setTasks(r.data));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mis solicitudes</h2>
        <Link
          to="/tasks/new"
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
        >
          Nueva
        </Link>
      </header>

      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="p-3 rounded bg-white shadow text-sm">
            <strong>{t.title}</strong> <span className="text-xs text-slate-500">({t.type})</span>
            <div className="text-xs text-slate-600">
              {t.when ? format(new Date(t.when), 'P p') : 'Sin fecha'} — Estado: {t.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
