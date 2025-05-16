import { useEffect, useState } from 'react';
import { getTasks, createTask } from '../api/tasks';
import { Loader2, Plus } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  async function addDemo() {
    setLoading(true);
    const demo = { title: 'Nueva tareosky', description: 'Demo creada desde la paginilla :D' };
    const nueva = await createTask(demo);
    setTasks([...tasks, nueva]);
    setLoading(false);
  }

  if (!tasks) return <Loader2 className="animate-spin" />;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis tareas</h2>
        <button
          onClick={addDemo}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Plus size={16} /> Añadir demo
        </button>
      </header>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(t => (
          <li key={t.id} className="p-4 rounded-2xl shadow bg-white">
            <h3 className="font-medium">{t.title}</h3>
            <p className="text-sm text-slate-600">{t.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
