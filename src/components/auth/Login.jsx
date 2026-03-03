// src/components/auth/Login.jsx
import { useAuth } from "../../lib/AuthContext";
import { useEffect } from "react";

export default function Login() {
  const { loginWithGoogle, loading, user } = useAuth();

  useEffect(() => {
    console.log('Login component - User:', user);
    console.log('Login component - Loading:', loading);
  }, [user, loading]);

  const handleGoogleLogin = async () => {
    console.log('Iniciando login con Google...');
    try {
      await loginWithGoogle();
      console.log('Login iniciado, redirigiendo a Google...');
    } catch (err) {
      console.error("Login error:", err);
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-gray-800">
      {/* Mitad Izquierda - Formulario */}
      <div className="relative flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo visible solo en móvil */}
          <div className="mb-10 flex justify-center md:hidden">
            <div className="rounded-2xl bg-[#1e2320] p-5 shadow-xl">
              <img src="/logogestify3.png" alt="Gestify" className="h-10 object-contain" />
            </div>
          </div>

          <h2 className="mb-2 text-[36px] font-extrabold tracking-tight text-[#1e2320]">
            Iniciar Sesión
          </h2>
          <p className="mb-10 text-[15px] font-medium text-gray-500">
            Ingresá con tu cuenta para acceder al sistema.
          </p>

          {/* Botón de Google Único */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-[16px] bg-[#F4F7FE] py-4 text-sm font-bold text-[#1e2320] transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Conectando..." : "Continuar con Google"}
          </button>
        </div>

        {/* Footer info izq */}
        <div className="absolute bottom-10 left-0 w-full text-center text-[13px] font-medium text-gray-400 md:text-left md:left-10 lg:left-24 xl:left-32">
          © {new Date().getFullYear()} Gestify. Todos los derechos reservados.
        </div>
      </div>

      {/* Mitad Derecha - Brand (Estilo Horizon UI) */}
      <div className="hidden md:block md:w-1/2">
        <div
          className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-bl-[140px] bg-[#1e2320]"
          style={{ backgroundImage: "url('/fondologin.PNG')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Capacidad superpuesta con gradiente corporativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e2320]/95 via-[#1e2320]/85 to-[#DCED31]/20 backdrop-blur-[2px]"></div>

          {/* Brillitos o manchas de luz */}
          <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#DCED31]/15 to-transparent blur-[100px]"></div>
          <div className="absolute -bottom-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#334139]/60 to-transparent blur-[100px]"></div>

          {/* Contenido Central */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
            {/* Contenedor del Logo (Círculo tipo Horizon UI) */}
            <div className="mb-10 flex h-60 w-60 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(220,237,49,0.05)] backdrop-blur-md">
              <img src="/logogestify3.png" alt="Gestify Logo" className="h-28 object-contain drop-shadow-xl" />
            </div>

            {/* Texto Título */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-white text-[56px] font-extrabold tracking-tight">Gestify</h1>
              <span className="flex items-center justify-center rounded-[12px] border-2 border-white text-white font-extrabold px-3 py-1 text-2xl tracking-tighter shadow-inner">
                PRO
              </span>
            </div>

            {/* Banner inferior tipo Horizon */}
            <div className="mt-20 rounded-[20px] border border-white/10 bg-white/5 w-full max-w-sm py-6 px-4 backdrop-blur-md text-center max-w-sm shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:bg-white/10 hover:border-white/20">
              <p className="text-[14px] font-medium text-gray-300 mb-1">Optimizá tus finanzas con el plan premium</p>
              <p className="text-[18px] font-bold text-white tracking-tight">Potenciando negocios</p>
            </div>
          </div>

          {/* Enlaces de pie de página (derecha) */}
          <div className="absolute bottom-10 flex gap-8 text-[13px] font-semibold text-white/70">
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </div>
  );
}