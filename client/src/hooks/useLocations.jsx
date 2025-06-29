import React, { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext()

export const useLocations = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocations must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([])

  // Load locations from localStorage on mount
  useEffect(() => {
    const savedLocations = localStorage.getItem('safeBubbleLocations')
    if (savedLocations) {
      try {
        const parsed = JSON.parse(savedLocations)
        setLocations(parsed)
      } catch (error) {
        console.error('Failed to parse saved locations:', error)
        // Initialize with demo data if parsing fails
        initializeDemoData()
      }
    } else {
      // Initialize with demo data for better UX
      initializeDemoData()
    }
  }, [])

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('safeBubbleLocations', JSON.stringify(locations))
  }, [locations])

  const initializeDemoData = () => {
    const demoLocations = [
      {
        id: 'demo-1',
        name: 'Home',
        address: '123 Main St, Anytown, USA',
        type: 'home',
        lat: 40.7128,
        lng: -74.0060,
        riskLevel: 'low',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'demo-2',
        name: 'Office',
        address: '456 Business Ave, Downtown, USA',
        type: 'work',
        lat: 40.7589,
        lng: -73.9851,
        riskLevel: 'medium',
        weatherAlert: 'Severe thunderstorm warning in effect until 8 PM',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'demo-3',
        name: "Mom's House",
        address: '789 Family Lane, Suburbs, USA',
        type: 'family',
        lat: 40.6782,
        lng: -73.9442,
        riskLevel: 'high',
        weatherAlert: 'Tornado watch in effect. Take shelter immediately.',
        lastUpdated: new Date().toISOString()
      }
    ]
    setLocations(demoLocations)
  }

  const addLocation = (location) => {
    setLocations(prev => [...prev, location])
  }

  const updateLocation = (id, updates) => {
    setLocations(prev => 
      prev.map(location => 
        location.id === id 
          ? { ...location, ...updates, lastUpdated: new Date().toISOString() }
          : location
      )
    )
  }

  const removeLocation = (id) => {
    setLocations(prev => prev.filter(location => location.id !== id))
  }

  const updateLocationRisk = (id, riskLevel, weatherAlert = null) => {
    updateLocation(id, { riskLevel, weatherAlert })
  }

  const clearAllLocations = () => {
    setLocations([])
  }

  const value = {
    locations,
    addLocation,
    updateLocation,
    removeLocation,
    updateLocationRisk,
    clearAllLocations
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
} 