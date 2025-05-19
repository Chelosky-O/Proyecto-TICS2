// frontend/src/pages/ReportsAdmin.jsx
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { getSummary, getByArea, getByType } from '../api/reports';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

import 'react-datepicker/dist/react-datepicker.css';

const colors = ['#1d4ed8', '#16a34a', '#dc2626', '#ca8a04', '#9333ea'];

export default function ReportsAdmin() {
  const [from, setFrom] = useState(null);
  const [to,   setTo]   = useState(null);
  const [summary, setSummary] = useState({});
  const [areaData, setArea]   = useState([]);
  const [typeData, setType]   = useState([]);

  const load = () => {
    getSummary({ from: from?.toISOString().slice(0,10), to: to?.toISOString().slice(0,10) })
      .then(r => setSummary(r.data));
    getByArea().then(r => setArea(r.data));
    getByType().then(r => setType(r.data));
  };

  useEffect(load, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Indicadores</h2>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <DatePicker
          selected={from}
          onChange={setFrom}
          placeholderText="Desde"
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded"
        />
        <DatePicker
          selected={to}
          onChange={setTo}
          placeholderText="Hasta"
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded"
        />
        <button
          onClick={load}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Aplicar
        </button>
      </div>

      {/* Resumen numérico */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-slate-600">Total creadas</p>
          <p className="text-2xl font-bold">{summary.total ?? '--'}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-slate-600">Completadas</p>
          <p className="text-2xl font-bold">{summary.completed ?? '--'}</p>
        </div>
      </div>

      {/* Gráfica por área */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-medium">Tareas por área</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={areaData}>
            <XAxis dataKey="area" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count">
              {areaData.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica por tipo */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-medium">Tareas por tipo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeData}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
            >
              {typeData.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
