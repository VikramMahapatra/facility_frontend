import { apiService } from '../api';

class TicketPMTemplateApiService {

    async getTicketPMTemplates(params?: URLSearchParams) {
        const qs = params?.toString() ? `?${params.toString()}` : "";
        return await apiService.request(`/ticket-pm-templates${qs}`);
    }

    async getTicketPMTemplateLookup(category_id?: any) {
        let url = '/ticket-pm-templates/lookup';
        if (category_id) {
            url += `?category_id=${category_id}`;
        }
        return await apiService.request(url);
    }

    async addTicketPMTemplate(templateData: any) {
        return await apiService.request('/ticket-pm-templates', {
            method: 'POST',
            body: JSON.stringify(templateData),
        });
    }

    async updateTicketPMTemplate(templateData: any) {
        return await apiService.request('/ticket-pm-templates', {
            method: 'PUT',
            body: JSON.stringify(templateData),
        });
    }

    async deleteTicketPMTemplate(id: any) {
        return await apiService.request(`/ticket-pm-templates/${id}`, {
            method: 'DELETE',
        });
    }

}

export const ticketPMTemplateApiService = new TicketPMTemplateApiService();



