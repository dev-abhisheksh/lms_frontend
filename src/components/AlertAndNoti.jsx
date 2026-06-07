import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MdNotifications, MdClose, MdQuiz, MdAssignment, MdCampaign, MdDragIndicator } from 'react-icons/md'
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
    unreadCount,
    notificationWidth,
    setNotificationWidth
  } = useNotifications();
  
  const navigate = useNavigate();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Resize Logic
  const startResizing = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < 600) {
        setNotificationWidth(newWidth);
      }
    }
  }, [isResizing, setNotificationWidth]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationRead(notif._id || notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
      if (window.innerWidth < 1024) toggleNotifications(); // Close on mobile after click
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
    <>
      {/* Mobile Overlay Backdrop */}
      {notificationsVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={toggleNotifications}
        />
      )}

      {/* Main Drawer Container */}
      <div 
        ref={sidebarRef}
        style={{ width: window.innerWidth >= 1024 ? (notificationsVisible ? `${notificationWidth}px` : '0px') : '85%' }}
        className={`fixed top-0 right-0 h-screen bg-white shadow-2xl lg:shadow-none lg:relative z-[70] transition-all duration-300 ease-in-out flex flex-col border-l border-gray-100 overflow-visible ${
          notificationsVisible ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Resize Handle (Desktop Only) */}
        <div 
          onMouseDown={startResizing}
          className={`absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/30 transition-colors group hidden lg:block ${
            isResizing ? 'bg-indigo-500 w-1.5' : ''
          }`}
        >
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
             <MdDragIndicator className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Header Section */}
        <div className="p-4 lg:p-5 flex items-center justify-between border-b border-gray-50 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <MdNotifications className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 block">Notifications</span>
              <p className="text-[10px] text-gray-400 font-medium">Updates & Alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="p-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={toggleNotifications} 
              className="p-2 hover:bg-gray-100 rounded-xl transition group"
            >
              <MdClose className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[#FDFDFF]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <MdNotifications className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">No notifications yet</p>
              <p className="text-xs text-gray-300 mt-1 max-w-[160px]">Check back later for course updates</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id || notif.id} 
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  notif.isRead 
                    ? 'bg-white border-gray-50' 
                    : 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${getColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[11px] font-black uppercase tracking-wider ${notif.isRead ? 'text-gray-400' : 'text-indigo-600'}`}>
                        {notif.type}
                      </p>
                      {!notif.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>}
                    </div>
                    <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-gray-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                         {new Date(notif.createdAt || notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                       </p>
                       <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                       <p className="text-[10px] text-gray-400 font-medium">
                         {new Date(notif.createdAt || notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif._id || notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition shrink-0 h-fit"
                  >
                    <MdClose className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Overlay (Fade Effect) */}
        <div className="h-8 bg-gradient-to-t from-white to-transparent absolute bottom-0 left-0 w-full pointer-events-none"></div>
      </div>
    </>
  )
}

export default AlertAndNoti