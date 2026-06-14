import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [pendingImage, setPendingImage] = useState(null); // { dataURL, file }
  const [result, setResult]             = useState(null);
  return (
    <AppContext.Provider value={{ pendingImage, setPendingImage, result, setResult }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);