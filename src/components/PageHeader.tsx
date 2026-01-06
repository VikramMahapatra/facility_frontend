import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePageHeader } from "@/hooks/use-pageheader";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PageHeader = () => {
    const { title, icon: Icon } = usePageHeader();
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const handleNotificationClick = () => {
        navigate("/notifications");
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {Icon && (
                    <Icon className="h-5 w-5 text-sidebar-primary" />
                )}

                <h1 className="text-lg font-semibold text-sidebar-primary">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground"
                    onClick={handleNotificationClick}
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                        3
                    </span>
                </Button>
                {/* User */}
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-gradient-primary text-white">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-right">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {user.account_type}
                        </p>
                    </div>
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
        </header>
    );
};
