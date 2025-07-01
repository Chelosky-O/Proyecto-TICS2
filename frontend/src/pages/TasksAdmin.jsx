// frontend/src/pages/TasksAdmin.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTasks } from '../api/tasks';
import { format } from 'date-fns';

export default function TasksAdmin() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  // Formateador seguro antes del render
  const fmt = (d) => (d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '-');
  
  // Formateador corto para fechas
  const fmtShort = (d) => (d ? format(new Date(d), 'dd MMM yyyy') : '-');

  // Cargar tareas al montar
  useEffect(() => {
    getAllTasks().then((r) => {
      setTasks(r.data);
      setFilteredTasks(r.data);
    });
  }, []);

  // Filtrar tareas cuando cambien los filtros
  useEffect(() => {
    let filtered = tasks;

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    if (filters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.author?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.executor?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // Calcular estadísticas
  const stats = {
    pendientes: tasks.filter(t => t.status === 'pendiente').length,
    asignadas: tasks.filter(t => t.status === 'asignada').length,
    enProgreso: tasks.filter(t => t.status === 'en-progreso').length,
    completadas: tasks.filter(t => t.status === 'completada').length,
  };

  // Obtener clase CSS para el estado
  const getStatusClass = (status) => {
    const classes = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'asignada': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'en-progreso': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'completada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return classes[status] || '';
  };

  // Obtener clase CSS para la prioridad
  const getPriorityClass = (priority) => {
    const classes = {
      'alta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'baja': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return classes[priority] || '';
  };

  // Obtener clase CSS para el tipo de servicio
  const getServiceClass = (type) => {
    const classes = {
      'retiro': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'traslados': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'compras': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'varios': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return classes[type] || '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Todas las Tareas</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Vista administrativa completa de todas las tareas del sistema
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              to="/assign"
              className="inline-flex items-center px-4 py-2 border border-violet-600 rounded-lg shadow-sm text-sm font-medium text-violet-600 bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Asignar Pendientes
            </Link>
            <Link
              to="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Tarea
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in delay-100">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pendientes</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.pendientes}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Asignadas</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.asignadas}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">En Progreso</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.enProgreso}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completadas</dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">{stats.completadas}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table Section */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lista Completa de Tareas</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Filter by Status */}
              <div className="relative">
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="asignada">Asignada</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Filter by Type */}
              <div className="relative">
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos los tipos</option>
                  <option value="retiro">Retiro</option>
                  <option value="traslados">Traslados</option>
                  <option value="compras">Compras</option>
                  <option value="varios">Varios</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Buscar tareas..." 
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ejecutor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map((task, index) => (
                  <tr key={task.id} className={index % 2 === 0 ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(task.type)}`}>
                            {task.type}
                          </span>
                          {task.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{task.author?.name || '-'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{task.author?.area || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.executor ? (
                        <div className="flex items-center">
                          <img 
                            className="h-8 w-8 rounded-full mr-2" 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.executor.name)}&background=6d28d9&color=fff`} 
                            alt={task.executor.name}
                          />
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{task.executor.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Servicios Generales</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">Sin asignar</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div><span className="font-medium">Creada:</span> {fmtShort(task.requestedAt)}</div>
                        <div><span className="font-medium">Límite:</span> {fmtShort(task.dueAt)}</div>
                        <div><span className="font-medium">Asignada:</span> {fmtShort(task.assignedAt)}</div>
                        <div><span className="font-medium">Completada:</span> {fmtShort(task.completedAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/tasks/${task.id}`} className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 mr-3">
                        Ver
                      </Link>
                      {task.status === 'pendiente' ? (
                        <Link to={`/assign/${task.id}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          Asignar
                        </Link>
                      ) : (
                        <Link to={`/tasks/${task.id}/edit`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden p-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="mobile-card mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(task.type)}`}>
                      {task.type}
                    </span>
                  </div>
                  {task.priority && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prioridad:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Solicitante:</span>
                    <span className="text-gray-900 dark:text-white">
                      {task.author?.name || '-'} {task.author?.area && `(${task.author.area})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Ejecutor:</span>
                    <span className={task.executor ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 italic"}>
                      {task.executor?.name || 'Sin asignar'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Límite:</span>
                    <span className="text-gray-900 dark:text-white">{fmtShort(task.dueAt)}</span>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Link to={`/tasks/${task.id}`} className="text-violet-600 hover:text-violet-900 text-sm font-medium">
                    Ver
                  </Link>
                  {task.status === 'pendiente' ? (
                    <Link to={`/assign/${task.id}`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Asignar
                    </Link>
                  ) : (
                    <Link to={`/tasks/${task.id}/edit`} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No hay tareas que coincidan con los filtros seleccionados.
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{Math.min(10, filteredTasks.length)}</span> de <span className="font-medium">{filteredTasks.length}</span> tareas
              </div>
              <div className="flex items-center space-x-1">
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="px-3 py-1 border border-primary-500 dark:border-primary-500 rounded-md text-sm font-medium text-white bg-primary-600 dark:bg-primary-600">
                  1
                </button>
                {filteredTasks.length > 10 && (
                  <>
                    <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      2
                    </button>
                    {filteredTasks.length > 20 && (
                      <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        3
                      </button>
                    )}
                    {filteredTasks.length > 30 && (
                      <>
                        <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">...</span>
                        <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          {Math.ceil(filteredTasks.length / 10)}
                        </button>
                      </>
                    )}
                  </>
                )}
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" disabled={filteredTasks.length <= 10}>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}