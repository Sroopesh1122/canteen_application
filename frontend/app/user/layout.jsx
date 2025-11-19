"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes, FaShoppingCart, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getProfile = async()=>{
  const response = await axios.get(`${API_URL}/api/v1/user/secure/auth/profile`,{
    headers:{
      "Authorization":`Bearer ${localStorage.getItem("authToken")}`
    }
  })
  return response.data;
}

const getCart = async()=>{
 const response = await axios.get(`${API_URL}/api/v1/cart/secure/`,{
    headers:{
      "Authorization":`Bearer ${localStorage.getItem("authToken")}`
    }
  })
  return response.data;
}

// Navbar Component
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef(null);

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey:["profile"],
    queryFn:getProfile,
  })

  const {data:cartData} = useQuery({
    queryKey:["cart"],
    queryFn:getCart,
    enabled:!!profileData
  })

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    // localStorage.removeItem("authToken");
    window.location.reload();
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Menu', path: '/user/menu' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={()=>router.push("/")}>
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
              <span className="font-bold text-lg lg:text-xl text-white">CC</span>
            </div>
            <div>
              <span className="text-lg lg:text-xl font-bold text-gray-900">
                CampusCanteen
              </span>
              <div className="h-1 w-10 rounded-full mt-1 bg-yellow-500"></div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button 
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className="font-medium text-gray-700 hover:text-yellow-600 transition-all duration-300 hover:scale-105"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Right Side - Cart & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            {profileData?.data && (
              <button 
                onClick={()=>router.push("/user/cart")} 
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 relative"
              >
                <FaShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartData?.data?.length || 0}
                </span>
              </button>
            )}

            {/* Profile or Login */}
            {profileData?.data ? (
              // User is logged in - Show profile
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitial(profileData.data.name)}
                  </div>
                  <span className="font-medium text-gray-700">
                    {profileData.data.name}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{profileData.data.name}</p>
                      <p className="text-xs text-gray-500 truncate">{profileData.data.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        router.push("/user/orders");
                        setIsProfileMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      My Orders
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      Profile Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - Show login button
              <button 
                onClick={() => router.push("/auth/signin")}
                className="px-5 py-2.5 lg:px-6 lg:py-3 rounded-2xl font-semibold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FaUser className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300"
          >
            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-4 border-t border-gray-200">
            {navItems.map((item) => (
              <button 
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className="block w-full text-left font-medium text-gray-700 hover:text-yellow-600 transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
            
            {/* Mobile Profile Section */}
            {profileData?.data ? (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitial(profileData.data.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profileData.data.name}</p>
                    <p className="text-sm text-gray-500">{profileData.data.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleNavigation("/user/orders")}
                    className="w-full text-left py-2 text-gray-700 hover:text-yellow-600 transition-colors duration-200"
                  >
                    My Orders
                  </button>
                  <button className="w-full text-left py-2 text-gray-700 hover:text-yellow-600 transition-colors duration-200">
                    Profile Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => handleNavigation("/auth/signin")}
                className="w-full py-3 rounded-xl font-semibold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FaUser className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Footer Component (unchanged)
function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm sm:text-lg">CC</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">CampusCanteen</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Serving the campus community with delicious, affordable meals since 2024.
            </p>
          </div>
          
          {[
            {
              title: "Quick Links",
              links: ["Menu", "About Us", "Contact"]
            },
            {
              title: "Contact",
              links: ["123 Campus Street", "University Area", "(555) 123-4567", "hello@campuscanteen.com"]
            },
            {
              title: "Hours",
              links: ["Mon-Fri: 7AM - 8PM", "Sat: 8AM - 6PM", "Sun: 9AM - 4PM", "24/7 Online Orders"]
            }
          ].map((section, index) => (
            <div key={section.title}>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-white">{section.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors duration-300 text-sm sm:text-base">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-800 mt-6 sm:mt-8 lg:mt-12 pt-6 sm:pt-8 text-center text-slate-400 text-sm sm:text-base">
          <p>&copy; 2024 CampusCanteen. Crafted with ❤️ for students.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}) {
  return (
          <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-16 lg:pt-0">
              {children}
            </main>
            <Footer />
          </div>
  );
}