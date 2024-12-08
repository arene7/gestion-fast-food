import React, { useState } from 'react';
import { db, auth } from '../firebase'; // Asegúrate de importar Firebase
import { collection, addDoc } from 'firebase/firestore';
import emailjs from 'emailjs-com';

const ReservationPage = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    fecha: '',
    hora: '',
    numeroDePersonas: '',
    mesa: '',
    email: '', // Añadimos el campo de correo electrónico
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica si la mesa está disponible (suponiendo que las mesas están numeradas del 1 al 12)
    const availableTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!availableTables.includes(parseInt(formData.mesa))) {
      setMensaje('El número de mesa es inválido o no está disponible.');
      return;
    }

    // Crea el documento de reserva en Firestore
    try {
      await addDoc(collection(db, 'reservas'), {
        nombreCompleto: formData.nombreCompleto,
        fecha: formData.fecha,
        hora: formData.hora,
        numeroDePersonas: formData.numeroDePersonas,
        mesa: formData.mesa,
        email: formData.email,
        usuarioId: auth.currentUser ? auth.currentUser.uid : null, // Guardar el UID del usuario si está autenticado
        creadoEn: new Date(), // Fecha de creación
      });

      // Enviar el correo con EmailJS
      const templateParams = {
        nombreCompleto: formData.nombreCompleto,
        fecha: formData.fecha,
        hora: formData.hora,
        numeroDePersonas: formData.numeroDePersonas,
        mesa: formData.mesa,
        email: formData.email, // Correo electrónico del usuario
      };
      

      emailjs.send('service_yfapbmq', 'template_3hudx86', templateParams, 'up8P-mUB4GN94Koks')
        .then((response) => {
          console.log('¡Éxito!', response.status, response.text);
          setIsSubmitted(true);
          setMensaje('Tu reservación ha sido realizada con éxito.');
        })
        .catch((err) => {
          console.error('Error', err);
          setMensaje('Error al enviar la reservación. Por favor, inténtalo de nuevo más tarde.');
        });

    } catch (err) {
      console.error('Error al guardar la reserva:', err);
      setMensaje('Error al realizar la reservación. Por favor, inténtalo de nuevo más tarde.');
    }

    // Limpiar el formulario después de enviar
    setFormData({
      nombreCompleto: '',
      fecha: '',
      hora: '',
      numeroDePersonas: '',
      mesa: '',
      email: '',
    });
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
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
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
            Enviar Reservación
          </button>
        </div>
      </form>

      {mensaje && (
        <div className={`alert ${isSubmitted ? 'alert-success' : 'alert-danger'} mt-4`}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
