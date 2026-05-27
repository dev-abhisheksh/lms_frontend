import React from 'react'
import { MdNotifications, MdClose } from 'react-icons/md'
import { useNotifications } from '../contexts/NotificationContext';

const AlertAndNoti = () => {
  const { notificationsVisible, toggleNotifications } = useNotifications();

  if (!notificationsVisible) {
    return null;
  }

  return (
    <div className='hidden lg:flex flex-col bg-white w-full h-full p-3 rounded-lg'>
      {/* Toggle Button */}
      <button
        onClick={toggleNotifications}
        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition mb-2"
      >
        <div className="flex items-center gap-2">
          <MdNotifications className="w-5 h-5 text-[#7034FF]" />
          <span className="text-sm font-semibold text-gray-700">Alerts & Notifications</span>
        </div>
        <MdClose className={`w-5 h-5 text-gray-500 transition-transform`} />
      </button>

      {/* Notifications Panel */}
      <div className='w-full h-full bg-[#D5C7FF] rounded-lg lg:flex justify-center p-3 flex-1'>
        <div className='w-full h-fit px-3 py-2 rounded-lg bg-[#7034FF] flex justify-center'>
          <h1 className='text-white font-semibold text-sm'>No new alerts or notifications</h1>
        </div>
      </div>
    </div>
  )
}

export default AlertAndNoti