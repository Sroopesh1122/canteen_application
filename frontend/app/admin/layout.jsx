"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  FaUserCircle,
  FaList,
  FaTags,
  FaUser
} from 'react-icons/fa'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getProfile = async() => {
  const response = await axios.get(`${API_URL}/api/v1/user/secure/auth/profile`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  return response.data;
}

// Custom Modal Component
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to logout? You'll need to login again to access the admin panel.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Root Layout 
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  })

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'Menu Management', href: '/admin/menu', icon: FaList },
    { name: 'Item Categories', href: '/admin/categories', icon: FaTags },
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

  const handleLogout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem("authToken")
    localStorage.removeItem("role")
    
    // Close modal and redirect to login
    setIsLogoutModalOpen(false)
    setIsDropdownOpen(false)
    router.push('/login')
  }

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true)
    setIsDropdownOpen(false)
  }

  return (
    <section className='w-full min-h-screen bg-gray-50 flex'>
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

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
                      <p className="text-sm font-medium text-gray-700">
                        {isLoading ? 'Loading...' : profileData?.data?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isLoading ? 'loading...' : profileData?.data?.email || 'admin@canteen.com'}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-gray-400 hover:text-gray-600 transition duration-200"
                    >
                      <FaSignOutAlt className="h-5 w-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={openLogoutModal}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                          >
                            <FaSignOutAlt className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                  </button>
                  
                  {/* Dropdown Menu for collapsed sidebar */}
                  {isDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={openLogoutModal}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                        >
                          <FaSignOutAlt className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                  <p className="text-sm font-medium text-gray-700">
                    {isLoading ? 'Loading...' : profileData?.data?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isLoading ? 'loading...' : profileData?.data?.email || 'admin@canteen.com'}
                  </p>
                </div>
              </div>
              <button 
                onClick={openLogoutModal}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
              >
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
              
              {/* User Profile with Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition duration-200"
                >
                  <FaUserCircle className="h-8 w-8 text-gray-400" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">
                      {isLoading ? 'Loading...' : profileData?.data?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isLoading ? 'loading...' : profileData?.data?.email || 'admin@canteen.com'}
                    </p>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {isLoading ? 'Loading...' : profileData?.data?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {isLoading ? 'loading...' : profileData?.data?.email || 'admin@canteen.com'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={openLogoutModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                      >
                        <FaSignOutAlt className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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