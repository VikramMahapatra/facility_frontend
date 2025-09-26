import { apiService } from '../api';

class ContactApiService {

    async getCustomerLookup(kind?: string) {
        let url = '/contacts/lookup';
        if (kind) {
            url += `?kind=${kind}`;
        }
        return await apiService.request(url);
    }

}

export const contactApiService = new ContactApiService();