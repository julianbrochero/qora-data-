// src/components/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1e2320',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin-accent { to { transform: rotate(360deg) } }
        @keyframes progress-fill {
          0%   { width: 0% }
          60%  { width: 70% }
          100% { width: 92% }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#282A28',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,.5)',
        padding: '40px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fade-up .4s ease both',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <img
            src="/logogestify3.png"
            alt="Gestify"
            style={{ height: 48, objectFit: 'contain' }}
          />
        </div>

        {/* Spinner */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '3px solid rgba(220,237,49,.15)',
          borderTop: '3px solid #DCED31',
          animation: 'spin-accent .85s linear infinite',
          marginBottom: 28,
        }} />

        {/* Textos */}
        <h1 style={{
          fontSize: 20,
          fontWeight: 800,
          color: '#fff',
          marginBottom: 6,
          letterSpacing: '-.03em',
          textAlign: 'center',
        }}>
          Autenticación exitosa
        </h1>
        <p style={{
          fontSize: 13,
          color: 'rgba(255,255,255,.45)',
          marginBottom: 28,
          textAlign: 'center',
        }}>
          ¡Bienvenido de vuelta! Redirigiendo...
        </p>

        {/* Barra de progreso */}
        <div style={{
          width: '100%',
          height: 4,
          background: 'rgba(255,255,255,.08)',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #DCED31, #b5c926)',
            borderRadius: 99,
            animation: 'progress-fill 1.5s ease forwards',
          }} />
        </div>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 24,
        fontSize: 12,
        color: 'rgba(255,255,255,.25)',
        textAlign: 'center',
      }}>
        Si no redirige automáticamente,{' '}
        <button
          onClick={() => navigate('/')}
          style={{
            color: '#DCED31',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12,
            fontFamily: 'inherit',
            textDecoration: 'underline',
          }}
        >
          hacé clic aquí
        </button>
      </p>
    </div>
  );
}