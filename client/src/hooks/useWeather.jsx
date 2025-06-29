import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocations } from './useLocations'

const WeatherContext = createContext()

export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState({
    alerts: [],
    radar: null,
    lastUpdated: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { locations, updateLocationRisk } = useLocations()

  // Fetch weather data from server
  useEffect(() => {
    const updateWeatherData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:5000/api/weather/alerts')
        const data = await response.json()
        
        setWeatherData({
          alerts: data.alerts || [],
          radar: null,
          lastUpdated: new Date().toISOString()
        })
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch weather alerts:', err)
        setError('Failed to fetch weather data')
        
        // Fallback to basic mock data if server is unavailable
        setWeatherData({
          alerts: [],
          radar: null,
          lastUpdated: new Date().toISOString()
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Update immediately and then every 1.2 minutes to sync with server
    updateWeatherData()
    const interval = setInterval(updateWeatherData, 1.2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Separate effect to update location risks when weather data or locations change
  useEffect(() => {
    if (weatherData.alerts.length > 0 && locations.length > 0) {
      updateLocationRisks(weatherData.alerts)
    }
  }, [weatherData.alerts, locations])

  const updateLocationRisks = (alerts) => {
    locations.forEach(location => {
      let newRiskLevel = 'low'
      let weatherAlert = null

      // Check if location is within any alert area
      alerts.forEach(alert => {
        const distance = calculateDistance(
          location.lat, location.lng,
          alert.area.lat, alert.area.lng
        )

        if (distance <= alert.area.radius) {
          // Map server severity levels to risk levels
          if (alert.severity === 'extreme' || alert.severity === 'high') {
            newRiskLevel = 'high'
            weatherAlert = alert.description
          } else if ((alert.severity === 'severe' || alert.severity === 'medium') && newRiskLevel !== 'high') {
            newRiskLevel = 'medium'
            weatherAlert = alert.description
          } else if (alert.severity === 'moderate' && newRiskLevel === 'low') {
            newRiskLevel = 'medium'
            weatherAlert = alert.description
          }
        }
      })

      // Update location risk if it has changed
      if (location.riskLevel !== newRiskLevel || location.weatherAlert !== weatherAlert) {
        updateLocationRisk(location.id, newRiskLevel, weatherAlert)
      }
    })
  }

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

  const fetchWeatherData = async (lat, lng) => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you'd call OpenWeatherMap API here
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`)
      // const data = await response.json()
      
      // For demo, return mock data
      return {
        temperature: Math.round(Math.random() * 40 + 10),
        condition: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 20)
      }
    } catch (err) {
      setError('Failed to fetch weather data')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const triggerWeatherUpdate = async () => {
    try {
      setIsLoading(true)
      
      // First, trigger server to generate new weather data
      const updateResponse = await fetch('http://localhost:5000/api/weather/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!updateResponse.ok) {
        throw new Error('Failed to trigger server update')
      }
      
      // Then fetch the updated weather alerts
      const response = await fetch('http://localhost:5000/api/weather/alerts', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      const data = await response.json()
      
      // Update weather data with new alerts from server
      setWeatherData({
        alerts: data.alerts || [],
        radar: null,
        lastUpdated: new Date().toISOString()
      })

      // Force update location risks with new alerts
      if (locations.length > 0 && data.alerts) {
        updateLocationRisks(data.alerts)
      }
      
      setError(null)
    } catch (err) {
      console.error('Failed to update weather:', err)
      setError('Failed to update weather data')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    weatherData,
    alerts: weatherData.alerts,
    isLoading,
    error,
    fetchWeatherData,
    updateWeather: triggerWeatherUpdate
  }

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  )
} 