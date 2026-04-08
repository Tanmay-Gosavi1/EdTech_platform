import React from 'react'
import { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext.jsx'
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import {ArrowRight} from 'lucide-react'

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
            
            const lectureCompleted = response.data.progressData && response.data.progressData?.lectureCompleted
                                    ? response.data.progressData?.lectureCompleted?.length
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

          {enrolledCourses.length === 0 && (
            <div className='w-full py-20 flex flex-col items-center justify-center gap-4'>
              <h1 className='text-xl font-semibold text-gray-700'>You have not enrolled in any courses yet.</h1>
              <button onClick={() => navigate('/courses')} className='theme-btn-primary px-8 py-3 text-md cursor-pointer hover:scale-105 transition-all duration-200'>
                Explore Courses
              </button>
            </div>
          )}

          <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
            {enrolledCourses.map((course,index)=>(
              <div key={index} className='rounded-lg border border-t-2 border-gray-300/30 shadow-md shadow-black/20 bg-white hover:scale-[1.02] transition-all duration-200 hover:shadow-lg'>
                  <div>
                    <img
                     src={course.courseThumbnail} alt={course.courseTitle}
                      className='w-full h-60 bg-cover shadow-md'
                     />
                  </div>
                  <div className='p-5'>
                    <h1 className='font-semibold text-lg mb-3'>
                      {course.courseTitle.substring(0, 35)} {course.courseTitle.length > 30 ? '...' : ''}
                    </h1>
                    <div className='my-4'>
                      <div className='flex items-center justify-between mb-1'>
                        <h1 className='font-medium text-sm '>
                          Progress
                        </h1>
                        <h1 className='font-medium text-sm '
                         >{progressArray[index] ? Math.round((progressArray[index].lectureCompleted / progressArray[index].totalLectures) * 100) : 0}%</h1>
                      </div>
                      <Line strokeWidth={2} percent={progressArray[index] ? (progressArray[index]?.lectureCompleted / progressArray[index]?.totalLectures) * 100 : 0} className= 'bg-gray-200 rounded-full mb-1' />
                      <h3 className='text-xs font-medium text-gray-500'
                       >{progressArray[index]?.lectureCompleted} of {progressArray[index]?.totalLectures} lessons completed</h3>
                    </div>

                    <div className='w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-md text-sm font-medium cursor-pointer hover:scale-105 bg-black text-white transition-all duration-200'
                     onClick={()=>navigate('/player/'+course._id)} >
                      Continue Learning
                      <span>
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments