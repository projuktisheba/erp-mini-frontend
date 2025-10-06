import { createContext, useState } from "react";

type AppContextType = {
  branchId: number;
  setBranchId: React.Dispatch<React.SetStateAction<number>>;
};

export const AppContext = createContext<AppContextType | null>(null);

const AppContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [branchId, setBranchId] = useState(1);
  const value = { branchId, setBranchId };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
