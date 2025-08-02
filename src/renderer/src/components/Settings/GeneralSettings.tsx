import React from 'react'
import { useGmail } from '../../hooks/useGmail'

export function GeneralSettings(): React.ReactElement {
  const { userProfile, logout } = useGmail()

  return (
    <div className="flex-1 gap-6 flex-col flex overflow-y-auto p-6">
      {/* Account Information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Account Information
        </h3>
        
        {userProfile ? (
          <div className="flex items-center space-x-4">
            <img
              src={userProfile.picture}
              alt={userProfile.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
              <p className="text-sm text-gray-600">{userProfile.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No user profile available</p>
        )}
        
        <div className="mt-4">
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Application Preferences */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Dark mode</label>
              <p className="text-xs text-gray-500">Switch to dark theme</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show notifications</label>
              <p className="text-xs text-gray-500">Get notified of new emails</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-save drafts</label>
              <p className="text-xs text-gray-500">Automatically save email drafts</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email refresh interval
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="30">30 seconds</option>
              <option value="60" selected>
                1 minute
              </option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Built with:</strong> Electron, React, TypeScript
          </p>
          <p>
            <strong>API Integration:</strong> Gmail API, Google Drive API, OpenAI API
          </p>
        </div>
        
        <div className="mt-4 space-x-4">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Support
          </a>
        </div>
      </div>
    </div>
  )
}
