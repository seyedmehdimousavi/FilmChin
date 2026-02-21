const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentMovie = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function renderChips(str, mode = "hashtags") {
  const raw = String(str || "").trim();
  if (!raw || raw === "-") return '<span class="chip">-</span>';
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) =>
      mode === "names"
        ? `<span class="chip person-chip">${escapeHtml(item)}</span>`
        : `<span class="chip country-chip">${escapeHtml(item)}</span>`
    )
    .join(" ");
}

function parseSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/movie/")) {
    return decodeURIComponent(pathname.replace("/movie/", "").replace(/\/+$/, ""));
  }
  return (new URLSearchParams(window.location.search).get("slug") || "").trim();
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

  const goPageColors = {
    blue: "#7c4dff",
    green: "#d97706",
    yellow: "#0ea5e9",
    red: "#10b981",
    purple: "#f59e0b",
    teal: "#ef4444",
  };
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
  if (title) title.textContent = `Post options · ${currentMovie.title || "Movie"}`;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
}

function closePostOptions() {
  const overlay = document.getElementById("postOptionsOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

function bindPostOptions(slug) {
  document.getElementById("postOptionsCloseBtn")?.addEventListener("click", closePostOptions);
  document.getElementById("postOptionsOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "postOptionsOverlay" || e.target.classList.contains("post-options-backdrop")) {
      closePostOptions();
    }
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

function renderMovieCard(container, movie, episodes = []) {
  const cover = escapeHtml(movie.cover || "https://via.placeholder.com/300x200?text=No+Image");
  const title = escapeHtml(movie.title || "-");
  const synopsis = escapeHtml((movie.synopsis || "-").trim());

  const episodesHtml = (episodes || [])
    .map((ep, idx) => {
      const epTitle = escapeHtml(ep.title || `Episode ${idx + 1}`);
      return `<button class="episode-card" type="button" data-link="${escapeHtml(ep.link || "#")}"><span class="episode-title"><span>${epTitle}</span></span></button>`;
    })
    .join("");

  container.innerHTML = `
  <div class="movie-card no-reveal movie-page-card-only" data-movie-id="${escapeHtml(movie.id)}">
    <div class="cover-container anim-vertical"><div class="cover-blur anim-vertical" style="background-image: url('${cover}');"></div><img class="cover-image anim-vertical" src="${cover}" alt="${title}"></div>
    <div class="movie-info anim-vertical">
      <div class="movie-title anim-left-right"><span class="movie-name anim-horizontal">${title}</span></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> Synopsis:</span><div class="field-quote anim-left-right synopsis-quote"><div class="quote-text anim-horizontal">${synopsis}</div></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> Director:</span><div class="field-quote anim-left-right director-field">${renderChips(movie.director || "-", "names")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-location.apng" style="width:20px;height:20px;"> Product:</span><div class="field-quote anim-horizontal">${renderChips(movie.product || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-star.apng" style="width:20px;height:20px;"> Stars:</span><div class="field-quote anim-left-right stars-field">${renderChips(movie.stars || "-", "names")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-imdb-48.png" class="imdb-bell" style="width:20px;height:20px;"> IMDB:</span><div class="field-quote anim-left-right"><span class="chip imdb-chip anim-horizontal">${escapeHtml(movie.imdb || "-")}</span></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-calendar.apng" style="width:20px;height:20px;"> Release:</span><div class="field-quote anim-left-right">${escapeHtml(movie.release_info || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-comedy-96.png" class="genre-bell" style="width:20px;height:20px;"> Genre:</span><div class="field-quote genre-grid anim-horizontal">${renderChips(movie.genre || "-")}</div>
      <div class="episodes-container anim-vertical" data-movie-id="${escapeHtml(movie.id)}"><div class="episodes-list anim-left-right">${episodesHtml}</div></div>
      <div class="post-action-row movie-page-actions"><div class="button-wrap"><button class="go-btn anim-vertical" data-link="${escapeHtml(movie.link || "#")}"><span>Go to file</span></button><div class="button-shadow"></div></div></div>
    </div>
  </div>`;

  const card = container.querySelector(".movie-card");
  const goBtn = container.querySelector(".go-btn");
  const episodeCards = container.querySelectorAll(".episode-card");

  card?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".go-btn") || target.closest(".episode-card") || target.closest(".quote-toggle-btn") || target.closest("a")) return;
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

  const { data: episodes } = await db
    .from("movie_episodes")
    .select("*")
    .eq("movie_id", movie.id)
    .order("episode_number", { ascending: true });

  bindPostOptions(slug);
  setSeo(movie, slug);
  renderMovieCard(cardContainer, movie, episodes || []);
  status.hidden = true;
  cardContainer.hidden = false;
}

document.addEventListener("DOMContentLoaded", loadMoviePage);
