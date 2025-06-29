import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useLocations } from '../hooks/useLocations'
import { useWeather } from '../hooks/useWeather'

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different location types
const createCustomIcon = (color, type) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
    ">
      ${getIconSymbol(type)}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const getIconSymbol = (type) => {
  const symbols = {
    home: '🏠',
    work: '🏢',
    school: '🏫',
    family: '👨‍👩‍👧‍👦',
    friend: '👥',
    hospital: '🏥',
    other: '📍'
  };
  return symbols[type] || symbols.other;
};

const getAlertEmoji = (type) => {
  const emojis = {
    tornado: '🌪️',
    thunderstorm: '⛈️',
    flood: '🌊',
    'winter-storm': '❄️',
    hurricane: '🌀',
    wildfire: '🔥'
  }
  return emojis[type] || '⚠️'
}

const MapView = ({ emergencyMode = false }) => {
  const { locations } = useLocations();
  const { alerts } = useWeather();
  const [center, setCenter] = useState([39.8283, -98.5795]); // US center
  const [zoom, setZoom] = useState(4);

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get alerts affecting a specific location
  const getLocationAlerts = (location) => {
    if (!alerts || alerts.length === 0) return []
    
    return alerts.filter(alert => {
      const distance = calculateDistance(
        location.lat, location.lng,
        alert.area.lat, alert.area.lng
      )
      return distance <= alert.area.radius
    })
  }

  // Get the most severe alert for a location
  const getMostSevereAlert = (locationAlerts) => {
    if (locationAlerts.length === 0) return null
    
    const severityOrder = { extreme: 4, severe: 3, moderate: 2, minor: 1 }
    return locationAlerts.reduce((most, current) => {
      return (severityOrder[current.severity] || 0) > (severityOrder[most.severity] || 0) ? current : most
    })
  }

  useEffect(() => {
    // Auto-center on locations if available
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      setCenter(bounds.getCenter());
      setZoom(8);
    }
  }, [locations]);

  return (
    <div className={`h-full w-full relative ${emergencyMode ? 'emergency-mode' : ''}`}>
      {/* Emergency Mode Overlay */}
      {emergencyMode && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-3 font-bold text-lg shadow-lg">
          🎯 FOCUS MODE - Enhanced Emergency View 🎯
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => {
          const locationAlerts = getLocationAlerts(location)
          const mostSevereAlert = getMostSevereAlert(locationAlerts)
          const hasAlerts = locationAlerts.length > 0
          
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location.riskLevel === 'high' ? '#ef4444' : 
                                     location.riskLevel === 'medium' ? '#f59e0b' : '#10b981', 
                                     location.type)}
            >
              {/* Hover Tooltip */}
              <Tooltip 
                direction="top" 
                offset={[0, -10]} 
                opacity={0.95}
                className="custom-tooltip"
                permanent={false}
              >
                <div className="p-2 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span>{getIconSymbol(location.type)}</span>
                    <span className="font-semibold text-sm">{location.name}</span>
                    {hasAlerts && mostSevereAlert && (
                      <span>{getAlertEmoji(mostSevereAlert.type)}</span>
                    )}
                  </div>
                  
                  {hasAlerts && mostSevereAlert ? (
                    <div>
                      <p className="text-red-600 font-medium text-xs">{mostSevereAlert.title}</p>
                      <p className="text-gray-600 text-xs">{mostSevereAlert.area.location}</p>
                      <p className="text-blue-600 text-xs mt-1">🖱️ Click for details</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-600 font-medium text-xs">✅ Safe</p>
                      <p className="text-gray-600 text-xs">No active alerts</p>
                    </div>
                  )}
                </div>
              </Tooltip>

              {/* Click Popup */}
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.type}</p>
                  <p className="text-sm mt-1">{location.address}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      location.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      location.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {location.riskLevel === 'high' ? 'High Risk' :
                       location.riskLevel === 'medium' ? 'Medium Risk' : 'Safe'}
                    </span>
                  </div>
                  
                  {/* Show all alerts in popup */}
                  {hasAlerts && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-semibold text-red-700">Active Alerts:</h4>
                      {locationAlerts.map((alert, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center space-x-2 mb-1">
                            <span>{getAlertEmoji(alert.type)}</span>
                            <span className="text-sm font-medium text-red-800">{alert.title}</span>
                          </div>
                          <p className="text-xs text-red-700">{alert.description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {alert.area.location} • {alert.area.radius}km radius
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Risk Level Legend */}
      <div 
        className={`absolute ${emergencyMode ? 'bottom-6 left-6' : 'bottom-4 left-4'} z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${emergencyMode ? 'border-2 border-blue-300' : ''}`} 
        style={{
          zIndex: 1000,
          position: 'absolute',
          pointerEvents: 'auto'
        }}
      >
        <h4 className={`text-sm font-semibold mb-2 ${emergencyMode ? 'text-blue-800' : 'text-gray-700'}`}>Risk Level</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-600">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-600">High Risk</span>
          </div>
        </div>
      </div>
      
      {/* Emergency Mode Border */}
      {emergencyMode && (
        <div className="absolute inset-0 pointer-events-none border-4 border-blue-600 shadow-lg shadow-blue-600/50"></div>
      )}
    </div>
  );
};

export default MapView; 