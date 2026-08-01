import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Corrección de icono por defecto de Leaflet ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;


// --- Definición del Plugin Nativo (MOCK para que no de error al compilar en web) ---
// En producción, Capacitor cargará el plugin real de Android.
const MockLocationPlugin = (window as any).Capacitor?.Plugins?.MockLocation || {
  startMocking: async (coords: any) => console.log('Mock Nativo simulado en WEB:', coords),
  stopMocking: async () => console.log('Mock Nativo detenido en WEB'),
};

interface LatLng {
  lat: number;
  lng: number;
}

// --- Estilos CSS en JS para Glassmorphism ---
const styles = {
  appContainer: {
    height: '100vh',
    width: '100vw',
    position: 'relative' as 'relative',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
  // Contenedor flotante superior (Buscador)
  glassPanelTop: {
    position: 'absolute' as 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1000,
    
    // Glassmorphism core
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // Soporte iOS
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    
    padding: '15px',
  },
  // Contenedor flotante inferior (Estado y Botón)
  glassPanelBottom: {
    position: 'absolute' as 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1000,
    
    background: 'rgba(20, 20, 20, 0.6)', // Variación oscura
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    
    padding: '20px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '15px',
    alignItems: 'center',
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    outline: 'none',
    color: '#333',
  },
  searchButton: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#4a90e2', // Azul moderno
    color: 'white',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.2s',
  },
  coordsTag: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  actionButton: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    fontWeight: 'bold' as 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
};


export default function App() {
  // Madrid por defecto
  const [position, setPosition] = useState<LatLng>({ lat: 40.416775, lng: -3.703790 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMocking, setIsMocking] = useState(false);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  // Componente interno para manejar eventos del mapa
  function MapEvents() {
    useMapEvents({
      click(e) {
        if (!isMocking) { // No permitir cambiar marcador si está activada la simulación
          setPosition(e.latlng);
        }
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  // Buscador de lugares mediante Nominatim API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setPosition(newPos);
        // Centrar mapa suavemente
        mapRef?.flyTo(newPos, 14);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  const toggleMockLocation = async () => {
    try {
      if (!isMocking) {
        // --- INVOCACIÓN AL PLUGIN NATIVO DE CAPACITOR ---
        await MockLocationPlugin.startMocking({ lat: position.lat, lng: position.lng });
        setIsMocking(true);
      } else {
        // --- DETENER PLUGIN NATIVO ---
        await MockLocationPlugin.stopMocking();
        setIsMocking(false);
      }
    } catch (error) {
      console.error("Error controlando el plugin nativo:", error);
      alert("Error al comunicarse con el sistema nativo. Revisa los permisos.");
    }
  };

  // Colores dinámicos para el botón de acción
  const getActionButtonStyle = () => {
    const base = styles.actionButton;
    if (isMocking) {
      return { ...base, background: '#ea4335' }; // Rojo Google
    }
    return { ...base, background: '#34a853' }; // Verde Google
  };

  return (
    <div style={styles.appContainer}>
      
      {/* 1. Panel Superior (Buscador) - Glassmorphism Claro */}
      <div style={styles.glassPanelTop}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad, calle..."
            style={styles.input}
            disabled={isMocking}
          />
          <button type="submit" style={styles.searchButton} disabled={isMocking}>
            🔍
          </button>
        </form>
      </div>

      {/* 2. Mapa Full Screen */}
      <MapContainer 
        center={position} 
        zoom={13} 
        style={styles.map} 
        zoomControl={false} // Desactivamos por defecto para moverlo
        ref={setMapRef}
      >
        <TileLayer 
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        <ZoomControl position="topright" /> {/* Movemos zoom para no estorbar */}
        <MapEvents />
      </MapContainer>

      {/* 3. Panel Inferior (Estado y Control) - Glassmorphism Oscuro */}
      <div style={styles.glassPanelBottom}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '14px', opacity: 0.8, marginBottom: '5px'}}>
            Ubicación seleccionada:
          </div>
          <div style={styles.coordsTag}>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        </div>
        
        <button 
          onClick={toggleMockLocation}
          style={getActionButtonStyle()}
        >
          {isMocking ? '🛑 Detener Simulación' : '📍 Iniciar Ubicación Falsa'}
        </button>
        
        {isMocking && (
          <div style={{fontSize: '12px', color: '#fab005', fontWeight: 'bold', animation: 'pulse 1.5s infinite'}}>
            ⚠️ GPS DEL SISTEMA FALSEADO
          </div>
        )}
      </div>

      {/* CSS para la animación de pulso (puedes ponerlo en index.css) */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        button:active {
          transform: scale(0.98);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}