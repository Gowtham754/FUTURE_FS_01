import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "./api/api";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Background3D from "./components/Background3D";

export default function App() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get("/api/profile")
      .then((res) => {
        const data = res.data.profile || res.data;
        setProfile(data);
      })
      .catch((err) => console.error("Error fetching profile in App:", err));
  }, []);

  return (
    <BrowserRouter>
      <Background3D />
      <Routes>
        {/* USER PORTFOLIO */}
        <Route
          path="/"
          element={
            <>
              <Navbar profile={profile} />
              <Home profile={profile} />
            </>
          }
        />

        {/* ADMIN PAGE (NO NAVBAR) */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
