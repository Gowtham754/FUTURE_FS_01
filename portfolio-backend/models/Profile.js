const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  name: String,
  title: String,
  bio: String,
  photo: String,

  skills: [String],

  experience: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    },
  ],

  projects: [
    {
      title: String,
      description: String,
      tech: [String],
      github: String,
      live: String,
    },
  ],

  socials: {
    linkedin: String,
    github: String,
    email: String,
  },

  resume: String,

  leetcodeUsername: { type: String, default: "Gowtham-N" },
  githubUsername: { type: String, default: "Gowtham754" },
  leetcodeSettings: {
    enabled: { type: Boolean, default: true },
    heatmapEnabled: { type: Boolean, default: true },
    statsEnabled: { type: Boolean, default: true },
    recentEnabled: { type: Boolean, default: true }
  },
  githubSettings: {
    enabled: { type: Boolean, default: true },
    heatmapEnabled: { type: Boolean, default: true },
    statsEnabled: { type: Boolean, default: true },
    recentEnabled: { type: Boolean, default: true },
    chartsEnabled: { type: Boolean, default: true }
  },
  cacheInterval: { type: Number, default: 60 }, // cache time in minutes
  
  leetcodeCache: { type: mongoose.Schema.Types.Mixed, default: null },
  leetcodeLastFetched: { type: Date, default: null },
  
  githubCache: { type: mongoose.Schema.Types.Mixed, default: null },
  githubLastFetched: { type: Date, default: null }
});

module.exports = mongoose.model("Profile", ProfileSchema);
