import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import cron from 'node-cron'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage for demo (in production, use a real database)
let weatherAlerts = []
let locationRisks = new Map()

// Weather API endpoints
app.get('/api/weather/alerts', (req, res) => {
  res.json({
    alerts: weatherAlerts,
    lastUpdated: new Date().toISOString()
  })
})

app.get('/api/weather/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params
    
    // In a real app, you'd call OpenWeatherMap API
    // const API_KEY = process.env.OPENWEATHER_API_KEY
    // const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`)
    
    // Mock weather data for demo
    const mockWeatherData = {
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      current: {
        temperature: Math.round(Math.random() * 40 + 10),
        condition: ['clear', 'cloudy', 'rain', 'storm', 'snow'][Math.floor(Math.random() * 5)],
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 20),
        pressure: Math.round(Math.random() * 50 + 980)
      },
      alerts: weatherAlerts.filter(alert => {
        const distance = calculateDistance(
          parseFloat(lat), parseFloat(lng),
          alert.area.lat, alert.area.lng
        )
        return distance <= alert.area.radius
      }),
      lastUpdated: new Date().toISOString()
    }

    res.json(mockWeatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
})

// Location risk assessment
app.post('/api/locations/assess-risk', (req, res) => {
  try {
    const { locations } = req.body
    
    const assessedLocations = locations.map(location => {
      let riskLevel = 'low'
      let alerts = []

      // Check if location is within any weather alert area
      weatherAlerts.forEach(alert => {
        const distance = calculateDistance(
          location.lat, location.lng,
          alert.area.lat, alert.area.lng
        )

        if (distance <= alert.area.radius) {
          alerts.push(alert)
          if (alert.severity === 'extreme' || alert.type === 'tornado') {
            riskLevel = 'high'
          } else if (alert.severity === 'severe' && riskLevel !== 'high') {
            riskLevel = 'medium'
          }
        }
      })

      return {
        ...location,
        riskLevel,
        alerts,
        lastAssessed: new Date().toISOString()
      }
    })

    res.json({ locations: assessedLocations })
  } catch (error) {
    console.error('Risk assessment error:', error)
    res.status(500).json({ error: 'Failed to assess location risks' })
  }
})

// Weather alerts endpoint
app.get('/api/weather/alerts', (req, res) => {
  // Generate fresh alerts on each request for demo purposes
  if (req.headers['cache-control'] === 'no-cache') {
    generateMockAlerts()
  }
  
  const activeAlerts = weatherAlerts.filter(alert => 
    new Date(alert.expires) > new Date()
  )
  
  res.json({
    alerts: activeAlerts,
    count: activeAlerts.length,
    lastUpdated: new Date().toISOString()
  })
})

// Emergency endpoints
app.get('/api/emergency/active-alerts', (req, res) => {
  const activeAlerts = weatherAlerts.filter(alert => 
    new Date(alert.expires) > new Date()
  )
  
  res.json({
    alerts: activeAlerts,
    count: activeAlerts.length,
    highPriorityCount: activeAlerts.filter(a => a.severity === 'extreme').length
  })
})







// Utility functions
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

// Simulate weather alerts for demo
const generateMockAlerts = () => {
  const alertTypes = [
    { 
      type: 'tornado', 
      severity: 'extreme', 
      title: 'Tornado Warning',
      description: 'Tornado activity detected. Take shelter immediately in a sturdy building.'
    },
    { 
      type: 'thunderstorm', 
      severity: 'severe', 
      title: 'Severe Thunderstorm Warning',
      description: 'Heavy rain and hail expected. Avoid travel if possible.'
    },
    { 
      type: 'flood', 
      severity: 'moderate', 
      title: 'Flash Flood Warning',
      description: 'Rapid water rise possible in low-lying areas'
    },
    { 
      type: 'winter-storm', 
      severity: 'severe', 
      title: 'Winter Storm Warning',
      description: 'Heavy snow and ice conditions expected'
    }
  ]

  // Specific geographic areas with realistic coordinates
  const locations = [
    {
      location: 'Springfield, IL',
      counties: ['Sangamon County', 'Menard County'],
      lat: 39.8008,
      lng: -89.6611
    },
    {
      location: 'Chicago, IL', 
      counties: ['Cook County', 'DuPage County'],
      lat: 41.9676,
      lng: -87.6881
    },
    {
      location: 'Mancos, CO',
      counties: ['Montezuma County'],
      lat: 37.3452,
      lng: -108.2920
    },
    {
      location: 'Denver, CO',
      counties: ['Denver County', 'Jefferson County'],
      lat: 39.7392,
      lng: -104.9903
    },
    {
      location: 'St. Louis, MO',
      counties: ['St. Louis County', 'St. Charles County'],
      lat: 38.6270,
      lng: -90.1994
    }
  ]

  // Generate 0-4 random alerts with higher chance of severe weather
  const weatherSeverity = Math.random()
  let numAlerts
  
  if (weatherSeverity < 0.25) {
    numAlerts = 0 // 25% chance of clear weather
  } else if (weatherSeverity < 0.5) {
    numAlerts = Math.floor(Math.random() * 2) + 1 // 25% chance of 1-2 alerts
  } else {
    numAlerts = Math.floor(Math.random() * 3) + 2 // 50% chance of 2-4 alerts
  }
  
  weatherAlerts = []

  for (let i = 0; i < numAlerts; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    const alert = {
      id: `alert-${Date.now()}-${i}`,
      type: alertType.type,
      severity: alertType.severity,
      title: alertType.title,
      description: alertType.description,
      area: {
        lat: location.lat + (Math.random() - 0.5) * 0.2, // Add slight variation
        lng: location.lng + (Math.random() - 0.5) * 0.2,
        location: location.location,
        counties: location.counties,
        radius: Math.floor(Math.random() * 40) + 25 // 25-65 km radius
      },
      issued: new Date().toISOString(),
      expires: new Date(Date.now() + (3 + Math.random() * 8) * 60 * 60 * 1000).toISOString(), // 3-11 hours
      urgency: alertType.severity === 'extreme' ? 'immediate' : 'expected'
    }
    weatherAlerts.push(alert)
  }

  if (weatherAlerts.length === 0) {
    console.log('Generated clear weather - no active alerts')
  } else {
    console.log(`Generated ${weatherAlerts.length} weather alert${weatherAlerts.length > 1 ? 's' : ''} with geographic details`)
  }
}

// Update weather alerts every 1 minute for demo
cron.schedule('*/1 * * * *', () => {
  console.log('Auto-updating weather alerts every 1 minute...')
  generateMockAlerts()
})

// Manual weather update endpoint
app.post('/api/weather/update', (req, res) => {
  try {
    console.log('Manual weather update triggered...')
    generateMockAlerts()
    res.json({
      success: true,
      message: 'Weather data updated successfully',
      timestamp: new Date().toISOString(),
      alertCount: weatherAlerts.length
    })
  } catch (error) {
    console.error('Failed to update weather:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update weather data'
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeAlerts: weatherAlerts.length
  })
})

// Initialize with mock data
generateMockAlerts()

app.listen(PORT, () => {
  console.log(`🚀 SafeBubble Server running on port ${PORT}`)
  console.log(`📍 Weather Alerts API: http://localhost:${PORT}/api/weather/alerts`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
  console.log(`⚡ Auto-updating weather alerts every 1 minute`)
}) 