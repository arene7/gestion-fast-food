import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Reservas from './components/Reservas';
import ReservationPage from './components/Reservar-users';
import Navbar from './components/Navbar';
import Perfiles from './components/Perfiles';
import Ordenes from './components/Ordenes'; // Importa el componente de Órdenes
import Mesas from './components/Mesas'; // Importa el nuevo componente de Mesas
import Facturacion from './components/Facturacion'; // Importa el componente de Facturación
import { auth, db } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.isActive) {
            setUser({ ...user, role: userData.role, isActive: userData.isActive });
            setErrorMessage('');
          } else {
            setUser(null);
            setErrorMessage('Tu cuenta está desactivada. Contacta con el administrador.');
          }
        }
      } else {
        setUser(null);
        setErrorMessage('');
      }
      setLoading(false);
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
        <Navbar user={user} />
        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/ordenes" /> : <Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/reservas" 
            element={user && user.isActive && hasRole(['administrador', 'recepcionista']) 
              ? <Reservas /> 
              : <Navigate to="/login" />} 
          />
          <Route path="/reservar" element={<ReservationPage />} />
          <Route 
            path="/perfiles" 
            element={user && user.isActive && hasRole(['administrador']) 
              ? <Perfiles /> 
              : <Navigate to="/login" />} 
          />
          {/* Ruta para Órdenes */}
          <Route 
            path="/ordenes" 
            element={user && user.isActive && hasRole(['administrador', 'recepcionista', 'cajero']) 
              ? <Ordenes /> 
              : <Navigate to="/login" />} 
          />
          {/* Nueva ruta para Mesas */}
          <Route 
            path="/mesas" 
            element={user && user.isActive && hasRole(['administrador', 'mesero']) 
              ? <Mesas /> 
              : <Navigate to="/login" />} 
          />
          {/* Nueva ruta para Facturación */}
          <Route 
            path="/facturacion" 
            element={user && user.isActive && hasRole(['administrador', 'cajero']) 
              ? <Facturacion /> 
              : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
