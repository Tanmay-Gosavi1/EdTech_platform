import React from 'react'
// import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
 
const Footer = () => {
  return (
    <footer className='bg-linear-to-br from-slate-950 to-indigo-950 text-slate-300'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12'>
            <div className='space-y-3 sm:space-y-4 lg:space-y-5'>
                <h1>
                    <span className="theme-logo text-3xl text-white">Educaso</span>
                </h1>
                <p className='text-sm sm:text-sm lg:text-base leading-relaxed text-gray-400 pr-0 lg:pr-4'>
                    Learn through project-first pathways with modern curriculum and community-backed momentum.
                </p>
            </div>
            <div className='space-y-3 sm:space-y-4 lg:space-y-5'>
                <h3 className='text-lg sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4 lg:mb-6'>Company</h3>
                <div className='flex flex-col space-y-2 sm:space-y-2 lg:space-y-3'>
                    <Link to='/' className='text-sm sm:text-sm lg:text-base hover:text-white transition-colors duration-200'>Home</Link>
                    <Link to='/' className='text-sm sm:text-sm lg:text-base hover:text-white transition-colors duration-200'>About us</Link>
                    <Link to='/' className='text-sm sm:text-sm lg:text-base hover:text-white transition-colors duration-200'>Contact us</Link>
                    <Link to='/' className='text-sm sm:text-sm lg:text-base hover:text-white transition-colors duration-200'>Privacy Policy</Link>
                </div>
            </div>
            <div className='space-y-3 sm:space-y-4 lg:space-y-5 sm:col-span-2 lg:col-span-1'>
                <h2 className='text-lg sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4 lg:mb-6'>Subscribe to our newsletter</h2>
                <p className='text-sm sm:text-sm lg:text-base text-gray-400 mb-3 sm:mb-4 lg:mb-5'>The latest news, articles, and resources , sent to your inbox weekly.</p>
                <div className='flex flex-col sm:flex-row gap-3'>
                    <input type="text" placeholder="Enter your email" className='flex-1 px-3 sm:px-4 py-2 sm:py-2 lg:py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200 text-sm sm:text-sm lg:text-base'/>
                    <button className='theme-btn-primary px-6 sm:px-6 lg:px-7 py-2 sm:py-2 lg:py-3 whitespace-nowrap text-sm sm:text-sm lg:text-base'>Subscribe</button>
                </div>
            </div>
        </div>
        <div className='border-t border-gray-800'>
            <p className='text-center text-sm sm:text-sm lg:text-base text-gray-500 py-6 sm:py-7 lg:py-8 px-4'>Copyright 2024 © Educaso. All Right Reserved.</p>
        </div>
    </footer>
  )
}

export default Footer