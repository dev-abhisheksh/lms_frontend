import React from 'react'
import UserDashboard from './pages/UserDashboard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CourseDetailspage from './pages/CourseDetailspage'

const App = () => {
  return (
    <BrowserRouter>

      <div className='h-screen w-full bg-[#D7D7E3]'>

        <Routes>
          <Route path='/' element={<UserDashboard />} />

          <Route path='/courses' element={<CourseDetailspage />} />
        </Routes>

      </div>

    </BrowserRouter>
  )
}

export default App