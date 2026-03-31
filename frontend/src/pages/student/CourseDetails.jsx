import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {AppContext} from '../../context/AppContext.jsx'
import Loading from '../../components/student/Loading.jsx';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer.jsx';
import Youtube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getYoutubeVideoId } from '../../utils/youtube.js';

const CourseDetails = () => {

  const {id}= useParams();

  const [courseData, setCourseData]= useState(null);

  const {calculateRating, calculateChapterTime, calculateCourseDuration, calculateNumberOfLectures, formatCurrency, formatDuration, backendUrl, user, token, isAlreadyEnrolled }= useContext(AppContext);

  const [openSections, setOpenSections]= useState({});

  const [playerData, setPlayerData]= useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchCourseData= useCallback(async ()=>{
    try{
      const response= await axios.get(backendUrl + '/api/course/' + id);
      if(response.data.success){
        setCourseData(response.data.course);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      console.log("Error fetching course data:", error);
      toast.error(error.message);
    }
  }, [backendUrl, id])

  useEffect(()=>{
    fetchCourseData();
  }, [fetchCourseData]);

  const enrollCourse= async ()=>{
    if (isEnrolling) {
      return;
    }
    if(!user){
      return toast.info("Please login to enroll in the course");
    }
    if(isAlreadyEnrolled){
      return toast.info("You are already enrolled in this course");
    }
    try{
      setIsEnrolling(true);
      const response= await axios.post(backendUrl + '/api/user/purchase',{
        courseId: courseData._id
      },{
        headers: {
          Authorization : `Bearer ${token}`
        }
      });
      if(response.data.success){
        const {session_url}= response.data;
        window.location.replace(session_url);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      console.log("Error while purchasing the course", error.message);
      toast.error(error.message);
    } finally {
      setIsEnrolling(false);
    }
  }

  const toggleSection = (index)=>{
    setOpenSections((prev)=>(
      {...prev,
      [index] :!prev[index],
      }
    ))
  }

  const handlePreviewClick = (lectureUrl) => {
    const videoId = getYoutubeVideoId(lectureUrl);

    if (!videoId) {
      toast.error('Invalid YouTube URL for this preview lecture.');
      return;
    }

    setPlayerData({ videoId });
  };

  return  courseData ? (
    <>
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white border-b border-gray-200'>

      </div>
      {/* Left Column */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10'>
          <div className='lg:col-span-2 space-y-6 sm:space-y-8'>
              <div className='space-y-3 sm:space-y-4'>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight'>{courseData.courseTitle}</h1>
                <p className='text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed' dangerouslySetInnerHTML={{__html: courseData.courseDescription.slice(0,200)}}></p>
              </div>
              {/* Reviews and Ratings */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-wrap pb-4 sm:pb-6 border-b border-gray-200">
                              <div className='flex items-center gap-2'>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{calculateRating(courseData)}</p>
                                <div className="flex items-center gap-0.5">
                                    {
                                        [...Array(5)].map((_,i)=>(
                                            <img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="Rating Block" className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ))
                                    }
                                </div>
                              </div>
                              <p className="text-sm sm:text-base text-gray-600">({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? "ratings" : "rating"})</p>

                              <p className='text-sm sm:text-base text-gray-600 flex items-center gap-1'>
                                <span className='font-semibold text-gray-900'>{courseData.enrolledStudents.length}</span> {courseData.enrolledStudents.length > 1 ? "students enrolled" : "student enrolled"}
                              </p>
                              <p className='text-sm sm:text-base text-gray-600'>Created by <span className='font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'>{courseData.educator.name}</span></p>
                          </div>
                  
                  <div className='bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200'>
                      <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>Course Structure</h2>
                    </div>
                    <div className='p-4 sm:p-6 space-y-2 sm:space-y-3'>
                      {
                        courseData.courseContent.map((chapter, index)=>(
                          <div key={index} className='border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors duration-200'>
                            <div onClick={()=> toggleSection(index)} className='bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors duration-200 p-3 sm:p-4 lg:p-5'>
                              <div className='flex items-center justify-between gap-2'>
                                <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                                  <img className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transform transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''}`}
                                   src={assets.down_arrow_icon} alt="arrow icon" />
                                  <p className='font-semibold text-gray-900 text-sm sm:text-base truncate'>{chapter.chapterTitle}</p>
                                </div>
                                <p className='text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap'>{chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}</p>
                              </div>
                            </div>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSections[index] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                              <ul className='bg-white divide-y divide-gray-100'>
                                { 
                                  chapter.chapterContent.map((lecture, idx)=>(
                                    <li key={idx} className='p-3 sm:p-4 hover:bg-blue-50 transition-colors duration-200 cursor-pointer'>
                                      <div className='flex items-start gap-3 sm:gap-4'>
                                        <img src={assets.play_icon} alt="play icon" className='w-5 h-5 sm:w-6 sm:h-6 mt-0.5 flex-shrink-0 opacity-70'/>
                                        <div className='flex-1 min-w-0'>
                                          <p className='font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base'>{lecture.lectureTitle}</p>
                                          <div className='flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap'>
                                              {lecture.isPreviewFree && <p onClick={() => handlePreviewClick(lecture.lectureUrl)} className='bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs hover:bg-green-200 transition-colors'>Preview</p>}
                                              <p className='hidden'>{lecture.lectureDuration}</p>
                                              <p className='flex items-center gap-1 sm:gap-1.5'>
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatDuration(lecture.lectureDuration)}
                                              </p>
                                            </div>
                                        </div>
                                      </div>
                                    </li>
                                  )
                                )
                              }
                              </ul>
                            </div>
                          </div>  
                        ))
                      }
                    </div>
                  </div>

                  <div className='bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200'>
                      <h3 className='text-xl sm:text-2xl font-bold text-gray-900'>Course Description</h3>
                    </div>
                    <div className='p-4 sm:p-6'>
                      <p className='text-sm sm:text-base text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{__html: courseData.courseDescription}}></p>
                    </div>
                  </div>
          </div>
          {/* Right Column */}
          <div className='lg:col-span-1'>
              <div className='lg:sticky lg:top-6 bg-white rounded-lg sm:rounded-xl shadow-xl border border-gray-200 overflow-hidden'>
                <div className='relative w-full'>
                  {
                    playerData ? 
                    <div>
                    <div className='w-full aspect-video'>
                      <Youtube 
                        videoId={playerData.videoId} 
                        opts={{
                          width: '100%',
                          height: '100%',
                          playerVars: {
                            autoplay: 1
                          }
                        }} 
                        className='w-full h-full'
                        iframeClassName='w-full h-full'
                      />
                    </div>
                    <div className="flex justify-end px-6 pt-2">
                    <button
                      onClick={() => setPlayerData(null)}
                      className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                    >
                      Close video
                    </button>
                  </div>
                    </div>
                    : <img src={courseData.courseThumbnail} alt={courseData.courseTitle} className='w-full h-48 sm:h-56 lg:h-64 object-cover'/>
                  }
                  {!playerData && <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none'></div>}
                </div>
                
                <div className='p-4 sm:p-6 space-y-4 sm:space-y-5'>
                  <div className='bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3'>

                    <img src={assets.time_left_clock_icon} alt="time left clock icon" className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0'/>

                    <p className='text-xs sm:text-sm text-red-700 font-medium'><span className='font-bold text-sm sm:text-base'>5 Days</span> left at this price!</p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-baseline gap-2 sm:gap-3 flex-wrap'>
                      <p className='text-3xl sm:text-4xl font-bold text-gray-900'>{formatCurrency(courseData.coursePrice - courseData.discount*courseData.coursePrice/100)}</p>
                      <p className='text-lg sm:text-xl text-gray-400 line-through'>{formatCurrency(courseData.coursePrice)}</p>
                    </div>
                    <div className='inline-flex items-center gap-2'>
                      <p className='bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-md'>{courseData.discount}% OFF</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between py-4 sm:py-5 border-y border-gray-200'>
                    <div className='flex items-center gap-1 sm:gap-2'>
                      <img src={assets.star} alt="star icon" className='w-4 h-4 sm:w-5 sm:h-5'/>
                      <p className='text-xs sm:text-sm font-bold text-gray-900'>{calculateRating(courseData)}</p>
                    </div>
                      
                      {/* Vertical line */}
                    <div className='w-px h-6 sm:h-8 bg-gray-300'></div>
                    <div className='flex items-center gap-1 sm:gap-2'>
                      <img src={assets.time_clock_icon} alt="time icon" className='w-4 h-4 sm:w-5 sm:h-5'/>
                      <p className='text-xs sm:text-sm font-semibold text-gray-700'>{calculateCourseDuration(courseData)}</p>
                    </div>

                    {/* Vertical line */}
                    <div className='w-px h-6 sm:h-8 bg-gray-300'></div>
                    <div className='flex items-center gap-1 sm:gap-2'>
                      <img src={assets.lesson_icon} alt="lesson icon" className='w-4 h-4 sm:w-5 sm:h-5'/>
                      <p className='text-xs sm:text-sm font-semibold text-gray-700'>{calculateNumberOfLectures(courseData)}</p>
                    </div>
                  </div>
                  {/* onClick={enrollCourse} */}
                  <button
                    onClick={enrollCourse}
                    disabled={isAlreadyEnrolled || isEnrolling}
                    className={`w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-lg text-sm sm:text-base ${isAlreadyEnrolled || isEnrolling ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'}`}
                  >
                    {isAlreadyEnrolled ? "Already Enrolled" : isEnrolling ? 'Redirecting to payment...' : "Enroll Now"}
                  </button>

                  <div className='bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-200'>
                    <p className='font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg'>What's included:</p>
                    <ul className='space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700'>
                      <li className='flex items-start gap-2 sm:gap-3'>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Lifetime access with free updates</span>
                      </li>
                      <li className='flex items-start gap-2 sm:gap-3'>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Step-by-step, hands-on project guidance</span>
                      </li>
                      <li className='flex items-start gap-2 sm:gap-3'>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Downloadable resources and source code</span>
                      </li>
                      <li className='flex items-start gap-2 sm:gap-3'>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Quizzes to test your knowledge</span>
                      </li>
                      <li className='flex items-start gap-2 sm:gap-3'>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Certificates of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>
    <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails