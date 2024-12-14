import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Importa tu configuración de Firebase
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const Ordenes = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const q = query(collection(db, "reservations"), where("estado", "==", "En proceso"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Reservaciones en Proceso</h1>
      <div className="row">
        {reservations.map((reservation) => (
          <ReservationCard key={reservation.id} reservation={reservation} />
        ))}
      </div>
    </div>
  );
};

const ReservationCard = ({ reservation }) => {
  const { numeroDePersonas, assignedOrders = {} } = reservation; // Asegurar valor predeterminado para assignedOrders
  const chairs = Array.from({ length: numeroDePersonas }, (_, i) => i + 1);

  return (
    <div className="col-md-4 mb-4">
      <div className="card">
        <div className="card-body">
        <h5 className="card-title">Mesa: {reservation.mesa}</h5>
          <p className="card-text"> Reservación ID: {reservation.id}</p>
          <p className="card-text">Cantidad de personas: {numeroDePersonas}</p>
          <div className="list-group">
            {chairs.map((chair) => (
              <ChairOrder
                key={chair}
                chairNumber={chair}
                orders={assignedOrders[chair] || []}
                reservationId={reservation.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChairOrder = ({ chairNumber, orders, reservationId }) => {
  const [products, setProducts] = useState([]); // Productos disponibles
  const [selectedProduct, setSelectedProduct] = useState(""); // ID del producto seleccionado

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!selectedProduct) return;

    // Buscar el producto seleccionado
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Crear un objeto con nombre y precio
    const updatedOrders = [
      ...(orders || []),
      { nombre: product.nombre, precio: product.precio },
    ];

    try {
      const reservationRef = doc(db, "reservations", reservationId);
      await updateDoc(reservationRef, {
        [`assignedOrders.${chairNumber}`]: updatedOrders,
      });
      console.log(`Updated orders for chair ${chairNumber}:`, updatedOrders);
      setSelectedProduct("");
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };

  return (
    <div className="mb-3">
      <h6>Silla {chairNumber}</h6>
      <ul className="list-group mb-2">
        {orders.map((order, index) => (
          <li key={index} className="list-group-item">
            {order.nombre} - ${order.precio}
          </li>
        ))}
      </ul>
      <div className="input-group">
        <select
          className="form-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Seleccionar producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.nombre} - ${product.precio}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default Ordenes;
