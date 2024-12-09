import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Asegúrate de importar tu configuración de Firebase
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'; 
import emailjs from 'emailjs-com';

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    fecha: '',
    hora: '',
    numeroDePersonas: '',
    mesa: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [editingReserva, setEditingReserva] = useState(null); // Estado para saber si estamos editando una reserva

  // Función para obtener todas las reservas desde Firestore
  const fetchReservas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reservas'));
      const reservasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservas(reservasList);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
    }
  };

  // Llamar a fetchReservas cuando el componente se monta
  useEffect(() => {
    fetchReservas();
  }, []);

  // Actualiza el estado formData cuando cambian los valores de entrada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica si la mesa está disponible (suponiendo que las mesas están numeradas del 1 al 12)
    const availableTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!availableTables.includes(parseInt(formData.mesa))) {
      setMensaje('El número de mesa es inválido o no está disponible.');
      return;
    }

    // Envía el correo a través de EmailJS
    const templateParams = {
      nombreCompleto: formData.nombreCompleto,
      fecha: formData.fecha,
      hora: formData.hora,
      numeroDePersonas: formData.numeroDePersonas,
      mesa: formData.mesa,
    };

    emailjs
      .send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
      .then((response) => {
        console.log('¡Éxito!', response.status, response.text);
        setIsSubmitted(true);
        setMensaje('Tu reservación ha sido realizada con éxito.');
        fetchReservas(); // Recargar reservas después de agregar una nueva
      })
      .catch((err) => {
        console.error('Error', err);
        setMensaje('Error al enviar la reservación. Por favor, inténtalo de nuevo más tarde.');
      });
  };

  // Maneja la edición de una reserva
  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormData({
      nombreCompleto: reserva.nombreCompleto,
      fecha: reserva.fecha,
      hora: reserva.hora,
      numeroDePersonas: reserva.numeroDePersonas,
      mesa: reserva.mesa,
    });
  };

  // Maneja el guardado de la reserva editada
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const reservaRef = doc(db, 'reservas', editingReserva.id);
      await updateDoc(reservaRef, {
        nombreCompleto: formData.nombreCompleto,
        fecha: formData.fecha,
        hora: formData.hora,
        numeroDePersonas: formData.numeroDePersonas,
        mesa: formData.mesa,
      });

      setMensaje('Reserva actualizada con éxito.');
      setEditingReserva(null); // Terminar la edición
      fetchReservas(); // Recargar las reservas
    } catch (err) {
      console.error('Error al actualizar la reserva:', err);
      setMensaje('Error al actualizar la reserva. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">Hacer una Reservación</h2>

      <form className="row g-3 needs-validation" noValidate onSubmit={editingReserva ? handleSaveEdit : handleSubmit}>
        <div className="col-md-6 position-relative">
          <label htmlFor="nombreCompleto" className="form-label">Nombre Completo</label>
          <input
            type="text"
            className="form-control"
            id="nombreCompleto"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 position-relative">
          <label htmlFor="fecha" className="form-label">Fecha de Reservación</label>
          <input
            type="date"
            className="form-control"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 position-relative">
          <label htmlFor="hora" className="form-label">Hora de Reservación</label>
          <input
            type="time"
            className="form-control"
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 position-relative">
          <label htmlFor="numeroDePersonas" className="form-label">Número de Personas</label>
          <input
            type="number"
            className="form-control"
            id="numeroDePersonas"
            name="numeroDePersonas"
            value={formData.numeroDePersonas}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="col-md-6 position-relative">
          <label htmlFor="mesa" className="form-label">Número de Mesa</label>
          <select
            className="form-select"
            id="mesa"
            name="mesa"
            value={formData.mesa}
            onChange={handleChange}
            required
          >
            <option selected disabled value="">
              Elige una mesa...
            </option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((numMesa) => (
              <option key={numMesa} value={numMesa}>
                Mesa {numMesa}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            {editingReserva ? 'Guardar Cambios' : 'Enviar Reservación'}
          </button>
        </div>
      </form>

      {mensaje && (
        <div className={`alert ${isSubmitted ? 'alert-success' : 'alert-danger'} mt-4`}>
          {mensaje}
        </div>
      )}

      {/* Mostrar la tabla con las reservas */}
      <h3 className="my-4">Reservas Realizadas</h3>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Número de Personas</th>
            <th>Mesa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.nombreCompleto}</td>
              <td>{reserva.fecha}</td>
              <td>{reserva.hora}</td>
              <td>{reserva.numeroDePersonas}</td>
              <td>{reserva.mesa}</td>
              <td>
                <button
                  className="btn btn-warning"
                  onClick={() => handleEdit(reserva)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationForm;
