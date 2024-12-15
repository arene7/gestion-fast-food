import React, { useState, useEffect, useCallback } from "react";
import { db } from '../firebase'; // Asegúrate de tener configurado el archivo firebase.js
import { Button, Table, Form, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { collection, query, where, getDocs } from 'firebase/firestore';

const Facturacion = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("mesa");  // Default to 'mesa'
  const [selectedReserva, setSelectedReserva] = useState(""); // Agregamos setSelectedReserva

  useEffect(() => {
    const fetchReservaciones = async () => {
      const reservacionesRef = collection(db, "reservations");  // Asegúrate de usar la colección correcta
      const q = query(reservacionesRef, where("estado", "==", "Cerrada"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReservaciones(data);
    };

    fetchReservaciones();
  }, []);

  const filterReservaciones = useCallback((reservaciones) => {
    return reservaciones.filter((reservacion) => {
      const chairs = reservacion.chairs || [];
      if (filterType === "mesa") {
        return reservacion.mesa && reservacion.mesa.toLowerCase().includes(filterType.toLowerCase());
      }
      if (filterType === "silla") {
        return chairs.some(chair => chair.toString().includes(filterType));
      }
      return reservacion.nombreCompleto && reservacion.nombreCompleto.toLowerCase().includes(filterType.toLowerCase());
    });
  }, [filterType]);

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
  };

  const handleSelectChange = (e) => {
    setSelectedReserva(e.target.value); // Usamos setSelectedReserva aquí
  };

  const handleGenerateInvoice = (reservacion) => {
    const doc = new jsPDF();
    doc.text(`Factura para: ${reservacion.nombreCompleto}`, 10, 10);
    doc.autoTable({
      startY: 20,
      head: [["Nombre", "Precio"]],
      body: reservacion.items.map((item) => [
        item.nombre,
        item.precio,
      ]),
    });

    doc.text(`Total: ${reservacion.total}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Factura_${reservacion.nombreCompleto}.pdf`);
  };

  const calculateTotal = useCallback(() => {
    const filteredReservaciones = filterReservaciones(reservaciones);
    const totalAmount = filteredReservaciones.reduce((sum, reservacion) => sum + reservacion.total, 0);
    setTotal(totalAmount);
  }, [reservaciones, filterReservaciones]);

  useEffect(() => {
    calculateTotal();
  }, [reservaciones, calculateTotal]);

  return (
    <div className="container">
      <h2 className="my-4">Facturación</h2>
      <InputGroup className="mb-3">
        <Form.Select value={selectedReserva} onChange={handleSelectChange}>
          <option value="">Seleccionar reservación</option>
          {reservaciones.map((reservacion) => (
            <option key={reservacion.id} value={reservacion.id}>
              {reservacion.nombreCompleto} - Mesa {reservacion.mesa}
            </option>
          ))}
        </Form.Select>
      </InputGroup>
      <DropdownButton id="dropdown-basic-button" title={`Filtrar por ${filterType}`} className="mb-3">
        <Dropdown.Item onClick={() => handleFilterTypeChange("mesa")}>Mesa</Dropdown.Item>
        <Dropdown.Item onClick={() => handleFilterTypeChange("silla")}>Silla</Dropdown.Item>
      </DropdownButton>
      {selectedReserva && (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>{filterType === "mesa" ? "Mesa" : "Silla"}</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservaciones
                .filter((reservacion) => reservacion.id === selectedReserva)
                .map((reservacion) => (
                  <tr key={reservacion.id}>
                    <td>{reservacion.nombreCompleto}</td>
                    <td>{filterType === "mesa" ? reservacion.mesa : reservacion.chairs.join(", ")}</td>
                    <td>${reservacion.total}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleGenerateInvoice(reservacion)}>
                        Generar Factura
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <h4>Total a facturar: ${total}</h4>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
