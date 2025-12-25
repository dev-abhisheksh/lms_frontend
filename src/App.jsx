import React from 'react'
import UserDashboard from './pages/UserDashboard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import CourseDetailspage from './pages/CourseDetailspage'
import CourseDetails from './components/courseDetailsPage/CourseDetails'
import Login from './pages/Login'
import CourseDetailsPage from './pages/CourseDetailspage'

const App = () => {
  return (
    <BrowserRouter>

      <div className='h-screen w-full bg-[#D7D7E3]'>

        <Routes>
          <Route path='/' element={<UserDashboard />} />

          <Route path='/course/:courseId' element={<CourseDetailsPage />} />

          <Route path='/login' element={<Login />} />
        </Routes>

      </div>

    </BrowserRouter>
  )
}

export default App