import React, { createContext, useState, useEffect, useCallback } from 'react';
import { myCourses } from '../API/course.api';
import { connectTestSocket, disconnectTestSocket } from '../socket/test.socket';
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../socket/assignment.socket';
import { socketManager } from '../API/socket.api';
import { getNotifications, markAsRead as apiMarkAsRead, markAllAsRead as apiMarkAllAsRead } from '../API/notification.api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(() => {
    return localStorage.getItem("notificationsVisible") !== "false";
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationsVisible", notificationsVisible);
  }, [notificationsVisible]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (token) {
      fetchNotifications();
      
      const initSockets = async () => {
        try {
          if (user?._id) {
            socketManager.connect(token);
            socketManager.joinPersonal(user._id);
            
            socketManager.on("notification", (data) => {
              // Real-time notification from backend
              fetchNotifications();
              
              addNotification({
                type: data.type || 'alert',
                title: data.title,
                message: data.message,
                link: data.link
              });
            });

            socketManager.on("new-announcement", (data) => {
              addNotification({
                type: 'announcement',
                title: 'New Announcement',
                message: data.announcement.title,
                link: `/course/${data.courseId}/announcements`
              });
            });
          }

          if (role === "student") {
            const res = await myCourses();
            const courses = res.data.courses || [];
            if (courses.length > 0) {
              const courseIds = courses.map(c => c.course._id);
              
              connectTestSocket(courseIds, {
                onPublished: (data) => {
                  addNotification({
                    type: 'test',
                    message: data.message,
                    data: data.test
                  });
                },
                // ... rest of socket listeners
              });
              // ...
            }
          }
        } catch (err) {
          console.error("Socket Init Error:", err);
        }
      };
      initSockets();
    }

    return () => {
      disconnectTestSocket();
      disconnectAssignmentSocket();
      socketManager.disconnect();
    };
  }, [fetchNotifications]);

  const toggleNotifications = () => {
    setNotificationsVisible(prev => !prev);
  };

  const addNotification = (notif) => {
    setNotifications(prev => [
      { id: Date.now(), ...notif, timestamp: new Date(), isRead: false },
      ...prev
    ].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    // setNotificationsVisible(true); // Optional: auto-show on new notif
  };

  const markNotificationRead = async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark Read Error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark All Read Error:", err);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
  };

  return (
    <NotificationContext.Provider value={{ 
      notificationsVisible, 
      setNotificationsVisible, 
      toggleNotifications,
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markNotificationRead,
      markAllRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
