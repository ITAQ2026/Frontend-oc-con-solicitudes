import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Shield, Mail, Trash2, Users, Lock, Key, Loader2 } from 'lucide-react';

const UsuariosGestion = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', password: '', rol: 'user' });
  const [cargando, setCargando] = useState(false);

  /**
   * Carga la lista de usuarios desde el Backend
   */
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      // CORRECCIÓN: Agregamos /api antes de /usuarios
      // Esto asume que tu backend tiene app.setGlobalPrefix('api');
      const res = await api.get('/api/usuarios');
      setUsuarios(res.data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      // Opcional: alert("❌ Error al conectar con el servidor para cargar usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { 
    cargarUsuarios(); 
  }, []);

  /**
   * Maneja el envío del formulario para crear un nuevo usuario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevo.password.length < 6) {
      return alert("⚠️ La contraseña debe tener al menos 6 caracteres por seguridad.");
    }

    try {
      // Mantenemos /api/usuarios/registro (que ya estaba bien)
      await api.post('/api/usuarios/registro', nuevo);
      alert("✅ Usuario creado y habilitado en el sistema");
      setNuevo({ nombre: '', email: '', password: '', rol: 'user' }); // Limpiamos formulario
      cargarUsuarios(); // Recargamos la lista
    } catch (err) {
      // Capturamos el mensaje de error que viene del backend (ej: "Email ya registrado")
      const errorMsg = err.response?.data?.message || "Error al crear usuario";
      alert(`❌ ${errorMsg}`);
    }
  };

  /**
   * Elimina (Soft Delete) un usuario
   * @param {number} id - ID numérico del usuario
   * @param {string} nombre - Nombre para mostrar en la confirmación
   */
  const eliminarUsuario = async (id, nombre) => {
    // PROTECCIÓN: Como vimos en tu pgAdmin, el admin inicial tiene el ID 1.
    // Esta línea asegura que el admin principal nunca sea eliminado por accidente.
    if (id === 1) {
      return alert("🛡️ Seguridad: El administrador del sistema principal no puede ser eliminado.");
    }

    if (window.confirm(`¿Está seguro de revocar el acceso a ${nombre}? Esta acción no se puede deshacer.`)) {
      try {
        // CORRECCIÓN: Usamos la ruta completa /api/usuarios/id
        await api.delete(`/api/usuarios/${id}`);
        cargarUsuarios(); // Recargamos para ver la lista actualizada
      } catch (err) {
        alert("No se pudo eliminar el usuario. Intente nuevamente.");
      }
    }
  };

  // --- RENDERIZADO DEL COMPONENTE Y ESTILOS ---
  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h2 style={styles.mainTitle}>Panel de Control de Accesos</h2>
        <p style={styles.mainSubtitle}>Gestione los permisos y credenciales del personal de Alpha Química</p>
      </div>

      <div style={styles.layoutGrid}>
        {/* FORMULARIO DE REGISTRO */}
        <div style={styles.card}>
          <div style={styles.header}>
            <UserPlus size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Nuevo Operador</h3>
          </div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}><Users size={12}/> Nombre Completo</label>
              <input 
                style={styles.input} 
                placeholder="Ej: Ing. Juan Pérez" 
                value={nuevo.nombre} 
                onChange={e => setNuevo({...nuevo, nombre: e.target.value})} 
                required 
              />
            </div>
            <div style={styles.inputGroupFull}>
              <label style={styles.label}><Mail size={12}/> Correo Corporativo</label>
              <input 
                style={styles.input} 
                type="email" 
                placeholder="usuario@alphaquimica.com" 
                value={nuevo.email} 
                onChange={e => setNuevo({...nuevo, email: e.target.value})} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><Key size={12}/> Contraseña</label>
              <input 
                style={styles.input} 
                type="password" 
                placeholder="Mín. 6 caracteres" 
                value={nuevo.password} 
                onChange={e => setNuevo({...nuevo, password: e.target.value})} 
                required 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><Shield size={12}/> Nivel de Acceso</label>
              <select style={styles.input} value={nuevo.rol} onChange={e => setNuevo({...nuevo, rol: e.target.value})}>
                <option value="user">USER (Básico)</option>
                <option value="admin">ADMIN (Total)</option>
              </select>
            </div>
            <button type="submit" style={styles.btnSave}>DAR DE ALTA EN SISTEMA</button>
          </form>
        </div>

        {/* LISTADO DE USUARIOS */}
        <div style={styles.card}>
          <div style={styles.header}>
            <Lock size={20} color="#64748b" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Cuentas Activas</h3>
          </div>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.th}>Identidad</th>
                  <th style={styles.th}>Permisos</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Gestión</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="3" style={styles.empty}><Loader2 className="animate-spin" /> Cargando...</td></tr>
                ) : usuarios.map(u => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '700' }}>{u.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.email}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={u.rol === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                        {u.rol === 'admin' ? <Shield size={10} /> : null} {u.rol.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button 
                        onClick={() => eliminarUsuario(u.id, u.nombre)} 
                        style={styles.btnDelete}
                        title="Revocar acceso"
                        disabled={u.id === 1} // Deshabilitamos botón para el admin principal
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!cargando && usuarios.length === 0 && (
                  <tr><td colSpan="3" style={styles.empty}>No hay otros usuarios registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- OBJETOS DE ESTILOS INLINE (Mantenemos tus estilos originales) ---
const styles = {
  container: { maxWidth: '1100px', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' },
  pageHeader: { marginBottom: '30px', borderLeft: '4px solid #3b82f6', paddingLeft: '20px' },
  mainTitle: { margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '800' },
  mainSubtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' },
  
  layoutGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
    gap: '25px',
    alignItems: 'start'
  },
  
  card: { 
    background: 'white', 
    padding: '25px', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
    border: '1px solid #f1f5f9',
    boxSizing: 'border-box',
    width: '100%',
    overflow: 'hidden' 
  },
  
  header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px' },
  
  form: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: '15px' 
  },
  
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputGroupFull: { display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' },
  
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' },
  
  input: { 
    padding: '10px 14px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    fontSize: '14px', 
    outline: 'none', 
    width: '100%', 
    boxSizing: 'border-box' 
  },
  
  btnSave: { 
    gridColumn: '1 / -1', 
    background: '#0f172a', 
    color: 'white', 
    padding: '14px', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    marginTop: '10px', 
    fontSize: '13px', 
    width: '100%' 
  },
  
  tableScroll: { 
    overflowX: 'auto', 
    width: '100%', 
    maxHeight: '450px', 
    overflowY: 'auto' 
  },
  
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '350px' },
  trHeader: { borderBottom: '2px solid #f1f5f9', textAlign: 'left' },
  tr: { borderBottom: '1px solid #f8fafc' },
  th: { padding: '12px', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' },
  td: { padding: '14px 12px', fontSize: '14px', color: '#334155' },
  
  badgeAdmin: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' },
  badgeUser: { display: 'inline-flex', alignItems: 'center', background: '#f0f9ff', color: '#075985', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' },
  btnDelete: { background: '#fff1f2', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  empty: { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px' }
};

export default UsuariosGestion;