import React from 'react';
import MockLocation, { type MockConfigStatus } from '../services/MockLocation';

interface Props {
  config: MockConfigStatus | null;
  onRecheck: () => void;
}

export const ConfigCheckModal: React.FC<Props> = ({ config, onRecheck }) => {
  if (!config) return null;

  const hasError = !config.isGpsEnabled || !config.isMockAppSelected;
  if (!hasError) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{"⚠️ Configuración Requerida"}</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Para que la simulación de ubicación funcione, debes corregir los siguientes puntos:
        </p>

        <ul style={styles.list}>
          <li style={styles.item}>
            <span>
              {config.isGpsEnabled ? '✅ ' : '❌ '}
              Ubicación / GPS activado
            </span>
            {!config.isGpsEnabled && (
              <button
                type="button"
                onClick={() => {
                  MockLocation.openLocationSettings();
                }}
                style={styles.btnSmall}
              >
                Activar GPS
              </button>
            )}
          </li>

          <li style={styles.item}>
            <span>
              {config.isMockAppSelected ? '✅ ' : '❌ '}
              App elegida para simular ubicación
            </span>
            {!config.isMockAppSelected && (
              <button
                type="button"
                onClick={() => {
                  MockLocation.openDeveloperSettings();
                }}
                style={styles.btnSmall}
              >
                Ajustes de Desarrollador
              </button>
            )}
          </li>
        </ul>

        <button
          type="button"
          onClick={onRecheck}
          style={styles.btnPrimary}
        >
          {"🔄 Volver a comprobar"}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: 'rgba(30, 30, 40, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    color: '#fff',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '20px 0',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '12px 0',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  btnSmall: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  btnPrimary: {
    width: '100%',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};