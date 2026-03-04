// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
      setAuthChecked(true);
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        const currentUser = session?.user || null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' && window.location.pathname.includes('/auth/callback')) {
          // Pequeño delay para asegurar que todo esté listo
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        }

        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Login simplificado - CONFÍA EN SUPABASE
  const loginWithGoogle = async () => {
    setLoading(true);

    // Detectar si estamos en GitHub Pages (subfolder) o local/Vercel
    const base = import.meta.env.BASE_URL || '/'
    // Limpiar posibles dobles slashes, excepto el de https://
    const redirectUrl = `${window.location.origin}${base}auth/callback`.replace(/([^:]\/)\/+/g, "$1");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Error Google login:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
    // Si no hay error, Supabase redirigirá automáticamente a Google
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUserData = async (metadata) => {
    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw error
    setUser(data.user)
    return data.user
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading: loading && !authChecked,
      loginWithGoogle,
      logout,
      updateUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);