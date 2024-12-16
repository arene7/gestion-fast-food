import React, { useState, useEffect, useCallback } from "react";
import { db } from '../firebase'; // Configuración de Firebase
import { Button, Table, Form, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { collection, query, where, getDocs } from 'firebase/firestore';

const Facturacion = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("mesa"); // Filtra por mesa por defecto
  const [selectedReserva, setSelectedReserva] = useState("");
  const [sillas, setSillas] = useState([]); // Estado para sillas

  useEffect(() => {
    const fetchReservaciones = async () => {
      const reservacionesRef = collection(db, "reservations");
      const q = query(reservacionesRef, where("estado", "==", "En proceso")); 
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
        const reservacion = doc.data();
        const productos = reservacion.assignedOrders
          ? Object.values(reservacion.assignedOrders).flat()  // Extraer productos asignados
          : [];
        const sillas = reservacion.assignedOrders
          ? Object.keys(reservacion.assignedOrders)  // Extraer las sillas
          : [];
        return {
          id: doc.id,
          ...reservacion,
          productos, // Guardar los productos extraídos en un array
          sillas, // Guardar las sillas extraídas en un array
        };
      });

      setReservaciones(data);
    };

    fetchReservaciones();
  }, []);

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setSelectedReserva("");
    if (type === "silla") {
      const sillasArray = reservaciones.reduce((acc, reserva) => {
        const sillas = reserva.assignedOrders ? Object.keys(reserva.assignedOrders).map(silla => ({ silla, reservaId: reserva.id })) : [];
        return [...acc, ...sillas];
      }, []);
      setSillas(sillasArray);
    }
  };

  const handleSelectChange = (e) => {
    setSelectedReserva(e.target.value);
  };

  const handleGenerateInvoice = (reservacion, silla) => {
    const doc = new jsPDF();
    doc.text(`Factura para: ${reservacion.nombreCompleto}`, 10, 10);
    const productos = silla ? reservacion.assignedOrders[silla] : reservacion.productos;
    doc.autoTable({
      startY: 20,
      head: [["Producto", "Precio"]],
      body: productos.map((item) => [item.nombre, item.precio]),
    });

    const totalFactura = productos.reduce((acc, prod) => acc + prod.precio, 0);
    doc.text(`Total: ${totalFactura}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Factura_${reservacion.nombreCompleto}_${silla || "completa"}.pdf`);
  };

  const calculateTotal = useCallback(() => {
    const totalAmount = reservaciones.reduce((sum, reservacion) => {
      const productos = reservacion.productos || [];
      return sum + productos.reduce((acc, prod) => acc + prod.precio, 0);
    }, 0);
    setTotal(totalAmount);
  }, [reservaciones]);

  useEffect(() => {
    calculateTotal();
  }, [reservaciones, calculateTotal]);

  return (
    <div className="container">
      <h2 className="my-4">Facturación</h2>
      <DropdownButton id="dropdown-basic-button" title={`Filtrar por ${filterType}`} className="mb-3">
        <Dropdown.Item onClick={() => handleFilterTypeChange("mesa")}>Mesa</Dropdown.Item>
        <Dropdown.Item onClick={() => handleFilterTypeChange("silla")}>Silla</Dropdown.Item>
      </DropdownButton>
      <InputGroup className="mb-3">
        <Form.Select value={selectedReserva} onChange={handleSelectChange}>
          <option value="">Seleccionar {filterType}</option>
          {filterType === "mesa" && reservaciones.map((reservacion) => (
            <option key={reservacion.id} value={reservacion.id}>
              {reservacion.nombreCompleto} - Mesa {reservacion.mesa}
            </option>
          ))}
          {filterType === "silla" && sillas.map((silla) => (
            <option key={silla.silla} value={`${silla.reservaId}-${silla.silla}`}>
              Silla {silla.silla} - Reservación {silla.reservaId}
            </option>
          ))}
        </Form.Select>
      </InputGroup>

      {selectedReserva && (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Sillas</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservaciones.map((reservacion) => {
                if (filterType === "mesa" && reservacion.id === selectedReserva) {
                  const totalReserva = reservacion.productos.reduce((sum, p) => sum + p.precio, 0);
                  return (
                    <tr key={reservacion.id}>
                      <td>{reservacion.nombreCompleto}</td>
                      <td>{reservacion.mesa}</td>
                      <td>{reservacion.sillas.join(", ")}</td>
                      <td>
                        {reservacion.productos.map((item, index) => (
                          <div key={index}>
                            {item.nombre} - ${item.precio}
                          </div>
                        ))}
                      </td>
                      <td>${totalReserva}</td>
                      <td>
                        <Button variant="primary" onClick={() => handleGenerateInvoice(reservacion)}>
                          Generar Factura
                        </Button>
                      </td>
                    </tr>
                  );
                }

                if (filterType === "silla") {
                  const [reservaId, silla] = selectedReserva.split("-");
                  if (reservacion.id === reservaId) {
                    const productos = reservacion.assignedOrders[silla] || [];
                    const totalSilla = productos.reduce((sum, p) => sum + p.precio, 0);
                    return (
                      <tr key={`${reservaId}-${silla}`}>
                        <td>{reservacion.nombreCompleto}</td>
                        <td>{reservacion.mesa}</td>
                        <td>Silla {silla}</td>
                        <td>
                          {productos.map((item, index) => (
                            <div key={index}>
                              {item.nombre} - ${item.precio}
                            </div>
                          ))}
                        </td>
                        <td>${totalSilla}</td>
                        <td>
                          <Button variant="primary" onClick={() => handleGenerateInvoice(reservacion, silla)}>
                            Generar Factura
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                }

                return null;
              })}
            </tbody>
          </Table>
          <h4>Total a facturar: ${total}</h4>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
