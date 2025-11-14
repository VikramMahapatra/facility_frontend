import { useLoader } from "@/context/LoaderContext";

const LoaderOverlay = () => {
    const { loading } = useLoader();

    if (!loading) return null;

    return (
        <div className="absolute inset-0 bg-background/30 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>

    );
};

export default LoaderOverlay;
