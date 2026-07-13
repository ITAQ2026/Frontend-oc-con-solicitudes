import React, { useState, useEffect } from 'react';
import api from './api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Package, Trash2, Plus, Save, Download, ClipboardList, Truck, CreditCard, History, EyeOff } from 'lucide-react';

const OrdenesCompra = ({ user }) => {


  const [proveedores, setProveedores] = useState([]);
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [items, setItems] = useState([{ producto: '', cantidad: 1, precio: '', moneda: 'PESOS', iva: '21%' }]);
  
  const [form, setForm] = useState({
    proveedorNombre: '',
    plazoPago: '',
    formaPago: 'TRANSFERENCIA',
    direccionDescarga: 'Av Brigadier Gral San Martin 235 - 5900 Villa María - Cba.',
    tiempoEstimado: '',
    especificaciones: '',
    autoriza: 'LUCRECIA CAPÓ LLORENTE',
    retira: '',
    solicitudId: ''
  });

  const isAdminPrincipal = (user?.email || '').toLowerCase().trim() === 'admin@sistema.com';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProv, resSol, resHistorial] = await Promise.all([
        api.get('/api/proveedores'),
        api.get('/api/solicitudes?rol=admin'),
        api.get('/api/ordenes-compra')
      ]);
      setProveedores(resProv.data || []);
      
      // Filtrar para que NO aparezcan las que ya están en estado "COMPRADO"
      const filtradas = (resSol.data || []).filter(s => s.estado === 'Aprobado');
      setSolicitudesAprobadas(filtradas);
      
      setHistorial(resHistorial.data?.sort((a, b) => b.id - a.id) || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const manejarSeleccionSolicitud = (id) => {
    if (!id) {
      setForm({ ...form, solicitudId: '' });
      setItems([{ producto: '', cantidad: 1, precio: '', moneda: 'PESOS', iva: '21%' }]);
      return;
    }
    const sol = solicitudesAprobadas.find(s => String(s.id) === String(id));
    if (sol) {
      setForm({ ...form, solicitudId: id });
      let itemsExtraidos = [];
      try {
        itemsExtraidos = typeof sol.items === 'string' ? JSON.parse(sol.items) : (sol.items || []);
      } catch (e) {
        itemsExtraidos = [{ producto: sol.justificacion || 'Producto sin nombre', cantidad: 1 }];
      }
      setItems(itemsExtraidos.map(i => ({
        producto: i.producto || '',
        cantidad: Number(i.cantidad) || 1,
        precio: '',
        moneda: 'PESOS',
        iva: '21%'
      })));
    }
  };

  const eliminarFila = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const exportarPDF = (itemsFinales, datosOrden = null) => {
    const doc = new jsPDF();
    const info = datosOrden || form;
    const idRef = datosOrden?.id ? `OC-${String(datosOrden.id).padStart(4, '0')}` : 'BORRADOR';
    const scRef = info.solicitudId ? `SC-${info.solicitudId}` : 'DIRECTA';
    const margin = 10;
    const lightBlueColor = [224, 242, 254];
    const textColor = [0, 0, 0];

    // Extraer moneda del primer ítem para el encabezado
    const itemsParseados = typeof itemsFinales === 'string' ? JSON.parse(itemsFinales) : itemsFinales;
    const monedaPrincipal = itemsParseados[0]?.moneda || 'PESOS';

    doc.setFillColor(...lightBlueColor);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(...textColor);
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("ALPHA QUÍMICA S.R.L.", 15, 20);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("CUIT: 30-60968636-3", 15, 28);
    doc.text("Av Brigadier Gral San Martin 235 - Villa María, Córdoba", 15, 33);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE COMPRA", 195, 25, { align: 'right' });
    doc.setFontSize(14);
    doc.text(`${idRef}`, 195, 35, { align: 'right' });

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, 52, 190, 38, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PROVEEDOR:", margin + 5, 62);
    doc.text("FECHA:", 135, 62);
    doc.setFont("helvetica", "normal");
    doc.text(`${(info.proveedor || info.proveedorNombre || '').toUpperCase()}`, margin + 40, 62);
    doc.text(`${new Date(info.createdAt || info.fecha || new Date()).toLocaleDateString('es-AR')}`, 155, 62);

    let currentY = 72;
    const textoPago = [info.formaPago, info.plazoPago].filter(val => val && val.trim() !== "").join(" - ");
    doc.setFont("helvetica", "bold");
    doc.text("PAGO:", margin + 5, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(textoPago.toUpperCase() || 'N/A', margin + 40, currentY);

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("GENERÓ:", margin + 5, currentY);
    doc.setFont("helvetica", "normal");
    doc.text((info.creado_por_nombre || user?.nombre || 'N/A').toUpperCase(), margin + 40, currentY);
    
    doc.setFont("helvetica", "bold");
    doc.text("REF. ORIGEN:", 135, currentY - 8);
    doc.setFont("helvetica", "normal");
    doc.text(scRef, 165, currentY - 8);

    currentY += 10;
    if (info.tiempoEstimado) {
        doc.setFont("helvetica", "bold");
        doc.text("ENTREGA:", margin + 5, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(info.tiempoEstimado.toUpperCase(), margin + 40, currentY);
    }

    // Campo MONEDA solicitado a la derecha de ENTREGA
    doc.setFont("helvetica", "bold");
    doc.text("MONEDA:", 135, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(monedaPrincipal.toUpperCase(), 165, currentY);

    autoTable(doc, {
      startY: 95,
      head: [['Descripción', 'Cant.', 'IVA', 'Unitario', 'Subtotal']],
      body: itemsParseados.map(i => {
        const tienePrecio = i.precio !== null && i.precio !== '' && i.precio !== undefined;
        const precioNum = Number(i.precio);
        const monedaSigno = i.moneda === 'USD' ? 'U$D' : '$';
        return [
          i.producto.toUpperCase(), 
          i.cantidad, 
          i.iva || '21%',
          tienePrecio ? `${monedaSigno} ${precioNum.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-', 
          tienePrecio ? `${monedaSigno} ${(i.cantidad * precioNum).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'
        ];
      }),
      headStyles: { fillColor: lightBlueColor, textColor: textColor, halign: 'center', lineWidth: 0.1, lineColor: [200, 200, 200] },
      styles: { fontSize: 8, textColor: textColor, cellPadding: 3 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    let nextY = doc.lastAutoTable.finalY + 10;
    if (info.direccionDescarga) {
        doc.setFont("helvetica", "bold");
        doc.text("ENTREGA EN:", 15, nextY);
        doc.setFont("helvetica", "normal");
        doc.text(info.direccionDescarga.toUpperCase(), 55, nextY);
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    const firmaY = pageHeight - 35;
    doc.setDrawColor(0); doc.line(30, firmaY, 85, firmaY); doc.line(125, firmaY, 180, firmaY); 
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("AUTORIZÓ", 57, firmaY + 5, { align: 'center' });
    doc.text("RETIRA / RECIBE", 152, firmaY + 5, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(info.autoriza || 'LUCRECIA CAPÓ LLORENTE', 57, firmaY + 12, { align: 'center' });
    doc.text(info.retira || '.......................', 152, firmaY + 12, { align: 'center' });

    doc.save(`OC_ALPHA_${idRef}.pdf`);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.proveedorNombre) return alert("Seleccione un proveedor");
    try {
      const payload = { 
        ...form, 
        solicitudId: form.solicitudId ? Number(form.solicitudId) : null,
        creado_por_nombre: user?.nombre || '',
        creado_por_email: user?.email || '',
        items: items.map(it => ({
          producto: it.producto,
          cantidad: Number(it.cantidad) || 1,
          precio: Number(it.precio) || 0,
          moneda: it.moneda || 'PESOS',
          iva: it.iva || '21%'
        }))
      };

      // 1. Enviamos la orden. EL BACKEND YA MARCA LA SOLICITUD COMO COMPRADO.
      const res = await api.post('/api/ordenes-compra', payload);

      alert("✅ Orden de compra generada y Solicitud procesada.");
      
      // 2. Generar PDF
      exportarPDF(items, { ...res.data, especificaciones: form.especificaciones, retira: form.retira }); 
      
      // 3. Limpiar y recargar
      cargarDatos();
      setItems([{ producto: '', cantidad: 1, precio: '', moneda: 'PESOS', iva: '21%' }]);
      setForm({ ...form, proveedorNombre: '', solicitudId: '', especificaciones: '', tiempoEstimado: '', retira: '' });
    } catch (err) { 
      console.error("Error detallado del servidor:", err.response?.data);
      alert("Error: " + (err.response?.data?.message || "No se pudo guardar la orden")); 
    }
  };

  const ocultarOrden = async (orden) => {
    if (!isAdminPrincipal) return;
    const ok = window.confirm(`Ocultar OC-${String(orden.id).padStart(4, '0')} para los demás administradores?`);
    if (!ok) return;

    try {
      await api.patch(`/api/ordenes-compra/${orden.id}/ocultar`);
      cargarDatos();
    } catch (err) {
      alert("Error: " + (err.message || "No se pudo ocultar la orden"));
    }
  };

  const styles = {
    container: { padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    card: { background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '1150px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', marginBottom: '25px', fontSize: '22px', fontWeight: '800' },
    sectionVinculo: { marginBottom: '20px', padding: '15px', background: '#e0f2fe', borderRadius: '12px', border: '1px solid #bae6fd' },
    labelVinculo: { fontSize: '12px', fontWeight: '800', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
    inputVinculo: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #7dd3fc', fontSize: '14px', outline: 'none' },
    sectionItems: { background: '#ffffff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e2e8f0' },
    gridRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: '1', fontSize: '14px', minWidth: '100px' },
    itemRow: { display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' },
    btnDeleteRow: { background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '10px', cursor: 'pointer' },
    btnAdd: { padding: '10px', width: '100%', borderRadius: '8px', border: '1px dashed #94a3b8', cursor: 'pointer', color: '#64748b', background: 'none', fontWeight: '600' },
    btnSubmit: { width: '100%', padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '16px' },
    btnPdfIcon: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#0f172a' },
    btnHideIcon: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#c2410c' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}><Package size={28} /> Generar Orden de Compra</h2>
        <form onSubmit={enviar}>
          <div style={styles.sectionVinculo}>
            <label style={styles.labelVinculo}><ClipboardList size={14}/> 1. Vincular Solicitud de Compra (Aprobadas)</label>
            <select style={styles.inputVinculo} value={form.solicitudId} onChange={e => manejarSeleccionSolicitud(e.target.value)}>
              <option value="">-- Compra Directa (Sin solicitud previa) --</option>
              {solicitudesAprobadas.map(s => (
                <option key={s.id} value={s.id}>SC-{s.id} | {s.solicitante} | {s.area}</option>
              ))}
            </select>
          </div>

          <div style={styles.sectionItems}>
            <label style={styles.label}><CreditCard size={14}/> 2. Proveedor y Condiciones de Pago</label>
            <div style={styles.gridRow}>
              <select style={styles.input} required value={form.proveedorNombre} onChange={e => setForm({...form, proveedorNombre: e.target.value})}>
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
              <input style={styles.input} placeholder="Plazo de Pago" value={form.plazoPago} onChange={e => setForm({...form, plazoPago: e.target.value})} />
              <select style={styles.input} value={form.formaPago} onChange={e => setForm({...form, formaPago: e.target.value})}>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="ECHEQ">Echeq / Cheque</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="CUENTA CORRIENTE">Cuenta Corriente</option>
              </select>
            </div>
          </div>

          <div style={styles.sectionItems}>
            <label style={styles.label}><Truck size={14}/> 3. Logística</label>
            <div style={styles.gridRow}>
              <input style={styles.input} placeholder="Dirección Descarga" value={form.direccionDescarga} onChange={e => setForm({...form, direccionDescarga: e.target.value})} />
              <input style={styles.input} placeholder="Tiempo estimado" value={form.tiempoEstimado} onChange={e => setForm({...form, tiempoEstimado: e.target.value})} />
              <input style={styles.input} placeholder="Quién retira?" value={form.retira} onChange={e => setForm({...form, retira: e.target.value})} />
            </div>
          </div>

          <div style={styles.sectionItems}>
            <label style={styles.label}>4. Detalle de Ítems, Moneda e IVA</label>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input style={{...styles.input, flex: 3}} placeholder="Producto" required value={item.producto} onChange={e => { const n = [...items]; n[index].producto = e.target.value; setItems(n); }} />
                <input style={{...styles.input, flex: 0.5}} type="number" placeholder="Cant" required value={item.cantidad} onChange={e => { const n = [...items]; n[index].cantidad = e.target.value; setItems(n); }} />
                <input style={{...styles.input, flex: 1}} type="number" step="0.01" placeholder="Precio" value={item.precio} onChange={e => { const n = [...items]; n[index].precio = e.target.value; setItems(n); }} />
                <select style={{...styles.input, flex: 0.8}} value={item.moneda} onChange={e => { const n = [...items]; n[index].moneda = e.target.value; setItems(n); }}>
                  <option value="PESOS">PESOS ($)</option>
                  <option value="USD">USD (U$D)</option>
                </select>
                <select style={{...styles.input, flex: 0.8}} value={item.iva} onChange={e => { const n = [...items]; n[index].iva = e.target.value; setItems(n); }}>
                  <option value="21%">IVA 21%</option>
                  <option value="10.5%">IVA 10.5%</option>
                  <option value="0%">IVA 0%</option>
                </select>
                <button type="button" onClick={() => eliminarFila(index)} style={styles.btnDeleteRow}><Trash2 size={16}/></button>
              </div>
            ))}
            <button type="button" onClick={() => setItems([...items, { producto: '', cantidad: 1, precio: '', moneda: 'PESOS', iva: '21%' }])} style={styles.btnAdd}><Plus size={16}/> Agregar Ítem</button>
          </div>
          <button type="submit" style={styles.btnSubmit}><Save size={20}/> GUARDAR Y GENERAR ORDEN PDF</button>
        </form>
      </div>

      <div style={{...styles.card, marginTop: '30px'}}>
        <h2 style={styles.header}><History size={28} /> Historial de Órdenes</h2>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#64748b'}}>
              <th style={{padding: '12px'}}>Nº ORDEN</th>
              <th style={{padding: '12px'}}>SOLICITUD</th>
              <th style={{padding: '12px'}}>FECHA</th>
              <th style={{padding: '12px'}}>PROVEEDOR</th>
              <th style={{padding: '12px'}}>GENERÓ</th>
              <th style={{padding: '12px', textAlign: 'right'}}>PDF</th>
              {isAdminPrincipal && <th style={{padding: '12px', textAlign: 'right'}}>OCULTAR</th>}
            </tr>
          </thead>
          <tbody>
            {historial.map((oc) => (
              <tr key={oc.id} style={{borderBottom: '1px solid #f1f5f9', fontSize: '14px'}}>
                <td style={{padding: '12px', fontWeight: 'bold'}}>OC-{String(oc.id).padStart(4, '0')}</td>
                <td style={{padding: '12px'}}>{oc.solicitudId ? <span style={{color: '#0369a1', fontWeight: '600'}}>SC-{oc.solicitudId}</span> : <span style={{color: '#94a3b8'}}>Directa</span>}</td>
                <td style={{padding: '12px'}}>{new Date(oc.createdAt || oc.fecha).toLocaleDateString()}</td>
                <td style={{padding: '12px'}}>{oc.proveedorNombre || oc.proveedor}</td>
                <td style={{padding: '12px'}}>{oc.creado_por_nombre || 'S/D'}</td>
                <td style={{padding: '12px', textAlign: 'right'}}>
                  <button onClick={() => exportarPDF(oc.items, oc)} style={styles.btnPdfIcon}><Download size={16}/></button>
                </td>
                {isAdminPrincipal && (
                  <td style={{padding: '12px', textAlign: 'right'}}>
                    {oc.oculto_para_admins ? (
                      <span style={{fontSize: '11px', color: '#94a3b8', fontWeight: '700'}}>Oculta</span>
                    ) : (
                      <button onClick={() => ocultarOrden(oc)} style={styles.btnHideIcon} title="Ocultar a otros admins"><EyeOff size={16}/></button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdenesCompra;
