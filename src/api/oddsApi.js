import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

export const getCricketOdds = async () => {
  try {
    const res = await API.get("/odds/fetch?sport=cricket");
    return res.data;
  } catch {
    return { success: false, data: [] };
  }
};
