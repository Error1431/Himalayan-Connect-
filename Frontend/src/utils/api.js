import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

const readJson = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
};

const getAccessToken = () => {
    return (
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('hc_token') ||
        readJson('user')?.token ||
        null
    );
};

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (token) => {
    pendingQueue.forEach(({ resolve }) => resolve(token));
    pendingQueue = [];
};

const rejectQueue = (error) => {
    pendingQueue.forEach(({ reject }) => reject(error));
    pendingQueue = [];
};

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            localStorage.getItem('refreshToken')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    { refreshToken: localStorage.getItem('refreshToken') }
                );

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('token', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                resolveQueue(data.accessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                rejectQueue(refreshError);

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('token');
                localStorage.removeItem('hc_token');
                localStorage.removeItem('user');

                window.location.href = '/login?sessionExpired=true';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { API_BASE_URL };
export default api;