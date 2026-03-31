import React from 'react'
import {assets} from '../../assets/assets'

const Companies = () => {
  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className='max-w-6xl mx-auto glass-panel rounded-2xl p-5 sm:p-7 border border-white/80'>
          <p className="text-center text-slate-600 text-sm sm:text-base uppercase tracking-[0.2em] font-semibold mb-6">Trusted by learners from</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 opacity-80">
              <img src={assets.microsoft_logo} alt="Microsoft Logo" className="w-20 md:w-28"/>
              <img src={assets.walmart_logo} alt="Walmart Logo" className="w-20 md:w-28"/>
              <img src={assets.accenture_logo} alt="Accenture Logo" className="w-20 md:w-28"/>
              <img src={assets.adobe_logo} alt="Adobe Logo" className="w-20 md:w-28"/>
              <img src={assets.paypal_logo} alt="PayPal Logo" className="w-20 md:w-28"/>
          </div>
        </div>
    </div>
  )
}

export default Companies