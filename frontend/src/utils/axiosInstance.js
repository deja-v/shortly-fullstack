import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    timeout: 30000,     
    headers: {
        "Content-type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const validateToken = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    
    const response = await axiosInstance.get("/user/me");
    return response.data.success;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return false;
  }
};

export default axiosInstance;