// frontend/src/pages/ReportsAdmin.jsx
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { getSummary, getByArea, getByType } from '../api/reports';
import { useNotification } from '../context/NotificationContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

import 'react-datepicker/dist/react-datepicker.css';

// Registrar la localización española
registerLocale('es', es);

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const donutColors = ['#8B5CF6', '#D946EF', '#06B6D4', '#10B981'];

// Definir las áreas posibles (sin Servicios Generales)
const AREAS = [
  'Comercial',
  'Laboratorio',
  'Gerencia',
  'Finanzas',
  'UTM',
];

export default function ReportsAdmin() {
  const { showSuccess, showError } = useNotification();
  
  // Calcular la semana actual al cargar la página
  const today = new Date();
  const initialFrom = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
  const initialTo = endOfWeek(today, { weekStartsOn: 1 }); // Domingo

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [summary, setSummary] = useState({});
  const [areaData, setArea] = useState([]);
  const [typeData, setType] = useState([]);

  
  const load = () => {
    const params = { from: from?.toISOString().slice(0,10), to: to?.toISOString().slice(0,10) };
    getSummary(params).then(r => setSummary(r.data));
    getByArea(params).then(r => {
      // Mapear todas las áreas posibles, asignando count 0 si no está en los datos
      const data = AREAS.map((area) => {
        const found = r.data.find((a) => a.area === area);
        return { area, count: found ? Number(found.count) : 0 };
      });
      setArea(data);
    });
    getByType(params).then(r => setType(r.data));
  };



  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="dashboard-pdf-content">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Reportes Administrativos</h2>
            <p className="mt-2 text-lg text-gray-600">Dashboard de indicadores y análisis del sistema de tareas</p>
          </div>

          {/* Date Filters */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Fecha</h3>
              <div className="mb-2 text-sm text-gray-500">
                Mostrando datos desde <b>{from?.toLocaleDateString()}</b> hasta <b>{to?.toLocaleDateString()}</b>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                  <DatePicker
                    selected={from}
                    onChange={setFrom}
                    placeholderText="Seleccionar fecha"
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <DatePicker
                    selected={to}
                    onChange={setTo}
                    placeholderText="Seleccionar fecha"
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={load}
                    className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Aplicar Filtros</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Tasks Created */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas Creadas</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total ?? '0'}</p>
                </div>
              </div>
            </div>

            {/* Total Tasks Completed */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas Finalizadas</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.completed ?? '0'}</p>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.pending ?? '0'}</p>
                </div>
              </div>
            </div>

            {/* In Progress Tasks */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tareas en Progreso</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.inProgress ?? '0'}</p>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.completed && summary.total 
                      ? `${Math.round((summary.completed / summary.total) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tasks by Area Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Tareas por Área</h3>
              </div>
              {areaData && areaData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={areaData}>
                      <XAxis dataKey="area" tick={false} label={{ value: 'Área', position: 'outsideBottom', offset: 65 }} />
                      <YAxis allowDecimals={false} label={{ value: 'Cantidad de Tareas', angle: -90, position: 'outsideLeft', dx: -20 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Cantidad de Tareas" radius={[8, 8, 0, 0]}>
                        {areaData.map((entry, idx) => (
                          <Cell key={idx} fill={colors[idx % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Leyenda personalizada de áreas */}
                  <div className="flex flex-wrap justify-center mt-4 gap-4">
                    {areaData.map((entry, idx) => (
                      <div key={entry.area} className="flex items-center space-x-2">
                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                        <span className="text-sm text-gray-700">{entry.area}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-16">No hay datos para mostrar</div>
              )}
            </div>

            {/* Tasks by Service Type Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Tareas por Tipo de Servicio</h3>
              </div>
              {typeData && typeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={100}
                        label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {typeData.map((entry, idx) => (
                          <Cell key={idx} fill={donutColors[idx % donutColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} tareas`, 'Cantidad']} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Leyenda personalizada de tipos de servicio */}
                  <div className="flex flex-wrap justify-center mt-4 gap-4">
                    {typeData.map((entry, idx) => (
                      <div key={entry.type} className="flex items-center space-x-2">
                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: donutColors[idx % donutColors.length] }}></span>
                        <span className="text-sm text-gray-700">{entry.type}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-16">No hay datos para mostrar</div>
              )}
            </div>
          </div>

          {/* Additional Charts */}
          {/* Se eliminaron las gráficas de evolución temporal y estado de tareas */}
        </div>
      </main>
    </div>
  );
}