import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4000/api/public",
});

export const getPublicSettings = async () => {
  try {
    const res = await API.get("/settings");
    return res.data;
  } catch {
    return { success: false, data: null };
  }
};
