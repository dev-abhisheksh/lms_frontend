import React from 'react'
import Navbar from '../components/userDashboard/Navbar'
import Sidebar from '../components/userDashboard/Sidebar'
import MainContent from '../components/userDashboard/MainContent'
import Bottombar from '../components/userDashboard/Bottombar'

const UserDashboard = () => {
    return (
        <div className="h-screen flex flex-col gap-3 lg:gap-4 py-3 px-3 lg:py-7 lg:px-7">
            <Navbar />

            <div className="flex flex-1 overflow-hidden gap-4">
                <Sidebar />

                <main className="flex-1 overflow-y-auto">
                    <MainContent />
                </main>
            </div>

            <Bottombar />
        </div>
    )
}

export default UserDashboard
