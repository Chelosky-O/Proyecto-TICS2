import logoVidacel from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-violet-800 to-purple-500 shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2 p-1">
              <img 
                src={logoVidacel} 
                alt="Vidacel Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-white/90">
              © 2025 Vidacel Task Manager
            </p>
          </div>
          
          {/* Información adicional del footer */}
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-white/70">
              Versión 1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}