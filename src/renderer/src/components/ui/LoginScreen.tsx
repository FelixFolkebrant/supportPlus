import React from 'react'

const LoginScreen: React.FC<{ onLogin: () => void; loginInProgress?: boolean }> = ({
  onLogin,
  loginInProgress
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999] text-3xl font-bold">
    <div className="flex flex-col items-center">
      <span className="mb-8">Please log in to your Google account</span>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
        onClick={onLogin}
        disabled={loginInProgress}
      >
        Log In with Google
      </button>
      {loginInProgress && (
        <span className="mt-8 text-base text-gray-600 animate-pulse">Waiting for login...</span>
      )}
    </div>
  </div>
)

export default LoginScreen
