// Part C - CheapShark live search

// CheapShark store IDs -> store names
const stores = {
    "1": "Steam",
    "7": "GOG",
    "25": "Epic Games"
};

async function fetchDeals() {
    try {
        const response = await fetch(
            "https://www.cheapshark.com/api/1.0/deals?pageSize=20"
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch deals:", error);
        return []; // always return an array so .map() below doesn't crash
    }
}

// Convert CheapShark data to our format
function formatDeals(data) {
    return data.map((game, index) => ({
        id: game.dealID || index,
        title: game.title,
        normalPrice: Number(game.normalPrice),
        salePrice: Number(game.salePrice),
        store: stores[game.storeID] || `Store ${game.storeID}`
    }));
}

// Part A - Functions

// Filter games on sale
function getGamesOnSale(games) {
    return games.filter(game => game.salePrice < game.normalPrice);
}

// Calculate discount percentage
function getDiscountPercentage(game) {
    if (!game.normalPrice) return 0;
    return Math.round(
        ((game.normalPrice - game.salePrice) / game.normalPrice) * 100
    );
}

// Find cheapest game
function getCheapestGame(games) {
    if (games.length === 0) return null; // reduce() on an empty array throws
    return games.reduce((cheapest, current) =>
        current.salePrice < cheapest.salePrice ? current : cheapest
    );
}

// Search titles case-insensitively
function searchGames(games, searchTerm) {
    return games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Part B - Render games to page

function renderGames(games) {
    const container = document.getElementById("games");

    container.innerHTML = "";

    if (games.length === 0) {
        container.innerHTML = "<p>No games found.</p>";
        return;
    }

    games.forEach((game, index) => {
        const isOnSale = game.salePrice < game.normalPrice;

        const card = document.createElement("div");
        card.classList.add("game-card");
        if (isOnSale) card.classList.add("on-sale");
        card.style.setProperty("--i", index); // staggers the entrance animation

        // CheapShark prices are in US dollars
        card.innerHTML = `
      <h2>${game.title}</h2>
      <p><strong>Store:</strong> ${game.store}</p>
      <p class="price normal"><strong>Normal Price:</strong> <span>$${game.normalPrice.toFixed(2)}</span></p>
      <p class="price sale"><strong>Sale Price:</strong> <span>$${game.salePrice.toFixed(2)}</span></p>
      ${isOnSale
                ? `<span class="sale-tag">ON SALE (${getDiscountPercentage(game)}% OFF)</span>`
                : ""
            }
    `;

        container.appendChild(card);
    });
}

// Filters

let deals = [];

const searchInput = document.getElementById("searchInput");
const saleFilter = document.getElementById("saleFilter");

function applyFilters() {
    let filteredGames = searchGames(deals, searchInput.value);

    if (saleFilter.checked) {
        filteredGames = getGamesOnSale(filteredGames);
    }

    renderGames(filteredGames);
}

searchInput.addEventListener("input", applyFilters);
saleFilter.addEventListener("change", applyFilters);

// Load live deals, then render and log

async function initialize() {
    const apiData = await fetchDeals();

    deals = formatDeals(apiData);

    applyFilters(); // respects anything already typed or ticked

    console.log("Games on sale:", getGamesOnSale(deals));
    console.log("Cheapest game:", getCheapestGame(deals));
    console.log("Search 'portal':", searchGames(deals, "portal"));
}

initialize();