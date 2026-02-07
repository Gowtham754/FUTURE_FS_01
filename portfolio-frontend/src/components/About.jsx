import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/about.css";

function About() {
  const [profile, setProfile] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    API.get("/api/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));
  }, []);

  if (!profile) {
    return <section className="about">Loading...</section>;
  }

  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <h1>
          Hi, I’m <span>N. Gowtham</span>
        </h1>

        <p>{profile.bio}</p>

        {profile.resume && (
          <a
            href={`${BASE_URL}${profile.resume}`}
            className="resume-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
        )}
      </div>

      <div className="about-photo">
        <img
          src={`${BASE_URL}${profile.photo}`}
          alt="Profile"
        />
      </div>
    </section>
  );
}

export default About;
