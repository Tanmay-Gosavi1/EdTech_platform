import React ,{useEffect, useState} from 'react'
import Loading from '../../components/student/Loading.jsx';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentsEnrolled = () => {

  const {backendUrl, token, isEducator}= useContext(AppContext);

  const [enrolledStudents, setEnrolledStudents]= useState(null);

  const fetchEnrolledStudents= async ()=>{
    try{
      const response= await axios.get(backendUrl + '/api/educator/enrolled-students',{
        headers: {Authorization: `Bearer ${token}`}
      });
      if(response.data.success){
        setEnrolledStudents(response.data.enrolledStudents.reverse());
      }else{
        toast.error(response.data.message);
      }
    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(()=>{
    if(isEducator){
      fetchEnrolledStudents();
    }
  },[isEducator]);

  return enrolledStudents ? (
    <div className='min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        <h2 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8'>Students Enrolled</h2>
        <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
        <table className='w-full min-w-190'>
          <thead className='bg-linear-to-r from-sky-50 to-cyan-50 border-b border-slate-200'>
            <tr>
              <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                #
              </th>

              <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                Student name
              </th>

              <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                Course Title
              </th>

              <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                Date
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-200'>
            {
              enrolledStudents.map((item, index)=>(
                <tr 
                  key={index} 
                  className='hover:bg-gray-50 transition-colors duration-200'
                >
                  <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-medium text-gray-700'>
                    {index + 1}
                  </td>

                  <td className='px-4 sm:px-6 py-4 sm:py-5'>
                    <div className='flex items-center gap-4'>
                      <span className='font-semibold text-gray-900 text-sm sm:text-base'>
                        {item.student.name}
                      </span>
                    </div>
                  </td>

                  <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-medium text-gray-700'>
                    {item.courseTitle}
                  </td>

                  <td className='px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base text-gray-600'>
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default StudentsEnrolled