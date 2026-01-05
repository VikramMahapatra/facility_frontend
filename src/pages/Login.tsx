import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Chrome, Phone, Mail, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authApiService } from "@/services/authapi";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileLoading, setIsMobileLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser } = useAuth();
  const { systemName } = useSettings();

  localStorage.removeItem("access_token");
  localStorage.removeItem("loggedInUser");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const response = await authApiService.authenticateGoogle(
        tokenResponse.access_token
      );

      if (response.success) {
        const authResponse = response.data;
        setTimeout(() => {
          if (authResponse.needs_registration) {
            navigate("/signup", {
              state: {
                googleData: {
                  email: authResponse.email,
                  name: authResponse.name,
                  picture: authResponse.picture,
                },
              },
            });
          } else {
            setUser(authResponse.user);
            if (authResponse.user.status.toLowerCase() === "pending_approval") {
              const user = authResponse.user;
              navigate("/registration-status", {
                state: {
                  userData: {
                    email: user.email,
                    name: user.full_name,
                  },
                },
              });
            } else {
              navigate("/dashboard");
            }
          }
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      toast.error("Please enter username/email and password");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual email/password login endpoint when available
      // const response = await authApiService.login(usernameOrEmail, password);
      // For now, show error that this method is not yet implemented
      toast.error("Try Another Login Method");
      setIsLoading(false);
    } catch (error) {
      toast.error("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    googleLogin();
  };

  const handlePhoneLoginClick = () => {
    setShowPhoneLogin(true);
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
        setShowPhoneLogin(false);
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
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
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
      const response = await authApiService.verifyOtp(
        mobileNumber,
        otpToVerify
      );
      if (response?.success) {
        const authResponse = response.data;
        if (authResponse?.needs_registration) {
          navigate("/signup", {
            state: {
              mobileData: {
                mobile: mobileNumber,
              },
            },
          });
        } else {
          setUser(authResponse?.user);
          if (
            authResponse?.user?.status?.toLowerCase() === "pending_approval"
          ) {
            const user = authResponse.user;
            navigate("/registration-status", {
              state: {
                userData: {
                  email: user.email,
                  name: user.full_name,
                },
              },
            });
          } else {
            navigate("/dashboard");
          }
        }
        toast.success("Login successful");
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

  const handleResendOtp = async () => {
    setOtp(["", "", "", "", "", ""]);
    await handleMobileLogin();
  };

  useEffect(() => {
    if (showOtp) {
      otpInputRefs.current[0]?.focus();
    }
  }, [showOtp]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome to {systemName}</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <Card className="shadow-elegant border-0">
            <CardContent className="space-y-4">
              {!showOtp && !showPhoneLogin ? (
                <>
                  {/* Email/Password Form - First */}
                  <form
                    onSubmit={handleEmailPasswordLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="usernameOrEmail">Username or Email</Label>
                      <Input
                        id="usernameOrEmail"
                        type="text"
                        placeholder="Enter your username or email"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => {}}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      className="w-full h-11 bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  {/* Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Google Login Button */}
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    size="lg"
                    className="w-full border border-input bg-background hover:bg-accent h-11"
                  >
                    <Chrome className="w-5 h-5 mr-2" />
                    Login with Google
                  </Button>

                  {/* Phone Login Button */}
                  <Button
                    onClick={handlePhoneLoginClick}
                    variant="outline"
                    size="lg"
                    className="w-full border border-input bg-background hover:bg-accent h-11"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Continue with Phone
                  </Button>
                </>
              ) : showPhoneLogin && !showOtp ? (
                <>
                  <div className="space-y-3">
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
                    <Button
                      onClick={() => {
                        setShowPhoneLogin(false);
                        setMobileNumber("");
                      }}
                      variant="ghost"
                      size="lg"
                      className="w-full"
                    >
                      Back
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter the 6-digit OTP sent to {mobileNumber}
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
                  <Button
                    onClick={() => {
                      setShowOtp(false);
                      setShowPhoneLogin(false);
                      setOtp(["", "", "", "", "", ""]);
                      setMobileNumber("");
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Cancel
                  </Button>
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
