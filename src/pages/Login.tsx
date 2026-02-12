import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Chrome, Phone, Loader2, Mail } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApiService } from "@/services/authapi";
import { useAuth } from "@/context/AuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMobileLoading, setIsMobileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser } = useAuth();

  localStorage.removeItem("access_token");
  localStorage.removeItem("loggedInUser");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Show loader only after user selects their Google account
      setIsGoogleLoading(true);
      try {
        const response = await authApiService.authenticateGoogle(
          tokenResponse.access_token,
        );

        if (response.success) {
          const authResponse = response.data;
          setTimeout(() => {
            if (authResponse.needs_registration) {
              navigate("/signup", {
                state: {
                  userData: {
                    email: authResponse.email,
                    name: authResponse.name,
                    picture: authResponse.picture,
                  },
                },
              });
              toast.success("OTP verification successful");
            } else {
              const user = authResponse.user;
              setUser(user);

              // Super Admin
              if (user.default_account_type === "super_admin") {
                navigate("/super-admin/dashboard");
                toast.success("Super Admin login successful");
                return;
              }

              if (user.status.toLowerCase() === "pending_approval") {
                navigate("/registration-status", {
                  state: {
                    userData: {
                      email: user.email,
                      name: user.full_name,
                    },
                  },
                });
                toast.success("OTP verification successful");
              } else {
                navigate("/dashboard");
                toast.success("Login successful");
              }
            }
            setIsGoogleLoading(false);
          }, 1000);
        } else {
          setIsGoogleLoading(false);
        }
      } catch (error) {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login failed or cancelled", error);
      setIsGoogleLoading(false);
      const errorMessage = error?.toString() || "";
      if (
        !errorMessage.includes("popup_closed") &&
        !errorMessage.includes("user_cancelled")
      ) {
        toast.error("Google login failed. Please try again.");
      }
    },
  });

  const handleGoogleLogin = async () => {
    googleLogin();
  };

  const handleMobileLogin = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      return;
    }
    setIsMobileLoading(true);
    try {
      const response = (await authApiService.sendOtp(mobileNumber)) as any;
      if (response?.success) {
        setShowOtp(true);
        toast.success("OTP sent to your mobile number");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsMobileLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus on the next empty box or the last box
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(value) && value !== "") {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        setTimeout(() => handleVerifyOtp(fullOtp), 100);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp.join("");
    if (otpToVerify.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      let response;
      if (loginMethod === "phone") {
        response = (await authApiService.verifyOtp(
          mobileNumber,
          otpToVerify,
        )) as any;
      } else {
        response = (await authApiService.verifyEmailOtp(
          email,
          otpToVerify,
        )) as any;
      }

      if (response?.success) {
        const authResponse = response.data;
        console.log("Auth Response after OTP verification:", authResponse);
        if (authResponse?.needs_registration) {
          navigate("/signup", {
            state: {
              userData: {
                mobile: authResponse.mobile,
                email: authResponse.email,
              },
            },
          });
          toast.success("OTP verification successful");
        } else {
          const user = authResponse.user;
          setUser(user);

          // Super Admin
          if (user.default_account_type === "super_admin") {
            navigate("/super-admin/dashboard");
            toast.success("Super Admin login successful");
            return;
          }

          if (user?.status?.toLowerCase() === "pending_approval") {
            navigate("/registration-status", {
              state: {
                userData: {
                  email: user.email,
                  name: user.full_name,
                },
              },
            });
            toast.success("OTP verification successful");
          } else {
            navigate("/dashboard");
            toast.success("Login successful");
          }
        }
      } else {
        toast.error("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsEmailLoading(true);
    try {
      const response = (await authApiService.sendEmailOtp(email)) as any;
      if (response?.success) {
        setShowOtp(true);
        toast.success("OTP sent to your email");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Prevent clicking during countdown

    setOtp(["", "", "", "", "", ""]);
    setResendTimer(30); // Start 30 second timer

    if (loginMethod === "phone") {
      await handleMobileLogin();
    } else {
      await handleEmailLogin();
    }
  };

  useEffect(() => {
    if (showOtp) {
      otpInputRefs.current[0]?.focus();
    }
  }, [showOtp]);

  // Resend OTP timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset timer when OTP screen is closed
  useEffect(() => {
    if (!showOtp) {
      setResendTimer(0);
    }
  }, [showOtp]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to FacilityOS</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Choose sign in method
          </p>

          <Card className="shadow-elegant border-0">
            <CardContent className="space-y-4">
              {!showOtp ? (
                <>
                  <div className="space-y-3">
                    {/* Toggle between Phone and Email */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                      <Button
                        type="button"
                        variant={loginMethod === "phone" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setLoginMethod("phone");
                          setEmail("");
                          setMobileNumber("");
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Phone
                      </Button>
                      <Button
                        type="button"
                        variant={loginMethod === "email" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setLoginMethod("email");
                          setEmail("");
                          setMobileNumber("");
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>

                    {loginMethod === "phone" ? (
                      <>
                        <div className="relative">
                          <Label htmlFor="mobile">Phone Number</Label>
                          <PhoneInput
                            country={"in"}
                            value={mobileNumber}
                            onChange={(value) => {
                              const digits = value.replace(/\D/g, "");
                              const finalValue = "+" + digits;
                              setMobileNumber(finalValue);
                            }}
                            disabled={isLoading || isMobileLoading}
                            inputProps={{
                              name: "mobile",
                              required: true,
                              id: "mobile",
                            }}
                            containerClass="w-full relative mt-2"
                            inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                            buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                            dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                            enableSearch={true}
                          />
                        </div>
                        <Button
                          onClick={handleMobileLogin}
                          disabled={
                            isLoading ||
                            isMobileLoading ||
                            !mobileNumber ||
                            mobileNumber.length < 10
                          }
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          {isMobileLoading
                            ? "Sending OTP..."
                            : "Continue with Phone"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading || isEmailLoading}
                            className="mt-2"
                          />
                        </div>
                        <Button
                          onClick={handleEmailLogin}
                          disabled={
                            isLoading ||
                            isEmailLoading ||
                            !email ||
                            !email.includes("@")
                          }
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          <Mail className="w-5 h-5 mr-2" />
                          {isEmailLoading
                            ? "Sending OTP..."
                            : "Continue with Email"}
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Google Login Button */}
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    size="lg"
                    disabled={isGoogleLoading || isLoading}
                    className="w-full border border-input bg-background hover:bg-accent h-11"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Chrome className="w-5 h-5 mr-2" />
                        Continue with Google
                      </>
                    )}
                  </Button>

                  {/* Signup Link */}
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                      Don't have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Signup
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter the 6-digit OTP sent to{" "}
                      {loginMethod === "phone" ? mobileNumber : email}
                    </p>
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={isVerifyingOtp}
                          className="w-12 h-12 text-center text-lg font-semibold"
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleVerifyOtp()}
                    disabled={isVerifyingOtp || otp.join("").length !== 6}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleResendOtp}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      disabled={
                        isEmailLoading || isMobileLoading || resendTimer > 0
                      }
                    >
                      {resendTimer > 0
                        ? `Resend OTP (${resendTimer}s)`
                        : "Resend OTP"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowOtp(false);
                        setOtp(["", "", "", "", "", ""]);
                        setMobileNumber("");
                        setEmail("");
                      }}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!showOtp && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>This is a demo with mock authentication</p>
              <p className="mt-1">
                50% chance you'll be treated as existing/new user
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
