import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';  // Si deseas aplicar estilos personalizados

const Navbar = ({ user }) => {
  // Función para mostrar enlaces dependiendo del rol del usuario
  const showLink = (roles) => roles.includes(user?.role);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Gestión Fast Food</Link> {/* Nombre de la aplicación */}
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
                {/* Enlace a Reservas */}
                {showLink(['administrador', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas">Reservas</Link>
                  </li>
                )}
                {/* Enlace a Órdenes */}
                {showLink(['administrador', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/ordenes">Órdenes</Link>
                  </li>
                )}
                {/* Enlace a Mesas */}
                {showLink(['administrador', 'mesero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/mesas">Mesas</Link>
                  </li>
                )}
                {/* Enlace a Facturación */}
                {showLink(['administrador', 'cajero', 'mesero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/facturacion">Facturación</Link>
                  </li>
                )}
                {/* Enlace a Perfiles */}
                {showLink(['administrador', 'cajero', 'mesero', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/perfiles">Perfiles</Link>
                  </li>
                )}
                {/* Cerrar Sesión */}
                <li className="nav-item">
                  <Link className="nav-link" to="/logout">Cerrar Sesión</Link>
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
