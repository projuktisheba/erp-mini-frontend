import { createContext, useState, useEffect } from "react";

// Define the type for AppContext
type AppContextType = {
  branchId: number;
  setBranchId: React.Dispatch<React.SetStateAction<number>>;
  userRole: string; // e.g., "chairman", "manager", "employee"
  setUserRole: React.Dispatch<React.SetStateAction<string>>;
};

// Create the context with default null
export const AppContext = createContext<AppContextType | null>(null);

// AppContext Provider
const AppContextProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Initialize from localStorage if available
  const [branchId, setBranchId] = useState<number>(() => {
    const saved = localStorage.getItem("branchId");
    return saved ? Number(saved) : 1;
  });

  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem("userRole") || "manager";
  });

  // Sync branchId to localStorage
  useEffect(() => {
    localStorage.setItem("branchId", String(branchId));
  }, [branchId]);

  // Sync userRole to localStorage
  useEffect(() => {
    localStorage.setItem("userRole", userRole);
  }, [userRole]);

  const value = { branchId, setBranchId, userRole, setUserRole };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
