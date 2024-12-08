import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';  // Asegúrate de que esta importación esté bien configurada
import { onAuthStateChanged } from 'firebase/auth';  // Función de Firebase para escuchar cambios de autenticación

// Crear el contexto de autenticación
const AuthContext = createContext();

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Estado para el usuario autenticado

  useEffect(() => {
    // Suscribirse a cambios en el estado de autenticación (cuando el usuario inicia o cierra sesión)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          role: currentUser.role || 'user',  // Supón que el rol está en el objeto del usuario (puedes ajustar según tu implementación)
        });
      } else {
        setUser(null);  // Si no hay usuario, lo seteamos a null
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
