import React, { useState, useEffect } from 'react';
import api from './api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdenesPago = () => {
  const [proveedores, setProveedores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pago, setPago] = useState({
    proveedorNombre: '',
    productoServicio: '', 
    cantidad: 1,
    precioUnitario: '',
    caja: '',
    metodoPago: 'Transferencia',
    referencia: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // ✅ Rutas corregidas con el prefijo /api/
      const [resProv, resPagos] = await Promise.all([
        api.get('/api/proveedores'),
        api.get('/api/ordenes-pago')
      ]);
      setProveedores(resProv.data || []);
      setHistorial(resPagos.data || []);
    } catch (err) { 
      console.error("Error cargando datos de pagos:", err); 
    }
  };

  const generarPDF = (p) => {
    const doc = new jsPDF();
    const idFormateado = String(p.id).padStart(4, '0');
    // Usamos el monto guardado en BD o calculamos en el momento
    const totalCalculado = p.monto || (p.cantidad * p.precioUnitario);
    
    // --- ENCABEZADO AZUL ---
    doc.setFillColor(41, 128, 185); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("ORDEN DE PAGO", 14, 25);
    doc.setFontSize(10);
    doc.text("ADMINISTRACIÓN Y GESTIÓN DE PROYECTOS", 196, 25, { align: "right" });
    
    // Datos principales
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Comprobante Nro: ${idFormateado}`, 14, 50);
    doc.text(`Fecha: ${new Date(p.fecha || p.fecha_creacion).toLocaleDateString()}`, 14, 56);
    doc.text(`Caja: ${p.caja || "General"}`, 14, 62);
    
    // --- TABLA DETALLADA ---
    autoTable(doc, {
      startY: 70,
      head: [["Producto / Servicio", "Proveedor", "Cant.", "P. Unit", "Total"]],
      body: [
        [
          p.productoServicio || "S/D",
          p.proveedorNombre, 
          p.cantidad, 
          `$${Number(p.precioUnitario || 0).toLocaleString()}`, 
          `$${Number(totalCalculado).toLocaleString()}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // --- DETALLES DE PAGO ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Método de Pago", "Referencia"]],
      body: [
        [p.metodoPago, p.referencia || "-"]
      ],
      theme: 'striped'
    });

    // --- SECCIÓN DE FIRMA ---
    const finalY = doc.lastAutoTable.finalY + 45;
    doc.line(14, finalY, 80, finalY); 
    doc.setFontSize(10);
    doc.text("FIRMA AUTORIZADA", 14, finalY + 5);
    doc.text("ACLARACIÓN:", 14, finalY + 13);
    doc.text("DNI:", 14, finalY + 21);

    doc.save(`Pago_${idFormateado}_${p.proveedorNombre}.pdf`);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!pago.proveedorNombre) return alert("Seleccione un proveedor");

    try {
      const montoTotal = Number(pago.cantidad) * Number(pago.precioUnitario);
      // ✅ Ruta corregida con /api/
      await api.post('/api/ordenes-pago', { ...pago, monto: montoTotal });
      
      alert("✅ Orden de Pago registrada con éxito");
      setPago({ 
        proveedorNombre: '', productoServicio: '', cantidad: 1, 
        precioUnitario: '', caja: '', metodoPago: 'Transferencia', referencia: '' 
      });
      cargarDatos();
    } catch (err) { 
      console.error(err);
      alert("Error al registrar el pago en el servidor"); 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>💸 Nueva Orden de Pago</h2>
        <form onSubmit={enviar}>
          
          <div style={styles.gridRow}>
            <div style={{gridColumn: 'span 2'}}>
               <label style={styles.label}>Producto / Servicio</label>
               <input 
                 style={styles.input} 
                 placeholder="Ej: Servicio de Limpieza / Compra de Insumos" 
                 value={pago.productoServicio} 
                 onChange={e => setPago({...pago, productoServicio: e.target.value})} 
                 required 
               />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div>
              <label style={styles.label}>Proveedor</label>
              <select style={styles.input} required value={pago.proveedorNombre} onChange={e => setPago({...pago, proveedorNombre: e.target.value})}>
                <option value="">Seleccionar...</option>
                {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Caja / Origen Fondos</label>
              <input style={styles.input} placeholder="Ej: Caja Chica / Banco" value={pago.caja} onChange={e => setPago({...pago, caja: e.target.value})} />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div>
              <label style={styles.label}>Cantidad</label>
              <input style={styles.input} type="number" min="1" value={pago.cantidad} onChange={e => setPago({...pago, cantidad: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Precio Unitario</label>
              <input style={styles.input} type="number" step="0.01" placeholder="$ 0.00" value={pago.precioUnitario} onChange={e => setPago({...pago, precioUnitario: e.target.value})} required />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div>
              <label style={styles.label}>Método</label>
              <select style={styles.input} value={pago.metodoPago} onChange={e => setPago({...pago, metodoPago: e.target.value})}>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
                <option value="Echeq">Echeq</option>
                <option value="Cuenta Corriente">Cuenta Corriente</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Referencia de Pago</label>
              <input style={styles.input} placeholder="Nro de comprobante o banco" value={pago.referencia} onChange={e => setPago({...pago, referencia: e.target.value})} />
            </div>
          </div>

          <div style={styles.totalBox}>
            Total a Liquidar: <strong>${(Number(pago.cantidad) * (Number(pago.precioUnitario) || 0)).toLocaleString()}</strong>
          </div>
          
          <button type="submit" style={styles.btnSubmit}>REGISTRAR Y GENERAR COMPROBANTE</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.header}>📋 Historial de Pagos</h3>
        <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
            <thead>
                <tr>
                <th style={styles.th}>Nro</th>
                <th style={styles.th}>Producto/Servicio</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Monto</th>
                <th style={styles.th}>Acción</th>
                </tr>
            </thead>
            <tbody>
                {historial.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No hay registros de pagos</td></tr>
                ) : (
                    historial.map(p => (
                    <tr key={p.id}>
                        <td style={styles.td}>#{String(p.id).padStart(4, '0')}</td>
                        <td style={styles.td}>{p.productoServicio}</td>
                        <td style={styles.td}>{p.proveedorNombre}</td>
                        <td style={styles.td}>${Number(p.monto).toLocaleString()}</td>
                        <td style={styles.td}>
                        <button onClick={() => generarPDF(p)} style={styles.btnPdf}>Ver PDF</button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  card: { background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', maxWidth: '850px', margin: '0 auto 20px' },
  header: { borderBottom: '2px solid #edf2f7', paddingBottom: '10px', color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#7f8c8d', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  totalBox: { background: '#f0fff4', padding: '15px', borderRadius: '10px', textAlign: 'right', fontSize: '18px', color: '#2f855a', marginBottom: '15px', border: '1px solid #c6f6d5' },
  btnSubmit: { width: '100%', padding: '14px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  btnPdf: { background: '#edf2f7', color: '#2980b9', border: '1px solid #2980b9', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #edf2f7', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '12px', borderBottom: '1px solid #edf2f7', fontSize: '14px', color: '#334155' }
};

export default OrdenesPago;