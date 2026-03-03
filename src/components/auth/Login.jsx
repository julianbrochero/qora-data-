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
    { icon: <BarChart3 className="w-5 h-5 text-[#1e2320]" />, label: "Reportes en tiempo real" },
    { icon: <Package className="w-5 h-5 text-[#1e2320]" />, label: "Gestión de pedidos" },
    { icon: <FileText className="w-5 h-5 text-[#1e2320]" />, label: "Facturación profesional" },
    { icon: <Wallet className="w-5 h-5 text-[#1e2320]" />, label: "Control de caja" },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="flex min-h-screen w-full bg-white"
    >
      {/* ══════════════ IZQUIERDA — FORMULARIO ══════════════ */}
      <div className="relative flex w-full flex-col justify-between py-10 px-8 bg-white md:w-[45%] lg:px-16 xl:px-24">

        {/* ── Logo arriba */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-[#1e2320] p-2 shadow-lg">
            <img src="/esquina.png" alt="Gestify" className="h-9 w-9 object-contain" />
          </div>
          <span className="text-[20px] font-black tracking-tight text-[#1e2320]">
            Gestify
          </span>
          <span className="rounded-lg border-2 border-[#1e2320] px-2.5 py-0.5 text-[11px] font-black tracking-widest text-[#1e2320]">
            PRO
          </span>
        </div>

        {/* ── Contenido central */}
        <div className="mx-auto w-full max-w-[400px] flex flex-col items-center">
          {/* Tagline */}
          <div className="mb-10 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#DCED31] bg-[#1e2320] rounded-full px-4 py-1.5 inline-block shadow-md">
              Sistema de Gestión Empresarial
            </p>
            <h1
              style={{ letterSpacing: "-0.05em" }}
              className="text-[48px] font-black leading-tight text-[#1e2320] whitespace-nowrap"
            >
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-[16px] font-medium leading-relaxed text-gray-500">
              Accedé a tu panel de gestión de forma segura.
            </p>
          </div>

          {/* ── Feature pills */}
          <div className="mb-10 grid grid-cols-2 gap-4 w-full">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-[#F4F7FE] p-4 transition-all hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl group"
              >
                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <span className="text-[12px] font-extrabold text-[#1e2320] leading-tight select-none">{f.label}</span>
              </div>
            ))}
          </div>

          {/* ── Botón Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-gray-300 bg-white py-5 text-[16px] font-bold text-[#1e2320] shadow-sm transition-all hover:border-[#1e2320] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Fondo hover sutil */}
            <span className="absolute inset-0 bg-[#1e2320] opacity-0 transition-opacity group-hover:opacity-[0.03]" />
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
          <div className="mt-8 flex items-center justify-center gap-2.5 text-[13px] font-semibold text-gray-400 text-center">
            <ShieldCheck size={18} className="text-emerald-500" />
            <p>Tus datos están protegidos. No almacenamos contraseñas.</p>
          </div>
        </div>

        {/* ── Footer */}
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
          <span className="select-none">© {new Date().getFullYear()} Gestify. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="hover:text-[#1e2320] transition-colors"
            >
              Términos
            </a>
            <button
              onClick={handleWhatsApp}
              className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
            >
              <MessageCircle size={14} />
              Soporte
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ DERECHA — BRAND ══════════════ */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden bg-[#1e2320] rounded-bl-[140px]">
        {/* Imagen de fondo SIN opacidad */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondologin.PNG')" }}
        />

        {/* Capas de gradiente para legibilidad y profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2320]/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e2320]/70 via-[#1e2320]/20 to-transparent" />

        {/* Brillo verde lima en esquina superior */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#DCED31]/10 blur-[120px] pointer-events-none" />

        {/* ── Contenido sobre la imagen */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12">

          {/* Logo grande */}
          <div className="mb-10 transition-all hover:scale-105 duration-500">
            <img
              src="/logologin2.png"
              alt="Gestify"
              className="h-72 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Nombre + badge PRO */}
          <div className="flex items-center gap-4 mb-4">
            <h2
              style={{ letterSpacing: "-0.04em" }}
              className="text-[72px] font-black text-white leading-none drop-shadow-2xl select-none"
            >
              Gestify
            </h2>
            <div className="flex items-center justify-center rounded-2xl border-2 border-white/90 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-xl">
              <span className="text-[18px] font-black tracking-widest text-white">PRO</span>
            </div>
          </div>

          <p className="text-[18px] font-bold text-white/80 mb-14 text-center max-w-sm drop-shadow-lg">
            Potenciando negocios de forma inteligente
          </p>

          {/* Card de stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { n: "100%", label: "Nube" },
              { n: "24/7", label: "Sistema" },
              { n: "ARG", label: "🇦🇷" },
            ].map((s, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-white/20 bg-white/10 py-5 px-2 text-center backdrop-blur-md transition-all hover:bg-white/20 hover:-translate-y-1 shadow-2xl"
              >
                <p className="text-[24px] font-black text-white leading-none group-hover:scale-110 transition-transform">{s.n}</p>
                <p className="mt-2 text-[12px] font-bold text-white/70 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Links abajo a la derecha */}
        <div className="absolute bottom-10 right-10 flex gap-8 text-[13px] font-bold text-white/70 z-10">
          <button
            onClick={handleWhatsApp}
            className="hover:text-[#25D366] transition-all hover:scale-105"
          >
            💬 Soporte Directo
          </button>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
            Términos
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
            Privacidad
          </a>
        </div>
      </div>
    </div>
  );
}