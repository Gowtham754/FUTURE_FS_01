import { useEffect, useState } from "react";
import "../styles/navbar.css";

const sections = ["about", "skills", "projects", "experience", "connect"];

export default function Navbar() {
  const [active, setActive] = useState("about");

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
  }, []);

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
      </ul>
    </nav>
  );
}
