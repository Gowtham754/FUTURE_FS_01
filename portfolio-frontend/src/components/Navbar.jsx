import { useEffect, useState, useMemo } from "react";
import "../styles/navbar.css";

export default function Navbar({ profile }) {
  const [active, setActive] = useState("about");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const sections = useMemo(() => {
    const list = ["about", "skills", "projects", "experience"];
    if (profile?.leetcodeSettings?.enabled) {
      list.push("leetcode");
    }
    if (profile?.githubSettings?.enabled) {
      list.push("github");
    }
    list.push("connect");
    return list;
  }, [profile]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 140;

      for (let sec of sections) {
        const el = document.getElementById(sec);
        if (
          el &&
          scrollY >= el.offsetTop &&
          scrollY < el.offsetTop + el.offsetHeight
        ) {
          setActive(sec);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">N.GOWTHAM</div>

      <ul className="nav-links">
        {sections.map(sec => (
          <li
            key={sec}
            className={active === sec ? "active" : ""}
          >
            <a href={`#${sec}`}>
              {sec.charAt(0).toUpperCase() + sec.slice(1)}
            </a>
          </li>
        ))}
        <li>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
