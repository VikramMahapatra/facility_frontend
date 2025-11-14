import { createContext, useContext, useState } from "react";

// ✅ Provide a safe default object to avoid createContext errors
const LoaderContext = createContext({
    loading: false,
    showLoader: () => { },
    hideLoader: () => { },
});

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    return (
        <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
            {children}

            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-white text-sm">Loading...</p>
                    </div>
                </div>
            )}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);
