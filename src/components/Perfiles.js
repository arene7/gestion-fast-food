import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Perfiles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({ email: "", role: "usuario", status: "Activo" });
  const [newUserData, setNewUserData] = useState({ email: "", role: "usuario", status: "Activo" });
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

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
      }
    };

    fetchUsers();
  }, [db]);

  // Actualizar rol del usuario
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      alert("Rol actualizado correctamente.");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error al actualizar el rol.");
    }
  };

  // Iniciar edición de usuario
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setUserData({ email: user.email, role: user.role, status: user.status });
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
      alert("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error al guardar los cambios.");
    }
  };

  // Eliminar usuario
  const handleDeleteClick = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar el usuario.");
    }
  };

  // Agregar nuevo usuario
  const handleAddUserClick = async () => {
    try {
      const newUserRef = await addDoc(collection(db, "users"), newUserData);
      setUsers((prevUsers) => [
        ...prevUsers,
        { id: newUserRef.id, ...newUserData }
      ]);
      setNewUserData({ email: "", role: "usuario", status: "Activo" }); // Limpiar formulario
      setShowAddUserForm(false); // Cerrar formulario
      alert("Nuevo usuario agregado.");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Error al agregar el usuario.");
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="container mt-5">
      <h1>Gestión de Perfiles</h1>

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
            <option value="usuario">Usuario</option>
          </select>
          <select
            value={newUserData.status}
            onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
            className="form-select mb-2"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
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
                    <option value="usuario">Usuario</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <select
                    value={userData.status}
                    onChange={(e) => setUserData({ ...userData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                ) : (
                  user.status
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
    </div>
  );
};

export default Perfiles;