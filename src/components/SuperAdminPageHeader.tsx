import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export const SuperAdminPageHeader = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, handleLogout } = useAuth();


  const handleLogoutClick = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } catch (error) {
      // Error handling is done in AuthContext
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center gap-4">
        {/* User */}
        <div className="flex items-center gap-3 rounded-md px-2 py-1 text-left">
          <Avatar>
            <AvatarFallback className="bg-gradient-primary text-white">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="text-right">
            <p className="text-sm font-medium">{user?.name || "-"}</p>
            <p className="text-xs text-muted-foreground">
              {user?.default_account_type || "-"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
};
