import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePageHeader } from "@/hooks/use-pageheader";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationsApiService } from "@/services/system/notificationsapi";
import { useEffect, useState } from "react";

export const PageHeader = () => {
    const [notiCount, setNotiCount] = useState(0);
    const { title, icon: Icon, breadcrumb } = usePageHeader();
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadNotificationCount();
    }, []);

    const handleNotificationClick = () => {
        navigate("/notifications");
    };

    const handleProfileClick = () => {
        navigate("/profile"); // or /account/profile
    };

    const loadNotificationCount = async () => {
        const response = await notificationsApiService.getNotificationCount();
        if (response?.success) setNotiCount(response.data || 0);
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {breadcrumb ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {/* Section */}
                        {breadcrumb.parent && (
                            <>
                                <Home className="h-4 w-4" />
                                <span className="font-medium">{breadcrumb.parent.sectionLabel}</span>
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}

                        {/* Parent Item */}
                        {breadcrumb.parent && (
                            <>
                                {breadcrumb.parent.icon && (
                                    <breadcrumb.parent.icon className="h-4 w-4" />
                                )}
                                {breadcrumb.current ? (
                                    <a
                                        href={breadcrumb.parent.url} // link to list page
                                        className="font-medium hover:underline"
                                    >
                                        {breadcrumb.parent.label}
                                    </a>
                                ) : (
                                    <span className="font-medium">{breadcrumb.parent.label}</span>
                                )}
                                {breadcrumb.current && <ChevronRight className="h-4 w-4" />}
                            </>
                        )}

                        {/* Current page */}
                        {breadcrumb.current && (
                            <span className="font-medium">{breadcrumb.current.label}</span>
                        )}
                    </div>
                ) : (
                    <>
                        {Icon && <Icon className="h-5 w-5 text-sidebar-primary" />}
                        <h1 className="text-lg font-semibold text-sidebar-primary">
                            {title}
                        </h1>
                    </>
                )}
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
                        {notiCount}
                    </span>
                </Button>
                {/* User */}
                <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-muted transition"
                >
                    <Avatar>
                        <AvatarFallback className="bg-gradient-primary text-white">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-right">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {user.default_account_type}
                        </p>
                    </div>
                </button>

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
        </header >
    );
};
