import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { PageHeader } from "@/components/PageHeader";

const MainLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background">
                {/* Fixed Sidebar */}
                <PropertySidebar />

                {/* Main Area */}
                <SidebarInset className="flex-1 flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <PageHeader />

                    {/* ONLY this changes */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default MainLayout;
