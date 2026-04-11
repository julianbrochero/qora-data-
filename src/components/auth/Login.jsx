import { useAuth } from "../../lib/AuthContext";
import { useEffect } from "react";
import { ShieldCheck, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5493534087718";

export default function Login() {
  const { loginWithGoogle, loading, user } = useAuth();

  useEffect(() => {}, [user, loading]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Hola! Necesito soporte con Gestify. 👋");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .login-root * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        /* Full-screen bg image with subtle overlay */
        .login-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #f0f0ee;
        }
        .login-bg {
          position: fixed;
          inset: 0;
          background-image: url('/fondologin.PNG');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        /* Light frosted overlay — keeps image visible but softened */
        .login-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(248,249,251,0.72);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        /* Left decorative strip */
        .login-strip {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #334139 0%, #5a7a62 50%, #334139 100%);
          z-index: 2;
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          margin: 24px 16px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(229,231,235,0.8);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 16px 48px rgba(0,0,0,0.10),
            0 0 0 1px rgba(255,255,255,0.6) inset;
          padding: 44px 40px 36px;
        }
        @media (max-width: 480px) {
          .login-card { padding: 36px 24px 28px; margin: 16px 12px; }
        }

        /* Logo */
        .login-logo { display: flex; justify-content: center; margin-bottom: 28px; }
        .login-logo img { height: 48px; object-fit: contain; }

        /* Headline */
        .login-headline { text-align: center; margin-bottom: 32px; }
        .login-eyebrow {
          display: inline-block;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #334139;
          background: #eef1ee;
          border: 1px solid rgba(51,65,57,0.15);
          padding: 4px 12px; border-radius: 20px;
          margin-bottom: 14px;
        }
        .login-title {
          font-size: 28px; font-weight: 800;
          color: #0d0d0d; letter-spacing: -0.04em;
          line-height: 1.15; margin: 0 0 8px;
        }
        .login-sub {
          font-size: 14px; color: #6b7280; font-weight: 400;
          line-height: 1.5; margin: 0;
        }

        /* Divider */
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }
        .login-divider-line {
          flex: 1; height: 1px; background: #e5e7eb;
        }
        .login-divider-text {
          font-size: 11px; color: #9ca3af; font-weight: 500;
          white-space: nowrap;
        }

        /* Google button */
        .login-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 14px 20px; border-radius: 12px;
          background: #fff; color: #111827;
          font-size: 15px; font-weight: 600;
          border: 1.5px solid #e5e7eb;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05);
          cursor: pointer; transition: all 0.15s ease;
          position: relative; overflow: hidden;
          margin-bottom: 24px;
        }
        .login-google-btn:hover:not(:disabled) {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.07);
          transform: translateY(-1px);
        }
        .login-google-btn:active { transform: translateY(0); }
        .login-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-google-btn svg { flex-shrink: 0; }

        /* Trust row */
        .login-trust {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; font-size: 12px; color: #9ca3af; font-weight: 500;
          margin-bottom: 20px;
        }
        .login-trust svg { color: #334139; flex-shrink: 0; }

        /* Features grid */
        .login-features {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          margin-bottom: 28px;
        }
        .login-feature {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border-radius: 10px;
          background: #f9fafb; border: 1px solid #f3f4f6;
        }
        .login-feature-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #334139; flex-shrink: 0;
        }
        .login-feature span {
          font-size: 11.5px; font-weight: 600; color: #374151;
        }

        /* Footer */
        .login-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 20px; border-top: 1px solid #f3f4f6;
          flex-wrap: wrap; gap: 8px;
        }
        .login-footer-copy { font-size: 11px; color: #d1d5db; font-weight: 500; }
        .login-footer-links { display: flex; align-items: center; gap: 16px; }
        .login-footer-link {
          font-size: 11px; color: #9ca3af; font-weight: 500;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          text-decoration: none; transition: color 0.12s;
          font-family: 'Inter', sans-serif;
        }
        .login-footer-link:hover { color: #334139; }

        /* Back link */
        .login-back {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; font-size: 12.5px; color: #9ca3af; font-weight: 500;
          margin-bottom: 24px; text-decoration: none;
          transition: color 0.12s;
        }
        .login-back:hover { color: #334139; }

        /* Spinner */
        @keyframes login-spin { to { transform: rotate(360deg); } }
        .login-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #e5e7eb; border-top-color: #374151;
          animation: login-spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* Gestify badge on bg (bottom right) */
        .login-bg-badge {
          position: fixed; bottom: 24px; right: 24px; z-index: 1;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(229,231,235,0.7);
          border-radius: 12px; padding: 8px 14px;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }
        .login-bg-badge img { height: 20px; object-fit: contain; }
        .login-bg-badge span { font-size: 11px; font-weight: 700; color: #334139; }
        @media (max-width: 640px) { .login-bg-badge { display: none; } }
      `}</style>

      <div className="login-root">
        {/* Background image */}
        <div className="login-bg" />
        <div className="login-strip" />

        {/* Card */}
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <img src="/newlogo.png" alt="Gestify" />
          </div>

          {/* Headline */}
          <div className="login-headline">
            <div className="login-eyebrow">Sistema de Gestión Empresarial</div>
            <h1 className="login-title">Bienvenido de vuelta</h1>
            <p className="login-sub">Accedé a tu panel para gestionar tu negocio.</p>
          </div>

          {/* Back to site */}
          <a href="/" className="login-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Volver al sitio
          </a>

          {/* Features */}
          <div className="login-features">
            {[
              "Gestión de ventas",
              "Control de caja",
              "Inventario",
              "Reportes",
            ].map(f => (
              <div className="login-feature" key={f}>
                <div className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">Ingresá con tu cuenta</span>
            <div className="login-divider-line" />
          </div>

          {/* Google button */}
          <button
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="login-spinner" />
                Conectando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          {/* Trust */}
          <div className="login-trust">
            <ShieldCheck size={13} style={{ color: "#334139" }} />
            Tus datos están protegidos. No almacenamos contraseñas.
          </div>

          {/* Footer */}
          <div className="login-footer">
            <span className="login-footer-copy">© {new Date().getFullYear()} Gestify</span>
            <div className="login-footer-links">
              <button className="login-footer-link" onClick={handleWhatsApp}>
                <MessageCircle size={11} /> Soporte
              </button>
              <a href="/" className="login-footer-link">Sitio web</a>
            </div>
          </div>
        </div>

        {/* Floating badge */}
        <div className="login-bg-badge">
          <img src="/newlogo.png" alt="Gestify" />
          <span>gestify.ar</span>
        </div>
      </div>
    </>
  );
}
