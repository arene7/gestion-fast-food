import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';  // Si deseas aplicar estilos personalizados

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const showLink = (roles) => roles.includes(user?.role);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Gestión Fast Food</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">Inicio</Link>
            </li>
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/reservar">Reservar</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Iniciar Sesión</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Registrarse</Link>
                </li>
              </>
            )}
            {user && (
              <>
                {showLink(['administrador', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas">Reservas</Link>
                  </li>
                )}
                {showLink(['administrador', 'recepcionista', 'cajero' ]) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/ordenes">Órdenes</Link>
                  </li>
                )}
                {showLink(['administrador', 'mesero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/mesas">Mesas</Link>
                  </li>
                )}
                {showLink(['administrador', 'cajero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/facturacion">Facturación</Link>
                  </li>
                )}
                {showLink(['administrador']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/perfiles">Perfiles</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
