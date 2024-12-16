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
    correo: '',
    estado: 'Pendiente', // Ahora el estado también se envía al crear una nueva reserva
  });
  const [mensaje, setMensaje] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [editingReserva, setEditingReserva] = useState(null);

  // Tabla con las sillas disponibles para cada mesa
  const mesas = {
    1: 4,
    2: 2,
    3: 4,
    4: 6,
    5: 4,
    6: 2,
    7: 6,
    8: 4,
    9: 2,
    10: 4,
    11: 6,
    12: 8,
  };

  // Función para obtener todas las reservas desde Firestore
  const fetchReservas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reservations'));
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

  // Verifica si la mesa está disponible en el intervalo de hora seleccionado
  const isTableAvailableInHourRange = (mesa, fecha, hora) => {
    const hourRangeStart = parseInt(hora.split(':')[0]);
    const hourRangeEnd = hourRangeStart + 1;

    // Excluir la reserva que estamos editando
    return !reservas.some((reserva) => {
      const reservaHora = parseInt(reserva.hora.split(':')[0]);

      // Excluir la reserva que estamos editando
      if (editingReserva && reserva.id === editingReserva.id) {
        return false;
      }

      return (
        reserva.mesa === mesa &&
        reserva.fecha === fecha &&
        (reservaHora === hourRangeStart || reservaHora === hourRangeEnd)
      );
    });
  };

  // Verifica si el número de personas no excede el número de sillas de la mesa seleccionada
  const isValidNumberOfPeople = (mesa, numeroDePersonas) => {
    return numeroDePersonas <= mesas[mesa];
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica si la mesa está disponible en el intervalo de hora seleccionado
    if (!isTableAvailableInHourRange(formData.mesa, formData.fecha, formData.hora)) {
      setMensaje('La mesa ya está ocupada en ese intervalo de hora.');
      return;
    }

    // Verifica que el número de personas no exceda el límite de sillas de la mesa seleccionada
    if (!isValidNumberOfPeople(formData.mesa, formData.numeroDePersonas)) {
      setMensaje(`La mesa ${formData.mesa} tiene un máximo de ${mesas[formData.mesa]} sillas.`);
      return;
    }

    // Envía el correo a través de EmailJS
    const templateParams = {
      nombreCompleto: formData.nombreCompleto,
      fecha: formData.fecha,
      hora: formData.hora,
      numeroDePersonas: formData.numeroDePersonas,
      mesa: formData.mesa,
      correo: formData.correo,
      estado: formData.estado, // El estado se incluye también al crear la reserva
    };

    emailjs
      .send('service_sovzhta', 'template_3hudx86', templateParams, 'up8P-mUB4GN94Koks')
      .then(
        (response) => {
          console.log('¡Éxito!', response.status, response.text);
          setIsSubmitted(true);
          setMensaje('Tu reservación ha sido realizada con éxito.');
          fetchReservas(); // Recargar reservas después de agregar una nueva
        },
        (err) => {
          console.error('Error', err);
          setMensaje('Error al enviar la reservación. Por favor, inténtalo de nuevo más tarde.');
        }
      );
  };

  // Maneja la edición de una reserva
  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormData({
      nombreCompleto: reserva.nombreCompleto,
      fecha: reserva.fecha,
      hora: reserva.hora,
      correo: reserva.correo,
      numeroDePersonas: reserva.numeroDePersonas,
      mesa: reserva.mesa,
      estado: reserva.estado, // Cargar el estado de la reserva
    });
  };

  // Maneja el guardado de la reserva editada
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    // Verifica si la mesa está disponible en el intervalo de hora seleccionado
    if (!isTableAvailableInHourRange(formData.mesa, formData.fecha, formData.hora)) {
      setMensaje('La mesa ya está ocupada en ese intervalo de hora.');
      return;
    }

    // Verifica que el número de personas no exceda el límite de sillas de la mesa seleccionada
    if (!isValidNumberOfPeople(formData.mesa, formData.numeroDePersonas)) {
      setMensaje(`La mesa ${formData.mesa} tiene un máximo de ${mesas[formData.mesa]} sillas.`);
      return;
    }

    try {
      const reservaRef = doc(db, 'reservations', editingReserva.id);
      await updateDoc(reservaRef, {
        nombreCompleto: formData.nombreCompleto,
        fecha: formData.fecha,
        hora: formData.hora,
        correo: formData.correo,
        numeroDePersonas: formData.numeroDePersonas,
        mesa: formData.mesa,
        estado: formData.estado,
      });

      // Enviar correo con el estado actualizado
      const templateParams = {
        nombreCompleto: formData.nombreCompleto,
        fecha: formData.fecha,
        hora: formData.hora,
        correo: formData.correo,
        numeroDePersonas: formData.numeroDePersonas,
        mesa: formData.mesa,
        estado: formData.estado, // Incluir estado en el correo
      };

      emailjs
        .send('service_sovzhta', 'template_3hudx86', templateParams, 'up8P-mUB4GN94Koks')
        .then((response) => {
          console.log('¡Correo enviado con éxito!', response.status, response.text);
        })
        .catch((err) => {
          console.error('Error al enviar el correo:', err);
        });

      setMensaje('Reserva actualizada con éxito.');
      setEditingReserva(null); // Terminar la edición
      fetchReservas(); // Recargar las reservas
    } catch (err) {
      console.error('Error al actualizar la reserva:', err);
      setMensaje('Error al actualizar la reserva. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  // Generar las horas disponibles en intervalos de una hora (de 8 AM a 11 PM)
  const generateAvailableHours = () => {
    const hours = [];
    for (let hour = 8; hour <= 23; hour++) {
      const formattedHour = `${hour < 10 ? '0' : ''}${hour}:00`;
      hours.push(formattedHour);
    }
    return hours;
  };

  return (
    <div className="container">
      <h2 className="my-4">Hacer una Reservación</h2>
      <form
        className="row g-3"
        onSubmit={editingReserva ? handleSaveEdit : handleSubmit}
      >
        <div className="col-md-6 position-relative">
          <label htmlFor="nombreCompleto" className="form-label">
            Nombre Completo
          </label>
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
          <label htmlFor="fecha" className="form-label">
            Fecha de Reservación
          </label>
          <input
            type="date"
            className="form-control"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]} // No permite días anteriores a la fecha actual
          />
        </div>

        <div className="col-md-6 position-relative">
          <label htmlFor="hora" className="form-label">
            Hora de Reservación
          </label>
          <select
            className="form-select"
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Elige una hora...
            </option>
            {generateAvailableHours().map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 position-relative">
          <label htmlFor="numeroDePersonas" className="form-label">
            Número de Personas
          </label>
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
          <label htmlFor="mesa" className="form-label">
            Número de Mesa
          </label>
          <select
            className="form-select"
            id="mesa"
            name="mesa"
            value={formData.mesa}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Elige una mesa...
            </option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((numMesa) => (
              <option key={numMesa} value={numMesa}>
                Mesa {numMesa} (Máximo {mesas[numMesa]} personas)
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 position-relative">
        <label htmlFor="correo" className="form-label">
          Correo Electrónico
        </label>
        <input
          type="email"
          className="form-control"
          id="correo"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />
      </div>


        {/* Campo de estado visible siempre */}
        <div className="col-md-6 position-relative">
          <label htmlFor="estado" className="form-label">
            Estado
          </label>
          <select
            className="form-select"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="En proceso">En Proceso</option>
            <option value="Cancelada">Cancelada</option>
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
            <th>Estado</th>
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
              <td>{reserva.estado}</td>
              <td>
                <button className="btn btn-warning" onClick={() => handleEdit(reserva)}>
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
