import React from 'react'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext.jsx'
import CourseCard from './CourseCard'

const CoursesSection = () => {

    const { allCourses } = useContext(AppContext);
  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
                <p className='text-center text-slate-600 font-semibold tracking-[0.2em] uppercase text-xs sm:text-sm mb-3'>Featured Tracks</p>
                <h2 className="headline-font text-3xl md:text-5xl font-extrabold text-slate-900 text-center mb-4">Learn from creators who build</h2>
                <p className="text-slate-600 text-center text-base md:text-lg max-w-3xl mx-auto mb-12">Explore high-impact courses across engineering, design, data, and business with practical outcomes and portfolio-ready projects.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {
                allCourses.slice(0,4).map((course, index)=>(
                    <CourseCard key={index} course={course} />
                ))
            }
        </div>
                <Link to={'/course-list'} onClick={()=> scrollTo(0,0)}
                                className="block w-fit mx-auto theme-btn-primary px-8 py-3 rounded-full">Explore All Courses</Link>
    </div>
  )
}

export default CoursesSection