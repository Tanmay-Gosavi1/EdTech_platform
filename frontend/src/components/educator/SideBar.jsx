import React from 'react'
import { assets } from '../../assets/assets.js'
import {AppContext} from '../../context/AppContext.jsx'
import {useContext} from 'react'
import { NavLink } from 'react-router-dom'

const SideBar = ({ isOpen, onClose }) => {

  const {isEducator}= useContext(AppContext);
  
  const menuItems= [
    {name: 'Dashboard', path: '/educator', icon: assets.home_icon},
    {name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon},
    {name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon},
    {name: 'Students Enrolled', path: '/educator/students-enrolled', icon: assets.person_tick_icon},
  ]

  return isEducator && (
    <>
      <div
        onClick={onClose}
        className={`md:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      ></div>
      <aside className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto bg-white/95 backdrop-blur border-r border-sky-100 w-72 py-6 px-4 sm:px-5 shadow-xl md:shadow-sm transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className='space-y-2'>
        <div className='md:hidden flex items-center justify-between mb-3 px-2'>
          <p className='text-sm font-semibold text-slate-500 uppercase tracking-wider'>Educator Menu</p>
          <button type='button' onClick={onClose} className='w-8 h-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50'>
            x
          </button>
        </div>
        {
          menuItems.map((item, index)=>(
            <NavLink 
              to={item.path} 
              key={index} 
              end={item.path === '/educator'}
              onClick={onClose}
              className={({isActive}) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-linear-to-r from-sky-50 to-violet-50 text-sky-700 border border-sky-100 shadow-sm font-semibold' 
                  : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700 border border-transparent'
                }
              `}
            >
              <img 
                src={item.icon} 
                alt={item.name} 
                className='w-5 h-5 sm:w-6 sm:h-6'
              />

              <p className='text-sm sm:text-base font-medium'>
                {item.name}
              </p>
            </NavLink>
          ))
        }
      </div>
      </aside>
    </>
  )
}

export default SideBar