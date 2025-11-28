import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5248/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST (İSTEK) INTERCEPTOR ---
// Her istekten önce çalışır ve Token'ı ekler
api.interceptors.request.use(
  (config) => {
    // 1. Token'ı al
    const token = localStorage.getItem("token");

    // Konsola yazdıralım ki Token gerçekten var mı görelim (DEBUG)
    // Eğer null yazıyorsa Login sayfasında kaydetme sorunu vardır.
    // console.log("Giden İstek:", config.url, "| Token Durumu:", token ? "Var" : "YOK");

    // Login ve Register hariç diğerlerine token ekle
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
// Backend'den hata dönerse burası yakalar
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Eğer Backend "401 Unauthorized" (Yetkisiz) derse:
    if (error.response && error.response.status === 401) {
      console.error("⛔ Yetkisiz Erişim! Token geçersiz veya süresi dolmuş.");
      
      // İstersen burada kullanıcıyı otomatik çıkış yaptırabilirsin:
      // localStorage.removeItem("token");
      // window.location.href = "/login"; // Login sayfasına yönlendir
    }
    return Promise.reject(error);
  }
);

export default api;