// src/components/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Solo esperar un momento y redirigir al dashboard
    // Supabase ya procesó la autenticación automáticamente
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">FP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Autenticación exitosa</h1>
            <p className="text-gray-600">Redirigiendo a tu dashboard...</p>
          </div>

          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              ¡Bienvenido de vuelta!
            </p>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Si no redirige automáticamente en 3 segundos,{' '}
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline font-medium"
            >
              haz clic aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}