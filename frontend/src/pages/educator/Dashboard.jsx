import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import Loading from '../../components/student/Loading.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {

  const { formatCurrency, backendUrl, token, isEducator }= useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData= async ()=>{
    try{
      const response= await axios.get(backendUrl + '/api/educator/dashboard',{
        headers: {Authorization: `Bearer ${token}`}
      });
      if(response.data.success){
        setDashboardData(response.data.dashboardData);
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    if(isEducator){
      fetchDashboardData();
    }
  },[isEducator]);

  return dashboardData ? (
    <div className='min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900'>Educator Dashboard</h1>
          <p className='text-sm sm:text-base text-slate-600 mt-1'>Track enrollments, courses, and revenue at a glance.</p>
        </div>
        
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10'>
          
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center gap-4'>
              <img 
                src={assets.patients_icon} 
                alt="patients_icon" 
                className='w-14 h-14 sm:w-16 sm:h-16'
              />

              <div>
                <p className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1'>
                  {dashboardData.enrolledStudentsData.length}
                </p>

                <p className='text-sm sm:text-base text-slate-600 font-medium'>
                  Total Enrollments
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center gap-4'>
              <img 
                src={assets.appointments_icon} 
                alt="courses_icon" 
                className='w-14 h-14 sm:w-16 sm:h-16'
              />

              <div>
                <p className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1'>
                  {dashboardData.totalCourses}
                </p>

                <p className='text-sm sm:text-base text-slate-600 font-medium'>
                  Total Courses
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center gap-4'>
              <img 
                src={assets.earning_icon} 
                alt="earning_icon" 
                className='w-14 h-14 sm:w-16 sm:h-16'
              />

              <div>
                <p className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1'>
                  {formatCurrency(dashboardData.totalEarning/100)}
                </p>

                <p className='text-sm sm:text-base text-slate-600 font-medium'>
                  Total Earnings
                </p>
              </div>
            </div>
          </div>

        </div>


        {/* Latest Enrollments Table */}
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
          <div className='bg-linear-to-r from-sky-50 to-cyan-50 p-4 sm:p-6 border-b border-slate-200'>
            <h2 className='text-xl sm:text-2xl font-bold text-slate-900'>
              Latest Enrollments
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    #
                  </th>

                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Student Name
                  </th>

                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-900'>
                    Course Title
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-200'>
                {dashboardData.enrolledStudentsData.map((item, index)=>(
                  <tr 
                    key={index} 
                    className='hover:bg-gray-50 transition-colors duration-200'
                  >
                    <td className='px-6 py-5 text-sm font-medium text-gray-700'>
                      {index + 1}
                    </td>

                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4'>
                        <span className='font-semibold text-gray-900 text-sm sm:text-base'>
                          {item.student.name}
                        </span>
                      </div>
                    </td>

                    <td className='px-6 py-5 text-sm sm:text-base text-gray-700 font-medium'>
                      {item.courseTitle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  ) : <Loading />
}

export default Dashboard