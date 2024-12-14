import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";

const Perfiles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({ email: "", role: "usuario", isActive: true });  // Renombramos el campo a isActive
  const [newUserData, setNewUserData] = useState({ email: "", role: "usuario", isActive: true });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const db = getFirestore();

  // Cargar usuarios desde la colección `users`
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
        setErrorMessage("Hubo un error al cargar los usuarios.");
      }
    };

    fetchUsers();
  }, [db]);

  // Iniciar edición de usuario
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setUserData({ email: user.email, role: user.role, isActive: user.isActive });
  };

  // Guardar los cambios de edición
  const handleSaveClick = async () => {
    try {
      const userRef = doc(db, "users", editingUser);
      await updateDoc(userRef, userData);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser ? { ...user, ...userData } : user
        )
      );
      setEditingUser(null);  // Salir del modo de edición
      setSuccessMessage("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error saving user:", error);
      setErrorMessage("Error al guardar los cambios.");
    }
  };

  // Eliminar usuario
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);  // Mostrar confirmación antes de eliminar
  };

  const confirmDelete = async () => {
    try {
      const userRef = doc(db, "users", userToDelete);
      await deleteDoc(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
      setShowDeleteConfirmation(false);
      setSuccessMessage("Usuario eliminado correctamente.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Error al eliminar el usuario.");
    }
  };

  // Agregar nuevo usuario
  const handleAddUserClick = async () => {
    if (!newUserData.email || !newUserData.role || newUserData.isActive === null) {
      setErrorMessage("Por favor, completa todos los campos.");
      return;
    }

    try {
      const newUserRef = await addDoc(collection(db, "users"), newUserData);
      setUsers((prevUsers) => [
        ...prevUsers,
        { id: newUserRef.id, ...newUserData }
      ]);
      setNewUserData({ email: "", role: "usuario", isActive: true }); // Limpiar formulario
      setShowAddUserForm(false); // Cerrar formulario
      setSuccessMessage("Nuevo usuario agregado.");
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage("Error al agregar el usuario.");
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="container mt-5">
      <h1>Gestión de Perfiles</h1>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Botón para mostrar el formulario de agregar usuario */}
      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowAddUserForm(true)}
      >
        Agregar Nuevo Usuario
      </button>

      {/* Formulario para agregar nuevo usuario */}
      {showAddUserForm && (
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            className="form-control mb-2"
          />
          <select
            value={newUserData.role}
            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
            className="form-select mb-2"
          >
            <option value="administrador">Administrador</option>
            <option value="cajero">Cajero</option>
            <option value="mesero">Mesero</option>
            <option value="recepcionista">Recepcionista</option>
          </select>
          <select
            value={newUserData.isActive}
            onChange={(e) => setNewUserData({ ...newUserData, isActive: e.target.value === 'true' })}
            className="form-select mb-2"
          >
            <option value={true}>Activo</option>
            <option value={false}>Inactivo</option>
          </select>
          <button className="btn btn-success" onClick={handleAddUserClick}>
            Agregar Usuario
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => setShowAddUserForm(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="form-control"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="cajero">Cajero</option>
                    <option value="mesero">Mesero</option>
                    <option value="recepcionista">Recepcionista</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={userData.isActive}
                    onChange={(e) => setUserData({ ...userData, isActive: e.target.value === 'true' })}
                    className="form-select"
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                ) : (
                  user.isActive ? "Activo" : "Inactivo"
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <button className="btn btn-success" onClick={handleSaveClick}>
                    Guardar
                  </button>
                ) : (
                  <button className="btn btn-warning me-2" onClick={() => handleEditClick(user)}>
                    Editar
                  </button>
                )}
                <button className="btn btn-danger" onClick={() => handleDeleteClick(user.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmación de eliminación */}
      {showDeleteConfirmation && (
        <div className="modal show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar este usuario?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfiles;
