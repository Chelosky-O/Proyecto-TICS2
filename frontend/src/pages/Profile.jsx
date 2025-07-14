// frontend/src/pages/Profile.jsx
import { useAuth } from '../auth/AuthContext';
import { useState, useEffect } from 'react';
import { updateMyProfile, changePassword } from '../api/users';
import { useNotification } from '../context/NotificationContext';

export default function Profile() {
  const { user, updateUserData, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPasswordLoading, setIsChangingPasswordLoading] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  
  // Estados para formularios
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    area: user.area || ''
  });

  // Actualizar el formulario cuando cambien los datos del usuario
  useEffect(() => {
    setEditForm({
      name: user.name,
      email: user.email,
      area: user.area || ''
    });
  }, [user]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Trigger animations immediately after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Mapeo de roles a nombres display
  const roleDisplayNames = {
    solicitante: 'Solicitante',
    sg: 'Servicios Generales',
    admin: 'Administrador'
  };

  // Función para obtener el color del rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'solicitante':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'sg':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      case 'admin':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const roleColors = getRoleColor(user.role);

  // Funciones para manejar formularios
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar si se van a hacer cambios
    const hasChanges = user.name !== editForm.name || 
                      user.email !== editForm.email || 
                      user.area !== editForm.area;
    
    if (hasChanges && !showProfileWarning) {
      setShowProfileWarning(true);
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await updateMyProfile(editForm);
      
      showSuccess('Perfil actualizado exitosamente. Por seguridad, tu sesión se ha cerrado. Por favor, inicia sesión nuevamente.');
      
      // Cerrar sesión después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (err) {
      showError('No se pudo actualizar el perfil');
    } finally {
      setIsUpdating(false);
      setShowProfileWarning(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordForm.newPassword.length < 3) {
      showError('La nueva contraseña debe tener al menos 3 caracteres');
      return;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showError('La nueva contraseña debe ser diferente a la contraseña actual');
      return;
    }
    
    setIsChangingPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showSuccess('Contraseña actualizada exitosamente. Por seguridad, tu sesión se ha cerrado. Por favor, inicia sesión con tu nueva contraseña.');
      
      // Limpiar el formulario
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Cerrar sesión después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      showError(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setIsChangingPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Contenido principal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Sección de bienvenida */}
        <div className={`mb-8 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-3xl font-bold text-gray-900">
            Mi Perfil
          </h2>
          <p className="text-lg text-gray-600">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className={`mb-6 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Editar Perfil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cambiar Contraseña
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido principal según la pestaña activa */}
        {activeTab === 'profile' && (
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Header del perfil con gradiente */}
            <div className="bg-gradient-to-r from-violet-800 to-purple-500 px-6 py-8">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-full border-4 border-white/30 shadow-lg"
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=6d28d9&color=fff&size=96`}
                    alt="User avatar"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Información básica */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {roleDisplayNames[user.role]}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del perfil */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información personal */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Información Personal
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{user.email || 'No disponible - Inicia sesión nuevamente'}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Área</p>
                        <p className="text-gray-900">{user.area || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Miembro desde</p>
                        <p className="text-gray-900">
                          {user.iat ? new Date(user.iat * 1000).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas y permisos */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Permisos y Acceso
                  </h4>

                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-800">Rol del Sistema</p>
                          <p className="text-lg font-semibold text-purple-900">{roleDisplayNames[user.role]}</p>
                        </div>
                        <div className={`p-2 rounded-full ${roleColors.bg}`}>
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Permisos específicos según el rol */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Permisos disponibles:</h5>
                      <div className="space-y-2">
                        {user.role === 'solicitante' && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Crear y gestionar tareas propias
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Ver historial de tareas
                            </div>
                          </>
                        )}
                        
                        {user.role === 'sg' && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Ver calendario de tareas asignadas
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Actualizar estado de tareas
                            </div>
                          </>
                        )}
                        
                        {user.role === 'admin' && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Gestión completa de tareas
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Gestión de usuarios
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Generar reportes
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Asignar tareas
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña de Editar Perfil */}
        {activeTab === 'edit' && (
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-violet-800 to-purple-500 px-6 py-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Perfil
              </h3>
            </div>

            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                      Área
                    </label>
                    <select
                      id="area"
                      value={editForm.area}
                      onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar área</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Gerencia">Gerencia</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="UTM">UTM</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                      isUpdating 
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>

                {/* Advertencia de cambios en el perfil */}
                {showProfileWarning && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">
                          Cambios en el perfil detectados
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Al actualizar tu perfil, tu sesión se cerrará por seguridad. Necesitarás iniciar sesión nuevamente para ver los cambios reflejados.
                        </p>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowProfileWarning(false)}
                            className="px-3 py-1 text-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors duration-200"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm text-white bg-yellow-600 hover:bg-yellow-700 rounded transition-colors duration-200"
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Pestaña de Cambiar Contraseña */}
        {activeTab === 'password' && (
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-violet-800 to-purple-500 px-6 py-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Cambiar Contraseña
              </h3>
            </div>

            <div className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      minLength="3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPasswordLoading}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                      isChangingPasswordLoading 
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {isChangingPasswordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cambiando...
                      </>
                    ) : (
                      'Cambiar Contraseña'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 