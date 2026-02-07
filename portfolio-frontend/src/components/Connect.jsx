import { useEffect, useState } from "react";
import API from "../api/api";
import "../styles/connect.css";

export default function Connect() {
  const [socials, setSocials] = useState(null);

  useEffect(() => {
    API.get("/api/profile")
      .then((res) => setSocials(res.data?.socials))
      .catch(() => setSocials(null));
  }, []);

  if (!socials) return null;

  return (
    <>
      <section className="connect-section" id="connect">
        <div className="section-container">
          {/* HEADER */}
          <div className="section-header">
            <span>CONNECT / GET IN TOUCH</span>
            <div className="section-underline"></div>
          </div>

          {/* CARDS */}
          <div className="connect-grid">
            {/* LINKEDIN */}
            <a
              href={socials.linkedin}
              rel="noreferrer"
              className="connect-card"
            >
              <div className="icon-box linkedin">
                <i className="fab fa-linkedin-in"></i>
              </div>

              <div className="connect-info">
                <h3>LinkedIn</h3>
                <p>in/gowtham</p>
                <span>CONNECT</span>
              </div>
            </a>

            {/* GITHUB */}
            <a
              href={socials.github}
              rel="noreferrer"
              className="connect-card"
            >
              <div className="icon-box github">
                <i className="fab fa-github"></i>
              </div>

              <div className="connect-info">
                <h3>GitHub</h3>
                <p>@gowtham</p>
                <span>VIEW CODE</span>
              </div>
            </a>

            {/* EMAIL — THIS IS THE ONLY CORRECT WAY */}
           {/* EMAIL */}
<a
  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${socials.email}`}
  target="_blank"
  rel="noopener noreferrer"
  className="connect-card"
>

  <div className="icon-box email">
    <i className="fas fa-envelope"></i>
  </div>

  <div className="connect-info">
    <h3>Email</h3>
    <p>{socials.email}</p>
    <span>SEND MESSAGE</span>
  </div>
</a>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        © {new Date().getFullYear()} N.Gowtham. All rights reserved.
      </footer>
    </>
  );
}
