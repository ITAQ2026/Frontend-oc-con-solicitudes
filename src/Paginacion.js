import React from 'react';

const Paginacion = ({ paginaActual, totalItems, itemsPorPagina = 10, onPageChange }) => {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));

  if (totalItems <= itemsPorPagina) return null;

  const paginaSegura = Math.min(Math.max(paginaActual, 1), totalPaginas);
  const inicio = (paginaSegura - 1) * itemsPorPagina + 1;
  const fin = Math.min(paginaSegura * itemsPorPagina, totalItems);

  return (
    <div style={styles.container}>
      <span style={styles.summary}>
        Mostrando {inicio}-{fin} de {totalItems}
      </span>
      <div style={styles.controls}>
        <button
          type="button"
          onClick={() => onPageChange(paginaSegura - 1)}
          disabled={paginaSegura === 1}
          style={{ ...styles.button, ...(paginaSegura === 1 ? styles.disabled : {}) }}
        >
          Anterior
        </button>
        <span style={styles.page}>
          Pagina {paginaSegura} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(paginaSegura + 1)}
          disabled={paginaSegura === totalPaginas}
          style={{ ...styles.button, ...(paginaSegura === totalPaginas ? styles.disabled : {}) }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '14px',
    flexWrap: 'wrap',
    color: '#64748b',
    fontSize: '13px'
  },
  summary: { fontWeight: '600' },
  controls: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  button: {
    border: '1px solid #cbd5e1',
    background: 'white',
    color: '#0f172a',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '12px'
  },
  disabled: {
    opacity: 0.45,
    cursor: 'not-allowed'
  },
  page: {
    fontWeight: '700',
    color: '#334155',
    padding: '0 4px'
  }
};

export default Paginacion;
