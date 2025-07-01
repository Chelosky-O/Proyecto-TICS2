import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTasks } from '../api/tasks';
import { format } from 'date-fns';

// Funciones para badges
const getStatusClass = (status) => {
  const classes = {
    Pendiente: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'En Progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Finalizada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pendiente: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'en-progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return classes[status] || '';
};
const getPriorityClass = (priority) => {
  const classes = {
    Alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return classes[priority] || '';
};
const getServiceClass = (type) => {
  const classes = {
    Retiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Traslados: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Compras: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    Varios: 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200',
  };
  return classes[type] || '';
};

function fmtShort(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmt(d) {
  if (!d) return '-';
  return format(new Date(d), 'dd/MM/yyyy HH:mm');
}

export default function TasksSolicitante() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Nuevo estado para filtros
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    getMyTasks().then((r) => {
      setTasks(r.data);
      setFilteredTasks(r.data);
    });
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (filters.status) {
      filtered = filtered.filter((task) =>
        (task.status || "").toLowerCase() === filters.status.toLowerCase()
      );
    }
    if (filters.type) {
      filtered = filtered.filter((task) =>
        (task.type || "").toLowerCase() === filters.type.toLowerCase()
      );
    }
    if (filters.priority) {
      filtered = filtered.filter((task) =>
        (task.priority || "").toLowerCase() === filters.priority.toLowerCase()
      );
    }
    if (filters.search) {
      filtered = filtered.filter(
        (task) =>
          (task.title && task.title.toLowerCase().includes(filters.search.toLowerCase())) ||
          (task.executor?.name && task.executor.name.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [filters, tasks]);

  // Actualizar filtros al cambiar los selectores
  useEffect(() => {
    setFilters(f => ({
      ...f,
      priority: priorityFilter,
      type: typeFilter
    }));
  }, [priorityFilter, typeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mis solicitudes</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Vista de todas tus solicitudes de servicio</p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              to="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nueva Solicitud
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar solicitudes
            </label>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los tipos</option>
              <option value="Retiro">Retiro</option>
              <option value="Traslados">Traslados</option>
              <option value="Compras">Compras</option>
              <option value="Varios">Varios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes (desktop) */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Límite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ejecutor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No hay solicitudes que coincidan con los filtros seleccionados.</td>
              </tr>
            ) : (
              currentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                  <td className="px-6 py-4">
                    {task.type && <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(task.type)}`}>{task.type}</span>}
                  </td>
                  <td className="px-6 py-4">
                    {task.priority && <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(task.priority)}`}>{task.priority}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(task.status)}`}>{task.status}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{fmtShort(task.dueAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {task.executor ? (
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.executor.name)}&background=6d28d9&color=fff`}
                          alt={task.executor.name}
                        />
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.executor.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Servicios Generales
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDetailModal(true);
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móviles */}
      <div className="sm:hidden p-4">
        {currentTasks.map((task) => (
          <div key={task.id} className="mobile-card mb-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {task.title}
              </h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Tipo:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(
                    task.type
                  )}`}
                >
                  {task.type}
                </span>
              </div>
              {task.priority && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Prioridad:
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Ejecutor:
                </span>
                <span
                  className={
                    task.executor
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 italic"
                  }
                >
                  {task.executor?.name || "Sin asignar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Límite:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {fmtShort(task.dueAt)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                className="text-violet-600 hover:text-violet-900 text-sm font-medium"
                onClick={() => {
                  setSelectedTask(task);
                  setShowDetailModal(true);
                }}
              >
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
            Mostrando <span className="font-medium">{filteredTasks.length === 0 ? 0 : indexOfFirstTask + 1}</span> a{" "}
            <span className="font-medium">{Math.min(indexOfLastTask, filteredTasks.length)}</span>{" "}
            de <span className="font-medium">{filteredTasks.length}</span>{" "}
            solicitudes
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2 justify-center mt-4 sm:mt-0">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === number
                        ? "bg-violet-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE SOLICITUD */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowDetailModal(false)}
            />
            {/* Truco para centrar verticalmente */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            {/* Panel modal */}
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalle de Solicitud
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <span className="font-semibold">Título:</span> {selectedTask.title}
                </div>
                <div>
                  <span className="font-semibold">Descripción:</span> {selectedTask.description || '-'}
                </div>
                <div>
                  <span className="font-semibold">Tipo:</span> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(selectedTask.type)}`}>{selectedTask.type}</span>
                </div>
                <div>
                  <span className="font-semibold">Prioridad:</span> {selectedTask.priority ? <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(selectedTask.priority)}`}>{selectedTask.priority}</span> : '-'}
                </div>
                <div>
                  <span className="font-semibold">Estado:</span> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(selectedTask.status)}`}>{selectedTask.status}</span>
                </div>
                <div>
                  <span className="font-semibold">Ejecutor:</span> {selectedTask.executor?.name || 'Sin asignar'}
                </div>
                <div>
                  <span className="font-semibold">Fecha de creación:</span> {fmt(selectedTask.requestedAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha límite:</span> {fmt(selectedTask.dueAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha de asignación:</span> {fmt(selectedTask.assignedAt)}
                </div>
                <div>
                  <span className="font-semibold">Fecha de finalización:</span> {fmt(selectedTask.completedAt)}
                </div>
                <div>
                  <span className="font-semibold">Ubicación:</span> {selectedTask.location || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
