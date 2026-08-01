import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import MockLocation, { type MockConfigStatus } from './services/MockLocation';
import { ConfigCheckModal } from './components/ConfigCheckModal';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const App: React.FC = () => {
  const [position, setPosition] = useState<[number, number]>([40.416775, -3.70379]);
  const [isMocking, setIsMocking] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [configStatus, setConfigStatus] = useState<MockConfigStatus | null>(null);

  const checkSystemConfig = async () => {
    try {
      const status = await MockLocation.checkConfig();
      setConfigStatus(status);
    } catch (e) {
      console.warn('Ejecutando en entorno Web o Plugin no registrado aún:', e);
    }
  };

  useEffect(() => {
    checkSystemConfig();
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert('Ubicación no encontrada');
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
    }
  };

  const toggleMocking = async () => {
    try {
      if (isMocking) {
        await MockLocation.stopMocking();
        setIsMocking(false);
      } else {
        await MockLocation.startMocking({
          lat: position[0],
          lng: position[1],
        });
        setIsMocking(true);
      }
    } catch (e) {
      console.error('Error al comunicarse con el plugin nativo:', e);
      alert('Error iniciando la simulación de GPS.');
    }
  };

  return (
    <div style={styles.container}>
      <ConfigCheckModal config={configStatus} onRecheck={checkSystemConfig} />

      <MapContainer
        center={position}
        zoom={13}
        style={{ width: '100%', height: '100vh', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon} />
        <MapEvents />
      </MapContainer>

      <div style={styles.glassPanel}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar ciudad, calle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.btnSearch}>
            🔍
          </button>
        </form>

        <div style={styles.coordsBox}>
          <div><strong>Lat:</strong> {position[0].toFixed(6)}</div>
          <div><strong>Lng:</strong> {position[1].toFixed(6)}</div>
        </div>

        <button
          onClick={toggleMocking}
          style={{
            ...styles.btnAction,
            backgroundColor: isMocking ? '#ef4444' : '#10b981',
          }}
        >
          {isMocking ? '🛑 Detener Simulación' : '🚀 Iniciar Simulación'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  glassPanel: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '400px',
    padding: '16px',
    background: 'rgba(20, 20, 30, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    outline: 'none',
    fontSize: '0.9rem',
  },
  btnSearch: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    cursor: 'pointer',
  },
  coordsBox: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  btnAction: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default App;