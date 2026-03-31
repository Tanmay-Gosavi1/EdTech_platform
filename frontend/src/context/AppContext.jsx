import React, { useEffect , useState } from 'react'
import {createContext} from 'react'
import {dummyCourses} from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import axios from 'axios'
import {toast} from 'react-toastify'

export const AppContext= createContext();

export const AppContextProvider = (props) => {

    const currencyCode = (import.meta.env.VITE_CURRENCY || 'USD').replace(/['"]/g, '').trim().toUpperCase();

    const formatCurrency = (amount) => {
      const value = Number(amount);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number.isFinite(value) ? value : 0);
    };

    const navigate= useNavigate();

     // New user authentication state
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [login, setLogin]= useState(false);

    const [isAlreadyEnrolled, setIsAlreadyEnrolled]= useState(false);

    const backendUrl= import.meta.env.VITE_BACKEND_URL;

    const [allCourses, setAllCourses]= useState([]);

    const [isEducator, setEducator]= useState(localStorage.getItem('isEducator') === 'true');

    const [enrolledCourses, setEnrolledCourses]= useState([]);


    // for reload of page and user stays logged in
    useEffect(()=>{
      if(token){
        setLogin(true);
      }
    },[token]);

    
    //Fetch User data
    const fetchUserData = async () => {
      setLoading(true)
      try {
        if (token) {
          const response = await axios.get(
            backendUrl + '/api/user-info',
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (response.data.success) {
            setUser(response.data.user)
            setEducator(response.data.user.role === 'educator')
          } else {
            toast.error(response.data.message)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.log("Error fetching user data:", error)
        setUser(null)
        setToken(null)
        setLogin(false)
        setEducator(false)
        localStorage.removeItem('token')
        localStorage.setItem('isEducator', 'false')
      } finally {
        setLoading(false)
      }
    }


    useEffect(()=>{
      fetchUserData();
    },[token])

    // Logout function
  const logoutUser = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/')
  }
    // Fetch All Courses
    const fetchAllCourses = async ()=>{
      try{
        const response= await axios.get(backendUrl + '/api/course/all');
        if(response.data.success){
          setAllCourses(response.data.courses);
        }else{
          toast.error(response.data.message);
        }
      }catch(error){
        console.log("Error fetching all courses:", error);
        toast.error(error.message);
      }
    }

    useEffect(()=>{
      fetchAllCourses();
    },[])

    // Function to calculate average Rating of Course
    const calculateRating= (course)=>{
      if(course.courseRatings.length === 0) return 0;
      let totalRating = 0;
      course.courseRatings.forEach(rating=>{
        totalRating+= rating.rating;
      })

      totalRating= Math.floor(totalRating / course.courseRatings.length);
      return totalRating;
    }

    // Function to Calculate Course Chapter Time
    const formatDuration = (minutes) => {
      const safeMinutes = Number(minutes);
      const totalSeconds = Math.max(0, Math.round((Number.isFinite(safeMinutes) ? safeMinutes : 0) * 60));

      return humanizeDuration(totalSeconds * 1000, {
        units: ['h', 'm'],
        round: true,
        largest: 2,
      });
    }

    const calculateChapterTime= (chapter)=>{
      let totalTime= 0;
      chapter.chapterContent.map((lecture)=>{
        totalTime+= lecture.lectureDuration;
      })
      return formatDuration(totalTime);
    }

    const calculateCourseDuration= (course)=>{
      let totalTime= 0;
      course.courseContent.map((chapter)=> chapter.chapterContent.map((lecture)=>{
        totalTime+= lecture.lectureDuration;
      }))
      return formatDuration(totalTime);
    }

    const calculateNumberOfLectures= (course)=>{
      let totalLectures= 0;
      course.courseContent.map((chapter)=> {
        if(Array.isArray(chapter.chapterContent)){
          totalLectures+= chapter.chapterContent.length;
        }
      });
      return totalLectures;
    }

    //Fetch User Enrolled Courses
    const fetchUserEnrolledCourses= async ()=>{
      // API Call to fetch enrolled coursess
      try{
        const response= await axios.get(backendUrl + '/api/user/enrolled-courses', {
          headers: {Authorization: `Bearer ${token}`}
        })
        if(response.data.success){
          setEnrolledCourses(response.data.enrolledCourses.reverse());
        }else{
          toast.error(response.data.message);
        }
      }
      catch(error){
        console.log("Error fetching user enrolled courses:", error.message);
        toast.error(error.message);
      }
    }

    useEffect(()=>{
      if(token){
      fetchUserEnrolledCourses();
      }
    },[token])

    const value = {
        login,
        setLogin,
        user,
        setUser,
        isAlreadyEnrolled, setIsAlreadyEnrolled,
        loading,
        setLoading,
        token,
        logoutUser,
        backendUrl,
        setToken,
        currency: currencyCode,
        formatCurrency,
        allCourses, setAllCourses,
        navigate,
        calculateRating,
        isEducator, setEducator,
        calculateChapterTime, calculateCourseDuration, calculateNumberOfLectures,
        formatDuration,
        enrolledCourses, setEnrolledCourses, fetchUserEnrolledCourses,
        fetchUserData, fetchAllCourses
    }
  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  )
}
