import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, useAuth, useClerk, useUser } from '@clerk/clerk-react';
import api from './api';

const clerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const Login = ({ onLogin }) => {
  if (!clerkKey) {
    return <MissingClerkConfig />;
  }

  return <ClerkLogin onLogin={onLogin} />;
};

const ClerkLogin = ({ onLogin }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validarUsuario = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      setLoading(true);
      setError('');
      try {
        const clerkToken = await getToken();
        const res = await api.post('/api/usuarios/clerk-login', { token: clerkToken });
        const { token, user: usuarioBackend } = res.data;

        localStorage.setItem('user', JSON.stringify(usuarioBackend));
        localStorage.setItem('token', token);
        onLogin(usuarioBackend);
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setError(err.message || 'Este email no esta autorizado.');
        await signOut();
      } finally {
        setLoading(false);
      }
    };

    validarUsuario();
  }, [isLoaded, isSignedIn, user, onLogin, signOut, getToken]);

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>AQ</span>
          <h2 style={styles.title}>Alpha Quimica</h2>
          <p style={styles.subtitle}>Gestion de Compras e Inventario</p>
        </div>

        {loading ? (
          <div style={styles.statusBox}>Validando usuario autorizado...</div>
        ) : (
          <>
            <SignInButton mode="modal">
              <button style={styles.button}>Ingresar con Clerk</button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button style={styles.secondaryButton}>Crear acceso con email autorizado</button>
            </SignUpButton>
          </>
        )}

        {error && <p style={styles.errorText}>{error}</p>}
        <p style={styles.footerText}>Solo emails cargados en Usuarios pueden ingresar.</p>
      </div>
    </div>
  );
};

const MissingClerkConfig = () => (
  <div style={styles.container}>
    <div style={styles.form}>
      <h2 style={styles.title}>Falta configurar Clerk</h2>
      <p style={styles.subtitle}>Agrega REACT_APP_CLERK_PUBLISHABLE_KEY en las variables del frontend.</p>
    </div>
  </div>
);

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f172a',
  },
  form: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '420px',
  },
  logoContainer: { textAlign: 'center', marginBottom: '30px' },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: '#0f172a',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  title: { margin: '12px 0 5px 0', color: '#1e293b', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0, lineHeight: 1.5 },
  button: {
    width: '100%',
    padding: '14px',
    color: 'white',
    background: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  secondaryButton: {
    width: '100%',
    padding: '12px',
    color: '#1e293b',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
  },
  statusBox: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'center',
    fontWeight: '700',
  },
  errorText: { color: '#b91c1c', fontSize: '13px', marginTop: '14px', textAlign: 'center' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' },
};

export default Login;
