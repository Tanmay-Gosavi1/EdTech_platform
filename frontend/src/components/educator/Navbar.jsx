import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../student/Loading.jsx'

const Navbar = ({ onMenuToggle }) => {

  const { user, loading, logoutUser } = useContext(AppContext)
  const userDisplayName = user?.name || user?.firstName || 'Educator'

  if (loading) {
    return <Loading />
  }

  return (
    <div className="w-full theme-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={onMenuToggle}
            className='md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50'
            aria-label='Toggle menu'
          >
            <svg className='w-5 h-5 text-slate-700' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>

          <Link to="/">
            <h1>
              <span className="theme-logo text-3xl">Educaso</span>
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <p className="hidden sm:block text-sm sm:text-base font-semibold text-slate-700 truncate max-w-45">
            Hello, {userDisplayName}
          </p>

          <img
            src={assets.local_img}
            alt="profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-slate-300 shadow-sm"
          />

          <button
            type='button'
            onClick={logoutUser}
            className='theme-btn-ghost text-xs sm:text-sm px-3 py-2'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
