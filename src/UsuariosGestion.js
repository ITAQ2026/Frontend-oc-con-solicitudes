import React, { useState, useEffect } from 'react';
import api from './api';
import { UserPlus, Shield, Mail, Trash2, Users, Lock } from 'lucide-react';

const UsuariosGestion = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', password: '', rol: 'user' });

  const cargarUsuarios = async () => {
    try {
      // ✅ Ruta sincronizada con el prefijo /api/
      const res = await api.get('/api/usuarios');
      setUsuarios(res.data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  useEffect(() => { 
    cargarUsuarios(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Ruta de registro sincronizada
      await api.post('/api/usuarios/registro', nuevo);
      
      alert("✅ Usuario creado con éxito");
      setNuevo({ nombre: '', email: '', password: '', rol: 'user' });
      cargarUsuarios();
    } catch (err) {
      console.error(err);
      alert("❌ Error al crear usuario. Es posible que el email ya esté registrado.");
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (id === '1' || nombre.toLowerCase() === 'admin') {
        return alert("No se puede eliminar al administrador principal.");
    }

    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await api.delete(`/api/usuarios/${id}`);
        cargarUsuarios();
      } catch (err) {
        alert("Error al eliminar el usuario");
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* CARD REGISTRO */}
      <div style={styles.card}>
        <div style={styles.header}>
            <UserPlus size={20} />
            <h3 style={{margin: 0}}>Crear Nuevo Usuario</h3>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input 
                style={styles.input} 
                placeholder="Ej: Juan Pérez" 
                value={nuevo.nombre} 
                onChange={e => setNuevo({...nuevo, nombre: e.target.value})} 
                required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input 
                style={styles.input} 
                type="email" 
                placeholder="email@alphaquimica.com" 
                value={nuevo.email} 
                onChange={e => setNuevo({...nuevo, email: e.target.value})} 
                required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input 
                style={styles.input} 
                type="password" 
                placeholder="••••••••" 
                value={nuevo.password} 
                onChange={e => setNuevo({...nuevo, password: e.target.value})} 
                required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Rol de Sistema</label>
            <select style={styles.input} value={nuevo.rol} onChange={e => setNuevo({...nuevo, rol: e.target.value})}>
                <option value="user">Usuario (Solicitante)</option>
                <option value="admin">Administrador (Gestión)</option>
            </select>
          </div>
          <button type="submit" style={styles.btnSave}>GUARDAR USUARIO EN SISTEMA</button>
        </form>
      </div>

      {/* CARD LISTA */}
      <div style={styles.card}>
        <div style={styles.header}>
            <Users size={20} />
            <h3 style={{margin: 0}}>Usuarios Existentes</h3>
        </div>
        <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
            <thead>
                <tr style={styles.trHeader}>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Acción</th>
                </tr>
            </thead>
            <tbody>
                {usuarios.map(u => (
                <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}><strong>{u.nombre}</strong></td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                        <span style={u.rol === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                            {u.rol === 'admin' ? <Shield size={10} /> : null} {u.rol.toUpperCase()}
                        </span>
                    </td>
                    <td style={styles.td}>
                        <button onClick={() => eliminarUsuario(u.id, u.nombre)} style={styles.btnDelete}>
                            <Trash2 size={16} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' },
  card: { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '30px' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
  btnSave: { gridColumn: 'span 2', background: '#0f172a', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  trHeader: { borderBottom: '2px solid #f1f5f9', textAlign: 'left' },
  tr: { borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' },
  th: { padding: '12px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '12px', fontSize: '14px', color: '#334155' },
  badgeAdmin: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  badgeUser: { background: '#e0f2fe', color: '#075985', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  btnDelete: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }
};

export default UsuariosGestion;