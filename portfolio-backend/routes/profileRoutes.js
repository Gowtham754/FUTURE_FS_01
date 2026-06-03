const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/authMiddleware");
const { fetchLeetcodeData } = require("../utils/leetcodeFetcher");
const { fetchGithubData } = require("../utils/githubFetcher");

const router = express.Router();

/* =========================
   GET PROFILE (PUBLIC)
========================= */
router.get("/", async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({
        name: "N. Gowtham",
        title: "Full Stack Developer",
        bio: "I build responsive, modern, and highly interactive web applications using clean architecture and state-of-the-art animations.",
        skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"],
        leetcodeUsername: "Gowtham-N",
        githubUsername: "Gowtham754",
        leetcodeSettings: {
          enabled: true,
          heatmapEnabled: true,
          statsEnabled: true,
          recentEnabled: true
        },
        githubSettings: {
          enabled: true,
          heatmapEnabled: true,
          statsEnabled: true,
          recentEnabled: true,
          chartsEnabled: true
        },
        socials: {
          linkedin: "https://linkedin.com",
          github: "https://github.com/Gowtham754",
          email: "nakkagowtham399@gmail.com"
        },
        cacheInterval: 60
      });
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE SOCIAL LINKS
========================= */
router.put("/socials", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.socials = {
      linkedin: req.body.linkedin || "",
      github: req.body.github || "",
      email: req.body.email || "",
    };

    await profile.save();
    res.json(profile.socials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE SKILLS
========================= */
router.put("/skills", auth, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.skills = skills;
    await profile.save();

    res.json(profile.skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD EXPERIENCE ✅
========================= */
router.post("/experience", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    const experience = {
      company: req.body.company,
      role: req.body.role,
      duration: req.body.duration,
      description: req.body.description,
    };

    profile.experience.push(experience);
    await profile.save();

    res.json(profile.experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE EXPERIENCE ✅
========================= */
router.delete("/experience/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.id
    );

    await profile.save();
    res.json(profile.experience);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD PROJECT
========================= */
router.post("/projects", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    const project = {
      title: req.body.title,
      description: req.body.description,
      tech: req.body.tech || [],
      github: req.body.github || "",
      live: req.body.live || "",
    };

    profile.projects.push(project);
    await profile.save();

    res.json(profile.projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE PROJECT
========================= */
router.delete("/projects/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    profile.projects = profile.projects.filter(
      (p) => p._id.toString() !== req.params.id
    );

    await profile.save();
    res.json(profile.projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE ABOUT (ADMIN) ✅
========================= */
router.put("/", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(req.body);
    } else {
      profile.name = req.body.name;
      profile.title = req.body.title;
      profile.bio = req.body.bio;
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UPDATE INTEGRATIONS (ADMIN) ✅
========================= */
router.put("/integrations", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.leetcodeUsername = req.body.leetcodeUsername || "Gowtham-N";
    profile.githubUsername = req.body.githubUsername || "Gowtham754";
    
    if (req.body.leetcodeSettings) {
      profile.leetcodeSettings = {
        enabled: req.body.leetcodeSettings.enabled !== undefined ? req.body.leetcodeSettings.enabled : profile.leetcodeSettings.enabled,
        heatmapEnabled: req.body.leetcodeSettings.heatmapEnabled !== undefined ? req.body.leetcodeSettings.heatmapEnabled : profile.leetcodeSettings.heatmapEnabled,
        statsEnabled: req.body.leetcodeSettings.statsEnabled !== undefined ? req.body.leetcodeSettings.statsEnabled : profile.leetcodeSettings.statsEnabled,
        recentEnabled: req.body.leetcodeSettings.recentEnabled !== undefined ? req.body.leetcodeSettings.recentEnabled : profile.leetcodeSettings.recentEnabled
      };
    }
    
    if (req.body.githubSettings) {
      profile.githubSettings = {
        enabled: req.body.githubSettings.enabled !== undefined ? req.body.githubSettings.enabled : profile.githubSettings.enabled,
        heatmapEnabled: req.body.githubSettings.heatmapEnabled !== undefined ? req.body.githubSettings.heatmapEnabled : profile.githubSettings.heatmapEnabled,
        statsEnabled: req.body.githubSettings.statsEnabled !== undefined ? req.body.githubSettings.statsEnabled : profile.githubSettings.statsEnabled,
        recentEnabled: req.body.githubSettings.recentEnabled !== undefined ? req.body.githubSettings.recentEnabled : profile.githubSettings.recentEnabled,
        chartsEnabled: req.body.githubSettings.chartsEnabled !== undefined ? req.body.githubSettings.chartsEnabled : profile.githubSettings.chartsEnabled
      };
    }
    
    profile.cacheInterval = req.body.cacheInterval !== undefined ? req.body.cacheInterval : 60;

    await profile.save();
    res.json({
      leetcodeUsername: profile.leetcodeUsername,
      githubUsername: profile.githubUsername,
      leetcodeSettings: profile.leetcodeSettings,
      githubSettings: profile.githubSettings,
      cacheInterval: profile.cacheInterval
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET LEETCODE DATA (PUBLIC) ✅
========================= */
router.get("/leetcode", async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const username = profile.leetcodeUsername || "Gowtham-N";
    const cacheIntervalMs = (profile.cacheInterval || 60) * 60 * 1000;
    const now = new Date();

    // Check cache validity
    const isCacheValid = 
      profile.leetcodeCache && 
      profile.leetcodeLastFetched && 
      (now - profile.leetcodeLastFetched < cacheIntervalMs);

    if (isCacheValid) {
      return res.json({ source: "cache", data: profile.leetcodeCache });
    }

    // Cache stale/missing: fetch fresh
    try {
      const freshData = await fetchLeetcodeData(username);
      profile.leetcodeCache = freshData;
      profile.leetcodeLastFetched = now;
      await profile.save();
      return res.json({ source: "network", data: freshData });
    } catch (fetchErr) {
      console.error("Failed to fetch fresh LeetCode data:", fetchErr.message);
      if (profile.leetcodeCache) {
        return res.json({ source: "stale-cache", data: profile.leetcodeCache, warning: fetchErr.message });
      }
      return res.status(502).json({ message: "Failed to fetch LeetCode data", error: fetchErr.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET GITHUB DATA (PUBLIC) ✅
========================= */
router.get("/github", async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const username = profile.githubUsername || "Gowtham754";
    const cacheIntervalMs = (profile.cacheInterval || 60) * 60 * 1000;
    const now = new Date();

    // Check cache validity
    const isCacheValid = 
      profile.githubCache && 
      profile.githubLastFetched && 
      (now - profile.githubLastFetched < cacheIntervalMs);

    if (isCacheValid) {
      return res.json({ source: "cache", data: profile.githubCache });
    }

    // Cache stale/missing: fetch fresh
    try {
      const freshData = await fetchGithubData(username, process.env.GITHUB_TOKEN || process.env["github-token"]);
      profile.githubCache = freshData;
      profile.githubLastFetched = now;
      await profile.save();
      return res.json({ source: "network", data: freshData });
    } catch (fetchErr) {
      console.error("Failed to fetch fresh GitHub data:", fetchErr.message);
      if (profile.githubCache) {
        return res.json({ source: "stale-cache", data: profile.githubCache, warning: fetchErr.message });
      }
      return res.status(502).json({ message: "Failed to fetch GitHub data", error: fetchErr.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   FORCE REFRESH LEETCODE DATA (ADMIN) ✅
========================= */
router.post("/leetcode/refresh", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const username = profile.leetcodeUsername || "Gowtham-N";
    const freshData = await fetchLeetcodeData(username);
    
    profile.leetcodeCache = freshData;
    profile.leetcodeLastFetched = new Date();
    await profile.save();
    
    res.json({ message: "LeetCode cache refreshed successfully", data: freshData });
  } catch (err) {
    res.status(500).json({ message: "Refresh failed", error: err.message });
  }
});

/* =========================
   FORCE REFRESH GITHUB DATA (ADMIN) ✅
========================= */
router.post("/github/refresh", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const username = profile.githubUsername || "Gowtham754";
    const freshData = await fetchGithubData(username, process.env.GITHUB_TOKEN || process.env["github-token"]);
    
    profile.githubCache = freshData;
    profile.githubLastFetched = new Date();
    await profile.save();
    
    res.json({ message: "GitHub cache refreshed successfully", data: freshData });
  } catch (err) {
    res.status(500).json({ message: "Refresh failed", error: err.message });
  }
});

module.exports = router;
