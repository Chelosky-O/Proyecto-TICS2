import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTasks } from '../api/tasks';
import { format } from 'date-fns';

export default function TasksAdmin() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => { getAllTasks().then(r => setTasks(r.data)); }, []);

  return (
    <div className="p-6 space-y-4">
      <header className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-xl font-semibold">Todas las tareas</h2>
        <div className="flex gap-2">
          <Link to="/tasks/new" className="px-3 py-2 bg-green-600 text-white rounded text-sm">Nueva</Link>
          <Link to="/assign" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Asignar pendientes</Link>
        </div>
      </header>

      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Título / Tipo</th>
            <th className="p-2">Área</th>              {/* 👈 NUEVA */}
            <th className="p-2">Solicitante</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Ejecutor</th>
            <th className="p-2">Creada</th>
            <th className="p-2">Límite</th>
            <th className="p-2">Asignada</th>
            <th className="p-2">Completada</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} className="border-t">
              <td className="p-2">
                <strong>{t.title}</strong>
                <div className="text-xs text-slate-500">{t.type}</div>
              </td>
              <td className="p-2 text-center">{t.dueAt ? format(new Date(t.dueAt), 'P p') : '—'}</td>
              <td className="p-2 text-center">{t.author?.area ?? '—'}</td>     
              <td className="p-2 text-center">{t.author?.name ?? '—'}</td>     
              <td className="p-2 text-center">{t.status}</td>
              <td className="p-2 text-center">{t.executor?.name ?? 'Sin asignar'}</td>
              <td className="p-2 text-center">{fmt(t.requestedAt)}</td>
              <td className="p-2 text-center">{fmt(t.dueAt)}</td>
              <td className="p-2 text-center">{fmt(t.assignedAt)}</td>
              <td className="p-2 text-center">{fmt(t.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
