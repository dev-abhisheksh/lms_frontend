import React from 'react'
import UserDashboard from './pages/UserDashboard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import CourseDetailspage from './pages/CourseDetailspage'
import CourseDetails from './components/courseDetailsPage/CourseDetails'
import Login from './pages/Login'

const App = () => {
  return (
    <BrowserRouter>

      <div className='h-screen w-full bg-[#D7D7E3]'>

        <Routes>
          <Route path='/' element={<UserDashboard />} />

          <Route path='/courses/:courseId' element={<CourseDetails />} />

          <Route path='/login' element={<Login />} />
        </Routes>

      </div>

    </BrowserRouter>
  )
}

export default App