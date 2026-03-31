import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'
import {Link} from 'react-router-dom'

const TestomonialsSection = () => {
  return (
    <div className='py-16 px-4 bg-slate-900'>
        <h2 className='headline-font text-4xl md:text-5xl font-bold text-center text-white mb-4'>What learners are shipping</h2>
        <p className='text-center text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed'>Real stories from learners who transformed ideas into execution through practical learning paths and guided mentorship.</p>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {
                dummyTestimonial.map((item, index)=>(
                    <div key={index} className='bg-white/95 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col border border-white/40'>
                        <div className='flex items-center gap-4 mb-4'>
                            <img src={item.image} alt={item.name} className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'/>
                            <div className='flex-1'>
                                <h1 className='text-lg font-semibold text-gray-900'>{item.name}</h1>
                                <p className='text-sm text-gray-500'>{item.role}</p>
                            </div>
                        </div>
                        <div className='flex-1'>
                                <div className='flex gap-1 mb-3'>
                                    {
                                        [...Array(5)].map((_,i)=>(
                                            <img key={i} src={i < Math.floor(item.rating) ? assets.star : assets.star_blank} alt="Rating Block" className="w-4 h-4" />
                                        ))
                                    }
                                </div>
                                <p className='text-gray-700 text-sm leading-relaxed line-clamp-4'>{item.feedback}</p>
                            </div>
                            <Link to="/course-list" onClick={()=> scrollTo(0,0)} className='text-sky-700 hover:text-sky-900 font-medium text-sm mt-4 inline-block transition-colors duration-200'>Read more</Link>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default TestomonialsSection