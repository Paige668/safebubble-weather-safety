import React, { useState, useEffect } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { LocationProvider } from './hooks/useLocations'
import { WeatherProvider } from './hooks/useWeather'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)

  return (
    <LocationProvider>
      <WeatherProvider>
        <div className={`h-screen flex flex-col ${emergencyMode ? 'emergency-mode' : ''}`}>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            emergencyMode={emergencyMode}
            onToggleEmergency={() => setEmergencyMode(!emergencyMode)}
          />
          
          <div className="flex-1 flex relative">
            {/* Sidebar */}
            <div className={`
              fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              lg:relative lg:translate-x-0 
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Map */}
            <div className="flex-1">
              <MapView emergencyMode={emergencyMode} />
            </div>
          </div>
        </div>
      </WeatherProvider>
    </LocationProvider>
  )
}

export default App 