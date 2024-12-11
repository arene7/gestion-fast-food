import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const Ordenes = ({ user }) => {
  const [reservaciones, setReservaciones] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState(['Hamburguesa', 'Hotdog', 'Refresco', 'Agua', 'Jugo']);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [selectedSilla, setSelectedSilla] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  const { mesaId } = useParams(); // Parámetro para obtener el ID de la mesa

  // Cargar reservaciones y órdenes desde Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reservacionesSnapshot = await getDocs(collection(db, 'reservaciones'));
        const reservacionesData = reservacionesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReservaciones(reservacionesData);
        setLoading(false);

        // Si la mesa está seleccionada, cargar las órdenes asociadas a la mesa
        if (mesaId) {
          const mesa = reservacionesData.find(reservacion => reservacion.mesa.id === mesaId); // Buscar mesa por la propiedad 'mesa'
          setSelectedMesa(mesa);
          setOrdenes(mesa.ordenes || []);
        }
      } catch (error) {
        console.error('Error al cargar las reservaciones:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [db, mesaId]);

  // Función para agregar un producto a la orden
  const agregarProducto = async () => {
    if (!selectedSilla) {
      alert("Por favor, seleccione una silla.");
      return;
    }
    
    const nuevaOrden = {
      producto: productos[selectedSilla],
      cantidad: cantidad,
      estado: 'abierto',
      silla: selectedSilla,
    };

    // Agregar la nueva orden a la lista
    const nuevaListaOrdenes = [...ordenes, nuevaOrden];
    setOrdenes(nuevaListaOrdenes);

    // Actualizar la base de datos
    const reservacionRef = doc(db, 'reservaciones', selectedMesa.id);
    await updateDoc(reservacionRef, { ordenes: nuevaListaOrdenes });

    alert('Producto agregado a la orden.');
  };

  if (loading) return <p>Cargando mesas y órdenes...</p>;

  return (
    <div className="container mt-5">
      <h1>Tomar Ordenes</h1>
      <div className="mb-4">
        <label>Seleccione una mesa</label>
        <select onChange={(e) => setSelectedMesa(reservaciones.find(reservacion => reservacion.mesa.id === e.target.value))}>
          <option value="">Seleccione una mesa</option>
          {reservaciones.map((reservacion) => (
            <option key={reservacion.id} value={reservacion.mesa.id}>
              Mesa {reservacion.mesa.numeroMesa} - {reservacion.mesa.estado}
            </option>
          ))}
        </select>
      </div>

      {selectedMesa && selectedMesa.mesa.estado !== 'vacía' && (
        <>
          <div className="mb-4">
            <label>Seleccione una silla</label>
            <select onChange={(e) => setSelectedSilla(parseInt(e.target.value))}>
              <option value="">Seleccione una silla</option>
              {[...Array(selectedMesa.mesa.posiciones).keys()].map((silla) => (
                <option key={silla} value={silla}>
                  Silla {silla + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Seleccione un producto</label>
            <select onChange={(e) => setCantidad(e.target.value)}>
              {productos.map((producto, index) => (
                <option key={index} value={producto}>
                  {producto}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button className="btn btn-primary" onClick={agregarProducto}>
              Agregar a la orden
            </button>
          </div>

          <h3>Órdenes de la Mesa</h3>
          <ul>
            {ordenes.map((orden, index) => (
              <li key={index}>
                {orden.producto} (Cantidad: {orden.cantidad}) - Silla {orden.silla + 1}
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedMesa && selectedMesa.mesa.estado === 'vacía' && (
        <p>No se pueden tomar órdenes en una mesa vacía.</p>
      )}
    </div>
  );
};

export default Ordenes;
