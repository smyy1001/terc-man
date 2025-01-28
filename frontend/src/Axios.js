import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL;
// const baseURL = 'http://192.168.1.20:8080'; 

console.log(baseURL);

const Axios = axios.create({
    baseURL: baseURL,
});

Axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (!error.response) {
            console.warn("Network hatası veya server cevap vemedi:", error);
        }
        else if (error?.response?.status === 404) {
            console.warn("404 error", error);
        }
        return Promise.reject(error);
    }
);

export default Axios;
