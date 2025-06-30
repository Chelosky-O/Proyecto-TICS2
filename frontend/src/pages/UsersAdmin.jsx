// frontend/src/pages/UsersAdmin.jsx
import { useEffect, useState } from 'react';
import { getAllUsers, createUser, toggleActive } from '../api/users';
import Select from 'react-select';

const areaOpts = [
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Laboratorio', label: 'Laboratorio' },
  { value: 'Gerencia', label: 'Gerencia' },
  { value: 'Finanzas', label: 'Finanzas' },
  { value: 'Servicios Generales', label: 'Servicios Generales' },
  { value: 'UTM', label: 'UTM' }
];

const roleOpts = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'sg', label: 'Servicios Generales' },
  { value: 'admin', label: 'Administrador' }
];

// Custom styles for react-select to match the design
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgb(255 255 255)',
    borderColor: state.isFocused ? 'rgb(139 92 246)' : 'rgb(209 213 219)',
    boxShadow: state.isFocused ? '0 0 0 1px rgb(139 92 246)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '&:hover': {
      borderColor: 'rgb(139 92 246)'
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgb(156 163 175)'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'rgb(139 92 246)' : state.isFocused ? 'rgb(243 244 246)' : 'white',
    color: state.isSelected ? 'white' : 'rgb(17 24 39)',
    '&:hover': {
      backgroundColor: state.isSelected ? 'rgb(139 92 246)' : 'rgb(243 244 246)'
    }
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
    setShowCreateModal(false);
    load();
  }

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClasses = (role) => {
    switch(role.toLowerCase()) {
      case 'solicitante':
        return 'bg-blue-100 text-blue-800';
      case 'servicios generales':
      case 'sg':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    switch(role.toLowerCase()) {
      case 'sg':
        return 'Servicios Generales';
      case 'admin':
        return 'Administrador';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <p className="mt-2 text-lg text-gray-600">Administra los usuarios del sistema y sus permisos</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Users Table Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Lista de Usuarios</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar usuarios..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Área
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? 'hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full" 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6d28d9&color=fff`} 
                                alt={user.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.area}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(user.Role?.name || '')}`}>
                            {getRoleDisplayName(user.Role?.name || '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={user.active}
                                onChange={() => toggleActive(user.id).then(load)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                            </label>
                            <span className={`ml-3 text-sm ${user.active ? 'text-gray-900' : 'text-gray-500'}`}>
                              {user.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{users.length}</span> usuarios
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal Placeholder */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowEditModal(false)}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Editar Usuario</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Función de edición en desarrollo para: {selectedUser?.name}</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal Placeholder */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowDeleteModal(false)}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar usuario
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar a {selectedUser?.name}? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    // Aquí iría la lógica de eliminación
                    setShowDeleteModal(false);
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => {
                setShowCreateModal(false);
                setForm({});
              }}
            />
            
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Usuario</h3>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({});
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="create-name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                      <div className="mt-1">
                        <input 
                          type="text" 
                          name="name" 
                          id="create-name" 
                          value={form.name || ''}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="Nombre y apellidos"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="create-email" className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1">
                        <input 
                          type="email" 
                          name="email" 
                          id="create-email" 
                          value={form.email || ''}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="usuario@vidacel.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="create-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                      <div className="mt-1">
                        <input 
                          type="password" 
                          name="password" 
                          id="create-password" 
                          value={form.password || ''}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Área</label>
                      <div className="mt-1">
                        <Select
                          options={areaOpts}
                          placeholder="Seleccionar área"
                          value={form.area}
                          onChange={area => setForm({ ...form, area })}
                          styles={customSelectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          inputId="create-area"
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          menuPosition="fixed"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rol</label>
                      <div className="mt-1">
                        <Select
                          options={roleOpts}
                          placeholder="Seleccionar rol"
                          value={form.role}
                          onChange={role => setForm({ ...form, role })}
                          styles={customSelectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          inputId="create-role"
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          menuPosition="fixed"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        id="create-active" 
                        name="active" 
                        type="checkbox" 
                        defaultChecked={true}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="create-active" className="ml-2 block text-sm text-gray-700">
                        Usuario activo
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setForm({});
                      }}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Guardar Usuario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}