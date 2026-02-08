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
        
        if (event === 'SIGNED_IN' && window.location.pathname === '/auth/callback') {
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
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Deja que Supabase maneje la redirección
        redirectTo: `${window.location.origin}/auth/callback`
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
    // El onAuthStateChange se encargará de redirigir a /login
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: loading && !authChecked, 
      loginWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);