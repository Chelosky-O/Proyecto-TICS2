import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logoVidacel from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  async function handle(e) {
    e.preventDefault();
    setIsLoading(true);
    setErr("");

    try {
      await login(email, password);
      nav("/");
    } catch {
      setErr("Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Importar la fuente Montserrat */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          fontFamily: "Montserrat, sans-serif",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <div
          className="w-full max-w-5xl rounded-3xl overflow-hidden bg-white"
          style={{
            boxShadow:
              "0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Illustration Side */}
            <div
              className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-white"
              style={{
                background: "linear-gradient(135deg, #4b0082 0%, #9370db 100%)",
              }}
            >
              <img
                src={logoVidacel}
                alt="Logo Vidacel"
                className="mb-4 w-50 h-50 object-contain"
                draggable="false"
                style={{ userSelect: "none" }}
              />
              <h1 className="text-3xl font-bold mb-3 text-center">
                Vidacel Task Manager
              </h1>
              <p className="text-lg opacity-80 text-center mb-6">
                Gestor eficiente de tareas empresariales
              </p>
              <div className="space-y-4 text-center">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Gestión de solicitudes de servicios</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Asignación de tareas</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span>Seguimiento de progreso</span>
                </div>
              </div>
            </div>

            {/* Login Form Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div
                  className="text-center md:text-left mb-8"
                  style={{ animation: "fadeIn 0.6s ease forwards" }}
                >
                  <h2 className="text-2xl font-bold text-gray-800">
                    ¡Bienvenido!
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Ingrese sus credenciales para continuar
                  </p>
                </div>

                <form onSubmit={handle} className="space-y-6">
                  {/* Email Field */}
                  <div
                    style={{
                      animation: "fadeIn 0.6s ease forwards",
                      animationDelay: "0.1s",
                    }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Correo Electrónico
                    </label>
                    <div className="relative">
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
                            strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          ></path>
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="form-input pl-10 w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="nombre@vidacel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div
                    style={{
                      animation: "fadeIn 0.6s ease forwards",
                      animationDelay: "0.2s",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Contraseña
                      </label>
                    </div>
                    <div className="relative">
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
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="form-input pl-10 w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPwd(e.target.value)}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              ></path>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              ></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {err && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {err}
                    </div>
                  )}

                  {/* Login Button */}
                  <div
                    style={{
                      animation: "fadeIn 0.6s ease forwards",
                      animationDelay: "0.3s",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-gradient w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Permitir selección solo en inputs */
          input,
          textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }

          .btn-gradient {
            background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(135deg, #8e24aa 0%, #5e35b1 100%);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(106, 48, 147, 0.3);
          }
          .form-input:focus {
            border-color: #9c27b0;
            box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.2);
          }

          .glass-effect {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .float-1 {
            animation: float 15s ease-in-out infinite;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
          }
          .delay-100 {
            animation-delay: 0.1s;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-300 {
            animation-delay: 0.3s;
          }
          .delay-400 {
            animation-delay: 0.4s;
          }

          @media (max-width: 768px) {
            .illustration-container {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
}
