import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Experience from "../components/Experience";
import LeetCode from "../components/LeetCode";
import GitHub from "../components/GitHub";
import Contact from "../components/Connect";

export default function Home({ profile }) {
  const showLeetcode = profile?.leetcodeSettings?.enabled;
  const showGithub = profile?.githubSettings?.enabled;

  return (
    <>
      <About />
      <Skills />
      <Projects />
      <Experience />
      {showLeetcode && <LeetCode profile={profile} />}
      {showGithub && <GitHub profile={profile} />}
      <Contact />
    </>
  );
}
