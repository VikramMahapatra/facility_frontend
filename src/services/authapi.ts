import { facilityAuthApiService as apiService } from "../services/api";

class AuthApiService {
  async sendOtp(mobileNo: string) {
    return await apiService.request("/auth/mobile/send_otp", {
      method: "POST",
      body: JSON.stringify({
        mobile: mobileNo,
      }),
    });
  }

  async verifyOtp(mobileNo: string, otp: string) {
    const response = await apiService.request("/auth/mobile/verify_otp", {
      method: "POST",
      body: JSON.stringify({
        mobile: mobileNo,
        otp,
      }),
    });

    this.updateTokens(response);
    return response;
  }

  async sendEmailOtp(email: string) {
    return await apiService.request("/auth/mobile/send_otp", {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
    });
  }

  async verifyEmailOtp(email: string, otp: string) {
    // Swagger: POST /api/auth/mobile/verify_otp
    const response = await apiService.request("/auth/mobile/verify_otp", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    });

    this.updateTokens(response);
    return response;
  }

  async resendEmailOtp(email: string) {
    // Swagger: POST /api/auth/mobile/resend_otp
    return await apiService.request("/auth/mobile/resend_otp", {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
    });
  }

  async login(username: string, password: string) {
    const response = await apiService.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });

    this.updateTokens(response);
    return response;
  }

  async authenticateGoogle(access_token: string) {
    const response = await apiService.request("/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: access_token,
      }),
    });

    this.updateTokens(response);
    return response;
  }

  async register(userData: any) {
    return await apiService.requestWithForm("/user/register", {
      method: "POST",
      body: userData,
    });
  }

  async setupUser(userData: any) {
    const response = await apiService.request("/user/setup", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    localStorage.removeItem("access_token");
    if (response.success) {
      let token = response.data?.access_token;
      localStorage.setItem("access_token", token);
    }
    return response;
  }

  async logout() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      await apiService.request(
        `/auth/logout?refresh_token_str=${refreshToken}`,
        { method: "POST" }
      );
    }

    // 🧹 client cleanup
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("loggedInUser");
  }

  private updateTokens(response: any) {
    // 🧹 Always start by clearing old tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // ✅ If new tokens exist, store them
    const accessToken = response?.data?.access_token;
    const refreshToken = response?.data?.refresh_token;

    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  }
}

export const authApiService = new AuthApiService();
