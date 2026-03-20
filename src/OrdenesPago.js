import React, { useState, useEffect } from 'react';
import api from './api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Landmark, Download, Send, History, Loader2 } from 'lucide-react';

const OrdenesPago = () => {
  // Base64 del logo (puedes completarlo con el string largo original)
  const LOGO_ALPHA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; 

  const [proveedores, setProveedores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const [resProv, resPagos] = await Promise.all([
        api.get('/proveedores'),
        api.get('/ordenes-pago')
      ]);
      setProveedores(resProv.data || []);
      setHistorial(resPagos.data?.sort((a, b) => b.id - a.id) || []);
    } catch (err) { 
      console.error("Error cargando datos de pagos:", err); 
    }
  };

  const generarPDF = (p) => {
    const doc = new jsPDF();
    const idFormateado = String(p.id).padStart(4, '0');
    const totalCalculado = p.monto || (Number(p.cantidad) * Number(p.precioUnitario));
    
    const lightBlue = [224, 242, 254]; 
    const textColor = [0, 0, 0]; 

    // --- CABECERA ---
    doc.setFillColor(...lightBlue);
    doc.rect(0, 0, 210, 40, 'F');
    
    try { 
      if (LOGO_ALPHA.length > 50) doc.addImage(LOGO_ALPHA, 'PNG', 15, 8, 50, 25); 
    } catch (e) { console.warn("Logo no disponible"); }

    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE PAGO", 200, 22, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("COMPROBANTE INTERNO DE EGRESO", 200, 35, { align: 'right' });
    
    // --- DATOS PRINCIPALES ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`NRO ORDEN: ${idFormateado}`, 15, 50);
    doc.text(`FECHA: ${new Date(p.createdAt || Date.now()).toLocaleDateString('es-AR')}`, 15, 56);
    doc.text(`CAJA/ORIGEN: ${(p.caja || "GENERAL").toUpperCase()}`, 15, 62);
    
    // --- TABLA DE DETALLE ---
    autoTable(doc, {
      startY: 70,
      head: [["DESCRIPCIÓN", "PROVEEDOR", "CANT.", "P. UNIT", "TOTAL"]],
      body: [[
        p.productoServicio.toUpperCase(),
        p.proveedorNombre.toUpperCase(), 
        p.cantidad, 
        `$ ${Number(p.precioUnitario || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 
        `$ ${Number(totalCalculado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: lightBlue, 
        textColor: textColor, 
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      styles: { fontSize: 9, textColor: textColor },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    // --- INFORMACIÓN ADICIONAL ---
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["MÉTODO DE PAGO", "REFERENCIA / NRO OPERACIÓN"]],
      body: [[p.metodoPago.toUpperCase(), (p.referencia || "SIN REFERENCIA").toUpperCase()]],
      theme: 'striped',
      headStyles: { fillColor: [241, 245, 249], textColor: textColor }
    });

    // --- SECCIÓN DE FIRMA ---
    const finalY = 245;
    const margenDerecho = 195;
    const anchoFirma = 75;
    const inicioFirmaX = margenDerecho - anchoFirma;

    doc.setDrawColor(0); 
    doc.setLineWidth(0.5);
    doc.line(inicioFirmaX, finalY, margenDerecho, finalY); 
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBÍ CONFORME", margenDerecho, finalY + 7, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("ACLARACIÓN: ...................................................", margenDerecho, finalY + 16, { align: 'right' });
    doc.text("DNI: ...................................................", margenDerecho, finalY + 23, { align: 'right' });

    doc.save(`OrdenPago_Alpha_${idFormateado}.pdf`);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!pago.proveedorNombre) return alert("Seleccione un proveedor");
    setLoading(true);

    try {
      const montoTotal = Number(pago.cantidad) * Number(pago.precioUnitario);
      const res = await api.post('/ordenes-pago', { 
        ...pago, 
        monto: montoTotal,
        cantidad: Number(pago.cantidad),
        precioUnitario: Number(pago.precioUnitario)
      });
      
      alert("✅ Orden de Pago registrada con éxito");
      generarPDF(res.data);

      setPago({ 
        proveedorNombre: '', productoServicio: '', cantidad: 1, 
        precioUnitario: '', caja: '', metodoPago: 'Transferencia', referencia: '' 
      });
      cargarDatos();
    } catch (err) { 
      alert(`❌ ${err.response?.data?.message || "Error al registrar el pago"}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Landmark size={24} /> Nueva Orden de Pago</h2>
        <form onSubmit={enviar}>
          <div style={styles.gridRow}>
            <div style={{flex: '1 1 100%'}}>
               <label style={styles.label}>Producto / Servicio</label>
               <input 
                 style={styles.input} 
                 placeholder="Ej: Servicio de Mantenimiento / Compra de Repuestos" 
                 value={pago.productoServicio} 
                 onChange={e => setPago({...pago, productoServicio: e.target.value})} 
                 required 
               />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div style={{flex: '1 1 300px'}}>
              <label style={styles.label}>Proveedor</label>
              <select style={styles.input} required value={pago.proveedorNombre} onChange={e => setPago({...pago, proveedorNombre: e.target.value})}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{flex: '1 1 300px'}}>
              <label style={styles.label}>Caja / Origen Fondos</label>
              <input style={styles.input} placeholder="Ej: Banco Galicia / Caja Chica" value={pago.caja} onChange={e => setPago({...pago, caja: e.target.value})} />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div style={{flex: '1 1 140px'}}>
              <label style={styles.label}>Cantidad</label>
              <input style={styles.input} type="number" min="1" value={pago.cantidad} onChange={e => setPago({...pago, cantidad: e.target.value})} />
            </div>
            <div style={{flex: '1 1 140px'}}>
              <label style={styles.label}>Precio Unitario</label>
              <input style={styles.input} type="number" step="0.01" placeholder="$ 0.00" value={pago.precioUnitario} onChange={e => setPago({...pago, precioUnitario: e.target.value})} required />
            </div>
            <div style={{flex: '1 1 140px'}}>
              <label style={styles.label}>Método de Pago</label>
              <select style={styles.input} value={pago.metodoPago} onChange={e => setPago({...pago, metodoPago: e.target.value})}>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
                <option value="Echeq">Echeq</option>
                <option value="Cuenta Corriente">Cuenta Corriente</option>
              </select>
            </div>
          </div>

          <div style={styles.gridRow}>
            <div style={{flex: '1 1 100%'}}>
              <label style={styles.label}>Referencia (CBU, Nro Operación, Nro Cheque)</label>
              <input style={styles.input} placeholder="Información adicional del pago" value={pago.referencia} onChange={e => setPago({...pago, referencia: e.target.value})} />
            </div>
          </div>

          <div style={styles.totalBox}>
            Monto a Liquidar: <strong>$ {(Number(pago.cantidad) * (Number(pago.precioUnitario) || 0)).toLocaleString('es-AR')}</strong>
          </div>
          
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> REGISTRAR Y DESCARGAR PDF</>}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.header}><History size={20} /> Historial Reciente</h3>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nro</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color: '#64748b'}}>Sin movimientos registrados</td></tr>
              ) : (
                historial.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>#{String(p.id).padStart(4, '0')}</td>
                    <td style={styles.td}>{p.proveedorNombre}</td>
                    <td style={styles.td}>$ {Number(p.monto).toLocaleString('es-AR')}</td>
                    <td style={styles.td}>
                      <button onClick={() => generarPDF(p)} style={styles.btnPdf}>
                        <Download size={14} /> PDF
                      </button>
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
  container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '900px', margin: '0 auto 20px' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  gridRow: { display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  totalBox: { background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'right', fontSize: '20px', color: '#0f172a', marginBottom: '20px', border: '1px solid #e2e8f0' },
  btnSubmit: { width: '100%', padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  btnPdf: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#1e293b' }
};

export default OrdenesPago;