import axios from "axios";

const API = axios.create({
  baseURL: "https://future-fs-backend-1d1d.onrender.com",
});

export default API;
