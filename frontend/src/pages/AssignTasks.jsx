import { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUnassigned, assignTask } from '../api/tasks';
import { getExecutors } from '../api/users';
import { useNotification } from '../context/NotificationContext';

export default function AssignTasks() {
  const { showSuccess, showError } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [execs, setExecs] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  // NUEVO: Estado de filtros y filtros aplicados
  const [filters, setFilters] = useState({
    priority: '',
    type: '',
    search: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    priority: '',
    type: '',
    search: '',
  });
  // Estado de ordenamiento: true = límite más próximo primero, false = más lejano primero
  const [showNewestFirst, setShowNewestFirst] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState({});
  // Estado para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ open: false, task: null, executor: null });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Resetear página cuando cambien los filtros aplicados
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const load = () => {
    getUnassigned().then(r => {
      setTasks(r.data);
    });
  };

  useEffect(() => {
    load();
    getExecutors().then(r =>
      setExecs(r.data.map(u => ({ value: u.id, label: u.name })))
    );
  }, []);

  // NUEVO: Filtrar tareas cuando cambien los filtros aplicados
  useEffect(() => {
    let filtered = [...tasks];
    // Buscador solo por título
    if (appliedFilters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(appliedFilters.search.toLowerCase())
      );
    }
    // Prioridad exacta
    if (appliedFilters.priority) {
      filtered = filtered.filter(task => task.priority === appliedFilters.priority);
    }
    // Tipo exacto
    if (appliedFilters.type) {
      filtered = filtered.filter(task => task.type === appliedFilters.type);
    }
    // Ordenar por fecha límite (dueAt o deadline)
    filtered.sort((a, b) => {
      // Tomar dueAt o deadline, si no existe poner Infinity
      const aDate = new Date(a.dueAt || a.deadline || 0).getTime() || Infinity;
      const bDate = new Date(b.dueAt || b.deadline || 0).getTime() || Infinity;
      if (showNewestFirst) {
        return aDate - bDate; // Más próximo primero
      } else {
        return bDate - aDate; // Más lejano primero
      }
    });
    setFilteredTasks(filtered);
  }, [tasks, appliedFilters, showNewestFirst]);

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ priority: '', type: '', search: '' });
    setAppliedFilters({ priority: '', type: '', search: '' });
  };

  async function handleAssign(taskId, taskTitle, userOption) {
    setConfirmModal({ open: true, task: { id: taskId, title: taskTitle }, executor: userOption });
  }

  async function confirmAssign() {
    const { task, executor } = confirmModal;
    setLoadingTasks(prev => ({ ...prev, [task.id]: true }));
    setConfirmModal({ open: false, task: null, executor: null });
    try {
      await assignTask(task.id, executor.value);
      showSuccess(`Tarea "${task.title}" asignada exitosamente a ${executor.label}`);
      setTimeout(() => {
        load();
        setLoadingTasks(prev => ({ ...prev, [task.id]: false }));
      }, 300);
    } catch (error) {
      console.error('Error asignando tarea:', error);
      showError('Error al asignar la tarea. Inténtalo de nuevo.');
      setLoadingTasks(prev => ({ ...prev, [task.id]: false }));
    }
  }

  // Badges visuales (estilo TasksAdmin)
  function getPriorityBadge(priority) {
    const classes = {
      Alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[priority] || ''}`}>{priority}</span>
    );
  }

  function getTypeBadge(type) {
    const classes = {
      Retiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Traslados: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Compras: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Varios: 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[type] || ''}`}>{type}</span>
    );
  }

  // Estilos para react-select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#8b5cf6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#8b5cf6'
      },
      minHeight: '2.5rem',
      fontSize: '0.875rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#8b5cf6' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151'
    })
  };

  // Formateador de fecha
  const fmtShort = (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '-');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Asignar Tareas</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Vista administrativa para asignar tareas pendientes a ejecutores
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y Ordenamiento (igual visual que TasksAdmin) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Buscador solo por título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscador (título)
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar..."
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
          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Tarea
            </label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
            >
              <option value="">Todos los tipos</option>
              <option value="Retiro">Retiro</option>
              <option value="Traslados">Traslados</option>
              <option value="Compras">Compras</option>
              <option value="Varios">Varios</option>
            </select>
          </div>
          {/* Filtro por Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              value={filters.priority}
              onChange={e => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
        {/* Botones */}
        <div className="mt-4">
          <div className="flex justify-end">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setAppliedFilters({ ...filters })}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 font-medium text-sm border border-red-700 shadow"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

              {/* Tabla de tareas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tareas Pendientes de Asignación ({filteredTasks.length} tareas)
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Orden: {showNewestFirst ? "Límite más próximo primero" : "Límite más lejano primero"}
              </span>
              <button
                onClick={() => setShowNewestFirst(!showNewestFirst)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
                title="Cambiar orden"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          </div>
        {/* Tabla Desktop */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Límite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asignar a</th>
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
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {task.description || task.location || 'Sin descripción'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(task.type)}</td>
                  <td className="px-6 py-4">{getPriorityBadge(task.priority)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{fmtShort(task.deadline || task.dueAt)}</td>
                  <td className="px-6 py-4">
                    <div className="w-48">
                      <Select
                        options={execs}
                        placeholder="Seleccionar ejecutor..."
                        isDisabled={loadingTasks[task.id]}
                        styles={selectStyles}
                        onChange={opt => handleAssign(task.id, task.title, opt)}
                        className="text-sm"
                      />
                    </div>
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
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                  {getTypeBadge(task.type)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Prioridad:</span>
                  {getPriorityBadge(task.priority)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Límite:</span>
                  <span className="text-gray-900 dark:text-white">{fmtShort(task.deadline || task.dueAt)}</span>
                </div>
              </div>
              <div className="mt-3">
                <Select
                  options={execs}
                  placeholder="Seleccionar ejecutor..."
                  isDisabled={loadingTasks[task.id]}
                  styles={selectStyles}
                  onChange={opt => handleAssign(task.id, task.title, opt)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        {/* Mensaje vacío */}
        {filteredTasks.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No hay tareas pendientes que coincidan con los filtros seleccionados.
          </div>
        )}
        {/* Paginación */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
              Mostrando <span className="font-medium">{filteredTasks.length === 0 ? 0 : indexOfFirstTask + 1}</span> a{' '}
              <span className="font-medium">{Math.min(indexOfLastTask, filteredTasks.length)}</span> de{' '}
              <span className="font-medium">{filteredTasks.length}</span> tareas
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

      {/* Modal de confirmación de asignación */}
      {confirmModal.open && confirmModal.task && confirmModal.executor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setConfirmModal({ open: false, task: null, executor: null })}
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-purple-600"
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
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Confirmar asignación
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        ¿Estás seguro de que deseas asignar la tarea <span className="font-semibold">{confirmModal.task.title}</span> a <span className="font-semibold">{confirmModal.executor.label}</span>?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmAssign}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Asignar
                </button>
                <button
                  onClick={() => setConfirmModal({ open: false, task: null, executor: null })}
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
