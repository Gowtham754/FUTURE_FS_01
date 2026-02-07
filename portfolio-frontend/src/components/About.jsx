import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/about.css";

function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get("/profile")
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
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

    <p>{profile?.bio}</p>

    {profile?.resume && (
      <a
        href={`https://future-fs-backend-1d1d.onrender.com${profile.resume}`}
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
      src={`https://future-fs-backend-1d1d.onrender.com${profile.photo}`}
      alt="Profile"
    />
  </div>
</section>
  );
}

export default About;
