import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Send, Clock, CheckCircle, XCircle, FileText, Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';

const SolicitudCompra = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado inicial para las líneas de productos
  const [items, setItems] = useState([{ producto: '', cantidad: 1 }]);
  
  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    area: '',
    solicitante: user?.nombre || '',
    justificacion: '',
    urgencia: 'Conveniente',
    link_referencia: ''
  });

  const cargarSolicitudes = async () => {
    if (!user?.id) return;
    try {
      // Ajustado a la lógica de tu API para filtrar por rol/usuario
      const res = await api.get(`/api/solicitudes?rol=${user.rol}&usuario_id=${user.id}`);
      setSolicitudes(res.data || []);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  useEffect(() => {
    if (user) cargarSolicitudes();
  }, [user]);

  // --- MANEJO DE ÍTEMS ---
  const agregarFila = () => setItems([...items, { producto: '', cantidad: 1 }]);
  
  const eliminarFila = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;
    setItems(nuevosItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(it => !it.producto.trim())) return alert("Complete los nombres de productos");

    setLoading(true);
    try {
      const payload = { 
        ...nuevaSolicitud, 
        items: JSON.stringify(items), 
        estado: 'En Revisión',
        usuario_id: user.id 
      };

      await api.post('/api/solicitudes', payload);
      
      alert("✅ Solicitud enviada al departamento de compras");
      setItems([{ producto: '', cantidad: 1 }]);
      setNuevaSolicitud({ ...nuevaSolicitud, justificacion: '', link_referencia: '' });
      cargarSolicitudes();
    } catch (err) {
      alert("❌ Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/api/solicitudes/${id}/estado`, { estado: nuevoEstado });
      cargarSolicitudes();
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  };

  if (!user) return (
    <div style={styles.loadingContainer}>
      <Clock className="animate-spin" /> Cargando sesión de usuario...
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}><FileText size={28} /> Gestión de Solicitudes de Compra</h2>
        <p style={styles.subtitle}>Circuito de aprobación de insumos y materiales</p>
      </div>

      {user.rol !== 'admin' && (
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <Plus size={20} />
            <h3 style={styles.sectionTitle}>Crear Nueva Requisición</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.gridForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Departamento / Área</label>
                <input style={styles.input} placeholder="Ej: Laboratorio / Logística" required value={nuevaSolicitud.area} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, area: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Prioridad</label>
                <select style={styles.input} value={nuevaSolicitud.urgencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, urgencia: e.target.value})}>
                  <option value="Conveniente">Conveniente (Stock)</option>
                  <option value="Necesario">Necesario (Operativo)</option>
                  <option value="Crítico">Crítico (Urgente)</option>
                </select>
              </div>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={styles.label}>Detalle de Insumos:</label>
              {items.map((item, index) => (
                <div key={index} style={styles.rowItem}>
                  <input style={{...styles.input, flex: 4}} placeholder="Nombre del producto o servicio" required value={item.producto} onChange={(e) => actualizarItem(index, 'producto', e.target.value)} />
                  <input style={{...styles.input, flex: 1}} type="number" min="1" placeholder="Cant." required value={item.cantidad} onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)} />
                  <button type="button" onClick={() => eliminarFila(index)} style={styles.btnDelete}><Trash2 size={18}/></button>
                </div>
              ))}
              <button type="button" onClick={agregarFila} style={styles.btnAdd}><Plus size={14}/> Añadir otra línea de producto</button>
            </div>

            <div style={{marginTop: '15px'}}>
              <label style={styles.label}>Justificación de la Compra</label>
              <textarea style={{...styles.input, width: '100%', minHeight: '80px'}} placeholder="Explique brevemente por qué se requiere este gasto..." required value={nuevaSolicitud.justificacion} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, justificacion: e.target.value})} />
            </div>

            <div style={{marginTop: '15px'}}>
              <label style={styles.label}>Enlace de Referencia / Web</label>
              <div style={{display:'flex', alignItems:'center', position:'relative'}}>
                <LinkIcon size={16} style={{position:'absolute', left:'12px', color:'#94a3b8'}} />
                <input style={{...styles.input, width: '100%', paddingLeft: '35px'}} placeholder="https://..." value={nuevaSolicitud.link_referencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, link_referencia: e.target.value})} />
              </div>
            </div>
            
            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? "Procesando..." : "ENVIAR SOLICITUD A COMPRAS"} <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* --- LISTADO --- */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <Clock size={20} />
          <h3 style={styles.sectionTitle}>{user.rol === 'admin' ? "Panel de Autorizaciones" : "Estado de mis Requerimientos"}</h3>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Origen / Usuario</th>
                <th style={styles.th}>Ítems</th>
                <th style={styles.th}>Prioridad</th>
                <th style={styles.th}>Estado</th>
                {user.rol === 'admin' && <th style={{...styles.th, textAlign: 'center'}}>Resolución</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.length > 0 ? solicitudes.map((s) => (
                <tr key={s.id} style={styles.trBody}>
                  <td style={styles.td}>{new Date(s.fecha_creacion).toLocaleDateString()}</td>
                  <td style={styles.td}>
                     <div style={{fontWeight:'700', color: '#1e293b'}}>{s.area}</div>
                     <div style={{fontSize:'12px', color:'#64748b'}}>{s.solicitante}</div>
                  </td>
                  <td style={styles.td}>
                    {(() => {
                      try {
                        const itemsParsed = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
                        return itemsParsed?.map((it, i) => (
                          <div key={i} style={{fontSize:'13px', marginBottom:'2px'}}>• {it.producto} <span style={{color:'#64748b'}}>(x{it.cantidad})</span></div>
                        ));
                      } catch (e) { return <span style={{fontSize:'12px'}}>{s.justificacion}</span>; }
                    })()}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.urgenciaLabel(s.urgencia)}>{s.urgencia}</span>
                  </td>
                  <td style={styles.td}><span style={styles.badgeEstado(s.estado)}>{s.estado}</span></td>
                  {user.rol === 'admin' && (
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.actions}>
                        <button onClick={() => cambiarEstado(s.id, 'Aprobado')} style={styles.btnApprove} title="Aprobar"><CheckCircle size={22}/></button>
                        <button onClick={() => cambiarEstado(s.id, 'Rechazado')} style={styles.btnReject} title="Rechazar"><XCircle size={22}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan="6" style={styles.empty}>No hay solicitudes pendientes de revisión.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS MEJORADOS ---
const styles = {
  container: { padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { marginBottom: '25px', borderLeft: '5px solid #0f172a', paddingLeft: '20px' },
  title: { display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', margin: 0, fontWeight: '800' },
  subtitle: { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f1f5f9' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#334155' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
  gridForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outlineColor: '#0f172a', boxSizing: 'border-box' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' },
  rowItem: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
  btnDelete: { background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  btnAdd: { background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '12px', width: '100%', cursor: 'pointer', borderRadius: '10px', color: '#64748b', fontWeight: '600', fontSize: '13px' },
  btnSubmit: { width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #f1f5f9', fontWeight: '700' },
  td: { padding: '15px', fontSize: '14px', borderBottom: '1px solid #f8fafc' },
  trBody: { transition: '0.2s', ':hover': { background: '#f8fafc' } },
  badgeEstado: (e) => ({
    padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    background: e === 'Aprobado' ? '#dcfce7' : e === 'Rechazado' ? '#fee2e2' : '#fef3c7',
    color: e === 'Aprobado' ? '#166534' : e === 'Rechazado' ? '#991b1b' : '#92400e',
  }),
  urgenciaLabel: (u) => ({
    fontSize: '11px', fontWeight: '600', color: u === 'Crítico' ? '#e11d48' : '#64748b'
  }),
  actions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  btnApprove: { background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', transition: '0.2s' },
  btnReject: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', transition: '0.2s' },
  empty: { textAlign: 'center', padding: '50px', color: '#94a3b8' },
  loadingContainer: { padding: '100px', textAlign: 'center', display: 'flex', flexDirection:'column', alignItems: 'center', gap: '10px', color: '#64748b' }
};

export default SolicitudCompra;