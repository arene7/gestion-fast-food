import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Reservas from './components/Reservas';
import Navbar from './components/Navbar';
import { auth, db } from './firebase';  // Importa auth y db

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configura el listener para cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si el usuario está autenticado, obtenemos la información adicional del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUser({ ...user, role: userDoc.data().role });
        }
      } else {
        setUser(null);
      }
      setLoading(false); // Establece loading en false cuando se completa la verificación
    });

    // Cleanup listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  const hasRole = (roles) => {
    return user && roles.includes(user.role);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* Renderizamos el Navbar siempre */}
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Solo permite acceder a /dashboard si hay un usuario autenticado */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          {/* Ruta protegida: solo los usuarios con ciertos roles pueden acceder */}
          <Route 
            path="/reservas" 
            element={user && hasRole(['administrador', 'cajero', 'mesero', 'recepcionista']) 
              ? <Reservas /> 
              : <Navigate to="/login" />}
          />
          {/* Agregar más rutas protegidas si es necesario */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
