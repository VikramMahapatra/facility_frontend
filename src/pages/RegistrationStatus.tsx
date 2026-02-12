import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegistrationStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.userData;

  useEffect(() => {
    if (!user?.email) {
      navigate("/login"); // redirect if accessed directly
    }
  }, [navigate, user?.email]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h1 className="text-2xl font-bold">Registration Submitted</h1>
            <p className="text-muted-foreground mt-2">
              Your account request has been submitted successfully
            </p>
          </div>

          <Card className="shadow-elegant border-0">
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-foreground">
                  Hi <span className="font-medium">{user?.name || "User"}</span>
                  , your account request has been submitted successfully.
                </p>
                <p className="text-muted-foreground">
                  Our team will review your application and notify you at{" "}
                  <span className="font-medium text-foreground">
                    {user?.email}
                  </span>{" "}
                  once approved.
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground">
                  You can close this window or return later after approval.
                  <p className="text-center text-sm text-muted-foreground">
                    Go back to login?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </p>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
