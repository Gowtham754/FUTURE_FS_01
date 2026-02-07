import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/skills.css";

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    API.get("/profile")
      .then(res => setSkills(res.data?.skills || []))
      .catch(() => setSkills([]));
  }, []);

  return (
    <section className="skills-section" id="skills">
      {/* CONTAINER to align with Projects */}
      <div className="skills-container">
        
        {/* SECTION HEADING (same alignment as Projects) */}
        <div className="section-header">
          <span>SKILLS / STACK</span>
          <div className="section-underline"></div>
        </div>

        {/* SKILLS */}
        <div className="skills-grid">
          {skills.map((skill, i) => (
            <div className="skill-card" key={i}>
              {skill}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
