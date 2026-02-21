const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentMovie = null;
let currentUser = null;
let favoriteMovieIds = new Set();

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initials(name) {
  return String(name || "G")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
}

function timeAgo(date) {
  const now = Date.now();
  const ts = new Date(date).getTime();
  if (!ts || Number.isNaN(ts)) return "now";
  const diffSec = Math.max(1, Math.floor((now - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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

function parseSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/movie/")) {
    return decodeURIComponent(pathname.replace("/movie/", "").replace(/\/+$/, ""));
  }
  return (new URLSearchParams(window.location.search).get("slug") || "").trim();
}

function extractHashtagTokens(str) {
  if (!str) return [];
  return (str.match(/#[^\s,،]+/g) || []).map((tag) => tag.trim()).filter(Boolean);
}

function extractCommaSeparatedNames(str) {
  if (!str) return [];
  return str
    .split(/[،,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildHomeSearchHref(value) {
  return `/?search=${encodeURIComponent(value)}`;
}

function buildSearchChip(value, className) {
  const safeValue = escapeHtml(value);
  return `<a class="${className}" dir="auto" href="${buildHomeSearchHref(value)}">${safeValue}</a>`;
}

function renderChips(str, mode = "hashtags") {
  if (!str || str === "-") return '<span class="chip">-</span>';

  if (mode === "names") {
    const names = extractCommaSeparatedNames(str);
    if (!names.length) return `<span class="chip">${escapeHtml(str)}</span>`;
    return names.map((name) => buildSearchChip(name, "person-chip")).join(' <span class="chip-separator">,</span> ');
  }

  const tags = extractHashtagTokens(str);
  if (tags.length) {
    return tags.map((tag) => buildSearchChip(tag, "genre-chip-mini")).join(" ");
  }

  return String(str)
    .split(" ")
    .filter((g) => g.trim())
    .map((g) => buildSearchChip(g, "country-chip"))
    .join(" ");
}

function buildTelegramBotUrlFromChannelLink(rawLink) {
  const trimmed = (rawLink || "").trim();
  if (!trimmed || trimmed === "#") return trimmed;
  if (/^https?:\/\/t\.me\/Filmchinbot\?start=/i.test(trimmed)) return trimmed;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const host = url.hostname.toLowerCase();
  if (host !== "t.me" && host !== "telegram.me") return trimmed;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "c" && parts.length >= 3 && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
    return `https://t.me/Filmchinbot?start=forward_${parts[1]}_${parts[2]}`;
  }
  if (parts.length === 2 && /^[A-Za-z0-9_]+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
    return `https://t.me/Filmchinbot?start=forward_${parts[0]}_${parts[1]}`;
  }
  if (parts.length === 3 && /^[A-Za-z0-9_]+$/.test(parts[0]) && /^\d+$/.test(parts[2])) {
    return `https://t.me/Filmchinbot?start=forward_${parts[0]}_${parts[2]}`;
  }
  return trimmed;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  document.body.classList.toggle("dark", savedTheme === "dark");

  const colorThemes = {
    blue: { accentRgb: "0, 74, 124", accentDark: "#004a7c", accent: "#0091d5", accentLight: "#2185d5", accentContrast: "#0d47a1", bgDay: "#f1f4f9", bgSoft: "#e8f0fa" },
    green: { accentRgb: "25, 114, 64", accentDark: "#197240", accent: "#31aa63", accentLight: "#4bb97a", accentContrast: "#0f5c32", bgDay: "#f1f8f3", bgSoft: "#e6f4eb" },
    yellow: { accentRgb: "156, 124, 19", accentDark: "#9c7c13", accent: "#d3a72a", accentLight: "#e0be4e", accentContrast: "#7a6008", bgDay: "#faf7ed", bgSoft: "#f7f0d8" },
    red: { accentRgb: "152, 49, 49", accentDark: "#983131", accent: "#cb4a4a", accentLight: "#de6a6a", accentContrast: "#7a2323", bgDay: "#faf1f1", bgSoft: "#f5e3e3" },
    purple: { accentRgb: "84, 63, 153", accentDark: "#543f99", accent: "#7f63d0", accentLight: "#9a83de", accentContrast: "#3e2c7a", bgDay: "#f5f2fb", bgSoft: "#ece6f7" },
    teal: { accentRgb: "19, 106, 114", accentDark: "#136a72", accent: "#1d98a2", accentLight: "#40afb7", accentContrast: "#0f5258", bgDay: "#f0f7f8", bgSoft: "#deeff1" },
  };

  const selected = colorThemes[localStorage.getItem("colorTheme") || "blue"] || colorThemes.blue;
  const s = document.documentElement.style;
  s.setProperty("--theme-accent-rgb", selected.accentRgb);
  s.setProperty("--theme-accent-dark", selected.accentDark);
  s.setProperty("--theme-accent", selected.accent);
  s.setProperty("--theme-accent-light", selected.accentLight);
  s.setProperty("--theme-accent-contrast", selected.accentContrast);
  s.setProperty("--theme-bg-day", selected.bgDay);
  s.setProperty("--theme-bg-soft", selected.bgSoft);

  const goPageColors = { blue: "#7c4dff", green: "#d97706", yellow: "#0ea5e9", red: "#10b981", purple: "#f59e0b", teal: "#ef4444" };
  const themeName = localStorage.getItem("colorTheme") || "blue";
  s.setProperty("--go-page-bg", goPageColors[themeName] || "#7c4dff");
}

function setSeo(movie, slug) {
  const title = movie?.title ? `${movie.title} | FilmChiin` : "FilmChiin | صفحه پست";
  const desc = (movie?.synopsis || "").trim() || "جزئیات کامل این پست در FilmChiin";
  const cover = movie?.cover || "https://filmchiin.ir/images/banner-icon.png";
  const canonical = `https://filmchiin.ir/movie/${encodeURIComponent(slug)}`;

  document.title = title;
  const setMeta = (selector, content) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  };
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[property="og:image"]', cover);
  setMeta('meta[property="og:url"]', canonical);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', desc);
  setMeta('meta[name="twitter:image"]', cover);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
}

function openPostOptions() {
  const overlay = document.getElementById("postOptionsOverlay");
  const title = document.getElementById("postOptionsTitle");
  if (!overlay || !currentMovie) return;
  if (title) title.textContent = currentMovie.title || "Post options";
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
}

function closePostOptions() {
  const overlay = document.getElementById("postOptionsOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

async function loadCurrentUserAndFavorites() {
  try {
    const { data } = await db.auth.getUser();
    currentUser = data?.user || null;
    if (!currentUser) {
      favoriteMovieIds = new Set();
      return;
    }
    const { data: favs } = await db.from("favorites").select("movie_id").eq("user_id", currentUser.id);
    favoriteMovieIds = new Set((favs || []).map((f) => f.movie_id));
  } catch {
    currentUser = null;
    favoriteMovieIds = new Set();
  }
}

function syncFavoriteOptionUi() {
  const btn = document.getElementById("postOptionFavorite");
  const statusEl = document.getElementById("postOptionFavoriteStatus");
  if (!btn || !statusEl || !currentMovie) return;
  if (!currentUser) {
    btn.classList.remove("favorite-active");
    statusEl.textContent = "Login required";
    return;
  }
  const isFavorite = favoriteMovieIds.has(currentMovie.id);
  btn.classList.toggle("favorite-active", isFavorite);
  statusEl.textContent = isFavorite ? "In favorites" : "Add to your favorites";
}

async function toggleFavoriteCurrentMovie() {
  if (!currentMovie || !currentUser) {
    syncFavoriteOptionUi();
    return;
  }

  const movieId = currentMovie.id;
  const has = favoriteMovieIds.has(movieId);
  if (has) {
    const { error } = await db.from("favorites").delete().eq("user_id", currentUser.id).eq("movie_id", movieId);
    if (!error) favoriteMovieIds.delete(movieId);
  } else {
    const { error } = await db.from("favorites").insert([{ user_id: currentUser.id, movie_id: movieId }]);
    if (!error) favoriteMovieIds.add(movieId);
  }
  syncFavoriteOptionUi();
}

function bindPostOptions(slug) {
  document.getElementById("postOptionsCloseBtn")?.addEventListener("click", closePostOptions);
  document.getElementById("postOptionsOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "postOptionsOverlay" || e.target.classList.contains("post-options-backdrop")) {
      closePostOptions();
    }
  });

  document.getElementById("postOptionFavorite")?.addEventListener("click", async () => {
    await toggleFavoriteCurrentMovie();
  });

  document.getElementById("postOptionCopyLink")?.addEventListener("click", async () => {
    const url = `${window.location.origin}/movie/${encodeURIComponent(slug)}`;
    await navigator.clipboard.writeText(url);
    closePostOptions();
  });

  document.getElementById("postOptionShareLink")?.addEventListener("click", async () => {
    const url = `${window.location.origin}/movie/${encodeURIComponent(slug)}`;
    if (navigator.share) {
      await navigator.share({ title: currentMovie?.title || "FilmChiin", url });
    } else {
      await navigator.clipboard.writeText(url);
    }
    closePostOptions();
  });
}

async function loadComments(movieId) {
  const { data } = await db.from("comments").select("*").eq("movie_id", movieId).eq("approved", true).order("created_at", { ascending: true }).limit(500);
  return data || [];
}

function attachCommentsHandlers(card, movieId) {
  const avatarsEl = card.querySelector(".avatars");
  const countEl = card.querySelector(".comments-count");
  const summaryRow = card.querySelector(".comment-summary");
  const enterBtn = card.querySelector(".enter-comments");
  const panel = card.querySelector(".comments-panel");
  const closeBtn = card.querySelector(".comments-close");
  const commentsList = card.querySelector(".comments-list");
  const nameInput = card.querySelector(".comment-name");
  const textInput = card.querySelector(".comment-text");
  const sendBtn = card.querySelector(".comment-send");

  function renderComments(arr) {
    const latest = (arr || []).slice(-3).map((c) => c.name || "Guest");
    if (avatarsEl) avatarsEl.innerHTML = latest.map((n) => `<div class="avatar">${escapeHtml(initials(n))}</div>`).join("");
    if (countEl) countEl.textContent = `${(arr || []).length} comments`;
    if (commentsList) {
      commentsList.innerHTML = (arr || []).map((c) => `
        <div class="comment-row">
          <div class="comment-avatar">${escapeHtml(initials(c.name))}</div>
          <div class="comment-body">
            <div class="comment-meta"><strong>${escapeHtml(c.name || "Guest")}</strong> · <span class="comment-time">${timeAgo(c.created_at)}</span></div>
            <div class="comment-text-content">${escapeHtml(c.text || "")}</div>
          </div>
        </div>`).join("");
    }
  }

  const refresh = async () => renderComments(await loadComments(movieId));
  const openComments = () => {
    refresh();
    panel?.classList.add("open");
    panel?.setAttribute("aria-hidden", "false");
  };
  const closeComments = () => {
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden", "true");
  };

  enterBtn?.addEventListener("click", openComments);
  summaryRow?.addEventListener("click", openComments);
  closeBtn?.addEventListener("click", closeComments);

  sendBtn?.addEventListener("click", async () => {
    const name = (nameInput?.value || "Guest").trim() || "Guest";
    const text = (textInput?.value || "").trim();
    if (!text) return;
    sendBtn.disabled = true;
    await db.from("comments").insert([{ movie_id: movieId, name, text, approved: false, published: false }]);
    if (nameInput) nameInput.value = "";
    if (textInput) textInput.value = "";
    await refresh();
    sendBtn.disabled = false;
  });

  refresh();
}

function buildSimilarMovies(current, allMovies) {
  const currentGenres = new Set(extractHashtagTokens(current.genre || ""));
  if (!currentGenres.size) return [];

  return allMovies
    .filter((m) => m.id !== current.id)
    .map((m) => {
      const g = new Set(extractHashtagTokens(m.genre || ""));
      let overlap = 0;
      currentGenres.forEach((x) => {
        if (g.has(x)) overlap += 1;
      });
      return { movie: m, overlap, total: g.size };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return (a.total || 0) - (b.total || 0);
    })
    .slice(0, 15)
    .map((x) => x.movie);
}

function renderSimilarMovies(card, similarMovies) {
  const html = (similarMovies || [])
    .map((m) => {
      const title = escapeHtml(m.title || "-");
      const cover = escapeHtml(m.cover || "https://via.placeholder.com/120x80?text=No+Cover");
      const url = `/movie/${encodeURIComponent(makeMovieSlug(m.title || ""))}`;
      return `<div class="episode-card similar-movie-card">
        <img src="${cover}" alt="${title}" class="episode-cover">
        <div class="episode-title"><span>${title}</span></div>
        <div class="button-wrap similar-go-wrap"><button class="go-page-btn similar-go-btn" data-url="${escapeHtml(url)}"><span>Go to page</span></button><div class="button-shadow"></div></div>
      </div>`;
    })
    .join("");

  const section = document.createElement("div");
  section.className = "episodes-container anim-vertical similar-movies-container";
  section.innerHTML = `
    <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> Similar movies:</span>
    <div class="episodes-list anim-left-right">${html || '<div class="episode-card">No similar movies found.</div>'}</div>
  `;
  card.querySelector(".movie-info")?.appendChild(section);

  section.querySelectorAll(".similar-go-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url || "#";
      if (url !== "#") window.location.href = url;
    });
  });
}

function renderMovieCard(container, movie, allMovies, episodes = []) {
  const cover = escapeHtml(movie.cover || "https://via.placeholder.com/300x200?text=No+Image");
  const title = escapeHtml(movie.title || "-");
  const synopsis = escapeHtml((movie.synopsis || "-").trim());

  const badgeHtml =
    movie.type && movie.type !== "single"
      ? `<span class="collection-badge ${movie.type === "collection" ? "badge-collection" : "badge-serial"}">${movie.type === "collection" ? "Collection" : "Series"}<span class="badge-count anim-left-right">${(episodes || []).length}</span></span>`
      : "";

  const episodesHtml = (episodes || [])
    .map((ep, idx) => {
      const epTitle = escapeHtml(ep.title || `Episode ${idx + 1}`);
      const epCover = escapeHtml(ep.cover || "https://via.placeholder.com/120x80?text=No+Cover");
      return `<button class="episode-card ${idx === 0 ? "active" : ""}" type="button" data-link="${escapeHtml(ep.link || "#")}" data-title="${epTitle}"><img src="${epCover}" alt="${epTitle}" class="episode-cover"><span class="episode-title"><span>${epTitle}</span></span></button>`;
    })
    .join("");

  container.innerHTML = `
  <div class="movie-card no-reveal movie-page-card-only" data-movie-id="${escapeHtml(movie.id)}">
    <div class="cover-container anim-vertical"><div class="cover-blur anim-vertical" style="background-image: url('${cover}');"></div><img class="cover-image anim-vertical" src="${cover}" alt="${title}"></div>
    <div class="movie-info anim-vertical">
      <div class="movie-title anim-left-right"><span class="movie-name anim-horizontal">${title}</span>${badgeHtml}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> Synopsis:</span><div class="field-quote anim-left-right synopsis-quote"><div class="quote-text anim-horizontal">${synopsis}</div></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> Director:</span><div class="field-quote anim-left-right director-field">${renderChips(movie.director || "-", "names")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-location.apng" style="width:20px;height:20px;"> Product:</span><div class="field-quote anim-horizontal">${renderChips(movie.product || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-star.apng" style="width:20px;height:20px;"> Stars:</span><div class="field-quote anim-left-right stars-field">${renderChips(movie.stars || "-", "names")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-imdb-48.png" class="imdb-bell" style="width:20px;height:20px;"> IMDB:</span><div class="field-quote anim-left-right"><span class="chip imdb-chip anim-horizontal">${escapeHtml(movie.imdb || "-")}</span></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-calendar.apng" style="width:20px;height:20px;"> Release:</span><div class="field-quote anim-left-right">${escapeHtml(movie.release_info || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-comedy-96.png" class="genre-bell" style="width:20px;height:20px;"> Genre:</span><div class="field-quote genre-grid anim-horizontal">${renderChips(movie.genre || "-")}</div>
      <div class="episodes-container anim-vertical" data-movie-id="${escapeHtml(movie.id)}"><div class="episodes-list anim-left-right">${episodesHtml}</div></div>
      <div class="post-action-row movie-page-actions"><div class="button-wrap"><button class="go-btn anim-vertical" data-link="${escapeHtml((episodes[0] && episodes[0].link) || movie.link || "#")}"><span>Go to file</span></button><div class="button-shadow"></div></div></div>
      <div class="comment-summary anim-horizontal"><div class="avatars"></div><div class="comments-count">0 comments</div><div class="enter-comments"><img src="/images/icons8-comment.apng" style="width:22px;height:22px;"></div></div>
      <div class="comments-panel" aria-hidden="true"><div class="comments-panel-inner"><div class="comments-panel-header"><div class="comments-title">Comments</div></div><div class="comments-list"></div><div class="comment-input-row"><div class="name-comments-close"><input class="comment-name" placeholder="Your name" maxlength="60" /><div class="button-wrap"><button class="comments-close"><span>close</span></button><div class="button-shadow"></div></div></div><textarea class="comment-text" placeholder="Write a comment..." rows="2"></textarea><div class="button-wrap"><button class="comment-send"><span>Send</span></button><div class="button-shaddow"></div></div></div></div></div>
    </div>
  </div>`;

  const card = container.querySelector(".movie-card");
  const goBtn = container.querySelector(".go-btn");
  const episodeCards = container.querySelectorAll(".episode-card");

  card?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".go-btn") || target.closest(".episode-card") || target.closest(".quote-toggle-btn") || target.closest("a") || target.closest(".comment-summary") || target.closest(".comments-panel")) return;
    openPostOptions();
  });

  episodeCards.forEach((ep) => {
    ep.addEventListener("click", () => {
      episodeCards.forEach((x) => x.classList.remove("active"));
      ep.classList.add("active");
      if (goBtn) goBtn.dataset.link = ep.dataset.link || "#";
    });
  });

  goBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const finalLink = buildTelegramBotUrlFromChannelLink(goBtn.dataset.link || "#");
    if (finalLink && finalLink !== "#") window.open(finalLink, "_blank", "noopener");
  });

  attachCommentsHandlers(card, movie.id);
  renderSimilarMovies(card, buildSimilarMovies(movie, allMovies));
}

