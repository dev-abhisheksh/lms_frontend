import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsVisible, setNotificationsVisible] = useState(() => {
    return localStorage.getItem("notificationsVisible") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("notificationsVisible", notificationsVisible);
  }, [notificationsVisible]);

  const toggleNotifications = () => {
    setNotificationsVisible(prev => !prev);
  };

  return (
    <NotificationContext.Provider value={{ notificationsVisible, setNotificationsVisible, toggleNotifications }}>
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
