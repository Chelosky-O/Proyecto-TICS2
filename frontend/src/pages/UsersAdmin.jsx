// frontend/src/pages/UsersAdmin.jsx
import { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  toggleActive,
  updateUser,
  deleteUser,
} from "../api/users";
import { useNotification } from "../context/NotificationContext";
import Select from "react-select";

const areaOpts = [
  { value: "Comercial", label: "Comercial" },
  { value: "Laboratorio", label: "Laboratorio" },
  { value: "Gerencia", label: "Gerencia" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "UTM", label: "UTM" },
];

const roleOpts = [
  { value: "solicitante", label: "Solicitante" },
  { value: "sg", label: "Servicios Generales" },
  { value: "admin", label: "Administrador" },
];

// Custom styles for react-select to match the design
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "rgb(255 255 255)",
    borderColor: state.isFocused ? "rgb(139 92 246)" : "rgb(209 213 219)",
    boxShadow: state.isFocused
      ? "0 0 0 1px rgb(139 92 246)"
      : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "&:hover": {
      borderColor: "rgb(139 92 246)",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "rgb(156 163 175)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "rgb(139 92 246)"
      : state.isFocused
      ? "rgb(243 244 246)"
      : "white",
    color: state.isSelected ? "white" : "rgb(17 24 39)",
    "&:hover": {
      backgroundColor: state.isSelected
        ? "rgb(139 92 246)"
        : "rgb(243 244 246)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

export default function UsersAdmin() {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({});
  // ESTADOS DE FILTRO
  const [filterNameEmail, setFilterNameEmail] = useState("");
  const [filterArea, setFilterArea] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({
    nameEmail: "",
    area: null,
    role: null,
  });
  // Estado de ordenamiento: true = más recientes primero, false = más antiguos primero
  const [showNewestFirst, setShowNewestFirst] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  function load() {
    getAllUsers().then((r) => setUsers(r.data));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        area: form.area?.value,
        role: form.role?.value,
      });
      setForm({});
      setShowCreateModal(false);
      load();
      showSuccess("Usuario creado exitosamente");
    } catch (err) {
      showError("No se pudo crear el usuario");
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user);
    // precargar campos en el mismo estado “form”
    setForm({
      name: user.name,
      email: user.email,
      area: areaOpts.find((a) => a.value === user.area) || null,
      role: roleOpts.find((r) => r.value === user.Role?.name) || null,
    });
    setShowEditModal(true);
  };

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await updateUser(selectedUser.id, {
        name: form.name,
        email: form.email,
        area: form.area?.value,
        role: form.role?.value,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      setForm({});
      load();
      showSuccess("Usuario actualizado exitosamente");
    } catch (err) {
      showError("No se pudo actualizar el usuario");
    }
  }

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // LÓGICA DE FILTRADO
  const filteredUsers = users
    .filter((user) => {
      // Filtro por nombre/email
      const nameEmailMatch =
        !appliedFilters.nameEmail ||
        user.name.toLowerCase().includes(appliedFilters.nameEmail.toLowerCase()) ||
        user.email.toLowerCase().includes(appliedFilters.nameEmail.toLowerCase());
      
      // Filtro por área
      const areaMatch =
        !appliedFilters.area || user.area === appliedFilters.area.value;
      
      // Filtro por rol
      const roleMatch =
        !appliedFilters.role || (user.Role && user.Role.name === appliedFilters.role.value);
      
      return nameEmailMatch && areaMatch && roleMatch;
    })
    .sort((a, b) => {
      // Ordenar por ID (fecha de creación)
      if (showNewestFirst) {
        return b.id - a.id; // Más recientes primero
      } else {
        return a.id - b.id; // Más antiguos primero
      }
    });

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Resetear página cuando cambien los filtros aplicados o el ordenamiento
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, showNewestFirst]);

  const getRoleBadgeClasses = (role) => {
    switch (role.toLowerCase()) {
      case "solicitante":
        return "bg-blue-100 text-blue-800";
      case "servicios generales":
      case "sg":
        return "bg-purple-100 text-purple-800";
      case "admin":
      case "administrador":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role.toLowerCase()) {
      case "sg":
        return "Servicios Generales";
      case "admin":
        return "Administrador";
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
              <h2 className="text-3xl font-bold text-gray-900">
                Gestión de Usuarios
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Administra los usuarios del sistema
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowCreateModal(true)}
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
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Buscador por nombre/email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscador (nombre, email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterNameEmail}
                  onChange={(e) => setFilterNameEmail(e.target.value)}
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
            {/* Filtro por área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Área
              </label>
              <select
                value={filterArea ? filterArea.value : ""}
                onChange={e => {
                  const val = e.target.value;
                  setFilterArea(val ? areaOpts.find(a => a.value === val) : null);
                }}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
              >
                <option value="">Todas las áreas</option>
                {areaOpts.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* Filtro por rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <select
                value={filterRole ? filterRole.value : ""}
                onChange={e => {
                  const val = e.target.value;
                  setFilterRole(val ? roleOpts.find(r => r.value === val) : null);
                }}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
              >
                <option value="">Todos los roles</option>
                {roleOpts.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Botones */}
          <div className="mt-4">
            <div className="flex justify-end">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setAppliedFilters({
                    nameEmail: filterNameEmail,
                    area: filterArea,
                    role: filterRole,
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Aplicar filtros
                </button>
                <button
                  onClick={() => {
                    setFilterNameEmail("");
                    setFilterArea(null);
                    setFilterRole(null);
                    setAppliedFilters({ nameEmail: "", area: null, role: null });
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 font-medium text-sm border border-red-700 shadow"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Users Table Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Lista de Usuarios ({filteredUsers.length} usuarios)
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Orden: {showNewestFirst ? "Agregados recientemente primero" : "Agregados antiguamente primero"}
                  </span>
                  <button
                    onClick={() => setShowNewestFirst(!showNewestFirst)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
                    title="Cambiar orden"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nombre
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Área
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={
                          index % 2 === 0
                            ? "hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=6d28d9&color=fff`}
                                alt={user.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.area}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(
                              user.Role?.name || ""
                            )}`}
                          >
                            {getRoleDisplayName(user.Role?.name || "")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={user.active}
                                onChange={() =>
                                  toggleActive(user.id).then(() => {
                                    load();
                                    showSuccess(`Usuario ${user.active ? 'desactivado' : 'activado'} exitosamente`);
                                  }).catch(() => {
                                    showError("No se pudo cambiar el estado del usuario");
                                  })
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                            </label>
                            <span
                              className={`ml-3 text-sm ${
                                user.active ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {user.active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
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

              {filteredUsers.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No hay usuarios que coincidan con los filtros seleccionados.
                </div>
              )}

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">{filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}</span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    usuarios
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              currentPage === number
                                ? "bg-purple-600 text-white"
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
        </div>
      </main>

      {/* Edit Modal Placeholder */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* FONDO OSCURO */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => {
                setShowEditModal(false);
                setForm({});
              }}
            />

            {/* TRUCO CENTRADO */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* PANEL */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Editar Usuario
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setForm({});
                  }}
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

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Área
                  </label>
                  <Select
                    options={areaOpts}
                    value={form.area}
                    onChange={(area) => setForm({ ...form, area })}
                    placeholder="Seleccionar área"
                    styles={customSelectStyles}
                    classNamePrefix="react-select"
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <Select
                    options={roleOpts}
                    value={form.role}
                    onChange={(role) => setForm({ ...form, role })}
                    placeholder="Seleccionar rol"
                    styles={customSelectStyles}
                    classNamePrefix="react-select"
                    menuPortalTarget={
                      typeof document !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setForm({});
                    }}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
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
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar usuario
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar a{" "}
                        {selectedUser?.name}? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    deleteUser(selectedUser.id).then(() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                      load();
                      showSuccess("Usuario eliminado exitosamente");
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
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Crear Nuevo Usuario
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({});
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
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
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="create-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre Completo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="create-name"
                          value={form.name || ""}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="Nombre y apellidos"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="create-email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="create-email"
                          value={form.email || ""}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="usuario@vidacel.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="create-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Contraseña
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="password"
                          id="create-password"
                          value={form.password || ""}
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Área
                      </label>
                      <div className="mt-1">
                        <Select
                          options={areaOpts}
                          placeholder="Seleccionar área"
                          value={form.area}
                          onChange={(area) => setForm({ ...form, area })}
                          styles={customSelectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          inputId="create-area"
                          menuPortalTarget={
                            typeof document !== "undefined"
                              ? document.body
                              : null
                          }
                          menuPosition="fixed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rol
                      </label>
                      <div className="mt-1">
                        <Select
                          options={roleOpts}
                          placeholder="Seleccionar rol"
                          value={form.role}
                          onChange={(role) => setForm({ ...form, role })}
                          styles={customSelectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          inputId="create-role"
                          menuPortalTarget={
                            typeof document !== "undefined"
                              ? document.body
                              : null
                          }
                          menuPosition="fixed"
                        />
                      </div>
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
