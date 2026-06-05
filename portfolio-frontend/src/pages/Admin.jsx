import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/admin.css";

export default function Admin() {
  const [token, setToken] = useState("");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [activeTab, setActiveTab] = useState("about");

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

  // Integrations settings
  const [leetcodeUsername, setLeetcodeUsername] = useState("Gowtham-N");
  const [githubUsername, setGithubUsername] = useState("Gowtham754");
  const [leetcodeSettings, setLeetcodeSettings] = useState({
    enabled: true,
    heatmapEnabled: true,
    statsEnabled: true,
    recentEnabled: true
  });
  const [githubSettings, setGithubSettings] = useState({
    enabled: true,
    heatmapEnabled: true,
    statsEnabled: true,
    recentEnabled: true,
    chartsEnabled: true
  });
  const [cacheInterval, setCacheInterval] = useState(60);

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
    try {
      const res = await API.get("/api/profile");
      const data = res.data.profile || res.data;

      setSkills(data?.skills || []);
      setProjects(data?.projects || []);
      setExperience(data?.experience || []);
      setSocials(data?.socials || { linkedin: "", github: "", email: "" });

      setAbout({
        name: data?.name || "",
        title: data?.title || "",
        bio: data?.bio || "",
      });

      // integrations config
      setLeetcodeUsername(data?.leetcodeUsername || "Gowtham-N");
      setGithubUsername(data?.githubUsername || "Gowtham754");
      setLeetcodeSettings(data?.leetcodeSettings || { enabled: true, heatmapEnabled: true, statsEnabled: true, recentEnabled: true });
      setGithubSettings(data?.githubSettings || { enabled: true, heatmapEnabled: true, statsEnabled: true, recentEnabled: true, chartsEnabled: true });
      setCacheInterval(data?.cacheInterval || 60);
    } catch (err) {
      console.error("Load profile error:", err);
    }
  };

  /* ================= ABOUT ================= */

  const updateAbout = async () => {
    try {
      await API.put("/api/profile", about, {
        headers: { Authorization: token },
      });
      alert("About section updated");
    } catch (err) {
      console.error(err);
      alert("Update About failed");
    }
  };

  /* ================= SKILLS ================= */

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      const updated = [...skills, newSkill.trim()];
      const res = await API.put(
        "/api/profile/skills",
        { skills: updated },
        { headers: { Authorization: token } }
      );
      setSkills(res.data.skills || res.data);
      setNewSkill("");
    } catch (err) {
      console.error(err);
      alert("Add skill failed");
    }
  };

  const removeSkill = async (skill) => {
    try {
      const updated = skills.filter((s) => s !== skill);
      const res = await API.put(
        "/api/profile/skills",
        { skills: updated },
        { headers: { Authorization: token } }
      );
      setSkills(res.data.skills || res.data);
    } catch (err) {
      console.error(err);
      alert("Remove skill failed");
    }
  };

  /* ================= PROJECTS ================= */

  const addProject = async () => {
    if (!project.title || !project.description) {
      return alert("Title & Description required");
    }
    try {
      const res = await API.post("/api/profile/projects", project, {
        headers: { Authorization: token },
      });
      setProjects(res.data.projects || res.data);
      setProject({ title: "", description: "", github: "", live: "" });
    } catch (err) {
      console.error(err);
      alert("Add project failed");
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await API.delete(`/api/profile/projects/${id}`, {
        headers: { Authorization: token },
      });
      setProjects(res.data.projects || res.data);
    } catch (err) {
      console.error(err);
      alert("Delete project failed");
    }
  };

  /* ================= EXPERIENCE ================= */

  const addExperience = async () => {
    if (!exp.company || !exp.role) {
      return alert("Company & Role required");
    }
    try {
      const res = await API.post("/api/profile/experience", exp, {
        headers: { Authorization: token },
      });
      setExperience(res.data.experience || res.data);
      setExp({ company: "", role: "", duration: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Add experience failed");
    }
  };

  const deleteExperience = async (id) => {
    try {
      const res = await API.delete(`/api/profile/experience/${id}`, {
        headers: { Authorization: token },
      });
      setExperience(res.data.experience || res.data);
    } catch (err) {
      console.error(err);
      alert("Delete experience failed");
    }
  };

  /* ================= SOCIAL LINKS ================= */

  const updateSocials = async () => {
    try {
      await API.put("/api/profile/socials", socials, {
        headers: { Authorization: token },
      });
      alert("Social links updated");
    } catch (err) {
      console.error(err);
      alert("Save socials failed");
    }
  };

  /* ================= INTEGRATIONS ================= */

  const updateIntegrations = async () => {
    try {
      await API.put("/api/profile/integrations", {
        leetcodeUsername,
        githubUsername,
        leetcodeSettings,
        githubSettings,
        cacheInterval
      }, {
        headers: { Authorization: token },
      });
      alert("Integration settings updated successfully");
    } catch (err) {
      console.error(err);
      alert("Update integration settings failed");
    }
  };

  const forceRefreshCache = async (platform) => {
    try {
      alert(`Refreshing ${platform} data...`);
      const res = await API.post(`/api/profile/${platform}/refresh`, {}, {
        headers: { Authorization: token },
      });
      alert(res.data?.message || `${platform} data updated!`);
    } catch (err) {
      console.error(err);
      const detailedError = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Manual refresh failed: ${detailedError}`);
    }
  };

  /* ================= FILE UPLOADS ================= */

  const uploadResume = async () => {
    if (!resume) return alert("Select a file first");
    try {
      const fd = new FormData();
      fd.append("resume", resume);
      await API.post("/api/resume", fd, {
        headers: { Authorization: token },
      });
      alert("Resume uploaded");
    } catch (err) {
      console.error(err);
      alert("Resume upload failed");
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return alert("Select a file first");
    try {
      const fd = new FormData();
      fd.append("photo", photo);
      await API.post("/api/photo", fd, {
        headers: { Authorization: token },
      });
      alert("Photo uploaded");
    } catch (err) {
      console.error(err);
      alert("Photo upload failed");
    }
  };

  /* ================= LOGIN SCREEN ================= */

  if (!token) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <input
          placeholder="Username"
          value={login.username}
          onChange={(e) =>
            setLogin({ ...login, username: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={login.password}
          onChange={(e) =>
            setLogin({ ...login, password: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <button className="admin-btn danger logout-btn" onClick={() => setToken("")}>
            Logout
          </button>
        </div>

        {/* ADMIN TAB NAVIGATION MENU */}
        <div className="admin-tabs-nav">
          <button 
            className={activeTab === "about" ? "active" : ""} 
            onClick={() => setActiveTab("about")}
          >
            👤 About & Socials
          </button>
          <button 
            className={activeTab === "skills" ? "active" : ""} 
            onClick={() => setActiveTab("skills")}
          >
            ⚡ Skills
          </button>
          <button 
            className={activeTab === "projects" ? "active" : ""} 
            onClick={() => setActiveTab("projects")}
          >
            🚀 Projects
          </button>
          <button 
            className={activeTab === "experience" ? "active" : ""} 
            onClick={() => setActiveTab("experience")}
          >
            💼 Experience
          </button>
          <button 
            className={activeTab === "integrations" ? "active" : ""} 
            onClick={() => setActiveTab("integrations")}
          >
            🔌 Integrations
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="admin-tab-content">
          
          {/* TAB 1: ABOUT & SOCIALS */}
          {activeTab === "about" && (
            <div className="tab-pane">
              <h3>General Information</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  placeholder="Name"
                  value={about.name}
                  onChange={(e) => setAbout({ ...about, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  placeholder="Title"
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  placeholder="Bio"
                  value={about.bio}
                  onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                />
              </div>
              <button className="admin-btn" onClick={updateAbout}>
                Update About Info
              </button>

              <hr className="admin-divider" />

              <h3>Media Uploads</h3>
              <div className="form-group">
                <label>Profile Photo</label>
                <div className="file-upload-row">
                  <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
                  <button className="admin-btn" onClick={uploadPhoto}>
                    Upload Photo
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Resume File</label>
                <div className="file-upload-row">
                  <input type="file" onChange={(e) => setResume(e.target.files[0])} />
                  <button className="admin-btn" onClick={uploadResume}>
                    Upload Resume
                  </button>
                </div>
              </div>

              <hr className="admin-divider" />

              <h3>Social Links</h3>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  placeholder="LinkedIn URL"
                  value={socials.linkedin}
                  onChange={(e) =>
                    setSocials({ ...socials, linkedin: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  placeholder="GitHub URL"
                  value={socials.github}
                  onChange={(e) =>
                    setSocials({ ...socials, github: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  placeholder="Email"
                  value={socials.email}
                  onChange={(e) =>
                    setSocials({ ...socials, email: e.target.value })
                  }
                />
              </div>
              <button className="admin-btn" onClick={updateSocials}>
                Save Social Links
              </button>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === "skills" && (
            <div className="tab-pane">
              <h3>Manage Skills</h3>
              <div className="add-row">
                <input
                  value={newSkill}
                  placeholder="New skill (e.g. Node.js)"
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button className="admin-btn" onClick={addSkill}>
                  Add Skill
                </button>
              </div>

              <ul className="admin-list">
                {skills.map((s) => (
                  <li key={s}>
                    <span>{s}</span>
                    <button
                      className="admin-btn danger delete-btn-small"
                      onClick={() => removeSkill(s)}
                    >
                      ❌ Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === "projects" && (
            <div className="tab-pane">
              <h3>Add Project</h3>
              <div className="form-group">
                <label>Project Title</label>
                <input
                  placeholder="Title"
                  value={project.title}
                  onChange={(e) =>
                    setProject({ ...project, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  placeholder="Description"
                  value={project.description}
                  onChange={(e) =>
                    setProject({ ...project, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>GitHub Repository URL</label>
                <input
                  placeholder="GitHub URL"
                  value={project.github}
                  onChange={(e) =>
                    setProject({ ...project, github: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Live Site URL</label>
                <input
                  placeholder="Live URL"
                  value={project.live}
                  onChange={(e) =>
                    setProject({ ...project, live: e.target.value })
                  }
                />
              </div>
              <button className="admin-btn" onClick={addProject}>
                Add Project
              </button>

              <hr className="admin-divider" />

              <h3>Current Projects</h3>
              <ul className="admin-list">
                {projects.map((p) => (
                  <li key={p._id}>
                    <div className="list-details">
                      <strong>{p.title}</strong>
                      <p className="list-desc-small">{p.description}</p>
                    </div>
                    <button
                      className="admin-btn danger delete-btn-small"
                      onClick={() => deleteProject(p._id)}
                    >
                      ❌ Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="tab-pane">
              <h3>Add Experience</h3>
              <div className="form-group">
                <label>Company</label>
                <input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    setExp({ ...exp, company: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) =>
                    setExp({ ...exp, role: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  placeholder="Duration (e.g. Jan 2023 - Present)"
                  value={exp.duration}
                  onChange={(e) =>
                    setExp({ ...exp, duration: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) =>
                    setExp({ ...exp, description: e.target.value })
                  }
                />
              </div>
              <button className="admin-btn" onClick={addExperience}>
                Add Experience
              </button>

              <hr className="admin-divider" />

              <h3>Experience Timeline</h3>
              <ul className="admin-list">
                {experience.map((e) => (
                  <li key={e._id}>
                    <div className="list-details">
                      <strong>{e.role}</strong>
                      <span className="sub-detail">{e.company} | {e.duration}</span>
                    </div>
                    <button
                      className="admin-btn danger delete-btn-small"
                      onClick={() => deleteExperience(e._id)}
                    >
                      ❌ Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="tab-pane">
              <h3>LeetCode Configuration</h3>
              <div className="form-group">
                <label>LeetCode Username</label>
                <input
                  placeholder="LeetCode Username"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                />
              </div>
              
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={leetcodeSettings.enabled}
                    onChange={(e) =>
                      setLeetcodeSettings({ ...leetcodeSettings, enabled: e.target.checked })
                    }
                  />
                  Enable LeetCode Tab Section
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={leetcodeSettings.heatmapEnabled}
                    disabled={!leetcodeSettings.enabled}
                    onChange={(e) =>
                      setLeetcodeSettings({ ...leetcodeSettings, heatmapEnabled: e.target.checked })
                    }
                  />
                  Show Activity Heatmap
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={leetcodeSettings.statsEnabled}
                    disabled={!leetcodeSettings.enabled}
                    onChange={(e) =>
                      setLeetcodeSettings({ ...leetcodeSettings, statsEnabled: e.target.checked })
                    }
                  />
                  Show Statistics Cards
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={leetcodeSettings.recentEnabled}
                    disabled={!leetcodeSettings.enabled}
                    onChange={(e) =>
                      setLeetcodeSettings({ ...leetcodeSettings, recentEnabled: e.target.checked })
                    }
                  />
                  Show Recent Submissions
                </label>
              </div>

              <div className="action-row">
                <button
                  className="admin-btn refresh-btn"
                  onClick={() => forceRefreshCache("leetcode")}
                  disabled={!leetcodeSettings.enabled}
                >
                  🔄 Force Refresh LeetCode Cache
                </button>
              </div>

              <hr className="admin-divider" />

              <h3>GitHub Configuration</h3>
              <div className="form-group">
                <label>GitHub Username</label>
                <input
                  placeholder="GitHub Username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                />
              </div>

              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={githubSettings.enabled}
                    onChange={(e) =>
                      setGithubSettings({ ...githubSettings, enabled: e.target.checked })
                    }
                  />
                  Enable GitHub Tab Section
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={githubSettings.heatmapEnabled}
                    disabled={!githubSettings.enabled}
                    onChange={(e) =>
                      setGithubSettings({ ...githubSettings, heatmapEnabled: e.target.checked })
                    }
                  />
                  Show Contribution Heatmap
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={githubSettings.statsEnabled}
                    disabled={!githubSettings.enabled}
                    onChange={(e) =>
                      setGithubSettings({ ...githubSettings, statsEnabled: e.target.checked })
                    }
                  />
                  Show Analytics/Stats
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={githubSettings.chartsEnabled}
                    disabled={!githubSettings.enabled}
                    onChange={(e) =>
                      setGithubSettings({ ...githubSettings, chartsEnabled: e.target.checked })
                    }
                  />
                  Show Language Pie Chart
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={githubSettings.recentEnabled}
                    disabled={!githubSettings.enabled}
                    onChange={(e) =>
                      setGithubSettings({ ...githubSettings, recentEnabled: e.target.checked })
                    }
                  />
                  Show Recent Activity
                </label>
              </div>

              <div className="action-row">
                <button
                  className="admin-btn refresh-btn"
                  onClick={() => forceRefreshCache("github")}
                  disabled={!githubSettings.enabled}
                >
                  🔄 Force Refresh GitHub Cache
                </button>
              </div>

              <hr className="admin-divider" />

              <h3>Caching Controls</h3>
              <div className="form-group">
                <label>Cache Expiration Interval (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  placeholder="Minutes"
                  value={cacheInterval}
                  onChange={(e) => setCacheInterval(parseInt(e.target.value, 10) || 60)}
                />
                <span className="help-text">
                  Determines how often the backend fetches live stats. Set higher to avoid rate limits. (e.g. 60 = 1 hour)
                </span>
              </div>

              <button className="admin-btn" onClick={updateIntegrations}>
                Save Integrations Settings
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
