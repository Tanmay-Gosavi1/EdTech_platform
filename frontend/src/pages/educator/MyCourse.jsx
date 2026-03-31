import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../../context/AppContext"
import Loading from '../../components/student/Loading.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyCourse = () => {

  const { formatCurrency, backendUrl, isEducator, token }= useContext(AppContext);

  const [courses, setCourses]= useState(null);

  const fetchCourseData= async ()=>{
    try{
      const response= await axios.get(backendUrl + '/api/educator/courses',{
        headers: {Authorization: `Bearer ${token}`}
      });
      if(response.data.success){
        setCourses(response.data.courses);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    if(isEducator){
      fetchCourseData();
    }
  },[isEducator]);

  return courses ? (
    <div className='min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        
        <h2 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8'>
          My Courses
        </h2>

        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-190'>
              <thead className='bg-linear-to-r from-sky-50 to-cyan-50 border-b border-slate-200'>
                <tr>
                  <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                    All Courses
                  </th>

                  <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                    Earning
                  </th>

                  <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                    Students
                  </th>

                  <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                    Published On
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-200'>
                {
                  courses.map((course, index)=>(
                    <tr 
                      key={course.id} 
                      className='hover:bg-gray-50 transition-colors duration-200'
                    >
                      <td className='px-4 sm:px-6 py-4 sm:py-5'>
                        <div className='flex items-center gap-3 sm:gap-4'>
                          <img 
                            src={course.courseThumbnail} 
                            alt="course Thumbnail" 
                            className='w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0 shadow-sm border border-slate-200'
                          />

                          <span className='font-semibold text-gray-900 text-sm sm:text-base line-clamp-2'>
                            {course.courseTitle}
                          </span>
                        </div>
                      </td>

                      <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-semibold text-emerald-600'>
                        {formatCurrency(course.enrolledStudents.length * (course.coursePrice - course.discount*course.coursePrice/100))}
                      </td>

                      <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-medium text-gray-700'>
                        {course.enrolledStudents.length}
                      </td>

                      <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base text-gray-600'>
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
  : <Loading />
}

export default MyCourse