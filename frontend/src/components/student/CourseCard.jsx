import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext.jsx'
import {assets} from '../../assets/assets'
import { Link } from 'react-router-dom';

const CourseCard = ({course}) => {

    const { formatCurrency, calculateRating, user }= useContext(AppContext);
  return (
    <Link to={'/course/' + course._id} className="block theme-surface overflow-hidden group transition-transform duration-200 hover:-translate-y-1" onClick={()=> scrollTo(0,0)}>
        <img src={course.courseThumbnail} alt="Course Image" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="p-4 space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 group-hover:text-sky-700 transition-colors duration-200">{course.courseTitle}</h3>
            <p className="text-sm text-slate-600 font-medium">{course.educator.name}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800">{calculateRating(course)}</p>
                <div className="flex items-center gap-0.5">
                    {
                        [...Array(5)].map((_,i)=>(
                            <img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt="Rating Block" className="w-4 h-4" />
                        ))
                    }
                </div>
                    <p className="text-sm text-slate-500">({course.courseRatings.length})</p>
                </div>
                {/* <div>
                    <h1 className='block text-xs'>{course.enrolledStudents?.length || 5}+ Students Enrolled </h1>
                </div> */}
                <p className="text-xl font-bold text-indigo-900">{formatCurrency(course.coursePrice - course.discount*course.coursePrice/100)}</p>
        </div>
    </Link>
  )
}

export default CourseCard