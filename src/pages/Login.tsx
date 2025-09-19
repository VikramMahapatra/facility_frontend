import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Mock Google OAuth flow
    setTimeout(() => {
      // Simulate checking if user exists
      const userExists = Math.random() > 0.5; // 50% chance for demo
      
      if (userExists) {
        // Existing user - go to dashboard
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          email: 'john.doe@company.com',
          name: 'John Doe',
          accountType: 'Organization',
          organizationName: 'Acme Corporation',
          isAuthenticated: true
        }));
        navigate('/dashboard');
      } else {
        // New user - go to signup
        navigate('/signup', { 
          state: { 
            googleData: {
              email: 'newuser@company.com',
              name: 'New User',
              picture: 'https://via.placeholder.com/100'
            }
          }
        });
      }
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to FacilityOS</h1>
            <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
          </div>

          <Card className="shadow-elegant border-0">
            <CardHeader className="text-center">
              <CardTitle>Choose Sign-In Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Chrome className="w-5 h-5 mr-2" />
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>This is a demo with mock authentication</p>
            <p className="mt-1">50% chance you'll be treated as existing/new user</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
