const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    // Authentication APIs
    auth: {
        login: async (email, password) => {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            return response.json();
        },

        register: async (userData) => {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            return response.json();
        },

        getProfile: async () => {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            return response.json();
        },
    },

    // Event APIs
    events: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/events`, {
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            return response.json();
        },

        create: async (eventData) => {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token'),
                },
                body: JSON.stringify(eventData),
            });
            return response.json();
        },

        delete: async (eventId) => {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            return response.json();
        },

        getCalendarEvents: async () => {
            const response = await fetch(`${API_BASE_URL}/events/calendar`, {
                headers: {
                    'Authorization': localStorage.getItem('token'),
                },
            });
            return response.json();
        },
    },

    // Error handler
    handleError: (error) => {
        console.error('API Error:', error);
        if (error.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
        throw error;
    }
};

export default api; 