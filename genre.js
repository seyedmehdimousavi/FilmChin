// ==================== genre.js ====================
// صفحه اختصاصی نمایش فیلم‌ها بر اساس ژانر

const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

if (!window._supabaseClient) {
  window._supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
}
const db = window._supabaseClient;

// ===== i18n =====
const genreI18n = {
  en: {
    backToHome: "← Back to homepage",
    loading: "Loading...",
    genrePageWatching: "You are watching movies with genre",
    genrePageAre: "",
    genreMoviesTitle: "Movies in this genre",
    showMore: "Show more",
    genreNoMovies: "No movies found for this genre.",
    goToPage: "Go to page",
    unknownGenre: "Genre",
  },
  fa: {
    backToHome: "← بازگشت به صفحه اصلی",
    loading: "در حال بارگذاری...",
    genrePageWatching: "شما در حال تماشای فیلم‌هایی با ژانر",
    genrePageAre: "هستید",
    genreMoviesTitle: "فیلم‌های این ژانر",
    showMore: "نمایش بیشتر",
    genreNoMovies: "فیلمی برای این ژانر پیدا نشد.",
    goToPage: "رفتن به صفحه",
    unknownGenre: "ژانر",
  },
};

function getLang() {
  return localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
}

function gt(key) {
  const lang = getLang();
  return (genreI18n[lang] || genreI18n.fa)[key] || key;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function makeMovieSlug(title) {
  if (!title) return "";
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[\(\)\[\]\{\}]/g, "")
    .replace(/[^a-z0-9ا-ی]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildMoviePageHref(title) {
  const slug = makeMovieSlug(title || "");
  return slug ? `/movie.html?slug=${encodeURIComponent(slug)}` : "/movie.html";
}

// ===== Parse genre from URL =====
function parseGenreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("genre") || "").trim();
}

// ===== Apply i18n to static elements =====
function applyStaticI18n() {
  const lang = getLang();
  const dir = lang === "fa" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (genreI18n[lang] && genreI18n[lang][key] !== undefined) {
      el.textContent = genreI18n[lang][key];
    }
  });
}

// ===== Page constants =====
const PAGE_SIZE = 12;
let allGenreMovies = [];
let shownCount = 0;

// ===== Render movie cards =====
function renderMovieCard(movie) {
  const cover = escapeHtml(
    movie.cover || "https://via.placeholder.com/200x300?text=No+Image",
  );
  const title = escapeHtml(movie.title || "-");
  const href = buildMoviePageHref(movie.title || "");

  return `
    <div class="favorite-item coming-soon-grid-item genre-movie-card" data-movie-id="${escapeHtml(String(movie.id || ""))}">
      <img class="favorite-cover genre-movie-cover" src="${cover}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
      <div class="favorite-title genre-movie-title">${title}</div>
      <div class="favorite-actions">
        <div class="button-wrap">
          <a class="similar-go-btn genre-go-btn" href="${escapeHtml(href)}" data-movie='${JSON.stringify({ id: movie.id, title: movie.title, cover: movie.cover, genre: movie.genre, link: movie.link, synopsis: movie.synopsis, imdb: movie.imdb, release_info: movie.release_info, director: movie.director, product: movie.product, stars: movie.stars, type: movie.type }).replace(/'/g, "&#39;")}'>
            <span>${gt("goToPage")}</span>
          </a>
          <div class="button-shadow"></div>
        </div>
      </div>
    </div>`;
}

function attachGoToPageHandlers() {
  document.querySelectorAll(".genre-go-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      try {
        const raw = btn.getAttribute("data-movie");
        if (raw) {
          const m = JSON.parse(raw.replace(/&#39;/g, "'"));
          sessionStorage.setItem("filmchin_scroll_y", "0");
          sessionStorage.setItem("filmchin_quick_movie", JSON.stringify(m));
        }
      } catch (err) {
        /* ignore */
      }
    });
  });
}

// ===== Show More =====
function showMoreMovies() {
  const grid = document.getElementById("genreMoviesGrid");
  const showMoreWrap = document.getElementById("genreShowMoreWrap");
  if (!grid) return;

  const nextBatch = allGenreMovies.slice(shownCount, shownCount + PAGE_SIZE);
  nextBatch.forEach((movie) => {
    const div = document.createElement("div");
    div.innerHTML = renderMovieCard(movie).trim();
    const card = div.firstChild;
    grid.appendChild(card);
  });

  shownCount += nextBatch.length;
  attachGoToPageHandlers();

  if (shownCount >= allGenreMovies.length) {
    if (showMoreWrap) showMoreWrap.hidden = true;
  }
}

