import React from 'react'
import { MdNotifications, MdClose, MdQuiz, MdAssignment, MdCampaign } from 'react-icons/md'
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AlertAndNoti = () => {
  const { 
    notificationsVisible, 
    toggleNotifications, 
    notifications, 
    removeNotification, 
    markNotificationRead,
    markAllRead,
    unreadCount 
  } = useNotifications();
  
  const navigate = useNavigate();

  if (!notificationsVisible) {
    return null;
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationRead(notif._id || notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'test': return <MdQuiz className="w-4 h-4" />;
      case 'announcement': return <MdCampaign className="w-4 h-4" />;
      default: return <MdAssignment className="w-4 h-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'test': return 'bg-orange-100 text-orange-600';
      case 'announcement': return 'bg-purple-100 text-purple-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className='hidden lg:flex flex-col bg-white w-full h-full p-4 rounded-xl shadow-sm border border-gray-100'>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <MdNotifications className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-900">Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              Mark all read
            </button>
          )}
          <button onClick={toggleNotifications} className="p-1 hover:bg-gray-100 rounded-md transition">
            <MdClose className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <MdNotifications className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400 leading-tight">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id || notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                notif.isRead 
                  ? 'bg-gray-50/50 border-transparent grayscale-[0.5]' 
                  : 'bg-indigo-50/30 border-indigo-50 hover:bg-indigo-50/50 hover:border-indigo-100'
              }`}
            >
              <div className="flex gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-[11px] font-bold truncate ${notif.isRead ? 'text-gray-500' : 'text-indigo-600'}`}>
                      {notif.title || (notif.type?.toUpperCase())}
                    </p>
                    {!notif.isRead && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0"></span>}
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-2 leading-snug ${notif.isRead ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1.5 font-medium">
                    {new Date(notif.createdAt || notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt || notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif._id || notif.id);
                  }}
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