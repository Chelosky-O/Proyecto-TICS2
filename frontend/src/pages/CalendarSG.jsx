import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';

import { useAuth } from '../auth/AuthContext';
import { getAssignedTasks, getAllTasks, changeStatus } from '../api/tasks';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales: { es }
});

export default function CalendarSG() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (user.role === 'sg' ? getAssignedTasks() : getAllTasks())
      .then(r => setTasks(r.data));
  }, [user.role]);

  const events = tasks
    .filter(t => t.dueAt)
    .map(t => ({
      ...t,
      title: `${t.title} (${t.status})`,
      start: new Date(t.dueAt),
      end:   new Date(t.dueAt),
      allDay: false
    }));

  async function handleStatus(t, next) {
    const ok = window.confirm(
      `¿Cambiar estado de “${t.title}” a ${next}?`
    );
    if (!ok) return;

    await changeStatus(t.id, next);
    setTasks(s => s.map(k => k.id === t.id ? { ...k, status: next } : k));
  }

  return (
    <div className="p-6 grid lg:grid-cols-2 gap-6">
      {/* Lista lateral */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {user.role === 'sg' ? 'Mis tareas' : 'Todas las tareas'}
        </h2>

        {tasks.map(t => (
          <div key={t.id} className="p-3 bg-white rounded shadow text-sm flex justify-between">
            <div>
              <strong>{t.title}</strong>
              <div className="text-xs text-slate-600">
                {t.dueAt ? format(new Date(t.dueAt), 'P p') : 'Sin fecha'} — Área: {t.author?.area}
              </div>
              <div className="text-xs">Estado: {t.status}</div>
            </div>

            {user.role === 'sg' && (
              <div className="flex flex-col gap-1">
                {t.status === 'Pendiente' && (
                  <button onClick={() => handleStatus(t, 'En Progreso')}
                          className="px-2 py-1 bg-amber-400 rounded text-xs">
                    Iniciar
                  </button>
                )}
                {t.status === 'En Progreso' && (
                  <button onClick={() => handleStatus(t, 'Finalizada')}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                    Finalizar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        style={{ height: 600 }}
        defaultView="week"
      />
    </div>
  );
}
