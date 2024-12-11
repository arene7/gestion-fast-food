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
import Perfiles from './components/Perfiles'; // Importa el componente Perfiles
import ReservationPage from './components/ReservationPage';
import Navbar from './components/Navbar';
import { auth, db } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        {/* Navbar visible siempre */}
        <Navbar user={user} />
        <Routes>
          {/* Ruta a la página de inicio */}
          <Route path="/" element={<Home />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ruta al Dashboard solo si el usuario está autenticado */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

          {/* Ruta a Reservas solo accesible por ciertos roles */}
          <Route 
            path="/reservas" 
            element={user && hasRole(['administrador', 'cajero', 'mesero', 'recepcionista']) 
              ? <Reservas /> 
              : <Navigate to="/login" />}
          />

          {/* Ruta para hacer una reserva */}
          <Route path="/reservar" element={<ReservationPage />} />

          {/* Ruta de Perfiles solo accesible por administradores */}
          <Route 
            path="/perfiles" 
            element={user && hasRole(['administrador']) 
              ? <Perfiles /> 
              : <Navigate to="/login" />}
          />
        </Routes>
        
      </div>
    </Router>
  );
};

export default App;
