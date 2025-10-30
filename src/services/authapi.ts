import { facilityAuthApiService as apiService } from '../services/api';

class AuthApiService {

    async sendOtp(mobileNo: string) {
        const response = await apiService.request('/auth/mobile/send_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobileNo
            }),
        });
    }

    async verifyOtp(mobileNo: string, otp: string) {
        const response = await apiService.request('/auth/mobile/verify_otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    mobile: mobileNo,
                    otp
                }),
        });

        localStorage.removeItem('access_token');
        if (response.success) {
            let token = response.data?.access_token;
            localStorage.setItem('access_token', token);
        }
        return response;
    }

    async authenticateGoogle(access_token: string) {
        const response = await apiService.request('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    access_token: access_token
                }),
        });

        localStorage.removeItem('access_token');
        if (response.success) {
            let token = response.data?.access_token;
            localStorage.setItem('access_token', token);
        }
        return response;
    }

    async register(userData: any) {
        return await apiService.requestWithForm('/user/register', {
            method: 'POST',
            body: userData,
        });
    }

    async setupUser(userData: any) {
        const response = await apiService.request('/user/setup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        localStorage.removeItem('access_token');
        if (response.success) {
            let token = response.data?.access_token;
            localStorage.setItem('access_token', token);
        }
        return response;
    }

    async logout() {
        localStorage.removeItem('access_token');
    }

}

export const authApiService = new AuthApiService();