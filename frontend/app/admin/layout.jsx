"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, 
  FaUtensils, 
  FaUsers, 
  FaShoppingCart, 
  FaChartBar, 
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaUserCircle
} from 'react-icons/fa'

// Admin Root Layout 
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Menu Management', href: '/admin/menu', icon: FaUtensils },
    { name: 'Item Categories', href: '/admin/categories', icon: FaUtensils },
    { name: 'Orders', href: '/admin/orders', icon: FaShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: FaUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
    { name: 'Settings', href: '/admin/settings', icon: FaCog },
  ]

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <section className='w-full min-h-screen bg-gray-50 flex'>
      {/* Sidebar for Desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="flex flex-col w-full bg-white border-r border-gray-200 h-screen sticky top-0">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <div className={`flex items-center ${sidebarOpen ? 'w-full' : 'w-12'}`}>
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              {sidebarOpen && (
                <span className="ml-3 text-xl font-bold text-gray-800">Admin</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                  <Icon className={`h-5 w-5 ${isActive(item.href) ? 'text-yellow-600' : 'text-gray-400'}`} />
                  {sidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {sidebarOpen ? (
                <>
                  <div className="flex items-center">
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Admin User</p>
                      <p className="text-xs text-gray-500">admin@canteen.com</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition duration-200">
                    <FaSignOutAlt className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button className="text-gray-400 hover:text-gray-600 transition duration-200">
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-800">Admin</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive(item.href) ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <span className="ml-3">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaUserCircle className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">admin@canteen.com</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition duration-200">
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <FaBars className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <FaBars className="h-5 w-5" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative text-gray-500 hover:text-gray-700 transition duration-200">
                <FaBell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-3">
                <FaUserCircle className="h-8 w-8 text-gray-400" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">admin@canteen.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Only this part is scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 Campus Canteen. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-2 sm:mt-0">
                <Link href="/admin/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition duration-200">
                  Privacy Policy
                </Link>
                <Link href="/admin/terms" className="text-sm text-gray-500 hover:text-gray-700 transition duration-200">
                  Terms of Service
                </Link>
                <Link href="/admin/support" className="text-sm text-gray-500 hover:text-gray-700 transition duration-200">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default Layout