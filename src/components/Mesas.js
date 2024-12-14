import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Configuración de Firebase
import './Mesas.css'; // Archivo CSS para estilos personalizados

const Mesas = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reservations'));
        // Filtra solo las mesas con estado "En proceso"
        const reservationsData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((reserva) => reserva.estado === 'En proceso');
        setReservations(reservationsData);
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="container mt-4 mesas-container">
      <h2 className="text-center mb-4">Mesas en Proceso</h2>
      <div className="row g-4"> {/* g-4 para espacio entre tarjetas */}
        {reservations.length > 0 ? (
          reservations.map((reserva) => (
            <div key={reserva.id} className="col-md-4 d-flex align-items-stretch"> {/* 3 tarjetas por fila */}
              <div className="card shadow-sm w-100">
                <div className="card-header bg-primary text-white text-center">
                  <h5 className="card-title mb-0">Mesa #{reserva.mesa}</h5>
                </div>
                <div className="card-body">
                  <p><strong>Fecha:</strong> {reserva.fecha}</p>
                  <p><strong>Hora:</strong> {reserva.hora}</p>
                  <p><strong>Correo:</strong> {reserva.correo}</p>
                  <hr />
                  <h6>Órdenes Asignadas:</h6>
                  {reserva.assignedOrders ? (
                    Object.entries(reserva.assignedOrders).map(([silla, productos]) => (
                      <div key={silla} className="order-item d-flex justify-content-between align-items-center">
                        <span>
                          <strong>Silla {silla}:</strong>
                          {productos.map((producto, index) => (
                            <span key={index} className="producto"> {producto.nombre} (${producto.precio})</span>
                          ))}
                        </span>
                        <span className="silla-icon">🪑</span>
                      </div>
                    ))
                  ) : (
                    <p>No hay órdenes asignadas.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p>No hay mesas en proceso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mesas;
