import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardamos el rol del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role
      });

      alert('Usuario registrado correctamente');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center">Registrar Usuario</h2>
          {error && <p className="text-danger text-center">{error}</p>}
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select 
                className="form-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required 
              >
                <option value="">Seleccionar Rol</option>
                <option value="administrador">Administrador</option>
                <option value="cajero">Cajero</option>
                <option value="mesero">Mesero</option>
                <option value="recepcionista">Recepcionista</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
