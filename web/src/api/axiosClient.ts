import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5248/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST (İSTEK) INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Token varsa Header'a ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE (CEVAP) INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Eğer Backend "401 Unauthorized" dönerse (Token geçersiz/yok):
    if (error.response && error.response.status === 401) {
      console.error("⛔ Token geçersiz! Çıkış yapılıyor...");

      // 1. Token'ı sil (ki hatalı token kalmasın)
      localStorage.removeItem("token");

      // 2. Kullanıcıyı zorla Login sayfasına gönder
      // (Eğer zaten login sayfasındaysa döngüye girmemesi için kontrol edebilirsin ama genelde gerekmez)
      if (window.location.pathname !== "/login") {
         window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;