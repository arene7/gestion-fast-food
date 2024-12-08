import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Asegúrate de que la ruta sea correcta
import { onAuthStateChanged } from 'firebase/auth';

// 1. Crear el contexto
const AuthContext = createContext();

// 2. Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para el usuario
  const [loading, setLoading] = useState(true); // Estado para controlar la carga

  // 3. Detectar el cambio de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Si el usuario está autenticado, se guarda en el estado
      setLoading(false); // Ya no estamos cargando
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, []);

  // 4. Valor que será accesible en cualquier parte de la aplicación
  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Renderiza los hijos (tu aplicación) */}
    </AuthContext.Provider>
  );
};

// 5. Crear un hook para acceder al contexto fácilmente
export const useAuth = () => {
  return React.useContext(AuthContext);
};
