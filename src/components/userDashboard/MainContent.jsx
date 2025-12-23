import React from 'react'
import AlertAndNoti from './AlertAndNoti'
import Grids from './Grids'

const MainContent = () => {
    return (
        <div className='bg-[#F5F7FB] rounded-xl h-full flex justify-between p-2 lg:p-4 gap-4'>
            <Grids/>
            <AlertAndNoti/>
        </div>
    )
}

export default MainContent