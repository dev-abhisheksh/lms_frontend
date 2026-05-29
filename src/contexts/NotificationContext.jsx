import React, { createContext, useState, useEffect } from 'react';
import { myCourses } from '../API/course.api';
import { connectTestSocket, disconnectTestSocket } from '../socket/test.socket';
import { connectAssignmentSocket, disconnectAssignmentSocket } from '../socket/assignment.socket';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(() => {
    return localStorage.getItem("notificationsVisible") !== "false";
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    localStorage.setItem("notificationsVisible", notificationsVisible);
  }, [notificationsVisible]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("accessToken");

    if (role === "student" && token) {
      const initSockets = async () => {
        try {
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
              onUnpublished: (data) => {
                addNotification({
                  type: 'test',
                  message: data.message,
                  data: { _id: data.testId }
                });
              },
              onUpdated: (data) => {
                addNotification({
                  type: 'test',
                  message: data.message,
                  data: data.test
                });
              },
              onDeleted: (data) => {
                addNotification({
                  type: 'test',
                  message: data.message,
                  data: { _id: data.testId }
                });
              }
            });

            connectAssignmentSocket(courseIds, {
              onCreated: (data) => {
                addNotification({
                  type: 'assignment',
                  message: `New assignment: ${data.title}`,
                  data: data
                });
              }
            });
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
    };
  }, []);

  const toggleNotifications = () => {
    setNotificationsVisible(prev => !prev);
  };

  const addNotification = (notif) => {
    setNotifications(prev => [
      { id: Date.now(), ...notif, timestamp: new Date() },
      ...prev
    ].slice(0, 20)); // Keep last 20
    setNotificationsVisible(true);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ 
      notificationsVisible, 
      setNotificationsVisible, 
      toggleNotifications,
      notifications,
      addNotification,
      removeNotification
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
