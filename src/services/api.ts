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
            const data = await response.json().catch(() => ({}));
            console.log('response data: ', data);
            if (response.status === 401) {
                if (data.detail === "Token expired") {
                    // Auto logout for expired token
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                    return;
                } else if (data.detail === "Invalid credentials") {
                    // Show error in login form
                    throw new Error("Invalid username or password");
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return data;
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
            console.log('request config: ', config)
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));
            console.log('response data: ', data);
            if (response.status === 401) {
                if (data.detail === "Token expired") {
                    // Auto logout for expired token
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                    return;
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error("Technical Error!");
        }
    }

    public async requestExcelFile(endpoint: string, options: RequestInit = {}) {
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error("Technical Error!");
        }
    }
}

export const facilityAuthApiService = new ApiService(AUTH_API_BASE_URL);
export const apiService = new ApiService(FACILITY_API_BASE_URL);