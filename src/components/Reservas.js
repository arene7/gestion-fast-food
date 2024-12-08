import React, { useState } from 'react';
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
      })
      .catch((err) => {
        console.error('Error', err);
        setMensaje('Error al enviar la reservación. Por favor, inténtalo de nuevo más tarde.');
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

export default ReservationForm;
