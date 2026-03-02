import React, { useState, useEffect } from 'react';
import api from './api'; 
import { Send, Clock, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';

const SolicitudCompra = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    area: '',
    solicitante: user?.nombre || '',
    descripcion: '',
    cantidad: 1,
    justificacion: '',
    fecha_limite: '',
    urgencia: 'Conveniente',
    link_referencia: ''
  });

  // 1. CARGAR DATOS (Corregido con /api/)
  const cargarSolicitudes = async () => {
    if (!user?.id) return; // Protección si el usuario no ha cargado
    try {
      // Ajuste de ruta: Ahora todas llevan /api al inicio
      const res = await api.get(`/api/solicitudes?rol=${user.rol}&usuario_id=${user.id}`);
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  useEffect(() => {
    if (user) cargarSolicitudes();
  }, [user]);

  // 2. CREAR SOLICITUD (Corregido con /api/)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ajuste de ruta: /api/solicitudes
      await api.post('/api/solicitudes', { 
        ...nuevaSolicitud, 
        usuario_id: user.id 
      });
      
      alert("✅ Solicitud enviada con éxito");
      
      // Limpiar solo los campos de texto, mantener área y urgencia por comodidad
      setNuevaSolicitud({ 
        ...nuevaSolicitud, 
        descripcion: '', 
        cantidad: 1, 
        justificacion: '',
        link_referencia: '' 
      });
      
      cargarSolicitudes();
    } catch (err) {
      console.error("Error al enviar:", err);
      alert("❌ Error al enviar solicitud. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  // 3. CAMBIAR ESTADO (Corregido con /api/)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      // Ajuste de ruta: /api/solicitudes/:id/estado
      await api.patch(`/api/solicitudes/${id}/estado`, { estado: nuevoEstado });
      cargarSolicitudes();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado");
    }
  };

  // Si no hay usuario, mostrar un aviso simple
  if (!user) return <div style={{padding: '20px'}}>Cargando sesión de usuario...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}><FileText /> Gestión de Solicitudes de Compra</h2>

      {/* FORMULARIO: Solo se muestra a usuarios comunes */}
      {user.rol === 'user' && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Nueva Solicitud</h3>
          <form onSubmit={handleSubmit} style={styles.gridForm}>
            <input style={styles.input} placeholder="Área" required value={nuevaSolicitud.area} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, area: e.target.value})} />
            <input style={styles.input} type="number" placeholder="Cantidad" required value={nuevaSolicitud.cantidad} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, cantidad: e.target.value})} />
            
            <select style={styles.input} value={nuevaSolicitud.urgencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, urgencia: e.target.value})}>
              <option value="Conveniente">Conveniente</option>
              <option value="Necesario">Necesario</option>
              <option value="Crítico">Crítico</option>
            </select>
            
            <input style={styles.input} type="date" required value={nuevaSolicitud.fecha_limite} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, fecha_limite: e.target.value})} />
            
            <textarea style={{...styles.input, gridColumn: 'span 2'}} placeholder="Descripción detallada del bien o servicio" required value={nuevaSolicitud.descripcion} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, descripcion: e.target.value})} />
            <textarea style={{...styles.input, gridColumn: 'span 2'}} placeholder="Justificación de la necesidad" required value={nuevaSolicitud.justificacion} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, justificacion: e.target.value})} />
            
            <input style={{...styles.input, gridColumn: 'span 2'}} placeholder="Link de referencia / Foto (Opcional)" value={nuevaSolicitud.link_referencia} onChange={(e) => setNuevaSolicitud({...nuevaSolicitud, link_referencia: e.target.value})} />
            
            <button type="submit" disabled={loading} style={styles.btnSubmit}>
              {loading ? "Enviando..." : "Enviar Solicitud"} <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* LISTADO DE SOLICITUDES */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>{user.rol === 'admin' ? "Todas las Solicitudes Recibidas" : "Mis Solicitudes Enviadas"}</h3>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th>Fecha</th>
                <th>Área</th>
                <th>Descripción</th>
                <th>Urgencia</th>
                <th>Estado</th>
                {user.rol === 'admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'#64748b'}}>No hay solicitudes registradas.</td></tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id} style={styles.trBody}>
                    <td>{new Date(s.fecha_creacion).toLocaleDateString()}</td>
                    <td>{s.area}</td>
                    <td>{s.descripcion}</td>
                    <td>
                      <span style={styles.badgeUrgencia(s.urgencia)}>{s.urgencia}</span>
                    </td>
                    <td>
                      <span style={styles.badgeEstado(s.estado)}>{s.estado}</span>
                    </td>
                    {user.rol === 'admin' && (
                      <td style={styles.actions}>
                        <button onClick={() => cambiarEstado(s.id, 'Aceptada')} style={styles.btnApprove} title="Aceptar"><CheckCircle size={18}/></button>
                        <button onClick={() => cambiarEstado(s.id, 'Cancelada')} style={styles.btnReject} title="Cancelar"><XCircle size={18}/></button>
                      </td>
                    )}
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
  container: { padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' },
  title: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '25px' },
  card: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#334155', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  gridForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  btnSubmit: { gridColumn: 'span 2', background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  trHead: { textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' },
  trBody: { borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontSize: '14px' },
  badgeUrgencia: (u) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    background: u === 'Crítico' ? '#fee2e2' : u === 'Necesario' ? '#fef3c7' : '#f1f5f9',
    color: u === 'Crítico' ? '#991b1b' : u === 'Necesario' ? '#92400e' : '#475569',
    textTransform: 'uppercase'
  }),
  badgeEstado: (e) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    background: e === 'Aceptada' ? '#dcfce7' : e === 'Cancelada' ? '#fee2e2' : '#e0f2fe',
    color: e === 'Aceptada' ? '#166534' : e === 'Cancelada' ? '#991b1b' : '#075985',
    textTransform: 'uppercase'
  }),
  actions: { display: 'flex', gap: '10px', padding: '10px 0' },
  btnApprove: { background: 'none', border: 'none', color: '#166534', cursor: 'pointer', transition: 'transform 0.2s' },
  btnReject: { background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', transition: 'transform 0.2s' }
};

export default SolicitudCompra;