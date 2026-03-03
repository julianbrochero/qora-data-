// src/components/auth/Login.jsx
import { useAuth } from "../../lib/AuthContext";
import { useEffect } from "react";
import {
  BarChart3,
  Package,
  FileText,
  Wallet,
  ShieldCheck,
  MessageCircle
} from "lucide-react";

const WHATSAPP_NUMBER = "5493534087718";

export default function Login() {
  const { loginWithGoogle, loading, user } = useAuth();

  useEffect(() => {
    console.log("Login - user:", user, "loading:", loading);
  }, [user, loading]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Hola! Necesito soporte con Gestify. 👋");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  const features = [
    { icon: <BarChart3 className="w-5 h-5 text-[#DCED31]" />, label: "Reportes en tiempo real" },
    { icon: <Package className="w-5 h-5 text-[#DCED31]" />, label: "Gestión de ventas" },
    { icon: <FileText className="w-5 h-5 text-[#DCED31]" />, label: "Facturación profesional" },
    { icon: <Wallet className="w-5 h-5 text-[#DCED31]" />, label: "Control de caja" },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="flex min-h-screen w-full bg-[#282A28]"
    >
      {/* ══════════════ IZQUIERDA — FORMULARIO ══════════════ */}
      <div className="relative flex w-full flex-col justify-between py-8 px-6 sm:py-10 sm:px-8 md:w-[45%] lg:px-16 xl:px-24">

        <div className="flex items-center">
          <img src="/esquina.png" alt="Gestify" className="h-[70px] sm:h-[100px] w-auto object-contain drop-shadow-sm" />
        </div>

        {/* ── Contenido central */}
        <div className="mx-auto w-full max-w-[400px] flex flex-col items-center">
          {/* Tagline */}
          <div className="mb-6 sm:mb-10 text-center">
            <p className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-[#282A28] bg-[#DCED31] rounded-full px-3 sm:px-4 py-1.5 inline-block shadow-md">
              Sistema de Gestión Empresarial
            </p>
            <h1
              style={{ letterSpacing: "-0.05em" }}
              className="text-[32px] sm:text-[40px] md:text-[48px] font-black leading-tight text-white"
            >
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-[13px] sm:text-[16px] font-medium leading-relaxed text-gray-400">
              Accedé a tu panel de gestión de forma segura.
            </p>
          </div>

          {/* ── Feature pills ── */}
          <div className="mb-6 sm:mb-10 grid grid-cols-2 gap-3 sm:gap-4 w-full">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 rounded-2xl bg-white/5 p-3 sm:p-4 transition-all hover:bg-white/10 border border-white/5 hover:border-white/20 shadow-sm group"
              >
                <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-white leading-tight select-none">{f.label}</span>
              </div>
            ))}
          </div>

          {/* ── Botón Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-white py-5 text-[16px] font-bold text-[#1e2320] shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Fondo hover sutil */}
            <span className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-[0.04]" />
            <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0 transition-transform group-hover:scale-110">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1e2320] border-t-transparent" />
                Conectando...
              </span>
            ) : (
              "Continuar con Google"
            )}
          </button>

          {/* ── Aviso datos seguros */}
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2.5 text-[12px] sm:text-[13px] font-semibold text-gray-500 text-center">
            <ShieldCheck size={16} className="text-[#DCED31] flex-shrink-0" />
            <p>Tus datos están protegidos. No almacenamos contraseñas.</p>
          </div>
        </div>

        {/* ── Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-bold text-gray-500 mt-6">
          <span className="select-none">© {new Date().getFullYear()} Gestify. Todos los derechos reservados.</span>
          <div className="flex gap-4 sm:gap-5">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="hover:text-white transition-colors"
            >
              Términos
            </a>
            <button
              onClick={handleWhatsApp}
              className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
            >
              <MessageCircle size={12} />
              Soporte
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ DERECHA — IMAGEN MAC ══════════════ */}
      <div className="hidden md:flex md:w-[55%] relative items-center justify-center bg-[#F5F5F5] rounded-l-[40px] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] z-10 transition-transform duration-500 overflow-hidden">
        <img
          src="/mac.png"
          alt="Gestify System en Mac"
          className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700 select-none"
        />

        {/* Marca de agua esquina superior derecha */}
        <div className="absolute top-6 right-6 z-20">
          <img src="/esquinader.png" alt="Gestify" className="h-[130px] w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" />
        </div>
      </div>
    </div>
  );
}