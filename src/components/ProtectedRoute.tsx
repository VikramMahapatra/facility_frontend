import { Outlet, Navigate, useLocation } from "react-router-dom";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import MainLayout from "../layouts/MainLayout";
import Forbidden from "../pages/Forbidden";
import { useAuth } from "@/context/AuthContext";
import { resourceMap } from "@/helpers/routePermissions";

const ProtectedRoute = () => {
    const { user, loading, canRead } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user?.is_authenticated) return <Navigate to="/login" replace />;

    // ✅ Layout based on user type
    if (user.default_account_type === "super_admin") {
        return <SuperAdminLayout />;
    }

    const path = location.pathname;
    const resource = resourceMap[path];

    if (resource && !canRead(resource)) {
        return <Forbidden />;
    }

    return <MainLayout />;
};

export default ProtectedRoute;
