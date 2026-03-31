import React, { useState, useContext, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {

  const { navigate, isEducator, setEducator, user, logoutUser, token, backendUrl } = useContext(AppContext)
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = () => {
    setShowDropdown(false)
    setShowMobileMenu(false)
    logoutUser()
  }

  const onBecomeEducator = async () => {
    if (isEducator) {
      navigate('/educator');
      return;
    }
    try{
      const response= await axios.post(backendUrl+ '/api/educator/update-role',{},{
        headers: {
          Authorization : `Bearer ${token}`
        }
      });
      if(response.data.success){
        setEducator(true);
        localStorage.setItem('isEducator', 'true');
        toast.success(response.data.message);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      console.log("Error becoming educator:", error);
      toast.error(error.message);
    }
  }

  return (
    <nav className="w-full theme-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1>
              <span className="theme-logo text-3xl">Educaso</span>
            </h1>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-8">
              <Link 
                to="/course-list" 
                className="theme-link"
              >
                All Courses
              </Link>

            {user && (
              <>
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    onBecomeEducator()
                  }}
                  className="theme-link"
                >
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                <Link 
                  to="/my-enrollments" 
                  className="theme-link"
                >
                  My Enrollments
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-sky-500 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  aria-label="User menu"
                  aria-expanded={showDropdown}
                >
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt="user avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() || user.firstName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 theme-surface py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name || user.firstName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <span className="text-lg">⇥</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/signup')}
                className="theme-btn-primary px-6 py-2.5 rounded-full"
              >
                Create Account
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-sky-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6 text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {showMobileMenu ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-slate-200 py-4 space-y-3">
              <Link 
                to="/course-list" 
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors duration-200"
              >
                All Courses
              </Link>

            {user && (
              <>
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    onBecomeEducator()
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors duration-200"
                >
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>

                <Link 
                  to="/my-enrollments" 
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors duration-200"
                >
                  My Enrollments
                </Link>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    navigate('/signup')
                  }}
                  className="w-full theme-btn-primary px-6 py-2.5 rounded-full"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar