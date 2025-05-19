import { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUnassigned, assignTask } from '../api/tasks';
import { getExecutors } from '../api/users';

export default function AssignTasks() {
  const [tasks, setTasks] = useState([]);
  const [execs, setExecs] = useState([]);

  const load = () => getUnassigned().then(r => setTasks(r.data));
  useEffect(() => {
    load();
    getExecutors().then(r =>
      setExecs(r.data.map(u => ({ value: u.id, label: u.name })))
    );
  }, []);

  async function handleAssign(taskId, taskTitle, userOption) {
    const ok = window.confirm(
      `¿Asignar la tarea “${taskTitle}” a ${userOption.label}?`
    );
    if (!ok) return;

    await assignTask(taskId, userOption.value);
    load();
  }

  if (!tasks.length)
    return <p className="p-6">No hay tareas pendientes.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Asignar tareas</h2>

      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Título / Tipo</th>
            <th className="p-2">Prioridad</th>
            <th className="p-2">Asignar a</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} className="border-t">
              <td className="p-2">
                <strong>{t.title}</strong>
                <div className="text-xs text-slate-500">{t.type}</div>
              </td>
              <td className="p-2 text-center">{t.priority}</td>
              <td className="p-2">
                <Select
                  options={execs}
                  placeholder="Seleccionar"
                  onChange={opt => handleAssign(t.id, t.title, opt)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
