import { useLoader } from "@/context/LoaderContext";

const ContentContainer = ({ children }) => {
    const { loading } = useLoader();

    return (
        <div className={loading ? "pointer-events-none opacity-50" : ""}>
            {children}
        </div>
    );
};

export default ContentContainer;
