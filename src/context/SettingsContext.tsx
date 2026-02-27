import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { settingsApiService } from "@/services/system/settingsapi";
import { AuthContext } from "./AuthContext";
import { CurrencyIcon } from "lucide-react";

interface SettingsContextType {
  systemName: string;
  systemCurrency: SystemCurrencyType;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

interface SystemCurrencyType {
  icon: string;
  name: string;
  format: (val: number) => string;
}

const currencyConfig: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  AED: { locale: "en-AE", symbol: "د.إ" },
  JPY: { locale: "ja-JP", symbol: "¥" },
  AUD: { locale: "en-AU", symbol: "A$" },
  CAD: { locale: "en-CA", symbol: "C$" },
  SGD: { locale: "en-SG", symbol: "S$" },
};


export const createCurrencyFormatter = (currency: string) => {
  const config = currencyConfig[currency];

  return (val: number) =>
    new Intl.NumberFormat(config?.locale || "en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(val);
};


export const getCurrencySymbol = (currency: string) =>
  currencyConfig[currency]?.symbol || currency;


const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [systemName, setSystemName] = useState<string>("FacilityOS");
  const [systemCurrency, setSystemCurrency] =
    useState<SystemCurrencyType>({
      icon: "₹",
      name: "INR",
      format: createCurrencyFormatter("INR"),
    });

  const [loading, setLoading] = useState(true);

  // Use useContext directly to avoid hook error - handle undefined gracefully
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;

  const loadSettings = async () => {
    if (user) {
      const response = await settingsApiService.getSettings();

      if (response?.success && response.data) {
        const name = response.data.general?.system_name || "FacilityOS";
        const currency = response.data.general?.currency || "INR";

        setSystemName(name);
        document.title = `${name} - Enterprise Facility Management`;

        setSystemCurrency({
          icon: getCurrencySymbol(currency),
          name: currency,
          format: createCurrencyFormatter(currency),
        });
      }
    }

    setLoading(false);
  };


  useEffect(() => {
    loadSettings();
  }, [user]);

  const refreshSettings = async () => {
    await loadSettings();
  };


  return (
    <SettingsContext.Provider value={{ systemName, systemCurrency, loading, refreshSettings }}>
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


