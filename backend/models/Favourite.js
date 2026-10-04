const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },

    author: {
      type: String,
      default: "Unknown"
    },

    topic: {
      type: String,
      default: "General"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Favourite", favouriteSchema);