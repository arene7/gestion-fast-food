import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { db } from '../firebase'; // Importamos la configuración de Firebase
import { collection, addDoc } from 'firebase/firestore';

const ReservationPage = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    fecha: '',
    hora: '',
    numeroDePersonas: '',
    mesa: null, // Mesa ya no se pregunta al usuario, se establece como null
    correo: '', // Campo para correo electrónico
    estado: 'Pendiente', // Estado inicial de la reserva
  });

  const [mensaje, setMensaje] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // Verifica que el correo tenga un formato válido (simple)
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(formData.correo)) {
      setMensaje('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Configuración del correo a través de EmailJS
    const templateParams = {
      nombreCompleto: formData.nombreCompleto,
      fecha: formData.fecha,
      hora: formData.hora,
      numeroDePersonas: formData.numeroDePersonas,
      mesa: formData.mesa, // Mesa se envía como null
      correo: formData.correo,
      estado: 'Pendiente',
    };

    const USER_ID = 'up8P-mUB4GN94Koks';
    const SERVICE_ID = 'service_sovzhta';
    const TEMPLATE_ID = 'template_3hudx86';

    // Enviar el correo
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
      .then(() => {
        // Guarda la reserva en Firestore
        addDoc(collection(db, 'reservations'), {
          ...formData,
          estado: 'Pendiente', // Estado "Confirmada"
          createdAt: new Date(),
        });

        setIsSubmitted(true);
        setMensaje('Tu reservación ha sido realizada con éxito.');
      })
      .catch((err) => {
        console.error('Error al enviar el correo', err);
        setMensaje('Error al enviar la reservación. Por favor, inténtalo de nuevo más tarde.');
      });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return slots;
  };

  const disablePastDates = () => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  };

  return (
    <div className="container">
      <h2 className="my-4">Hacer una Reservación</h2>

      <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
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
          <label htmlFor="correo" className="form-label">Correo Electrónico</label>
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
            min={disablePastDates()}
          />
        </div>

        <div className="col-md-6 position-relative">
          <label htmlFor="hora" className="form-label">Hora de Reservación</label>
          <select
            className="form-select"
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          >
            {getTimeSlots().map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
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

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Enviar Reservación
          </button>
        </div>
      </form>

      {mensaje && (
        <div className={`alert ${isSubmitted ? 'alert-success' : 'alert-danger'} mt-4`}>
          {mensaje}
        </div>
      )}

      {/* Mostrar el estado de la reserva */}
      {isSubmitted && (
        <div className="mt-4">
          <h4>Estado de la Reserva: {formData.estado}</h4>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
