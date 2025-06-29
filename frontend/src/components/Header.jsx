import { useAuth } from "../auth/AuthContext";
import logoVidacel from "../assets/logo.png";

export default function Header() {
  const { user, logout } = useAuth();

  // Mapeo de roles a nombres display
  const roleDisplayNames = {
    solicitante: "Solicitante",
    sg: "Servicios Generales",
    admin: "Administrador",
  };

  return (
    <header className="bg-gradient-to-r from-violet-800 to-purple-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3 p-1">
              <img
                src={logoVidacel}
                alt="Vidacel Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-white">
              Vidacel Task Manager
            </h1>
          </div>

          {/* Todo agrupado a la derecha */}
          <div className="flex items-center space-x-4">
            {/* Botón de inicio */}
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 font-medium text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="hidden sm:inline">Inicio</span>
            </button>

            {/* Separador */}
            <div className="w-px h-6 bg-white/30"></div>

            {/* Perfil del usuario */}
            <div className="flex items-center space-x-3">
              <img
                className="h-9 w-9 rounded-full border-2 border-white/30"
                src={`https://ui-avatars.com/api/?name=${user.name}&background=6d28d9&color=fff`}
                alt="User avatar"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-white/80">
                  {roleDisplayNames[user.role]}
                </p>
              </div>
            </div>

            {/* Separador */}
            <div className="w-px h-6 bg-white/30"></div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 font-medium text-sm border border-red-700 shadow"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
