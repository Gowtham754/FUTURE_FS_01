import axios from "axios";

const API = axios.create({
  baseURL: "https://portfolio-backend-t1ef.onrender.com",
});

export default API;
