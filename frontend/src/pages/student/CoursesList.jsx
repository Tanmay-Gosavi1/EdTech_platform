import React from 'react'
import {AppContext} from '../../context/AppContext.jsx'
import { useContext, useState, useEffect } from 'react'
import SearchBar from '../../components/student/SearchBar';
import {useParams} from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import {assets} from '../../assets/assets'
import Footer from '../../components/student/Footer.jsx';

const CoursesList = () => {
  const {navigate, allCourses }= useContext(AppContext);

  const {input}= useParams();

  const [filteredCourses, setFilteredCourses]= useState([]);

  useEffect(()=>{
    if(allCourses && allCourses.length > 0){
      const tempCourses= allCourses.slice()

      input ? 
      setFilteredCourses(tempCourses.filter((item)=>{
        return item.courseTitle.toLowerCase().includes(input.toLowerCase());
      }))
      : setFilteredCourses(tempCourses);
    }
  },[allCourses, input])

  return (
    <>  
      <div className='min-h-screen'>
        <div className='theme-surface-soft py-8 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='shrink-0'>
              <h1 className='theme-section-title text-3xl sm:text-4xl font-bold mb-3'>Course List</h1>
              <p className='text-sm text-slate-600'>
                <span onClick={()=> navigate('/')} className='hover:text-sky-600 cursor-pointer transition-colors duration-200'>Home</span> / <span className='text-slate-900 font-medium'>Course List</span>
              </p>
            </div>
            <div className='flex-1 max-w-2xl'>
              <SearchBar data={input}/>
            </div>
          </div>
        </div>

        {
          input && <div className='w-full mx-auto gap-4 px-4 py-2 -mb-8 text-slate-600'>
            <div className='flex items-center w-full gap-2 justify-center' >
              <p className='text-md font-medium capitalize'>{input}</p>
              <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={()=> navigate('/course-list')}/>
            </div>
          </div>
        }

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {
              filteredCourses.map((course, index)=>(
                  <CourseCard key={index} course={course} />
              ))
            }
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CoursesList