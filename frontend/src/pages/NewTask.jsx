// frontend/src/pages/NewTask.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { createTask } from '../api/tasks';

import 'react-datepicker/dist/react-datepicker.css';

const typeOpts = ['Retiro', 'Traslados', 'Compras', 'Varios']
  .map(v => ({ value: v, label: v }));
const priorityOpts = ['Alta', 'Media', 'Baja']
  .map(v => ({ value: v, label: v }));

export default function NewTask() {
  const nav = useNavigate();
  const [form, set] = useState({
    title: '', description: '', location: '',
    type: null, priority: priorityOpts[1],
    dueAt: new Date()
  });
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTask({
        title: form.title,
        description: form.description,
        location: form.location,
        type: form.type?.value,
        priority: form.priority?.value,
        dueAt: form.dueAt
      });
      nav('/tasks');
    } catch (e) {
      setErr('Error al guardar. Revisa los campos.');
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Nueva solicitud</h2>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">
        <input
          className="w-full p-2 border rounded"
          placeholder="Título"
          value={form.title}
          onChange={e => set({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Descripción"
          rows={3}
          value={form.description}
          onChange={e => set({ ...form, description: e.target.value })}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Ubicación"
          value={form.location}
          onChange={e => set({ ...form, location: e.target.value })}
        />

        <div className="grid sm:grid-cols-3 gap-3">
          <Select
            options={typeOpts}
            placeholder="Tipo"
            value={form.type}
            onChange={type => set({ ...form, type })}
          />
          <Select
            options={priorityOpts}
            placeholder="Prioridad"
            value={form.priority}
            onChange={priority => set({ ...form, priority })}
          />
          <DatePicker
            selected={form.dueAt}
            onChange={date => set({ ...form, dueAt: date })}
            showTimeSelect
            dateFormat="Pp"
            className="w-full p-2 border rounded"
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="px-3 py-2 bg-blue-600 text-white rounded">
          Guardar
        </button>
      </form>
    </div>
  );
}
