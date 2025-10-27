import { toast } from "sonner";
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;
const FACILITY_API_BASE_URL = import.meta.env.VITE_FACILITY_API_BASE_URL;

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

    public async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            console.log('request config: ', config, url);
            const response = await fetch(url, config);
            const result = await response.json().catch(() => null);
            console.log('response data: ', result);
            if (result?.status === "Failure") {
                const message = result.message || "Something went wrong";

                // ✅ Handle token expiration or invalid authentication
                if (
                    result.status_code === "AUTH_TOKEN_EXPIRED" ||
                    result.message?.includes("Token expired")
                ) {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                    return;
                }

                toast.error(message);
                throw new Error(message);

            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return result.data;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error("Technical Error!");
        }
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

        try {
            console.log('request config: ', config, url);
            const response = await fetch(url, config);
            const result = await response.json().catch(() => null);
            console.log('response data: ', result);
            if (result?.status === "Failure") {
                const message = result.message || "Something went wrong";

                // ✅ Handle token expiration or invalid authentication
                if (
                    result.status_code === "AUTH_TOKEN_EXPIRED" ||
                    result.message?.includes("Token expired")
                ) {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                    return;
                }

                throw new Error(message);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return result.data;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error("Technical Error!");
        }
    }
}

export const facilityAuthApiService = new ApiService(AUTH_API_BASE_URL);
export const apiService = new ApiService(FACILITY_API_BASE_URL);