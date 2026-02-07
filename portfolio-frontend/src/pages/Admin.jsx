import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/admin.css";

export default function Admin() {
  const [token, setToken] = useState("");
  const [login, setLogin] = useState({ username: "", password: "" });

  /* ================= STATES ================= */

  const [about, setAbout] = useState({
    name: "",
    title: "",
    bio: "",
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState({
    title: "",
    description: "",
    github: "",
    live: "",
  });

  const [experience, setExperience] = useState([]);
  const [exp, setExp] = useState({
    company: "",
    role: "",
    duration: "",
    description: "",
  });

  const [socials, setSocials] = useState({
    linkedin: "",
    github: "",
    email: "",
  });

  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleLogin = async () => {
    try {
      const res = await API.post("/api/auth/login", login);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      loadProfile();
    } catch (err) {
      alert("Invalid credentials");
       console.error("Login error:", err);
    }
  };

  const loadProfile = async () => {
    const res = await API.get("/api/profile");

    setSkills(res.data?.skills || []);
    setProjects(res.data?.projects || []);
    setExperience(res.data?.experience || []);
    setSocials(res.data?.socials || { linkedin: "", github: "", email: "" });

    setAbout({
      name: res.data?.name || "",
      title: res.data?.title || "",
      bio: res.data?.bio || "",
    });
  };

  /* ================= ABOUT ================= */

  const updateAbout = async () => {
    await API.put("/api/profile", about, {
      headers: { Authorization: token },
    });
    alert("About section updated");
  };

  /* ================= SKILLS ================= */

  const addSkill = async () => {
    if (!newSkill.trim()) return;

    const updated = [...skills, newSkill.trim()];

    const res = await API.put(
      "/api/profile/skills",
      { skills: updated },
      { headers: { Authorization: token } }
    );

    setSkills(res.data.skills);
    setNewSkill("");
  };

  const removeSkill = async (skill) => {
    const updated = skills.filter((s) => s !== skill);

    const res = await API.put(
      "/api/profile/skills",
      { skills: updated },
      { headers: { Authorization: token } }
    );

    setSkills(res.data.skills);
  };

  /* ================= PROJECTS ================= */

  const addProject = async () => {
    if (!project.title || !project.description) {
      return alert("Title & Description required");
    }

    const res = await API.post("/api/profile/projects", project, {
      headers: { Authorization: token },
    });

    setProjects(res.data.projects);
    setProject({ title: "", description: "", github: "", live: "" });
  };

  const deleteProject = async (id) => {
    const res = await API.delete(`/api/profile/projects/${id}`, {
      headers: { Authorization: token },
    });

    setProjects(res.data.projects);
  };

  /* ================= EXPERIENCE ================= */

  const addExperience = async () => {
    if (!exp.company || !exp.role) {
      return alert("Company & Role required");
    }

    const res = await API.post("/api/profile/experience", exp, {
      headers: { Authorization: token },
    });

    setExperience(res.data.experience);
    setExp({ company: "", role: "", duration: "", description: "" });
  };

  const deleteExperience = async (id) => {
    const res = await API.delete(`/api/profile/experience/${id}`, {
      headers: { Authorization: token },
    });

    setExperience(res.data.experience);
  };

  /* ================= SOCIAL LINKS ================= */

  const updateSocials = async () => {
    await API.put("/api/profile/socials", socials, {
      headers: { Authorization: token },
    });
    alert("Social links updated");
  };

  /* ================= FILE UPLOADS ================= */

  const uploadResume = async () => {
    const fd = new FormData();
    fd.append("resume", resume);

    await API.post("/api/resume", fd, {
      headers: { Authorization: token },
    });

    alert("Resume uploaded");
  };

  const uploadPhoto = async () => {
    const fd = new FormData();
    fd.append("photo", photo);

    await API.post("/api/photo", fd, {
      headers: { Authorization: token },
    });

    alert("Photo uploaded");
  };

  /* ================= LOGIN SCREEN ================= */

  if (!token) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>

        <input
          placeholder="Username"
          onChange={(e) =>
            setLogin({ ...login, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setLogin({ ...login, password: e.target.value })
          }
        />

        <button className="admin-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    );
  }

  /* ================= DASHBOARD ================= */

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>Admin Dashboard</h2>

        {/* ABOUT */}
        <h3>About</h3>
        <input
          placeholder="Name"
          value={about.name}
          onChange={(e) => setAbout({ ...about, name: e.target.value })}
        />
        <input
          placeholder="Title"
          value={about.title}
          onChange={(e) => setAbout({ ...about, title: e.target.value })}
        />
        <textarea
          placeholder="Bio"
          value={about.bio}
          onChange={(e) => setAbout({ ...about, bio: e.target.value })}
        />
        <button className="admin-btn" onClick={updateAbout}>
          Update About
        </button>

        {/* PHOTO */}
        <h3>Profile Photo</h3>
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        <button className="admin-btn" onClick={uploadPhoto}>
          Upload Photo
        </button>

        {/* RESUME */}
        <h3>Resume</h3>
        <input type="file" onChange={(e) => setResume(e.target.files[0])} />
        <button className="admin-btn" onClick={uploadResume}>
          Upload Resume
        </button>

        {/* SKILLS */}
        <h3>Skills</h3>
        <input
          value={newSkill}
          placeholder="New skill"
          onChange={(e) => setNewSkill(e.target.value)}
        />
        <button className="admin-btn" onClick={addSkill}>
          Add Skill
        </button>

        <ul className="admin-list">
          {skills.map((s) => (
            <li key={s}>
              {s}
              <button
                className="admin-btn danger"
                onClick={() => removeSkill(s)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        {/* PROJECTS */}
        <h3>Projects</h3>
        <input
          placeholder="Title"
          value={project.title}
          onChange={(e) =>
            setProject({ ...project, title: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          value={project.description}
          onChange={(e) =>
            setProject({ ...project, description: e.target.value })
          }
        />
        <input
          placeholder="GitHub URL"
          value={project.github}
          onChange={(e) =>
            setProject({ ...project, github: e.target.value })
          }
        />
        <input
          placeholder="Live URL"
          value={project.live}
          onChange={(e) =>
            setProject({ ...project, live: e.target.value })
          }
        />
        <button className="admin-btn" onClick={addProject}>
          Add Project
        </button>

        <ul className="admin-list">
          {projects.map((p) => (
            <li key={p._id}>
              {p.title}
              <button
                className="admin-btn danger"
                onClick={() => deleteProject(p._id)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        {/* EXPERIENCE */}
        <h3>Experience</h3>
        <input
          placeholder="Company"
          value={exp.company}
          onChange={(e) =>
            setExp({ ...exp, company: e.target.value })
          }
        />
        <input
          placeholder="Role"
          value={exp.role}
          onChange={(e) =>
            setExp({ ...exp, role: e.target.value })
          }
        />
        <input
          placeholder="Duration"
          value={exp.duration}
          onChange={(e) =>
            setExp({ ...exp, duration: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          value={exp.description}
          onChange={(e) =>
            setExp({ ...exp, description: e.target.value })
          }
        />
        <button className="admin-btn" onClick={addExperience}>
          Add Experience
        </button>

        <ul className="admin-list">
          {experience.map((e) => (
            <li key={e._id}>
              {e.role} @ {e.company}
              <button
                className="admin-btn danger"
                onClick={() => deleteExperience(e._id)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        {/* SOCIALS */}
        <h3>Social Links</h3>
        <input
          placeholder="LinkedIn URL"
          value={socials.linkedin}
          onChange={(e) =>
            setSocials({ ...socials, linkedin: e.target.value })
          }
        />
        <input
          placeholder="GitHub URL"
          value={socials.github}
          onChange={(e) =>
            setSocials({ ...socials, github: e.target.value })
          }
        />
        <input
          placeholder="Email"
          value={socials.email}
          onChange={(e) =>
            setSocials({ ...socials, email: e.target.value })
          }
        />
        <button className="admin-btn" onClick={updateSocials}>
          Save Social Links
        </button>
      </div>
    </div>
  );
}
