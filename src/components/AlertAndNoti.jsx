import React from 'react'
import { MdNotifications, MdClose, MdQuiz, MdAssignment } from 'react-icons/md'
import { useNotifications } from '../contexts/NotificationContext';

const AlertAndNoti = () => {
  const { notificationsVisible, toggleNotifications, notifications, removeNotification } = useNotifications();

  if (!notificationsVisible) {
    return null;
  }

  return (
    <div className='hidden lg:flex flex-col bg-white w-full h-full p-4 rounded-xl shadow-sm border border-gray-100'>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <MdNotifications className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-gray-900">Notifications</span>
        </div>
        <button onClick={toggleNotifications} className="p-1 hover:bg-gray-100 rounded-md transition">
          <MdClose className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <MdNotifications className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400 leading-tight">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="group relative bg-gray-50 hover:bg-indigo-50/50 p-3 rounded-xl border border-transparent hover:border-indigo-100 transition-all">
              <div className="flex gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  notif.type === 'test' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {notif.type === 'test' ? <MdQuiz className="w-4 h-4" /> : <MdAssignment className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  onClick={() => removeNotification(notif.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white hover:text-red-500 rounded transition shrink-0 h-fit"
                >
                  <MdClose className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlertAndNoti