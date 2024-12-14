import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firebase config
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
    <div className="container mt-5">
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
  const { numeroDePersonas, assignedOrders = {} } = reservation; // Default for assignedOrders
  const chairs = Array.from({ length: numeroDePersonas }, (_, i) => i + 1);

  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm border-light">
        <div className="card-body">
          <h5 className="card-title">Mesa: {reservation.mesa}</h5>
          <p className="card-text">Reservación ID: {reservation.id}</p>
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
  const [products, setProducts] = useState([]); // Available products
  const [selectedProduct, setSelectedProduct] = useState(""); // Selected product ID
  const [isOpen, setIsOpen] = useState(false); // To track the collapse state

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

    // Find selected product
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Create order object
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
      <h6
        className="d-flex justify-content-between align-items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)} // Toggle collapse on chair click
      >
        <span>Silla {chairNumber}</span>
        <span className="badge bg-info">{orders.length} Pedido(s)</span>
      </h6>

      <div className={`collapse ${isOpen ? "show" : ""}`}>
        <ul className="list-group mb-2">
          {orders.map((order, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {order.nombre}
              <span className="badge bg-primary">${order.precio}</span>
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
          <button className="btn btn-success" onClick={handleAddProduct}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ordenes;
