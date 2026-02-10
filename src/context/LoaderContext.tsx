import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    ReactNode,
} from "react";

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

    const showLoader = useCallback(() => setLoading(true), []);
    const hideLoader = useCallback(() => setLoading(false), []);

    // ⭐ Generic return type <T> fixes type errors
    const withLoader = useCallback(
        async <T,>(callback: () => Promise<T>): Promise<T> => {
            showLoader();
            try {
                return await callback();
            } finally {
                hideLoader();
            }
        },
        [showLoader, hideLoader]
    );

    const value = useMemo(
        () => ({ loading, showLoader, hideLoader, withLoader }),
        [loading, showLoader, hideLoader, withLoader]
    );

    return (
        <LoaderContext.Provider value={value}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);
