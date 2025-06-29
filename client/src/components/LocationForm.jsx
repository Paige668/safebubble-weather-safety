import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLocations } from '../hooks/useLocations'

const LocationForm = ({ onClose }) => {
  const { addLocation } = useLocations()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'home',
    lat: '',
    lng: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const locationTypes = [
    { value: 'home', label: '🏠 Home' },
    { value: 'work', label: '🏢 Work' },
    { value: 'school', label: '🏫 School' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'friend', label: '👥 Friend' },
    { value: 'hospital', label: '🏥 Hospital' },
    { value: 'other', label: '📍 Other' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.address) {
        throw new Error('Name and address are required')
      }

      let lat = parseFloat(formData.lat)
      let lng = parseFloat(formData.lng)

      // If coordinates aren't provided, try to geocode the address
      if (!lat || !lng) {
        const geocoded = await geocodeAddress(formData.address)
        lat = geocoded.lat
        lng = geocoded.lng
      }

      const newLocation = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        type: formData.type,
        lat,
        lng,
        riskLevel: 'low', // Default to low risk
        lastUpdated: new Date().toISOString()
      }

      addLocation(newLocation)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Simple geocoding function (in a real app, you'd use a proper geocoding service)
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      const data = await response.json()
      
      if (data.length === 0) {
        throw new Error('Address not found')
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    } catch (err) {
      throw new Error('Failed to find location coordinates')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="p-4 sm:p-6 mobile-form">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Location</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="Close form"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Location Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Mom's House, My Office"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Location Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter full address"
            rows={3}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude (optional)
            </label>
            <input
              type="number"
              id="lat"
              name="lat"
              value={formData.lat}
              onChange={handleInputChange}
              step="any"
              placeholder="e.g., 40.7128"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude (optional)
            </label>
            <input
              type="number"
              id="lng"
              name="lng"
              value={formData.lng}
              onChange={handleInputChange}
              step="any"
              placeholder="e.g., -74.0060"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LocationForm 