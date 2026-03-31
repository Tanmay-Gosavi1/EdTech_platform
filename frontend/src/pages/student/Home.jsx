import React from 'react'
import Hero from '../../components/student/Hero.jsx'
import Companies from '../../components/student/Companies.jsx'
import CoursesSection from '../../components/student/CoursesSection.jsx'
import TestomonialsSection from '../../components/student/TestomonialsSection.jsx'
import CallToAction from '../../components/student/CallToAction.jsx'
import Footer from '../../components/student/Footer.jsx'

export const Home = () => {
  return (
    <div className='landing-page'>
      <Hero />
      <Companies />
      <CoursesSection />
      <TestomonialsSection />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default Home

