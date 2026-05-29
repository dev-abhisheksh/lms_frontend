import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(() => {
    return localStorage.getItem("notificationsVisible") !== "false";
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    localStorage.setItem("notificationsVisible", notificationsVisible);
  }, [notificationsVisible]);

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
