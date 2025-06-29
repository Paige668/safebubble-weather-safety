import React, { useState, useEffect } from 'react'
import { MapPinIcon, ExclamationTriangleIcon, XMarkIcon, PencilIcon, TrashIcon, CheckIcon, SunIcon, CloudIcon } from '@heroicons/react/24/outline'
import { useWeather } from '../hooks/useWeather'
import { useLocations } from '../hooks/useLocations'

const LocationCard = ({ location }) => {
  const { alerts, fetchWeatherData, isLoading } = useWeather()
  const { updateLocation, removeLocation } = useLocations()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showWeatherModal, setShowWeatherModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [locationWeather, setLocationWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: location.name,
    address: location.address,
    type: location.type
  })
  const [showWeatherDetail, setShowWeatherDetail] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800'
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      default: return 'bg-green-100 border-green-200 text-green-800'
    }
  }

  const getTypeIcon = (type) => {
    const icons = {
      home: '🏠',
      work: '🏢',
      school: '🏫',
      family: '👨‍👩‍👧‍👦',
      friend: '👥',
      hospital: '🏥',
      other: '📍'
    }
    return icons[type] || icons.other
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      stormy: '⛈️',
      snowy: '❄️',
      foggy: '🌫️'
    }
    return icons[condition] || '🌤️'
  }

  const getWeatherDescription = (condition) => {
    const descriptions = {
      sunny: 'Sunny',
      cloudy: 'Cloudy', 
      rainy: 'Rainy',
      stormy: 'Stormy',
      snowy: 'Snowy',
      foggy: 'Foggy'
    }
    return descriptions[condition] || 'Partly Cloudy'
  }

  // Fetch weather data for this location
  const handleFetchWeather = async () => {
    setWeatherLoading(true)
    try {
      const weather = await fetchWeatherData(location.lat, location.lng)
      setLocationWeather(weather)
      if (isMobile) {
        setShowWeatherDetail(true)
      } else {
        setShowWeatherModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setWeatherLoading(false)
    }
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

  // Find all alerts affecting this location
  const getLocationAlerts = () => {
    if (!alerts || alerts.length === 0) return []
    
    return alerts.filter(alert => {
      const distance = calculateDistance(
        location.lat, location.lng,
        alert.area.lat, alert.area.lng
      )
      return distance <= alert.area.radius
    })
  }

  const locationAlerts = getLocationAlerts()
  const hasAlerts = locationAlerts.length > 0

  // Get the most severe alert for display
  const getMostSevereAlert = () => {
    if (locationAlerts.length === 0) return null
    
    const severityOrder = { extreme: 4, severe: 3, moderate: 2, minor: 1 }
    return locationAlerts.reduce((most, current) => {
      return (severityOrder[current.severity] || 0) > (severityOrder[most.severity] || 0) ? current : most
    })
  }

  const mostSevereAlert = getMostSevereAlert()

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'extreme': return 'text-red-600'
      case 'severe': return 'text-orange-600'
      case 'moderate': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateLocation(location.id, editForm)
    setIsEditing(false)
  }

  // Handle edit form cancel
  const handleEditCancel = () => {
    setEditForm({
      name: location.name,
      address: location.address,
      type: location.type
    })
    setIsEditing(false)
  }

  // Handle delete location
  const handleDelete = () => {
    removeLocation(location.id)
    setShowDeleteConfirm(false)
  }

  // Handle location card click - different behavior for mobile vs desktop
  const handleLocationClick = () => {
    if (hasAlerts) {
      setShowDetailModal(true)
    } else {
      // If no alerts, show weather information instead
      handleFetchWeather()
    }
  }

  // Debug info
  console.log(`Location ${location.name}:`, {
    alerts: alerts?.length || 0,
    locationAlerts: locationAlerts.length,
    hasAlerts,
    mostSevereAlert: mostSevereAlert?.title || 'none',
    isHovered
  })

  if (isEditing) {
    return (
      <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({...editForm, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="home">🏠 Home</option>
              <option value="work">🏢 Work</option>
              <option value="school">🏫 School</option>
              <option value="family">👨‍👩‍👧‍👦 Family</option>
              <option value="friend">👥 Friend</option>
              <option value="hospital">🏥 Hospital</option>
              <option value="other">📍 Other</option>
            </select>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <>
      <div 
        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer relative group ${
          location.riskLevel === 'high' ? 'border-red-200 bg-red-50' :
          location.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200 bg-white'
        }`}
        onMouseEnter={() => {
          console.log('Mouse entered, hasAlerts:', hasAlerts, 'mostSevereAlert:', mostSevereAlert?.title)
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          console.log('Mouse left')
          setIsHovered(false)
        }}
        onClick={handleLocationClick}
      >
        {/* Action buttons - show on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Edit location"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            title="Delete location"
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getTypeIcon(location.type)}</span>
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              {hasAlerts && mostSevereAlert && (
                <span className="text-lg">
                  {getAlertEmoji(mostSevereAlert.type)}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{location.address}</p>
            
            <div className="flex items-center space-x-2 mb-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(location.riskLevel)}`}>
                {location.riskLevel === 'high' ? 'High Risk' :
                 location.riskLevel === 'medium' ? 'Medium Risk' : 'Safe'}
              </span>
              
              {hasAlerts && (
                <div className="flex items-center space-x-1">
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">
                    {locationAlerts.length} Alert{locationAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Weather button for easy access */}
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFetchWeather()
                }}
                disabled={weatherLoading}
                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {weatherLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <SunIcon className="h-4 w-4" />
                    <span>View Weather</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {location.weatherAlert && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
            <p className="text-xs text-orange-800 font-medium">Weather Alert</p>
            <p className="text-xs text-orange-700 mt-1">{location.weatherAlert}</p>
          </div>
        )}

        {location.lastUpdated && (
          <div className="mt-2 text-xs text-gray-400">
            Updated {new Date(location.lastUpdated).toLocaleTimeString()}
          </div>
        )}

        {/* Simplified Hover Tooltip - Always show when hovered for testing */}
        {isHovered && (
          <div className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs top-0 left-full ml-2">
            <div className="flex items-center space-x-2 mb-2">
              <span>🔍</span>
              <span className="font-semibold">Location Info</span>
            </div>
            <p className="text-gray-300 mb-2">{location.name}</p>
            
            {hasAlerts && mostSevereAlert ? (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span>{getAlertEmoji(mostSevereAlert.type)}</span>
                  <span className="font-semibold text-red-300">{mostSevereAlert.title}</span>
                </div>
                <p className="text-gray-300 mb-1">{mostSevereAlert.description}</p>
                <p className="text-gray-400 text-xs">
                  {mostSevereAlert.area.location} • {mostSevereAlert.area.radius}km radius
                </p>
                <p className="text-blue-300 text-xs mt-2 font-medium">
                  🖱️ Click for alert details
                </p>
              </div>
            ) : (
              <div>
                <p className="text-green-300 mb-1">✅ No active alerts</p>
                <p className="text-gray-400 text-xs">Click to view weather</p>
              </div>
            )}
            
            {/* Tooltip arrow */}
            <div className="absolute top-4 left-0 transform -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Weather Modal */}
      {showWeatherModal && locationWeather && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getTypeIcon(location.type)} {location.name} - Weather
                </h3>
                <button
                  onClick={() => setShowWeatherModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{location.address}</p>
            </div>
            
            <div className="p-6">
              {/* Current Weather Display */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">
                  {getWeatherIcon(locationWeather.condition)}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {locationWeather.temperature}°C
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {getWeatherDescription(locationWeather.condition)}
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-sm text-gray-600">Humidity</div>
                  <div className="font-semibold">{locationWeather.humidity}%</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">💨</div>
                  <div className="text-sm text-gray-600">Wind Speed</div>
                  <div className="font-semibold">{locationWeather.windSpeed} km/h</div>
                </div>
              </div>

              {/* Location alerts if any */}
              {hasAlerts && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Active Alerts:</h4>
                  <div className="space-y-2">
                    {locationAlerts.slice(0, 2).map((alert, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center space-x-2">
                          <span>{getAlertEmoji(alert.type)}</span>
                          <span className="text-sm font-medium text-red-800">{alert.title}</span>
                        </div>
                      </div>
                    ))}
                    {locationAlerts.length > 2 && (
                      <button
                        onClick={() => {
                          setShowWeatherModal(false)
                          setShowDetailModal(true)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all {locationAlerts.length} alerts →
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 text-center">
                Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowWeatherModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Location</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete this location?</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(location.type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{location.name}</p>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. The location will be permanently removed from your list.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Alerts */}
      {showDetailModal && hasAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getTypeIcon(location.type)} {location.name} - Weather Alerts
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{location.address}</p>
            </div>
            
            <div className="p-4 space-y-4">
              {locationAlerts.map((alert) => (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getAlertEmoji(alert.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          alert.severity === 'extreme' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-3 w-3" />
                          <span>Location: {alert.area.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>Counties: {alert.area.counties.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🎯</span>
                          <span>Coverage: {alert.area.radius}km radius</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⏰</span>
                          <span>
                            Issued: {new Date(alert.issued).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⏳</span>
                          <span>
                            Expires: {new Date(alert.expires).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && showWeatherDetail && locationWeather && (
        <div className="mt-3 p-4 bg-white rounded-lg shadow border border-blue-100">
          {/* Weather details here, similar to your modal content */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{getWeatherIcon(locationWeather.condition)}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{locationWeather.temperature}°C</div>
            <div className="text-lg text-gray-600 mb-2">{getWeatherDescription(locationWeather.condition)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="text-xl mb-1">💧</div>
              <div className="text-xs text-gray-600">Humidity</div>
              <div className="font-semibold">{locationWeather.humidity}%</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="text-xl mb-1">💨</div>
              <div className="text-xs text-gray-600">Wind</div>
              <div className="font-semibold">{locationWeather.windSpeed} km/h</div>
            </div>
          </div>
          <button
            onClick={() => setShowWeatherDetail(false)}
            className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}

export default LocationCard 