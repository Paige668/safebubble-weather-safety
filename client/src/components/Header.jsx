import React from 'react'
import { ShieldCheckIcon, Bars3Icon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const Header = ({ onToggleSidebar, emergencyMode, onToggleEmergency }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">SafeBubble</h1>
              <p className="text-xs text-gray-500">Weather & Family Safety</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleEmergency}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              emergencyMode 
                ? 'bg-danger text-white pulse-danger' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
            {emergencyMode ? 'FOCUS MODE' : 'Normal Mode'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 