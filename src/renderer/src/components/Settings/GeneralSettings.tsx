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
      {/* Removed non-functional Application Preferences and About sections */}
    </div>
  )
}
