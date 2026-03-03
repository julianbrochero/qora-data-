// src/components/auth/Login.jsx
import { useAuth } from "../../lib/AuthContext";
import { useEffect } from "react";

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
    { icon: "📊", label: "Reportes en tiempo real" },
    { icon: "📦", label: "Gestión de pedidos" },
    { icon: "🧾", label: "Facturación profesional" },
    { icon: "💼", label: "Control de caja" },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="flex min-h-screen w-full"
    >
      {/* ══════════════ IZQUIERDA — FORMULARIO ══════════════ */}
      <div className="relative flex w-full flex-col justify-between py-10 px-8 bg-white md:w-[45%] lg:px-16 xl:px-20">

        {/* ── Logo arriba */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl bg-[#1e2320] p-2 shadow-md">
            <img src="/logogestify3.png" alt="Gestify" className="h-7 w-7 object-contain" />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-[18px] font-black tracking-tight text-[#1e2320]">
            Gestify
          </span>
          <span className="rounded-md border-2 border-[#1e2320] px-2 py-0.5 text-[10px] font-black tracking-widest text-[#1e2320]">
            PRO
          </span>
        </div>

        {/* ── Contenido central */}
        <div className="mx-auto w-full max-w-[340px]">
          {/* Tagline */}
          <div className="mb-8">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#DCED31] bg-[#1e2320] rounded-full px-3 py-1 inline-block">
              Sistema de Gestión Empresarial
            </p>
            <h1
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}
              className="text-[42px] font-black leading-none text-[#1e2320]"
            >
              Iniciar<br />Sesión
            </h1>
            <p className="mt-3 text-[14px] font-medium leading-relaxed text-gray-500">
              Accedé a tu panel de gestión de forma segura con tu cuenta de Google.
            </p>
          </div>

          {/* ── Feature pills */}
          <div className="mb-8 grid grid-cols-2 gap-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-xl bg-[#F4F7FE] px-3 py-2.5 transition-all hover:bg-[#eef1fb]"
              >
                <span className="text-[16px]">{f.icon}</span>
                <span className="text-[11px] font-semibold text-[#1e2320]">{f.label}</span>
              </div>
            ))}
          </div>

          {/* ── Botón Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white py-4 text-[14px] font-bold text-[#1e2320] shadow-sm transition-all hover:border-[#1e2320] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Fondo hover sutil */}
            <span className="absolute inset-0 bg-[#1e2320] opacity-0 transition-opacity group-hover:opacity-[0.03]" />
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e2320] border-t-transparent" />
                Conectando...
              </span>
            ) : (
              "Continuar con Google"
            )}
          </button>

          {/* ── Aviso datos seguros */}
          <p className="mt-4 text-center text-[11px] font-medium text-gray-400">
            🔒 Tus datos están protegidos. No almacenamos contraseñas.
          </p>
        </div>

        {/* ── Footer */}
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-400">
          <span>© {new Date().getFullYear()} Gestify. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="hover:text-[#1e2320] transition-colors"
            >
              Términos
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleWhatsApp(); }}
              className="hover:text-[#25D366] transition-colors"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════ DERECHA — BRAND ══════════════ */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden">
        {/* Imagen de fondo SIN opacidad */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondologin.PNG')" }}
        />

        {/* Capa muy sutil solo en los bordes para dar profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2320]/25 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e2320]/60 via-transparent to-transparent" />

        {/* Brillo verde lima en esquina superior */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#DCED31]/8 blur-[120px] pointer-events-none" />

        {/* ── Contenido sobre la imagen */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12">

          {/* Logo grande */}
          <div className="mb-8 flex h-52 w-52 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_80px_rgba(220,237,49,0.08)] backdrop-blur-md">
            <img
              src="/logogestify3.png"
              alt="Gestify"
              className="h-32 w-32 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Nombre + badge PRO */}
          <div className="flex items-center gap-3 mb-3">
            <h2
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}
              className="text-[60px] font-black text-white leading-none drop-shadow-lg"
            >
              Gestify
            </h2>
            <span className="flex items-center justify-center rounded-xl border-2 border-white/80 px-3 py-1 text-[14px] font-black tracking-widest text-white shadow-inner">
              PRO
            </span>
          </div>

          <p className="text-[15px] font-medium text-white/70 mb-12 text-center max-w-xs">
            Gestioná tu negocio de forma inteligente
          </p>

          {/* Card de stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { n: "100%", label: "Nube" },
              { n: "24/7", label: "Disponible" },
              { n: "ARG", label: "Localizado" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/15 bg-white/8 py-4 text-center backdrop-blur-md transition-all hover:bg-white/15"
              >
                <p className="text-[20px] font-black text-white leading-none">{s.n}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Links abajo a la derecha */}
        <div className="absolute bottom-8 right-8 flex gap-6 text-[12px] font-semibold text-white/60 z-10">
          <button
            onClick={handleWhatsApp}
            className="hover:text-[#25D366] transition-colors"
          >
            💬 Soporte
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