import React from 'react';
import MockLocation, { type MockConfigStatus } from '../services/MockLocation';

interface Props {
  config: MockConfigStatus | null;
  onRecheck: () => void;
}

export const ConfigCheckModal: React.FC<Props> = ({ config, onRecheck }) => {
  if (!config) return null;

  const hasError =
    !config.hasLocationPermission ||
    !config.isGpsEnabled ||
    !config.isMockAppSelected ||
    !config.hasNotificationPermission;

  if (!hasError) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>⚠️ Requisitos Faltantes</h2>
        <p>
          Para poder simular la ubicación del GPS, debes solucionar los elementos marcados con ❌:
        </p>

        <ul style={styles.list}>
          {/* 1. Permiso de ubicación app */}
          <li style={styles.item}>
            <div>
              {config.hasLocationPermission ? '✅ ' : '❌ '}
              Permiso de Ubicación en App
            </div>
          </li>

          {/* 2. GPS del teléfono */}
          <li style={styles.item}>
            <div>
              {config.isGpsEnabled ? '✅ ' : '❌ '}
              GPS / Ubicación Encendida
            </div>
            {!config.isGpsEnabled && (
              <button
                onClick={() => MockLocation.openLocationSettings()}
                style={styles.btnSmall}
              >
                Activar GPS
              </button>
            )}
          </li>

          {/* 3. Elegida en Desarrollo */}
          <li style={styles.item}>
            <div>
              {config.isMockAppSelected ? '✅ ' : '❌ '}
              Elegida en 'Ubicación Falsa'
            </div>
            {!config.isMockAppSelected && (
              <button
                onClick={() => MockLocation.openDeveloperSettings()}
                style={styles.btnSmall}
              >
                Ir a Desarrollo
              </button>
            )}
          </li>

          {/* 4. Notificaciones */}
          {!config.hasNotificationPermission && (
            <li style={styles.item}>
              <div>❌ Permiso de Notificaciones (Requerido)</div>
            </li>
          )}
        </ul>

        <button onClick={onRecheck} style={styles.btnPrimary}>
          🔄 Recomprobar Estado
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: 'rgba(30, 30, 40, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    color: '#fff',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  list: { listStyle: 'none', padding: 0, margin: '20px 0' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '10px 0',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '0.88rem',
  },
  btnSmall: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    whiteSpace: 'nowrap',
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