import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const storedUser = localStorage.getItem("loggedInUser");
    let user;
    if (storedUser) {
        user = JSON.parse(storedUser);
    }

    if (!user || !user.is_authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // renders child protected routes
};

export default ProtectedRoute;
