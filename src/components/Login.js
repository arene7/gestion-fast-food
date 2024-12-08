import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
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
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, correo, contraseña);
      alert('Inicio de sesión exitoso');
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
