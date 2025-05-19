// frontend/src/pages/UsersAdmin.jsx
import { useEffect, useState } from 'react';
import { getAllUsers, createUser, toggleActive } from '../api/users';
import Select from 'react-select';

const areaOpts = [
  'Comercial', 'Laboratorio', 'Gerencia', 'Finanzas', 'Servicios Generales', 'UTM'
].map(a => ({ value: a, label: a }));

const roleOpts = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'sg',          label: 'Servicios Generales' },
  { value: 'admin',       label: 'Admin' }
];

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [form, setForm]   = useState({});

  function load() {
    getAllUsers().then(r => setUsers(r.data));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      area: form.area?.value,
      role: form.role?.value
    });
    setForm({});
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Usuarios</h2>

      {/* ----- Tabla ----- */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2">Área</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Activo</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2 text-center">{u.area}</td>
              <td className="p-2 text-center">{u.Role.name}</td>
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={u.active}
                  onChange={() => toggleActive(u.id).then(load)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ----- Formulario ----- */}
      <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow max-w-lg">
        <h3 className="font-medium">Crear usuario</h3>

        <input
          placeholder="Nombre"
          className="w-full p-2 border rounded"
          value={form.name || ''}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={form.email || ''}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 border rounded"
          value={form.password || ''}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        <Select
          options={areaOpts}
          placeholder="Área"
          value={form.area}
          onChange={area => setForm({ ...form, area })}
        />
        <Select
          options={roleOpts}
          placeholder="Rol"
          value={form.role}
          onChange={role => setForm({ ...form, role })}
        />

        <button className="px-3 py-2 bg-blue-600 text-white rounded">
          Guardar
        </button>
      </form>
    </div>
  );
}
