import React, { useState } from 'react';
import api from './api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Normalizamos el email antes de enviar
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Llamada al endpoint de NestJS
      const res = await api.post('/usuarios/login', { 
        email: normalizedEmail, 
        password 
      });
      
      if (res.data) {
        // Preparamos el objeto de usuario con los datos del backend
        const userToSave = {
          ...res.data,
          email: res.data.email || normalizedEmail
        };
        
        // 1. Guardamos el token si el backend lo genera (JWT)
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }

        // 2. Guardamos el objeto usuario para que el interceptor de api.js 
        // pueda extraer el user.id para las auditorías (adminId)
        localStorage.setItem('user', JSON.stringify(userToSave));
        
        // 3. Notificamos al componente App.js
        onLogin(userToSave);
      }
    } catch (err) {
      // Usamos el mensaje procesado por nuestro interceptor en api.js
      const errorMessage = err.message || "Error al iniciar sesión";
      
      if (err.response?.status === 401) {
        alert("❌ Credenciales incorrectas");
      } else {
        alert(`⚠️ ${errorMessage}`);
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.logoContainer}>
          <span style={{ fontSize: '40px' }}>🛡️</span>
          <h2 style={styles.title}>Alpha Química</h2>
          <p style={styles.subtitle}>Gestión de Compras e Inventario</p>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Correo Electrónico</label>
          <input 
            style={styles.input} 
            type="email" 
            placeholder="ejemplo@alphaquimica.com.ar" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Contraseña</label>
          <input 
            style={styles.input} 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.button,
            backgroundColor: loading ? '#94a3b8' : '#2563eb',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Validando...' : 'Iniciar Sesión'}
        </button>
        
        <p style={styles.footerText}>Sistema de Uso Interno</p>
      </form>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: '#0f172a' 
  },
  form: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
    width: '100%',
    maxWidth: '400px' 
  },
  logoContainer: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '10px 0 5px 0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '5px', textTransform: 'uppercase' },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: { 
    width: '100%', 
    padding: '14px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.2s',
    marginTop: '10px'
  },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }
};

export default Login;