import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import Loading from '../../components/student/Loading.jsx'

const Signup = () => {
  const { navigate, backendUrl, setToken, setUser, setLogin } = useContext(AppContext)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (data) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const signupData = {
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }

      const response = await axios.post(
        backendUrl + '/api/signup',
        signupData
      )

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setToken(response.data.token)
        setUser(response.data.user)
        setLogin(true);
        navigate('/')
      } else {
        setErrorMessage(response.data.message || 'Signup failed.')
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        'An error occurred during signup.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const password = watch('password')

  // ✅ GLOBAL LOADING COMPONENT
  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign up to get started
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                placeholder="First Name"
                className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                placeholder="Last Name"
                className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

          {/* Password */}
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

          {/* Confirm Password */}
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Confirm password',
              validate: value => value === password || 'Passwords do not match',
            })}
            placeholder="Confirm Password"
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-200"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
          >
            Sign Up
          </button>
        </form>

        {/* Login */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Signup
