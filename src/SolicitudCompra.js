import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Send, Clock, CheckCircle, XCircle, FileText, Plus, Trash2, Link as LinkIcon, DollarSign, Building2, Search } from 'lucide-react';

const SolicitudCompra = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroArea, setFiltroArea] = useState(''); 
  
  const [items, setItems] = useState([{ producto: '', cantidad: 1 }]);
  
  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    area: '',
    solicitante: user?.nombre || '',
    justificacion: '',
    urgencia: 'MEDIA',
    monto_estimado: 'Hasta 200.000',
    link_referencia: ''
  });

  const departamentos = [
    "Calidad", "I+D", "Comercial", "Proyectos", "Mantenimiento", 
    "Recursos Humanos", "Logistica", "Produccion", "Administracion", 
    "Expedición", "Informática", "Brigada de emergencia", "Gestión interna"
  ];

  const cargarSolicitudes = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/api/solicitudes?rol=${user.rol}&usuario_id=${user.id}`);
      setSolicitudes(res.data || []);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  useEffect(() => {
    if (user) cargarSolicitudes();
  }, [user]);

  const solicitudesFiltradas = solicitudes.filter(s => 
    s.area.toLowerCase().includes(filtroArea.toLowerCase())
  );

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
    if (!nuevaSolicitud.area) return alert("Por favor, seleccione un Departamento / Área");
    
    setLoading(true);
    try {
      const payload = { 
        ...nuevaSolicitud, 
        items: JSON.stringify(items), 
        estado: 'En Revisión',
        usuario_id: user.id 
      };
      await api.post('/api/solicitudes', payload);
      alert("✅ Solicitud enviada correctamente");
      setItems([{ producto: '', cantidad: 1 }]);
      setNuevaSolicitud({ ...nuevaSolicitud, area: '', justificacion: '', link_referencia: '' });
      cargarSolicitudes();
    } catch (err) {
      alert("❌ Error al procesar");
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

  if (!user) return <div style={styles.loadingContainer}><Clock className="animate-spin" /> Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}><FileText size={28} /> Gestión de Solicitudes de Compra</h2>
      </div>

      {user.rol !== 'admin' && (
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <Plus size={20} />
            <h3 style={styles.sectionTitle}>Crear Nueva Solicitud</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.gridForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Departamento / Área</label>
                <div style={{position:'relative', display:'flex', alignItems:'center'}}>
                  <Building2 size={16} style={{position:'absolute', left:'12px', color:'#94a3b8'}} />
                  <select 
                    style={{...styles.input, width: '100%', paddingLeft: '35px'}} 
                    required 
                    value={nuevaSolicitud.area} 
                    onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, area: e.target.value})}
                  >
                    <option value="">Seleccione un área...</option>
                    {departamentos.sort().map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Prioridad</label>
                <select style={styles.input} value={nuevaSolicitud.urgencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, urgencia: e.target.value})}>
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Monto Estimado</label>
                <select style={{...styles.input, backgroundColor: '#f0f9ff'}} value={nuevaSolicitud.monto_estimado} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, monto_estimado: e.target.value})}>
                  <option value="Hasta 200.000">Hasta $200.000</option>
                  <option value="Hasta 1.000.000">Hasta $1.000.000</option>
                  <option value="Mas de 1.000.000">Más de $1.000.000</option>
                </select>
              </div>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={styles.label}>Detalle de Insumos:</label>
              {items.map((item, index) => (
                <div key={index} style={styles.rowItem}>
                  <input style={{...styles.input, flex: 4}} placeholder="Producto" required value={item.producto} onChange={(e) => actualizarItem(index, 'producto', e.target.value)} />
                  <input style={{...styles.input, flex: 1}} type="number" min="1" required value={item.cantidad} onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)} />
                  <button type="button" onClick={() => eliminarFila(index)} style={styles.btnDelete}><Trash2 size={18}/></button>
                </div>
              ))}
              <button type="button" onClick={agregarFila} style={styles.btnAdd}><Plus size={14}/> Añadir línea</button>
            </div>

            <div style={{marginTop: '15px'}}>
                <label style={styles.label}>Justificación</label>
                <textarea style={{...styles.input, width: '100%', minHeight: '60px'}} required value={nuevaSolicitud.justificacion} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, justificacion: e.target.value})} />
            </div>
            
            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? "Enviando..." : "ENVIAR SOLICITUD"} <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px'}}>
          <div style={styles.sectionHeader}>
            <Clock size={20} />
            <h3 style={styles.sectionTitle}>{user.rol === 'admin' ? "Panel de Autorizaciones" : "Mis Requerimientos"}</h3>
          </div>

          {user.rol === 'admin' && (
            <div style={styles.searchContainer}>
              <Search size={18} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Filtrar por Área..." 
                style={styles.searchInput}
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Origen / Usuario</th>
                <th style={styles.th}>Ítems</th>
                <th style={styles.th}>Monto Estimado</th>
                <th style={styles.th}>Prioridad</th>
                <th style={styles.th}>Estado</th>
                {user.rol === 'admin' && <th style={{...styles.th, textAlign: 'center'}}>Resolución</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map((s) => (
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
                          <div key={i} style={{fontSize:'12px'}}>• {it.producto} (x{it.cantidad})</div>
                        ));
                      } catch (e) { return <span>{s.justificacion}</span>; }
                    })()}
                  </td>
                  <td style={styles.td}>
                    <DollarSign size={12} style={{display:'inline'}}/> {s.monto_estimado}
                  </td>
                  <td style={styles.td}><span style={styles.urgenciaLabel(s.urgencia)}>{s.urgencia}</span></td>
                  <td style={styles.td}><span style={styles.badgeEstado(s.estado)}>{s.estado}</span></td>
                  {user.rol === 'admin' && (
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.actions}>
                        <button onClick={() => cambiarEstado(s.id, 'Aprobado')} style={styles.btnApprove}><CheckCircle size={22}/></button>
                        <button onClick={() => cambiarEstado(s.id, 'Rechazado')} style={styles.btnReject}><XCircle size={22}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan="7" style={styles.empty}>No se encontraron solicitudes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
  header: { marginBottom: '20px', borderLeft: '5px solid #0f172a', paddingLeft: '15px' },
  title: { color: '#0f172a', margin: 0, fontWeight: '800' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', margin: 0, textTransform: 'uppercase' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569' },
  rowItem: { display: 'flex', gap: '8px', marginBottom: '8px' },
  btnDelete: { background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '8px' },
  btnAdd: { background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px', width: '100%', borderRadius: '8px', cursor: 'pointer' },
  btnSubmit: { width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' },
  searchContainer: { position: 'relative', flex: '1', maxWidth: '400px', minWidth: '250px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 15px 10px 40px', borderRadius: '10px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#64748b', borderBottom: '2px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '13px', borderBottom: '1px solid #f8fafc' },
  badgeEstado: (e) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', background: e === 'Aprobado' ? '#dcfce7' : e === 'Rechazado' ? '#fee2e2' : '#fef3c7', color: e === 'Aprobado' ? '#166534' : e === 'Rechazado' ? '#991b1b' : '#92400e' }),
  urgenciaLabel: (u) => ({ fontSize: '11px', fontWeight: '700', color: u === 'ALTA' ? '#dc2626' : '#64748b' }),
  actions: { display: 'flex', gap: '8px', justifyContent: 'center' },
  btnApprove: { background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer' },
  btnReject: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '30px', color: '#94a3b8' }
};

export default SolicitudCompra;