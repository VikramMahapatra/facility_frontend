// SuperAdminLayout.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./SuperAdminLayout.css"; // Assuming you have some CSS for styling
import { useAuth } from "@/context/AuthContext";

const SuperAdminLayout: React.FC = () => {
    const { user } = useAuth();

    if (!user || user.default_account_type !== "super_admin") {
        return <div>Access Denied</div>; // fallback if non-super-admin tries to access
    }

    return (
        <div className="super-admin-layout">
            {/* Sidebar */}
            <aside className="super-admin-sidebar">
                <h2>Super Admin</h2>
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/super-admin/dashboard">Dashboard</NavLink>
                        </li>
                        <li>
                            <NavLink to="/super-admin/pending-approvals">Pending Approvals</NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className="super-admin-content">
                <header className="super-admin-header">
                    <h1>Welcome, {user.name}</h1>
                </header>
                <section className="super-admin-main">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
