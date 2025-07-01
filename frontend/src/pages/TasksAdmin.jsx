// frontend/src/pages/TasksAdmin.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTasks, updateTask, assignTask, deleteTask } from "../api/tasks";
import { getExecutors } from "../api/users";
import { format } from "date-fns";

export default function TasksAdmin() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5; // O el número que prefieras

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [executors, setExecutors] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Formateador seguro antes del render
  const fmt = (d) => (d ? format(new Date(d), "dd/MM/yyyy HH:mm") : "-");

  // Formateador corto para fechas
  const fmtShort = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "-");

  // Cargar tareas al montar
  useEffect(() => {
    getAllTasks().then((r) => {
      setTasks(r.data);
      setFilteredTasks(r.data);
    });
    getExecutors().then((r) => setExecutors(r.data));
  }, []);

  // Filtrar tareas cuando cambien los filtros
  useEffect(() => {
    let filtered = tasks;

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter((task) => task.type === filters.type);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.author?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          task.executor?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // Calcular estadísticas
  const stats = {
    pendientes: tasks.filter((t) => t.status === "pendiente").length,
    asignadas: tasks.filter((t) => t.status === "asignada").length,
    enProgreso: tasks.filter((t) => t.status === "en-progreso").length,
    completadas: tasks.filter((t) => t.status === "completada").length,
  };

  // Obtener clase CSS para el estado
  const getStatusClass = (status) => {
    const classes = {
      Pendiente:
        "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      "En Progreso":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Finalizada:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return classes[status] || "";
  };

  // Obtener clase CSS para la prioridad
  const getPriorityClass = (priority) => {
    const classes = {
      Alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Media:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Baja: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return classes[priority] || "";
  };

  // Obtener clase CSS para el tipo de servicio
  const getServiceClass = (type) => {
    const classes = {
      Retiro:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Traslados:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Compras: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Varios:
        "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
    };
    return classes[type] || "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Todas las Tareas
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Vista administrativa completa de todas las tareas del sistema
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              to="/assign"
              className="inline-flex items-center px-4 py-2 border border-violet-600 rounded-lg shadow-sm text-sm font-medium text-violet-600 bg-white dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Asignar Pendientes
            </Link>
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
              Nueva Tarea
            </Link>
          </div>
        </div>
      </div>

      {/* Tasks Table Section */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Lista Completa de Tareas
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Buscar tareas..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Tarea
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Solicitante
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Ejecutor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Fechas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentTasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className={
                      index % 2 === 0
                        ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                        : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceClass(
                              task.type
                            )}`}
                          >
                            {task.type}
                          </span>
                          {task.priority && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full mr-2"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            task.author?.name || "-"
                          )}&background=6d28d9&color=fff`}
                          alt={task.author?.name || "-"}
                        />
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.author?.name || "-"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {task.author?.area || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.executor ? (
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full mr-2"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              task.executor.name
                            )}&background=6d28d9&color=fff`}
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
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Sin asignar
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>
                          <span className="font-medium">Creada:</span>{" "}
                          {fmtShort(task.requestedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Límite:</span>{" "}
                          {fmtShort(task.dueAt)}
                        </div>
                        <div>
                          <span className="font-medium">Asignada:</span>{" "}
                          {fmtShort(task.assignedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Completada:</span>{" "}
                          {fmtShort(task.completedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to="#"
                        className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300 mr-3"
                        onClick={e => {
                          e.preventDefault();
                          setSelectedTask(task);
                          setShowDetailModal(true);
                        }}
                      >
                        Ver
                      </Link>
                      {task.status === "pendiente" ? (
                        <Link
                          to={`/assign/${task.id}`}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Asignar
                        </Link>
                      ) : (
                        <Link
                          to="#"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={e => {
                            e.preventDefault();
                            setSelectedTask(task);
                            setEditForm({
                              title: task.title || '',
                              description: task.description || '',
                              location: task.location || '',
                              type: task.type || '',
                              priority: task.priority || '',
                              dueAt: task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : '',
                              executorId: task.executor?.id || ''
                            });
                            setEditErrors({});
                            setShowEditModal(true);
                          }}
                        >
                          Editar
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setTaskToDelete(task);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
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
                      Solicitante:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {task.author?.name || "-"}{" "}
                      {task.author?.area && `(${task.author.area})`}
                    </span>
                  </div>
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
                  <Link
                    to="#"
                    className="text-violet-600 hover:text-violet-900 text-sm font-medium"
                    onClick={e => {
                      e.preventDefault();
                      setSelectedTask(task);
                      setShowDetailModal(true);
                    }}
                  >
                    Ver
                  </Link>
                  {task.status === "pendiente" ? (
                    <Link
                      to={`/assign/${task.id}`}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      Asignar
                    </Link>
                  ) : (
                    <Link
                      to="#"
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      onClick={e => {
                        e.preventDefault();
                        setSelectedTask(task);
                        setEditForm({
                          title: task.title || '',
                          description: task.description || '',
                          location: task.location || '',
                          type: task.type || '',
                          priority: task.priority || '',
                          dueAt: task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : '',
                          executorId: task.executor?.id || ''
                        });
                        setEditErrors({});
                        setShowEditModal(true);
                      }}
                    >
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
                Mostrando <span className="font-medium">{filteredTasks.length === 0 ? 0 : indexOfFirstTask + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastTask, filteredTasks.length)}
                </span>{" "}
                de <span className="font-medium">{filteredTasks.length}</span>{" "}
                tareas
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
        </div>
      </div>

      {/* MODAL DETALLE DE TAREA */}
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
                  Detalle de Tarea
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
                  <span className="font-semibold">Solicitante:</span> {selectedTask.author?.name || '-'} ({selectedTask.author?.area || '-'})
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

      {/* MODAL EDITAR TAREA */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowEditModal(false)}
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
                  Editar Tarea
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
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
              <form
                className="p-6 space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Validaciones
                  const newErrors = {};
                  if (!editForm.title || editForm.title.trim().length < 5) newErrors.title = 'El título debe tener al menos 5 caracteres';
                  if (!['Retiro', 'Traslados', 'Compras', 'Varios'].includes(editForm.type)) newErrors.type = 'Debes seleccionar un tipo de servicio';
                  if (!['Alta', 'Media', 'Baja'].includes(editForm.priority)) newErrors.priority = 'Debes seleccionar una prioridad';
                  if (!editForm.dueAt || new Date(editForm.dueAt) <= new Date()) newErrors.dueAt = 'La fecha debe ser posterior al momento actual';
                  setEditErrors(newErrors);
                  if (Object.keys(newErrors).length > 0) return;
                  setIsEditSubmitting(true);
                  try {
                    await updateTask(selectedTask.id, {
                      title: editForm.title,
                      description: editForm.description,
                      location: editForm.location,
                      type: editForm.type,
                      priority: editForm.priority,
                      dueAt: editForm.dueAt ? new Date(editForm.dueAt) : null
                    });
                    if (editForm.executorId && editForm.executorId !== (selectedTask.executor?.id || '')) {
                      await assignTask(selectedTask.id, editForm.executorId);
                    }
                    setShowEditModal(false);
                    // Recargar tareas
                    getAllTasks().then((r) => {
                      setTasks(r.data);
                      setFilteredTasks(r.data);
                    });
                  } catch (err) {
                    let msg = 'Error al guardar. Revisa los campos.';
                    if (err.response && err.response.data && err.response.data.errors) {
                      msg = err.response.data.errors.map(e => e.msg).join(' | ');
                    } else if (err.response && err.response.data && err.response.data.message) {
                      msg = err.response.data.message;
                    }
                    setEditErrors({ submit: msg });
                    console.error('Error al guardar tarea:', err);
                  } finally {
                    setIsEditSubmitting(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Título de la tarea <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className={`block w-full px-4 py-3 border ${editErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                    placeholder="Ej: Traslado de equipos de laboratorio"
                  />
                  {editErrors.title && <div className="mt-1 text-sm text-red-600">{editErrors.title}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Descripción detallada
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm resize-none"
                    placeholder="Describe los detalles específicos de la tarea, materiales necesarios, instrucciones especiales, etc."
                  />
                  <div className="mt-1 text-xs text-gray-500">Proporciona todos los detalles relevantes para facilitar el servicio</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Ej: Laboratorio Principal - Piso 2, Oficina 205"
                  />
                  <div className="mt-1 text-xs text-gray-500">Especifica el lugar exacto donde se realizará el servicio</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Tipo de servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      required
                      value={editForm.type}
                      onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                      className={`block w-full px-4 py-3 border ${editErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                    >
                      <option value="" disabled>Seleccionar tipo de servicio</option>
                      <option value="Retiro">Retiro</option>
                      <option value="Traslados">Traslados</option>
                      <option value="Compras">Compras</option>
                      <option value="Varios">Varios</option>
                    </select>
                    {editErrors.type && <div className="mt-1 text-sm text-red-600">{editErrors.type}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Prioridad <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      required
                      value={editForm.priority}
                      onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                      className={`block w-full px-4 py-3 border ${editErrors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                    >
                      <option value="" disabled>Seleccionar prioridad</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                    {editErrors.priority && <div className="mt-1 text-sm text-red-600">{editErrors.priority}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Ejecutor
                    </label>
                    <select
                      name="executorId"
                      value={editForm.executorId}
                      onChange={e => setEditForm(f => ({ ...f, executorId: e.target.value }))}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="">Sin asignar</option>
                      {executors.map(exec => (
                        <option key={exec.id} value={exec.id}>{exec.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Fecha y hora límite <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="dueAt"
                    required
                    value={editForm.dueAt}
                    onChange={e => setEditForm(f => ({ ...f, dueAt: e.target.value }))}
                    className={`block w-full px-4 py-3 border ${editErrors.dueAt ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                  />
                  {editErrors.dueAt && <div className="mt-1 text-sm text-red-600">{editErrors.dueAt}</div>}
                  <div className="mt-1 text-xs text-gray-500">Selecciona cuándo debe estar completada la tarea</div>
                </div>
                {editErrors.submit && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{editErrors.submit}</h3>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEditSubmitting}
                  >
                    {isEditSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR TAREA */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowDeleteModal(false)}
            />
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Eliminar tarea
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar la tarea <span className="font-semibold">{taskToDelete.title}</span>? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={async () => {
                    await deleteTask(taskToDelete.id);
                    setShowDeleteModal(false);
                    setTaskToDelete(null);
                    // Recargar tareas
                    getAllTasks().then((r) => {
                      setTasks(r.data);
                      setFilteredTasks(r.data);
                    });
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
