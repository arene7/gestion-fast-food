import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Asegúrate de importar la base de datos de Firestore

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      navigate('/dashboard');  // Si ya está autenticado, redirige al dashboard
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Intenta iniciar sesión con correo y contraseña
      const userCredential = await signInWithEmailAndPassword(auth, correo, contraseña);
      const user = userCredential.user;

      // Verificar si el usuario está en Firestore y si está activo
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.isActive) {
          // Si no está activo, se muestra el mensaje y redirige
          setError('Tu cuenta está desactivada. Contacta con el administrador.');
          setLoading(false);
          return;
        }
        
        // Si está activo, redirige al dashboard
        setSuccess('Inicio de sesión exitoso');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);  // Redirige después de 1.5 segundos
      } else {
        setError('No se encontró el usuario en la base de datos.');
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center">Iniciar Sesión</h2>
          {error && <p className="text-danger text-center">{error}</p>}
          {success && <p className="text-success text-center">{success}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Dirección de Correo</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
