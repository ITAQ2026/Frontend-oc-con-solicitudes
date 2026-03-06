import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Send, Clock, CheckCircle, XCircle, FileText, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

const SolicitudCompra = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para las líneas de productos
  const [items, setItems] = useState([{ producto: '', cantidad: 1, precio: '' }]);
  
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
      const res = await api.get(`/api/solicitudes?rol=${user.rol}&usuario_id=${user.id}`);
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  useEffect(() => {
    if (user) cargarSolicitudes();
  }, [user]);

  // --- LÓGICA DE ÍTEMS DINÁMICOS ---
  const agregarFila = () => setItems([...items, { producto: '', cantidad: 1, precio: '' }]);
  
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
    setLoading(true);
    try {
      await api.post('/api/solicitudes', { 
        ...nuevaSolicitud, 
        items: JSON.stringify(items), // Enviamos los productos como JSON
        estado: 'En Revisión',
        usuario_id: user.id 
      });
      
      alert("✅ Solicitud enviada en revisión");
      setItems([{ producto: '', cantidad: 1, precio: '' }]);
      setNuevaSolicitud({ ...nuevaSolicitud, justificacion: '', link_referencia: '' });
      cargarSolicitudes();
    } catch (err) {
      alert("❌ Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/api/solicitudes/${id}/estado`, { estado: nuevoEstado });
      cargarSolicitudes();
    } catch (err) {
      alert("No se pudo cambiar el estado");
    }
  };

  if (!user) return <div style={{padding: '20px'}}>Cargando sesión...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}><FileText /> Gestión de Solicitudes</h2>

      {user.rol === 'user' && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Nueva Solicitud</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.gridForm}>
              <input style={styles.input} placeholder="Área" required value={nuevaSolicitud.area} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, area: e.target.value})} />
              <select style={styles.input} value={nuevaSolicitud.urgencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, urgencia: e.target.value})}>
                <option value="Conveniente">Conveniente</option>
                <option value="Necesario">Necesario</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={styles.label}>Productos Solicitados:</label>
              {items.map((item, index) => (
                <div key={index} style={styles.rowItem}>
                  <input style={{...styles.input, flex: 3}} placeholder="Producto / Descripción" required value={item.producto} onChange={(e) => actualizarItem(index, 'producto', e.target.value)} />
                  <input style={{...styles.input, flex: 1}} type="number" placeholder="Cant." required value={item.cantidad} onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)} />
                  <button type="button" onClick={() => eliminarFila(index)} style={styles.btnDelete}><Trash2 size={16}/></button>
                </div>
              ))}
              <button type="button" onClick={agregarFila} style={styles.btnAdd}><Plus size={14}/> Agregar otro producto</button>
            </div>

            <textarea style={{...styles.input, width: '100%', marginTop: '15px'}} placeholder="Justificación" required value={nuevaSolicitud.justificacion} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, justificacion: e.target.value})} />
            <input style={{...styles.input, width: '100%', marginTop: '10px'}} placeholder="Link de referencia (opcional)" value={nuevaSolicitud.link_referencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, link_referencia: e.target.value})} />
            
            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? "Enviando..." : "ENVIAR A REVISIÓN"} <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>{user.rol === 'admin' ? "Panel de Revisión" : "Mis Solicitudes"}</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th>Fecha</th>
              <th>Área / Solicitante</th>
              <th>Productos / Cantidad</th>
              <th>Link</th>
              <th>Estado</th>
              {user.rol === 'admin' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id} style={styles.trBody}>
                <td>{new Date(s.fecha_creacion).toLocaleDateString()}</td>
                <td>
                   <div style={{fontWeight:'bold'}}>{s.area}</div>
                   <div style={{fontSize:'12px', color:'#64748b'}}>{s.solicitante}</div>
                </td>
                <td>
                  {(() => {
                    try {
                      const itemsParsed = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
                      return itemsParsed?.map((it, i) => (
                        <div key={i} style={{fontSize:'13px'}}>• {it.producto} <strong>(x{it.cantidad})</strong></div>
                      ));
                    } catch (e) { return s.descripcion; }
                  })()}
                </td>
                <td>
                  {s.link_referencia && <a href={s.link_referencia} target="_blank" rel="noreferrer"><LinkIcon size={18} color="#2563eb"/></a>}
                </td>
                <td><span style={styles.badgeEstado(s.estado)}>{s.estado}</span></td>
                {user.rol === 'admin' && (
                  <td style={styles.actions}>
                    <button onClick={() => cambiarEstado(s.id, 'Aprobado')} style={styles.btnApprove}><CheckCircle size={20}/></button>
                    <button onClick={() => cambiarEstado(s.id, 'Rechazado')} style={styles.btnReject}><XCircle size={20}/></button>
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

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  title: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' },
  card: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  gridForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px', display: 'block' },
  rowItem: { display: 'flex', gap: '10px', marginBottom: '10px' },
  btnDelete: { background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' },
  btnAdd: { background: 'none', border: '1px dashed #cbd5e1', padding: '10px', width: '100%', cursor: 'pointer', borderRadius: '8px', color: '#64748b' },
  btnSubmit: { width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  trHead: { textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b' },
  trBody: { borderBottom: '1px solid #f1f5f9' },
  badgeEstado: (e) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    background: e === 'Aprobado' ? '#dcfce7' : e === 'Rechazado' ? '#fee2e2' : '#fef3c7',
    color: e === 'Aprobado' ? '#166534' : e === 'Rechazado' ? '#991b1b' : '#92400e',
  }),
  actions: { display: 'flex', gap: '15px' },
  btnApprove: { background: 'none', border: 'none', color: '#166534', cursor: 'pointer' },
  btnReject: { background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }
};

export default SolicitudCompra;