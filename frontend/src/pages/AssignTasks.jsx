import { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUnassigned, assignTask } from '../api/tasks';
import { getExecutors } from '../api/users';

export default function AssignTasks() {
  const [tasks, setTasks] = useState([]);
  const [execs, setExecs] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [priorityFilter, typeFilter, searchTerm]);

  const load = () => {
    getUnassigned().then(r => {
      setTasks(r.data);
      setFilteredTasks(r.data);
    });
  };

  useEffect(() => {
    load();
    getExecutors().then(r =>
      setExecs(r.data.map(u => ({ value: u.id, label: u.name })))
    );
  }, []);

  // Filtrar tareas según búsqueda y filtros
  useEffect(() => {
    let filtered = tasks.filter(task => {
      // Solo filtrar por título
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase());
      // Prioridad exacta
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      // Tipo exacto
      const matchesType = !typeFilter || task.type === typeFilter;
      return matchesSearch && matchesPriority && matchesType;
    });
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, priorityFilter, typeFilter]);

  async function handleAssign(taskId, taskTitle, userOption) {
    // En vez de window.confirm, abrimos el modal
    setConfirmModal({ open: true, task: { id: taskId, title: taskTitle }, executor: userOption });
  }

  async function confirmAssign() {
    const { task, executor } = confirmModal;
    setLoadingTasks(prev => ({ ...prev, [task.id]: true }));
    setConfirmModal({ open: false, task: null, executor: null });
    try {
      await assignTask(task.id, executor.value);
      setTimeout(() => {
        load();
        setLoadingTasks(prev => ({ ...prev, [task.id]: false }));
      }, 300);
    } catch (error) {
      console.error('Error asignando tarea:', error);
      setLoadingTasks(prev => ({ ...prev, [task.id]: false }));
    }
  }

  // Badges visuales (estilo TasksAdmin)
  function getPriorityBadge(priority) {
    const classes = {
      Alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      baja: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    const label = priority?.charAt(0).toUpperCase() + priority?.slice(1);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[priority] || ''}`}>{label}</span>
    );
  }

  function getTypeBadge(type) {
    const classes = {
      Retiro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Traslados: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Compras: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Varios: 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200',
      mantenimiento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      limpieza: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      transporte: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      suministros: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      reparacion: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    const label = type?.charAt(0).toUpperCase() + type?.slice(1);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[type] || ''}`}>{label}</span>
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

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar tareas
            </label>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Tabla de tareas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tareas Pendientes de Asignación
          </h3>
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
