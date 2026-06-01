import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/about.css";

function About() {
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const nameToType = "N. Gowtham";

  useEffect(() => {
    API.get("/api/profile")
      .then((res) => {
        console.log("PROFILE API RESPONSE 👉", res.data);
        if (res.data.profile) {
          setProfile(res.data.profile);
        } else {
          setProfile(res.data);
        }
      })
      .catch((err) => {
        console.error("Profile fetch error ❌", err);
      });
  }, []);

  // Typing effect logic
  useEffect(() => {
    let timer;
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing mode
        const nextChar = nameToType.substring(0, displayName.length + 1);
        setDisplayName(nextChar);

        if (nextChar === nameToType) {
          // Complete: pause, then start deleting
          timer = setTimeout(() => {
            setIsDeleting(true);
            setTypingSpeed(80);
          }, 2000);
          return;
        }
      } else {
        // Deleting mode
        const prevChar = nameToType.substring(0, displayName.length - 1);
        setDisplayName(prevChar);

        if (prevChar === "") {
          setIsDeleting(false);
          setTypingSpeed(150);
          // Small pause before typing again
          timer = setTimeout(() => {}, 500);
          return;
        }
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayName, isDeleting, typingSpeed]);

  if (!profile) {
    return <section className="about">Loading...</section>;
  }

  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <h1>
          Hi, I’m <span>{displayName}</span>
          <span className="cursor-blink">|</span>
        </h1>

        <p>{profile?.bio || "Bio missing"}</p>

        {profile?.resume && (
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
        {profile?.photo ? (
          <img
            src={`${BASE_URL}${profile.photo}`}
            alt="Profile"
          />
        ) : (
          <p>Photo missing</p>
        )}
      </div>
    </section>
  );
}

export default About;
