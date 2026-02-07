import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/experience.css";

export default function Experience() {
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    API.get("/api/profile")
      .then(res => setExperience(res.data?.experience || []))
      .catch(() => setExperience([]));
  }, []);

  if (!experience.length) return null;

  return (
    <section className="experience-section" id="experience">
      <div className="experience-container">

        {/* SECTION HEADER */}
        <div className="section-header">
          <span>EXPERIENCE</span>
          <div className="section-underline"></div>
        </div>

        {/* EXPERIENCE LIST */}
        <div className="experience-list">
          {experience.map((exp, i) => (
            <div className="experience-card" key={i}>
              <h3>{exp.role}</h3>
              <h4>{exp.company}</h4>
              <p>{exp.description}</p>
              <span className="exp-duration">{exp.duration}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
