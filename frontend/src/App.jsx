import React, { useEffect } from 'react'
import { Route, Routes, useMatch, useLocation } from 'react-router-dom'

import Home from './pages/student/Home.jsx'
import CoursesList from './pages/student/CoursesList.jsx'
import CourseDetails from './pages/student/CourseDetails.jsx'
import MyEnrollments from './pages/student/MyEnrollments.jsx'
import Player from './pages/student/Player.jsx'
import Loading from './components/student/Loading.jsx'
import AddCourse from './pages/educator/AddCourse.jsx'
import Dashboard from './pages/educator/Dashboard.jsx'
import Educator from './pages/educator/Educator.jsx'
import MyCourse from './pages/educator/MyCourse.jsx'
import StudentsEnrolled from './pages/educator/StudentsEnrolled.jsx'
import Login from './pages/student/Login.jsx'
import Signup from './pages/student/Signup.jsx'
import VerifyPayment from './pages/student/VerifyPayment.jsx'

import Navbar from './components/student/Navbar.jsx'


import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

import "quill/dist/quill.snow.css";

const App = () => {

  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/signup']
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname)
  const isEducatorRoute = useMatch('/educator/*');

  useEffect(() => {
    if (location.state?.toast?.message) {
      const { type, message } = location.state.toast;
      if (type === 'success') toast.success(message);
      else if (type === 'info') toast.info(message);
      else toast.error(message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className='app-shell'>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        pauseOnHover
        newestOnTop
        closeOnClick
        theme="light"
        toastClassName="rounded-xl"
      />
      {!isEducatorRoute && shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/course-list' element={<CoursesList />}></Route>
        <Route path='/course-list/:input' element={<CoursesList />}></Route>
        <Route path='/course/:id' element={<CourseDetails />}></Route>
        <Route path='/my-enrollments' element={<MyEnrollments />}></Route>
        <Route path='/player/:courseId' element={<Player />}></Route>
        <Route path='/loading/:path' element={<Loading />}></Route>
        <Route path='/login' element ={<Login />}></Route>
        <Route path='/signup' element ={<Signup />}></Route>
        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard />}></Route>
          <Route path='my-courses' element={<MyCourse />}></Route>
          <Route path='students-enrolled' element={<StudentsEnrolled />}></Route>
          <Route path='add-course' element={<AddCourse />}></Route>
          
        </Route>
        <Route path='/verify' element={<VerifyPayment />}></Route>
      </Routes>
    </div>
  )
}

export default App