import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RolePolicy {
    resource: string;
    action: string; // "read" | "write" | "delete"
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    is_authenticated: boolean;
    role_policies?: RolePolicy[];
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    canRead: (resource: string) => boolean;
    canWrite: (resource: string) => boolean;
    canDelete: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("loggedInUser");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            } catch {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const hasPermission = (resource: string, action: string) => {
        if (!user?.role_policies) return false;

        return user.role_policies.some(
            (policy) =>
                policy.resource.toLowerCase() === resource.toLowerCase() &&
                policy.action.toLowerCase() === action.toLowerCase()
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                canRead: (resource: string) => hasPermission(resource, "read"),
                canWrite: (resource: string) => hasPermission(resource, "write"),
                canDelete: (resource: string) => hasPermission(resource, "delete"),
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
