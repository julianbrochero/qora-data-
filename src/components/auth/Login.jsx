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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .lg-root * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        .lg-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fb;
          padding: 24px 16px;
        }

        .lg-wrap {
          width: 100%;
          max-width: 384px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Logo */
        .lg-logo {
          margin-bottom: 36px;
        }
        .lg-logo img {
          height: 96px;
          object-fit: contain;
        }

        /* Heading */
        .lg-heading {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 10px;
          text-align: center;
        }
        .lg-sub {
          font-size: 14px;
          color: #6b7280;
          font-weight: 400;
          line-height: 1.55;
          margin: 0 0 36px;
          text-align: center;
        }

        /* Google button */
        .lg-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 20px;
          border-radius: 8px;
          background: #fff;
          color: #111827;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #d1d5db;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: background 0.12s, box-shadow 0.12s;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
        }
        .lg-google-btn:hover:not(:disabled) {
          background: #f9fafb;
          box-shadow: 0 1px 4px rgba(0,0,0,0.09);
        }
        .lg-google-btn:active { background: #f3f4f6; }
        .lg-google-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Divider */
        .lg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          margin-bottom: 20px;
        }
        .lg-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .lg-divider-text { font-size: 11px; color: #9ca3af; font-weight: 500; white-space: nowrap; }

        /* Sign-in with email placeholder (disabled, shown as context) */
        .lg-input-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .lg-input-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          display: block;
        }
        .lg-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.12s, box-shadow 0.12s;
          font-family: 'Inter', sans-serif;
        }
        .lg-input:focus {
          border-color: #334139;
          box-shadow: 0 0 0 3px rgba(51,65,57,0.10);
        }

        /* Primary button */
        .lg-primary-btn {
          width: 100%;
          padding: 10px 20px;
          border-radius: 8px;
          background: #334139;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.12s;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
        }
        .lg-primary-btn:hover:not(:disabled) { background: #2a3530; }
        .lg-primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Trust */
        .lg-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11.5px;
          color: #9ca3af;
          font-weight: 500;
          margin-bottom: 32px;
        }

        /* Footer */
        .lg-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 11.5px;
          color: #9ca3af;
        }
        .lg-footer-link {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11.5px;
          color: #9ca3af;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          transition: color 0.12s;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }
        .lg-footer-link:hover { color: #334139; }
        .lg-footer-sep { color: #e5e7eb; }

        /* Spinner */
        @keyframes lg-spin { to { transform: rotate(360deg); } }
        .lg-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid #e5e7eb; border-top-color: #334139;
          animation: lg-spin 0.7s linear infinite; flex-shrink: 0;
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-wrap">
          {/* Logo */}
          <div className="lg-logo">
            <img src="/favicon.png" alt="Gestify" />
          </div>

          {/* Heading */}
          <h1 className="lg-heading">Iniciar sesión</h1>
          <p className="lg-sub">Accedé a tu cuenta para gestionar tu negocio.</p>

          {/* Google button */}
          <button
            className="lg-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="lg-spinner" />
                Conectando...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
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
          <div className="lg-trust">
            <ShieldCheck size={12} style={{ color: "#334139" }} />
            No almacenamos contraseñas.
          </div>

          {/* Footer links */}
          <div className="lg-footer">
            <a href="/" className="lg-footer-link">Sitio web</a>
            <span className="lg-footer-sep">·</span>
            <button className="lg-footer-link" onClick={handleWhatsApp}>
              <MessageCircle size={11} /> Soporte
            </button>
            <span className="lg-footer-sep">·</span>
            <span>© {new Date().getFullYear()} Gestify</span>
          </div>
        </div>
      </div>
    </>
  );
}
