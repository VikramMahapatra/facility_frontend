import { useLoader } from "@/context/LoaderContext";

const LoaderOverlay = () => {
    const { loading } = useLoader();

    if (!loading) return null;

    return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-inherit">
            <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
                Loading...
            </p>
        </div>
    );
};

export default LoaderOverlay;