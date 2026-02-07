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
});

module.exports = mongoose.model("Profile", ProfileSchema);
