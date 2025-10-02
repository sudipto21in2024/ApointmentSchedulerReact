import React from 'react'
import { Outlet } from 'react-router-dom'

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Appointment Booking System
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/services" className="text-gray-700 hover:text-gray-900">
                Services
              </a>
              <a href="/pricing" className="text-gray-700 hover:text-gray-900">
                Pricing
              </a>
              <a href="/contact" className="text-gray-700 hover:text-gray-900">
                Contact
              </a>
              <a href="/auth/login" className="text-gray-700 hover:text-gray-900">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Appointment Booking System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout