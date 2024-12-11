import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Archivo CSS para estilos personalizados

const Navbar = ({ user }) => {
  // Función para verificar si el usuario tiene acceso a enlaces específicos según su rol
  const hasAccess = (roles) => roles.includes(user?.role);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Título o nombre de la aplicación */}
        <Link className="navbar-brand" to="/">Gestión Fast Food</Link>
        
        {/* Botón para vista responsiva */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces del menú */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Enlace a la página de inicio */}
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>

            {/* Enlaces visibles para usuarios no autenticados */}
            {!user ? (
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
            ) : (
              // Enlaces visibles para usuarios autenticados
              <>
                {hasAccess(['administrador', 'cajero', 'mesero', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Panel de Control</Link>
                  </li>
                )}
                {hasAccess(['administrador', 'recepcionista']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/reservas">Reservas</Link>
                  </li>
                )}
                {hasAccess(['administrador', 'cajero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/ordenes">Órdenes</Link>
                  </li>
                )}
                {hasAccess(['administrador', 'cajero', 'mesero']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/facturacion">Facturación</Link>
                  </li>
                )}
                {user && user.role === 'mesero' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/ordenes">Órdenes</Link>
                  </li>
                )}

                {hasAccess(['administrador']) && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/perfiles">Perfiles</Link>
                  </li>
                )}
                {/* Enlace para cerrar sesión */}
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
