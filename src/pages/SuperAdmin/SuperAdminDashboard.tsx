import { superAdminApiService } from "@/services/super_admin/superadminapi";
import React, { useEffect, useState } from "react";

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            const response = await superAdminApiService.fetchSuperAdminStats(); // fetch dashboard stats
            if (response.success) {
                const data = response.data;
                setStats(data);
            }
        };
        loadStats();
    }, []);


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
            <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">Total Organizations</h2>
                    <p className="text-xl">{stats?.totalOrganizations || 0}</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">Pending Approvals</h2>
                    <p className="text-xl">{stats?.pendingApprovals || 0}</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <h2 className="font-semibold">Active Users</h2>
                    <p className="text-xl">{stats?.activeUsers || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
