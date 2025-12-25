import { createContext, useState } from "react";

export const SidebarTabsContext = createContext();

export const SidebarTabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <SidebarTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </SidebarTabsContext.Provider>
  );
};
