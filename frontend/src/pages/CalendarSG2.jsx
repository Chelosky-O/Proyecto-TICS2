import { useEffect, useState } from 'react';

// Simulando el contexto de autenticación y API calls
const useAuth = () => ({ user: { role: 'sg' } });
const getAssignedTasks = () => Promise.resolve({ data: mockTasks });
const getAllTasks = () => Promise.resolve({ data: mockTasks });
const changeStatus = (id, status) => Promise.resolve();

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

// Mock data para demostración
const mockTasks = [
  {
    id: 1,
    title: 'Traslado de equipos de laboratorio',
    status: 'En Progreso',
    dueAt: '2023-11-15T08:30:00',
    author: { area: 'Comercial' }
  },
  {
    id: 2,
    title: 'Compra de material de oficina',
    status: 'Pendiente',
    dueAt: '2023-11-14T08:00:00',
    author: { area: 'Laboratorio' }
  },
  {
    id: 3,
    title: 'Mantenimiento sistema ventilación',
    status: 'Pendiente',
    dueAt: '2023-11-16T09:00:00',
    author: { area: 'UTM' }
  },
  {
    id: 4,
    title: 'Retiro de documentos archivo',
    status: 'Finalizada',
    dueAt: '2023-11-13T10:00:00',
    author: { area: 'Finanzas' }
  },
  {
    id: 5,
    title: 'Instalación nuevo mobiliario',
    status: 'En Progreso',
    dueAt: '2023-11-17T10:00:00',
    author: { area: 'Gerencia' }
  },
  {
    id: 6,
    title: 'Limpieza área común',
    status: 'Pendiente',
    dueAt: '2023-11-18T11:00:00',
    author: { area: 'General' }
  },
  {
    id: 7,
    title: 'Revisión inventario',
    status: 'En Progreso',
    dueAt: '2023-11-14T13:00:00',
    author: { area: 'Almacén' }
  },
  {
    id: 8,
    title: 'Organización archivo',
    status: 'Pendiente',
    dueAt: '2023-11-17T16:00:00',
    author: { area: 'Administración' }
  }
];

export default function CalendarSG() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [taskFilter, setTaskFilter] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    (user.role === 'sg' ? getAssignedTasks() : getAllTasks())
      .then(r => setTasks(r.data));
  }, [user.role]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle status change
  async function handleStatus(task, nextStatus) {
    const ok = window.confirm(
      `¿Cambiar estado de "${task.title}" a ${nextStatus}?`
    );
    if (!ok) return;

    await changeStatus(task.id, nextStatus);
    setTasks(s => s.map(k => k.id === task.id ? { ...k, status: nextStatus } : k));
    showNotification(`"${task.title}" marcada como ${nextStatus}`, 'success');
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const statusMatch = !taskFilter || task.status.toLowerCase().replace(' ', '-') === taskFilter;
    const searchMatch = !taskSearch || task.title.toLowerCase().includes(taskSearch.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Get status class
  const getStatusClass = (status) => {
    const statusMap = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En Progreso': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Finalizada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get calendar event class
  const getEventClass = (status) => {
    const eventMap = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
      'En Progreso': 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
      'Finalizada': 'bg-green-100 text-green-800 border-l-4 border-green-500'
    };
    return eventMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="relative z-10 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario Servicios Generales</h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Vista semanal de todas las tareas asignadas</p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {darkMode ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
                {/* Legend */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                    <span>Pendiente</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span>En Progreso</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Finalizada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar and Task List Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Calendar Section */}
            <div className="xl:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Calendar Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Semana del 13 - 19 Noviembre 2023</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                      Hoy
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Calendar Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                    {/* Header Row */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Hora</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Lun 13</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Mar 14</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Mié 15</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Jue 16</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Vie 17</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Sáb 18</div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 text-center font-semibold text-sm">Dom 19</div>
                    
                    {/* Time slots */}
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                      <div key={hour} className="contents">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                          {hour}:00
                        </div>
                        {[...Array(7)].map((_, dayIndex) => {
                          const dayTasks = tasks.filter(task => {
                            if (!task.dueAt) return false;
                            const taskDate = new Date(task.dueAt);
                            const taskHour = taskDate.getHours();
                            const taskDay = taskDate.getDay();
                            return taskHour === hour && taskDay === (dayIndex + 1) % 7;
                          });
                          
                          return (
                            <div key={dayIndex} className="bg-white dark:bg-gray-800 min-h-16 p-1 relative">
                              {dayTasks.map(task => (
                                <div 
                                  key={task.id}
                                  className={`absolute left-1 right-1 top-1 p-1 rounded text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getEventClass(task.status)}`}
                                  onClick={() => showNotification(`Mostrando detalles de: ${task.title}`, 'info')}
                                >
                                  {task.title}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Task List Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.role === 'sg' ? 'Mis tareas' : 'Todas las tareas'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
                </div>
                
                {/* Task Filters */}
                <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
                  <select 
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="block w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white p-2"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en-progreso">En Progreso</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Buscar tareas..." 
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="block w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 p-2"
                  />
                </div>
                
                {/* Task List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(task.dueAt)} — Área: {task.author?.area}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                          
                          {user.role === 'sg' && (
                            <div className="flex flex-col gap-1">
                              {task.status === 'Pendiente' && (
                                <>
                                  <button 
                                    onClick={() => handleStatus(task, 'En Progreso')}
                                    className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium px-2 py-1 bg-purple-50 dark:bg-purple-900 rounded"
                                  >
                                    ▶ Iniciar
                                  </button>
                                  <button 
                                    onClick={() => handleStatus(task, 'Finalizada')}
                                    className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium px-2 py-1 bg-green-50 dark:bg-green-900 rounded"
                                  >
                                    ✓ Finalizar
                                  </button>
                                </>
                              )}
                              {task.status === 'En Progreso' && (
                                <button 
                                  onClick={() => handleStatus(task, 'Finalizada')}
                                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium px-2 py-1 bg-green-50 dark:bg-green-900 rounded"
                                >
                                  ✓ Finalizar
                                </button>
                              )}
                              {task.status === 'Finalizada' && (
                                <span className="text-xs text-gray-400">Completada</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 shadow-lg max-w-sm transform transition-transform">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {notification.type === 'info' ? 'Información' : '¡Estado actualizado!'}
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className="inline-flex bg-green-50 dark:bg-green-900 rounded-md p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-800 focus:outline-none"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}