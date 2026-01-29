// ProfileRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProfileRedirect() {
    const { user } = useAuth();

    if (!user?.id) return null; // or loader/spinner

    return <Navigate to={`/users-management/${user.id}/view`} replace />;
}
