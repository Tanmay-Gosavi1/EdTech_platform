import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const CallToAction = () => {
  return (
  <div className='py-20 px-4 bg-white'>
    <div className='max-w-5xl mx-auto text-center rounded-3xl bg-gradient-to-r from-slate-900 to-sky-900 p-8 sm:p-12 shadow-2xl relative overflow-hidden'>
      <div className='absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-300/30 blur-2xl'></div>
      <div className='absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl'></div>
      <h1 className='headline-font text-4xl md:text-5xl font-bold mb-6 leading-tight text-white'>Start building your next skill sprint today</h1>
      <p className='text-base sm:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed'>Move from confusion to clarity with structured learning paths, weekly progress momentum, and outcomes you can showcase.</p>
      <div className='flex flex-col sm:flex-row gap-4 justify-center items-center relative'>
        <Link to="/course-list" onClick={()=> scrollTo(0,0)} className='bg-white text-slate-900 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors duration-300 shadow-md hover:shadow-lg'>Get Started</Link>
        <Link to="/course-list" onClick={()=> scrollTo(0,0)} className='border-2 border-slate-300 text-white font-semibold px-8 py-3 rounded-lg hover:border-white transition-all duration-300 flex items-center gap-2'>Learn more <img src={assets.arrow_icon} alt="arrow icon" className='w-4 h-4 invert'/></Link>
            </div>
        </div>
    </div>
    
  )
}

export default CallToAction