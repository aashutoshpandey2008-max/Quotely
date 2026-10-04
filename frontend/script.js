const API_URL = "http://localhost:5000";

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteTopic = document.getElementById("quoteTopic");

const quoteCard = document.getElementById("quoteCard");

const newQuoteBtn = document.getElementById("newQuoteBtn");
const favouriteBtn = document.getElementById("favouriteBtn");
const copyBtn = document.getElementById("copyBtn");

const favouritesGrid = document.getElementById("favouritesGrid");
const emptyState = document.getElementById("emptyState");
const favCount = document.getElementById("favCount");

const statusMessage = document.getElementById("statusMessage");

let currentQuote = null;

/* ================================
   GET RANDOM QUOTE
================================ */

async function getQuote() {
  try {
    newQuoteBtn.disabled = true;

    quoteCard.classList.add("changing");

    await new Promise(resolve => setTimeout(resolve, 250));

    const response = await fetch(
      `${API_URL}/api/quotes/random`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch quote");
    }

    const data = await response.json();

    currentQuote = data;

    quoteText.textContent = data.text;
    quoteAuthor.textContent = data.author || "Unknown";
    quoteTopic.textContent = data.topic || "General";

    favouriteBtn.classList.remove("saved");
    favouriteBtn.textContent = "♡";

    quoteCard.classList.remove("changing");

  } catch (error) {

    quoteText.textContent =
      "Something went wrong while finding your next quote.";

    quoteAuthor.textContent = "Quotely";
    quoteTopic.textContent = "Error";

    quoteCard.classList.remove("changing");

  } finally {
    newQuoteBtn.disabled = false;
  }
}

/* ================================
   SAVE FAVOURITE
================================ */

async function saveFavourite() {

  if (!currentQuote) return;

  try {

    const response = await fetch(
      `${API_URL}/api/favourites`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text: currentQuote.text,
          author: currentQuote.author,
          topic: currentQuote.topic
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save favourite");
    }

    favouriteBtn.classList.add("saved");
    favouriteBtn.textContent = "♥";

    showStatus("Saved to your collection.");

    await loadFavourites();

  } catch (error) {
    showStatus("Couldn't save this quote.");
  }
}

/* ================================
   LOAD FAVOURITES
================================ */

async function loadFavourites() {

  try {

    const response = await fetch(
      `${API_URL}/api/favourites`
    );

    if (!response.ok) {
      throw new Error("Failed to load favourites");
    }

    const favourites = await response.json();

    favouritesGrid.innerHTML = "";

    favCount.textContent = favourites.length;

    if (favourites.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    favourites.forEach(favourite => {

      const card = document.createElement("article");

      card.className = "favourite-card";

      const topic = document.createElement("span");
      topic.className = "card-topic";
      topic.textContent = favourite.topic || "General";

      const text = document.createElement("blockquote");
      text.textContent = `“${favourite.text}”`;

      const bottom = document.createElement("div");
      bottom.className = "card-bottom";

      const author = document.createElement("span");
      author.className = "card-author";
      author.textContent = `— ${favourite.author || "Unknown"}`;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "×";
      deleteButton.title = "Remove favourite";

      deleteButton.addEventListener("click", () => {
        deleteFavourite(favourite._id);
      });

      bottom.appendChild(author);
      bottom.appendChild(deleteButton);

      card.appendChild(topic);
      card.appendChild(text);
      card.appendChild(bottom);

      favouritesGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Could not load favourites:", error);
  }
}

/* ================================
   DELETE FAVOURITE
================================ */

async function deleteFavourite(id) {

  try {

    const response = await fetch(
      `${API_URL}/api/favourites/${id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete favourite");
    }

    showStatus("Removed from your collection.");

    await loadFavourites();

  } catch (error) {
    showStatus("Couldn't remove that quote.");
  }
}

/* ================================
   COPY QUOTE
================================ */

async function copyQuote() {

  if (!currentQuote) return;

  const text =
    `"${currentQuote.text}" — ${currentQuote.author}`;

  try {

    await navigator.clipboard.writeText(text);

    copyBtn.textContent = "✓";

    showStatus("Copied to clipboard.");

    setTimeout(() => {
      copyBtn.textContent = "⧉";
    }, 1300);

  } catch (error) {
    showStatus("Couldn't copy the quote.");
  }
}

/* ================================
   STATUS MESSAGE
================================ */

function showStatus(message) {

  statusMessage.textContent = message;

  setTimeout(() => {
    statusMessage.textContent = "";
  }, 2500);
}

/* ================================
   SCROLL
================================ */

function scrollToFavourites() {

  document
    .getElementById("favouritesSection")
    .scrollIntoView({
      behavior: "smooth"
    });
}

/* ================================
   EVENTS
================================ */

newQuoteBtn.addEventListener("click", getQuote);
favouriteBtn.addEventListener("click", saveFavourite);
copyBtn.addEventListener("click", copyQuote);

/* ================================
   INITIAL LOAD
================================ */

getQuote();
loadFavourites();