import React, { createContext, useContext, useState } from "react";

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: "",
  setApiKey: () => {},
});

export const useApiKey = () => useContext(ApiKeyContext);

interface ApiKeyProviderProps {
  children: React.ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>("");

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
