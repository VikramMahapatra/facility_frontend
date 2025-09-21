import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">FacilityOS</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="nav"
                  className={location.pathname === item.href ? "text-primary" : ""}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <Link to="/login">
            <Button variant="default" className="shadow-sm">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;