import React from 'react'
import { Link } from 'react-router-dom'

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">403</h1>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage