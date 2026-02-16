import { openGlobalModal } from "@/context/ModalContext";
import { showErrorToast } from "@/helpers/CustomToastUI";
import { toast } from "sonner";


const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;
const FACILITY_API_BASE_URL = import.meta.env.VITE_FACILITY_API_BASE_URL;


const ERROR_TITLES: Record<string, string> = {
    "400": "Invalid Request",
    "401": "Authentication Required",
    "403": "Access Denied",
    "404": "Not Found",
    "500": "Server Error",
    "999": "Critical Error"
};

function normalizeError(result: any) {
    const statusCode = result?.status_code?.toString();

    return {
        title:
            ERROR_TITLES[statusCode] || "Action Failed",

        message:
            result?.message || "Something went wrong",
    };
}


class ApiService {
    private token: string | null = null;
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders() {
        this.token = localStorage.getItem('access_token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private getHeadersWithoutContentType() {
        this.token = localStorage.getItem('access_token');

        const headers: Record<string, string> = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private handleErrorByStatusCode(result: any) {

        let message = "Something went wrong";
        const statusCode = result?.status_code?.toString();


        if (result.status_code != "210" && result.status_code != "400" && result.status_code != "500"
            && result?.status.toString().toLowerCase() === "failure"
        )
            message = result.message

        // 🚨 ALERT LEVEL (High priority errors)
        const MODAL_CODES = ["999", "777"]; // example

        if (MODAL_CODES.includes(statusCode)) {
            openGlobalModal(message);
            return;
        }

        // default fallback
        const error = normalizeError(result);
        showErrorToast(error.title, error.message);
    }


    public async request(
        endpoint: string,
        options: RequestInit = {},
        isRetry = false) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            console.log('API request config: ', config, url);
            let response = await fetch(url, config);
            let result: any = null;
            try {
                result = await response.json();
            } catch {
                result = null;
            }
            console.log('API response data: ', result);

            if (result?.status?.toString().toLowerCase() === "failed" || result?.status.toString().toLowerCase() === "failure") {
                // ✅ Handle token expiration or invalid authentication
                if (result.status_code === "210" && !isRetry) {
                    console.warn("Access token expired, attempting refresh...");
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        return await this.request(endpoint, options, true);
                    } else {
                        // Refresh failed → logout
                        this.logoutUser();
                        return { success: false };
                    }

                } else if (
                    result.status_code === "106" ||
                    result.message?.includes("User inactive.")
                ) {
                    this.logoutUser();
                    return;
                }
                this.handleErrorByStatusCode(result);
                return { success: false };
            }
            return { success: true, data: result.data };
        } catch (error) {
            console.log('API request failed:', error);
            showErrorToast("Technical Error!", "Something went wrong");
            return { success: false };
        }
    }

    public async requestBlob(
        endpoint: string,
        options: RequestInit = {},
        isRetry = false
    ): Promise<Response> {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        let response = await fetch(url, config);

        // 🔐 Handle token expiration
        if (response.status === 401 && !isRetry) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                return this.requestBlob(endpoint, options, true);
            }
            this.logoutUser();
            throw new Error("Unauthorized");
        }

        return response; // 🔥 RAW RESPONSE
    }


    public async requestWithForm(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeadersWithoutContentType(),
                ...options.headers,
            },
        };
        const errorMessage = "Something went wrong";

        try {
            console.log('request config: ', config, url);
            const response = await fetch(url, config);
            const result = await response.json().catch(() => null);
            console.log('response data: ', result);

            if (result?.status === "Failure" || result?.status?.toString().toLowerCase() === "failed") {
                let message = errorMessage;

                if (result.status_code != "210" && result.status_code != "400" && result.status_code != "500")
                    message = result.message

                toast.error(message);

                // ✅ Handle token expiration or invalid authentication
                if (
                    result.status_code === "210" ||
                    result.message?.includes("expired")
                ) {
                    console.warn("Access token expired, attempting refresh...");
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                    return { success: false };
                }

                return { success: false, message };
            }

            if (!response.ok) {
                return { success: false, message: `HTTP error! status: ${response.status}` };
            }

            return { success: true, data: result.data };
        } catch (error) {
            console.error('API request failed:', error);
            showErrorToast("Technical Error!", "Something went wrong");

            return { success: false, message: "Something went wrong" };
        }
    }

    private async refreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            const result = await response.json();
            if (result?.status?.toString().toLowerCase() === "failure") {
                return false;
            }

            // ✅ Save new access token
            localStorage.setItem("access_token", result.access_token);
            localStorage.setItem("refresh_token", result.refresh_token);

            return true;
        } catch (err) {
            console.error("Token refresh failed:", err);
            return false;
        }
    }

    private logoutUser() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
    }
}

export const facilityAuthApiService = new ApiService(AUTH_API_BASE_URL);
export const apiService = new ApiService(FACILITY_API_BASE_URL);