import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../../context/AppContext"
import Loading from '../../components/student/Loading.jsx';
import Modal from '../../components/common/Modal.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyCourse = () => {

  const { formatCurrency, backendUrl, isEducator, token }= useContext(AppContext);
  const navigate = useNavigate();

  const [courses, setCourses]= useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteCourse = async () => {
    if (!courseToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${backendUrl}/api/educator/courses/${courseToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCourses(response.data.allCourses || courses.filter((course) => course._id !== courseToDelete._id));
        toast.success(response.data.message || 'Course deleted successfully');
        setCourseToDelete(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return courses ? (
    <div className='min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-10'>
        
        <h2 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8'>
          My Courses
        </h2>
        <p className='text-sm sm:text-base text-slate-600 mb-4 sm:mb-6'>
          You can delete only the courses uploaded from your educator account.
        </p>

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

                  <th className='px-4 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-900 uppercase tracking-wide'>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-200'>
                {
                  courses.map((course)=>(
                    <tr 
                      key={course._id} 
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

                      <td className='px-4 sm:px-6 py-4 sm:py-5'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() => navigate(`/educator/edit-course/${course._id}`)}
                            className='rounded-lg border border-sky-200 px-3 py-2 text-xs sm:text-sm font-semibold text-sky-600 transition hover:bg-sky-50'
                          >
                            Edit
                          </button>
                          <button
                            type='button'
                            onClick={() => setCourseToDelete(course)}
                            disabled={isDeleting}
                            className='rounded-lg border border-red-200 px-3 py-2 text-xs sm:text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Modal
        isOpen={!!courseToDelete}
        title='Delete Course'
        description='This action is permanent. The course and related data can no longer be accessed.'
        onClose={() => !isDeleting && setCourseToDelete(null)}
      >
        {courseToDelete && (
          <p className='text-sm text-slate-700'>
            Are you sure you want to delete <span className='font-semibold'>{courseToDelete.courseTitle}</span>?
          </p>
        )}
        <div className='mt-5 flex justify-end gap-3'>
          <button
            type='button'
            onClick={() => setCourseToDelete(null)}
            disabled={isDeleting}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleDeleteCourse}
            disabled={isDeleting}
            className='rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
  : <Loading />
}

export default MyCourse