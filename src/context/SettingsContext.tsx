import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { settingsApiService } from "@/services/system/settingsapi";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  systemName: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [systemName, setSystemName] = useState<string>("FacilityOS");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()

  const loadSettings = async () => {
    console.log("user", user);
    if (user) {
      const response = await settingsApiService.getSettings();
      if (response?.success && response.data) {
        const name = response.data.general?.system_name || "FacilityOS";
        setSystemName(name);
        document.title = `${name} - Enterprise Facility Management`;
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ systemName, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