function initFeatureAccordions() {
  const accordions = document.querySelectorAll(".feature-accordion");
  accordions.forEach((acc) => {
    const header = acc.querySelector(".feature-accordion-header");
    const body = acc.querySelector(".feature-accordion-body");
    if (!header || !body) return;
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    const toggle = () => {
      const isOpen = acc.classList.contains("open");
      accordions.forEach((other) => other.classList.remove("open"));
      if (!isOpen) acc.classList.add("open");
    };
    header.addEventListener("click", toggle);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

async function hydrateSharedSectionsFromHome() {
  const resp = await fetch("/");
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const banner = doc.querySelector("#site-banner .banner-content");
  const features = doc.querySelector("#siteFeatures");
  if (banner) document.getElementById("movieBannerMount").innerHTML = banner.outerHTML;
  if (features) {
    document.getElementById("movieFeaturesMount").innerHTML = features.outerHTML;
    initFeatureAccordions();
  }
}

async function loadMoviePage() {
  const status = document.getElementById("moviePageStatus");
  const cardContainer = document.getElementById("moviePageCard");

  applySavedTheme();
  await hydrateSharedSectionsFromHome();

  const slug = parseSlug();
  if (!slug) return (status.textContent = "اسلاگ پست مشخص نیست.");

  const { data: movies, error } = await db.from("movies").select("*");
  if (error || !Array.isArray(movies)) return (status.textContent = "خطا در دریافت اطلاعات پست.");

  const movie = movies.find((item) => makeMovieSlug(item.title) === slug);
  if (!movie) return (status.textContent = "پست مورد نظر پیدا نشد.");

  currentMovie = movie;

  const { data: items } = await db.from("movie_items").select("*").eq("movie_id", movie.id).order("order_index", { ascending: true });
  const episodes = (movie.type === "collection" || movie.type === "serial")
    ? [
        {
          title: movie.title,
          cover: movie.cover,
          link: movie.link,
        },
        ...(items || []),
      ]
    : [];

  await loadCurrentUserAndFavorites();
  bindPostOptions(slug);
  syncFavoriteOptionUi();
  setSeo(movie, slug);
  renderMovieCard(cardContainer, movie, movies, episodes);
  status.hidden = true;
  cardContainer.hidden = false;
}

document.addEventListener("DOMContentLoaded", loadMoviePage);
