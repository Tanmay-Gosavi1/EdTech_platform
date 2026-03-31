import React from 'react'
import {assets} from '../../assets/assets'
import SearchBar from './SearchBar.jsx'

const Hero = () => {
  return (
    <section className='relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10 md:pb-14'>
      <div className='pointer-events-none absolute inset-0 hero-grid-bg opacity-45'></div>
      <div className='pointer-events-none absolute -top-10 -left-10 h-44 w-44 rounded-full bg-lime-300/45 blur-3xl'></div>
      <div className='pointer-events-none absolute top-20 right-10 h-36 w-36 rounded-full bg-violet-300/40 blur-3xl'></div>
      <div className='pointer-events-none absolute -bottom-16 right-1/4 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl'></div>

      <div className='relative max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-8 sm:gap-10 lg:gap-12'>
          <div className='fade-rise'>
            <div className='flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <span className='funky-chip rotate-[-4deg]'>Fresh Tracks</span>
              <span className='funky-chip-violet rotate-2'>Mentor Led</span>
              <span className='funky-chip-dark'>Portfolio Ready</span>
            </div>

            <p className='text-slate-500 text-sm sm:text-base mb-3'>Crafting student journeys that actually feel exciting</p>

            <h1 className='headline-font text-slate-950 text-4xl sm:text-5xl md:text-6xl lg:text-[78px] leading-[0.98] font-extrabold tracking-tight max-w-4xl'>
              Build your
              <span className='mx-2 sm:mx-3 text-violet-700 inline-flex items-center justify-center rounded-full h-13 w-13 sm:h-16 sm:w-16 border-4 border-lime-300 bg-violet-600 shadow-lg'>
                <img src={assets.logo_dark} alt='logo icon' className='w-7 sm:w-8 invert'/>
              </span>
              dream career with
              <span className='block mt-2 sm:mt-3'>
                <span className='hero-highlight'>Creative</span>
                <span className='ml-3 sm:ml-4'>Learning</span>
              </span>
            </h1>

            <p className='text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mt-5 sm:mt-6 mb-7'>
              No boring lectures. Learn from interactive paths, project sprints, and community feedback loops that make your progress visible every week.
            </p>

            <div className='bg-white/85 backdrop-blur border border-white rounded-2xl p-3 sm:p-4 max-w-2xl shadow-[0_16px_40px_rgba(15,23,42,0.14)]'>
              <SearchBar />
            </div>

            <div className='mt-6 flex flex-wrap gap-3 text-sm text-slate-700 font-medium'>
              <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200 shadow-sm'>
                <span className='h-2 w-2 rounded-full bg-emerald-500'></span>
                25k+ active learners
              </span>
              <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200 shadow-sm'>
                <span className='h-2 w-2 rounded-full bg-violet-500'></span>
                4.9 average course rating
              </span>
            </div>
          </div>

          <div className='fade-rise lg:justify-self-end w-full max-w-xl'>
            <div className='relative hero-visual-shell rounded-3xl p-4 sm:p-5 shadow-2xl'>
              <span className='funky-badge top-3 right-3'>Top Picks</span>

              <div className='grid gap-3'>
                <div className='tilt-card-left rounded-2xl overflow-hidden border-2 border-white/70'>
                  <img src={assets.course_1_thumbnail} alt='Course preview 1' className='w-full h-40 sm:h-44 object-cover'/>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='tilt-card-right rounded-2xl overflow-hidden border-2 border-white/70'>
                    <img src={assets.course_4_thumbnail} alt='Course preview 2' className='w-full h-32 object-cover'/>
                  </div>

                  <div className='rounded-2xl bg-white/95 border border-slate-200 p-3 sm:p-4 flex flex-col justify-between'>
                    <div>
                      <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Weekly Sprint</p>
                      <p className='text-lg sm:text-xl font-bold text-slate-900 mt-1'>UI Challenge</p>
                    </div>
                    <p className='text-xs sm:text-sm text-slate-600 mt-3'>Ship one polished component every 7 days with mentor feedback.</p>
                  </div>
                </div>
              </div>

              <div className='absolute -bottom-5 left-4 sm:left-8 bg-lime-300 text-slate-900 font-bold rounded-2xl px-4 py-2 shadow-lg -rotate-3 text-sm sm:text-base'>
                Learn. Build. Get Hired.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero