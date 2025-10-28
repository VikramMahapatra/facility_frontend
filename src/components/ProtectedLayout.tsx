import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { useNavigate } from "react-router-dom";

const ProtectedLayout = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("loggedInUser");
    const user = JSON.parse(storedUser);

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('access_token');
        navigate('/login');
    };


    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <PropertySidebar />

                <div className="flex-1 flex flex-col">

                    {/* ✅ Common Header */}
                    <header className="bg-card border-b border-border">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <SidebarTrigger />
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">F</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold">FacilityOS</h1>
                                        <p className="text-sm text-muted-foreground">
                                            {user?.organizationName || user?.accountType} Dashboard
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback className="bg-gradient-primary text-white">
                                        {user?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.accountType}</p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* ✅ Page content renders here */}
                    <main className="flex-1 p-6 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default ProtectedLayout;
