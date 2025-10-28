import { Navigate, Outlet, useLocation } from "react-router-dom";
import { resourceMap } from "@/helpers/routePermissions";
import { useAuth } from "@/context/AuthContext";
import Forbidden from "@/pages/Forbidden";

const ProtectedRoute = () => {
    const { user, loading, canRead } = useAuth();
    const location = useLocation();

    const path = location.pathname;
    const resource = resourceMap[path];

    console.log("ProtectedRoute:", { user, loading });

    if (loading) return <div>Loading...</div>; // or a Loader component


    if (!user?.is_authenticated) return <Navigate to="/login" replace />;

    // ✅ If resource exists, check read permission
    if (resource && !canRead(resource)) {
        return <Forbidden />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
