import React from 'react'
import { useGmail } from '../../hooks/useGmail'

export function GeneralSettings(): React.ReactElement {
  const { userProfile, accounts, activeAccount, switchAccount, addAccount, removeAccount, logout } =
    useGmail()

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

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
          >
            Sign Out
          </button>
          <button
            onClick={addAccount}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
          >
            Add Account
          </button>
        </div>
      </div>
      {/* Accounts list */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Linked Accounts</h3>
        {accounts.length === 0 && <p className="text-sm text-gray-600">No accounts linked.</p>}
        <ul className="divide-y divide-gray-100">
          {accounts.map((acc) => (
            <li key={acc.email} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={acc.picture} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="text-sm text-gray-900">{acc.name}</div>
                  <div className="text-xs text-gray-600">{acc.email}</div>
                </div>
                {acc.email === activeAccount && (
                  <span className="ml-2 text-xs text-green-600">Active</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {acc.email !== activeAccount && (
                  <button
                    onClick={() => switchAccount(acc.email)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => removeAccount(acc.email)}
                  className="px-3 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Removed non-functional Application Preferences and About sections */}
    </div>
  )
}
