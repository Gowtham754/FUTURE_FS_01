import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get("/api/projects").then(res => {
      setProjects(res.data?.projects || []);
    });
  }, []);

  return (
    <section className="projects-section" id="projects">
      <h2 className="section-title">Projects / Work</h2>

      <div className="projects-list">
        {projects.length === 0 && (
          <p className="empty-text">No projects added yet.</p>
        )}

        {projects.map((p, i) => (
          <div className="project-card" key={i}>
            <div className="project-info">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>

            <div className="project-actions">
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn github"
                >
                  GitHub
                </a>
              )}

              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noreferrer"
                  className="btn live"
                >
                  Visit Site
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
