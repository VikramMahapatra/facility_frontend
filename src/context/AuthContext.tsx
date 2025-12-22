import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface RolePolicy {
    resource: string;
    action: string; // "read" | "write" | "delete"
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    account_type: string;
    organization_name: string;
    is_authenticated: boolean;
    role_policies?: RolePolicy[];
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    setUser: (user: AuthUser) => void;
    canRead: (resource: string) => boolean;
    canWrite: (resource: string) => boolean;
    canDelete: (resource: string) => boolean;
    handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  


    useEffect(() => {
        const loadUser = async () => {
            const stored = localStorage.getItem("loggedInUser");

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                } catch {
                    setUser(null);
                }
            }

            setLoading(false); // ✅ Only after user set attempt
        };

        loadUser();
    }, []);

    // ✅ Save to storage whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("loggedInUser");
        }
    }, [user]);

    const hasPermission = (resource: string, action: string) => {
        if (!user?.role_policies) return false;
      


        return user.role_policies.some(
            (policy) =>
                policy.resource.toLowerCase() === resource.toLowerCase() &&
                policy.action.toLowerCase() === action.toLowerCase()
        );
    };

        const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };



    return (
        <AuthContext.Provider value={{
            user,
            loading,
            setUser, // ✅ Now available in login success handler
            canRead: (r) => hasPermission(r, "read"),
            canWrite: (r) => hasPermission(r, "write"),
            canDelete: (r) => hasPermission(r, "delete"),
            handleLogout

        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
