import { superAdminApiService } from "@/services/super_admin/superadminapi";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Org {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

const OrgApprovalPage: React.FC = () => {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null);

    const loadOrgs = async () => {
        setLoading(true);
        const response = await superAdminApiService.fetchPendingOrganizations();
        if (response.success) {
            setOrgs(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadOrgs();
    }, []);

    const handleApprove = async (orgId: string) => {
        setApproving(orgId);
        const response = await superAdminApiService.approveOrganization(orgId);
        if (response.success) {
            toast.success("Organization approved successfully!");
            loadOrgs(); // refresh list
        }
        setApproving(null);
    };

    if (loading) return <div className="p-6">Loading pending organizations...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Pending Organization Approvals</h1>
            {orgs.length === 0 ? (
                <p>No pending organizations to approve.</p>
            ) : (
                <table className="min-w-full bg-white shadow rounded">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Created At</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orgs.map((org) => (
                            <tr key={org.id}>
                                <td className="px-4 py-2 border">{org.name}</td>
                                <td className="px-4 py-2 border">{org.email}</td>
                                <td className="px-4 py-2 border">{new Date(org.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2 border">
                                    <button
                                        className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
                                        disabled={approving === org.id}
                                        onClick={() => handleApprove(org.id)}
                                    >
                                        {approving === org.id ? "Approving..." : "Approve"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrgApprovalPage;