// ===== Main load function =====
async function loadGenrePage() {
  const lang = getLang();
  const genre = parseGenreFromUrl();

  const statusEl = document.getElementById("genrePageStatus");
  const moviesBlock = document.getElementById("genreMoviesBlock");
  const emptyState = document.getElementById("genreEmptyState");
  const heroTitle = document.getElementById("genreHeroTitle");
  const heroAccent = document.getElementById("genreHeroAccent");
  const heroSubtitle = document.getElementById("genreHeroSubtitle");
  const moviesTitle = document.getElementById("genreMoviesTitle");
  const grid = document.getElementById("genreMoviesGrid");
  const showMoreWrap = document.getElementById("genreShowMoreWrap");
  const showMoreBtn = document.getElementById("genreShowMoreBtn");

  // Set page title
  const cleanGenre = genre.startsWith("#") ? genre.slice(1) : genre;
  document.title = `FilmChiin | ${cleanGenre}`;

  // Update hero
  if (heroTitle) heroTitle.textContent = cleanGenre;
  if (heroAccent) heroAccent.textContent = ` ${cleanGenre} `;
  if (moviesTitle) moviesTitle.textContent = gt("genreMoviesTitle");

  // Apply subtitle i18n text
  if (heroSubtitle) {
    const watchText = gt("genrePageWatching");
    const areText = gt("genrePageAre");
    if (lang === "fa") {
      heroSubtitle.innerHTML = `${escapeHtml(watchText)} <span class="genre-hero-name-accent" id="genreHeroAccent"> ${escapeHtml(cleanGenre)} </span> ${escapeHtml(areText)}`;
    } else {
      heroSubtitle.innerHTML = `${escapeHtml(watchText)} <span class="genre-hero-name-accent" id="genreHeroAccent"> ${escapeHtml(cleanGenre)} </span>`;
    }
  }

  if (!genre) {
    if (statusEl) statusEl.textContent = gt("genreNoMovies");
    return;
  }

  // Try sessionStorage cache first
  let allMovies = [];
  try {
    const cached = sessionStorage.getItem("filmchin_movies_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        allMovies = parsed;
        window._fcMovies = parsed;
      }
    }
  } catch (e) {
    /* ignore */
  }

  if (!allMovies.length) {
    try {
      const { data, error } = await db.from("movies").select("*");
      if (!error && Array.isArray(data)) {
        allMovies = data;
        window._fcMovies = data;
        try {
          sessionStorage.setItem("filmchin_movies_cache", JSON.stringify(data));
        } catch (e) {
          /* ignore */
        }
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "خطا در بارگذاری";
      return;
    }
  }

  // Filter by genre
  const genreToken = genre.toLowerCase();
  allGenreMovies = allMovies.filter((m) => {
    if (!m.genre) return false;
    const tokens = m.genre.toLowerCase().split(/\s+/);
    return tokens.some(
      (t) =>
        t === genreToken ||
        t.replace(/^#/, "") === genreToken.replace(/^#/, ""),
    );
  });

  // Update side menu genres from loaded data
  setTimeout(() => {
    if (window.FilmChiinSharedSections?.buildSideMenuGenres)
      window.FilmChiinSharedSections.buildSideMenuGenres();
    if (window.FilmChiinSharedSections?.buildSideMenuCountries)
      window.FilmChiinSharedSections.buildSideMenuCountries();
    if (window.FilmChiinSharedSections?.buildGenreHubGrid)
      window.FilmChiinSharedSections.buildGenreHubGrid();
  }, 200);

  if (statusEl) statusEl.hidden = true;

  if (!allGenreMovies.length) {
    if (emptyState) emptyState.hidden = false;
    return;
  }

  // Render first batch
  if (moviesBlock) moviesBlock.hidden = false;
  shownCount = 0;

  if (grid) grid.innerHTML = "";
  showMoreMovies();

  // Show "Show More" button if needed
  if (showMoreWrap && allGenreMovies.length > PAGE_SIZE) {
    showMoreWrap.hidden = false;
  }

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      showMoreMovies();
    });
  }
}

// ===== Apply theme =====
function applySavedTheme() {
  const dark = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark", dark);

  const colorThemes = {
    blue: {
      accentRgb: "30, 136, 229",
      accentDark: "#1565c0",
      accent: "#1e88e5",
      accentLight: "#42a5f5",
      accentContrast: "#0d47a1",
      bgDay: "#f2f7ff",
      bgSoft: "#e5f0ff",
    },
    green: {
      accentRgb: "46, 157, 87",
      accentDark: "#227a43",
      accent: "#2e9d57",
      accentLight: "#45b36e",
      accentContrast: "#195b32",
      bgDay: "#f1faf4",
      bgSoft: "#e1f3e7",
    },
    yellow: {
      accentRgb: "197, 163, 23",
      accentDark: "#9f8010",
      accent: "#c5a317",
      accentLight: "#d6b63e",
      accentContrast: "#6b5505",
      bgDay: "#fdf9ec",
      bgSoft: "#f8efcf",
    },
    red: {
      accentRgb: "200, 70, 70",
      accentDark: "#9b2d2d",
      accent: "#c84646",
      accentLight: "#dc6666",
      accentContrast: "#6e2020",
      bgDay: "#fcf2f2",
      bgSoft: "#f6e0e0",
    },
    purple: {
      accentRgb: "123, 97, 255",
      accentDark: "#5f46d2",
      accent: "#7b61ff",
      accentLight: "#a68fff",
      accentContrast: "#47329e",
      bgDay: "#f7f4ff",
      bgSoft: "#eee8ff",
    },
    teal: {
      accentRgb: "76, 201, 240",
      accentDark: "#2c9bc0",
      accent: "#4cc9f0",
      accentLight: "#7fdcf7",
      accentContrast: "#1f6e87",
      bgDay: "#f2fbff",
      bgSoft: "#e2f6ff",
    },
  };
  const selected =
    colorThemes[localStorage.getItem("colorTheme") || "blue"] ||
    colorThemes.blue;
  const rootStyle = document.documentElement.style;
  Object.entries({
    "--theme-accent-rgb": selected.accentRgb,
    "--theme-accent-dark": selected.accentDark,
    "--theme-accent": selected.accent,
    "--theme-accent-light": selected.accentLight,
    "--theme-accent-contrast": selected.accentContrast,
    "--theme-bg-day": selected.bgDay,
    "--theme-bg-soft": selected.bgSoft,
  }).forEach(([key, value]) => rootStyle.setProperty(key, value));
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", async () => {
  applySavedTheme();
  applyStaticI18n();

  // Hydrate shared sections (header, sidemenu, dock, features)
  if (window.FilmChiinSharedSections?.hydrate) {
    await window.FilmChiinSharedSections.hydrate();
  }

  await loadGenrePage();
});
