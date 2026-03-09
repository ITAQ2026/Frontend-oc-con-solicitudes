// src/styles.js
export const globalStyles = {
  container: { 
    padding: '15px 10px', 
    backgroundColor: '#f1f5f9', 
    minHeight: '100vh' 
  },
  card: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '20px', 
    maxWidth: '1000px', 
    margin: '0 auto', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
  },
  // FORMULARIO RESPONSIVO (La clave)
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '15px', 
    marginBottom: '30px' 
  },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '16px' // 16px evita el zoom molesto en iPhone
  },
  // TABLA CON SCROLL (Para que no rompa el celular)
  tableWrapper: { 
    overflowX: 'auto', 
    WebkitOverflowScrolling: 'touch',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  table: { 
    width: '100%', 
    minWidth: '700px', 
    borderCollapse: 'collapse' 
  }
};