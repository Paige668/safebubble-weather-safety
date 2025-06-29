import React, { useState } from 'react'
import { XMarkIcon, PlusIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useLocations } from '../hooks/useLocations'
import { useWeather } from '../hooks/useWeather'
import LocationCard from './LocationCard'
import LocationForm from './LocationForm'

const Sidebar = ({ onClose }) => {
  const { locations } = useLocations()
  const { updateWeather, isLoading, weatherData } = useWeather()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false)


  // Filter locations based on selected filter
  const filteredLocations = locations.filter(location => {
    if (filter === 'all') return true
    return location.type === filter
  })

  // Get unique location types for filter options
  const locationTypes = [...new Set(locations.map(loc => loc.type))]

  const handleWeatherUpdate = async () => {
    await updateWeather()
    setShowUpdateSuccess(true)
    setTimeout(() => setShowUpdateSuccess(false), 3000) // Hide success message after 3 seconds
  }



  return (
    <div className="h-full flex flex-col bg-white w-full max-w-sm lg:max-w-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">SafeBubble</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col gap-2 mb-4">
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Location
          </button>
          <button 
            onClick={handleWeatherUpdate}
            disabled={isLoading}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              'Update Weather'
            )}
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({locations.length})
          </button>
          {locationTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type} ({locations.filter(l => l.type === type).length})
            </button>
          ))}
        </div>

        {/* Update Success Message */}
        {showUpdateSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-green-800">Weather Updated Successfully!</p>
              <p className="text-xs text-green-600">
                {weatherData.alerts?.length === 0 
                  ? '🌤️ Clear weather - no active alerts' 
                  : `⚠️ ${weatherData.alerts?.length || 0} active alert${weatherData.alerts?.length > 1 ? 's' : ''}`
                } • Last updated: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No locations found</p>
            <p className="text-sm text-gray-400">Add your first location to get started</p>
          </div>
        ) : (
          filteredLocations.map(location => (
            <LocationCard key={location.id} location={location} />
          ))
        )}
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <LocationForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar 