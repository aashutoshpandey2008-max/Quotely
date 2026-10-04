const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("node:dns");
require("dotenv").config();

const Favourite = require("./models/Favourite");
const fallbackQuotes = require("./data/fallbackQuotes.json");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Quote Generator API is running 🚀"
  });
});

app.post("/api/favourites", async (req, res) => {
  try {
    const { text, author, topic } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Quote text is required"
      });
    }

    const favourite = new Favourite({
      text,
      author: author || "Unknown",
      topic: topic || "General"
    });

    const savedFavourite = await favourite.save();

    res.status(201).json(savedFavourite);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save favourite",
      error: error.message
    });
  }
});

app.get("/api/favourites", async (req, res) => {
  try {
    const favourites = await Favourite.find().sort({
      createdAt: -1
    });

    res.json(favourites);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch favourites",
      error: error.message
    });
  }
});

app.delete("/api/favourites/:id", async (req, res) => {
  try {
    const favourite = await Favourite.findByIdAndDelete(req.params.id);

    if (!favourite) {
      return res.status(404).json({
        message: "Favourite not found"
      });
    }

    res.json({
      message: "Favourite deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete favourite",
      error: error.message
    });
  }
});

app.get("/api/quotes/random", async (req, res) => {
  try {
    const response = await fetch(
      "https://dummyjson.com/quotes/random"
    );

    if (!response.ok) {
      throw new Error("External quote API failed");
    }

    const data = await response.json();

    const quote = {
      text: data.quote,
      author: data.author || "Unknown",
      topic: "General",
      source: "api"
    };

    res.json(quote);

  } catch (error) {
    console.error("Quote API error:", error.message);
    console.log("Using fallback quote...");

    const randomIndex = Math.floor(
      Math.random() * fallbackQuotes.length
    );

    const fallback = fallbackQuotes[randomIndex];

    res.json({
      text: fallback.text,
      author: fallback.author,
      topic: fallback.topic,
      source: "fallback"
    });
  }
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});