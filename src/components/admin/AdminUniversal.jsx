import React from 'react'
import Bottombar from '../Bottombar'
import AdminSideBar from './AdminSideBar'
import Navbar from '../Navbar'
import { Outlet } from 'react-router-dom'

const AdminUniversal = () => {
    return (
        <div className="h-screen w-full flex flex-col bg-[#D7D7E3] p-4 lg:pt-7 justify-between">
            <Navbar />

            <div className="flex flex-1 overflow-hidden py-4 lg:pt-5 lg:gap-5 md:gap-4">

                <aside className="w-fit h-full bg-white rounded-lg">
                    <AdminSideBar/>
                </aside>

                <main className="flex-1 h-full overflow-y-auto ">
                    <Outlet />
                </main>

                <aside className="w-fit h-full">
                    
                </aside>



            </div>
            <Bottombar />
        </div>
    )
}

export default AdminUniversal