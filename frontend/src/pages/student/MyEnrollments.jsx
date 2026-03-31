import React from 'react'
import { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext.jsx'
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyEnrollments = () => {
  const {enrolledCourses, calculateCourseDuration, navigate, user, fetchUserEnrolledCourses, backendUrl, token, calculateNumberOfLectures } = useContext(AppContext);

  const [progressArray, setProgressArray]= React.useState(
    []
  );
  
  const getCourseProgress= async ()=>{
    try{
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course)=>{
          try{
            const response= await axios.post(backendUrl + '/api/user/get-course-progress',{courseId : course._id}, {headers: {Authorization: `Bearer ${token}`}});
            let totalLectures= calculateNumberOfLectures(course);
            
            const lectureCompleted = response.data.progressData && response.data.progressData.lectureCompleted
                                    ? response.data.progressData.lectureCompleted.length
                                    : 0;

            return {totalLectures: totalLectures, lectureCompleted: lectureCompleted};
          }catch(error){
            console.log("Error fetching course progress for courseId:", course._id, error.message);
          }
        })
      )
      setProgressArray(tempProgressArray);
    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    if(user){
      fetchUserEnrolledCourses();
    }
  },[user])

  useEffect(()=>{
    if(enrolledCourses.length > 0){
      getCourseProgress();
    }
  },[enrolledCourses])

  return (
    <>
      <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='theme-section-title text-3xl sm:text-4xl font-bold text-slate-900 mb-8'>My Enrollments</h1>
          
          <div className='theme-surface overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-linear-to-r from-sky-50 to-violet-50 border-b border-slate-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Course</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Duration</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Completed</th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>Status</th>
                  </tr>
                </thead>
                
                <tbody className='divide-y divide-gray-200'>
                  {enrolledCourses.map((course,index)=>(
                    <tr key={index} className='hover:bg-slate-50 transition-colors duration-200'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-4'>
                          <img src={course.courseThumbnail} alt="course thumbnail" className='w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 shadow-sm'/>
                          
                          <div className='min-w-0'>
                            <p className='font-semibold text-gray-900 text-sm sm:text-base line-clamp-2'>{course.courseTitle}</p>
                            <Line strokeWidth={2} percent={progressArray[index] ? (progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100 : 0} className= 'bg-gray-300 rounded-full' />
                          </div>
                        </div>
                      </td>
                      
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-gray-700'>{calculateCourseDuration(course)}</p>
                      </td>
                      
                      <td className='px-6 py-4'>
                        <p className='text-sm text-gray-700'>
                          {progressArray[index] && `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`} <span className='text-gray-500'>Lectures</span>
                        </p>
                      </td>
                      
                      <td className='px-6 py-4'>
                        <button onClick={()=>navigate('/player/'+course._id)} className='theme-btn-ghost px-4 py-2 text-sm'>
                          {progressArray[index] && progressArray[index].lectureCompleted === progressArray[index].totalLectures ? 'Completed' : 'On Going'}
                        </button>
                      </td>
                    </tr>
                  ))} 
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments