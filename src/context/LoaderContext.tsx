import { createContext, useContext, useState, ReactNode } from "react";

type LoaderContextType = {
    loading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
    withLoader: <T>(callback: () => Promise<T>) => Promise<T>;
};

const LoaderContext = createContext<LoaderContextType>({
    loading: false,
    showLoader: () => { },
    hideLoader: () => { },
    withLoader: async () => {
        throw new Error("withLoader called outside LoaderProvider");
    },
});

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);

    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    // ⭐ Generic return type <T> fixes type errors
    const withLoader = async <T,>(callback: () => Promise<T>): Promise<T> => {
        showLoader();
        try {
            return await callback();
        } finally {
            hideLoader();
        }
    };

    return (
        <LoaderContext.Provider
            value={{ loading, showLoader, hideLoader, withLoader }}
        >
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);
