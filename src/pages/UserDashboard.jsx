import React from 'react'
import Navbar from '../components/userDashboard/Navbar'
import Sidebar from '../components/userDashboard/Sidebar'
import MainContent from '../components/userDashboard/MainContent'

const UserDashboard = () => {
    return (
        <div className="h-screen flex flex-col gap-4 py-7 px-7">
            <Navbar />

            <div className="flex flex-1 overflow-hidden gap-4">
                <Sidebar />

                <main className="flex-1 overflow-y-auto">
                    <MainContent />
                </main>
            </div>
        </div>
    )
}

export default UserDashboard
