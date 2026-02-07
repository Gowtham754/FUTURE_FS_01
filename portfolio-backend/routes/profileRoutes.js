const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   GET PROFILE (PUBLIC)
========================= */
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.json({});
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

module.exports = router;
