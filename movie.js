const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    .map((item) => {
      if (mode === "names") {
        return `<span class="chip person-chip">${escapeHtml(item)}</span>`;
      }
      return `<span class="chip country-chip">${escapeHtml(item)}</span>`;
    })
    .join(" ");
}

function parseSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/movie/")) {
    return decodeURIComponent(pathname.replace("/movie/", "").replace(/\/+$/, ""));
  }

  const params = new URLSearchParams(window.location.search);
  return (params.get("slug") || "").trim();
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
  if (!parts.length) return trimmed;

  if (parts[0] === "c" && parts.length >= 3) {
    const internalId = parts[1];
    const messageId = parts[2];
    if (/^[0-9]+$/.test(internalId) && /^[0-9]+$/.test(messageId)) {
      return `https://t.me/Filmchinbot?start=forward_${internalId}_${messageId}`;
    }
  }

  if (parts.length === 2) {
    const username = parts[0];
    const messageId = parts[1];
    if (/^[A-Za-z0-9_]+$/.test(username) && /^[0-9]+$/.test(messageId)) {
      return `https://t.me/Filmchinbot?start=forward_${username}_${messageId}`;
    }
  }

  if (parts.length === 3) {
    const username = parts[0];
    const messageId = parts[2];
    if (/^[A-Za-z0-9_]+$/.test(username) && /^[0-9]+$/.test(messageId)) {
      return `https://t.me/Filmchinbot?start=forward_${username}_${messageId}`;
    }
  }

  return trimmed;
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

  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute("href", canonical);
}

function renderMovieCard(container, movie, episodes = []) {
  const cover = escapeHtml(movie.cover || "https://via.placeholder.com/300x200?text=No+Image");
  const title = escapeHtml(movie.title || "-");
  const synopsis = escapeHtml((movie.synopsis || "-").trim());
  const director = renderChips(movie.director || "-", "names");
  const stars = renderChips(movie.stars || "-", "names");
  const imdb = escapeHtml(movie.imdb || "-");
  const releaseInfo = escapeHtml(movie.release_info || "-");

  const episodesHtml = (episodes || [])
    .map((ep, idx) => {
      const epTitle = escapeHtml(ep.title || `Episode ${idx + 1}`);
      return `<button class="episode-card" type="button" data-link="${escapeHtml(ep.link || "#")}" data-title="${epTitle}">
        <span class="episode-title"><span>${epTitle}</span></span>
      </button>`;
    })
    .join("");

  container.innerHTML = `
  <div class="movie-card reveal movie-page-card-only" data-movie-id="${escapeHtml(movie.id)}">
    <div class="cover-container anim-vertical">
      <div class="cover-blur anim-vertical" style="background-image: url('${cover}');"></div>
      <img class="cover-image anim-vertical" src="${cover}" alt="${title}">
    </div>

    <div class="movie-info anim-vertical">
      <div class="movie-title anim-left-right">
        <span class="movie-name anim-horizontal">${title}</span>
      </div>

      <span class="field-label anim-vertical"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> Synopsis:</span>
      <div class="field-quote anim-left-right synopsis-quote">
        <div class="quote-text anim-horizontal">${synopsis}</div>
      </div>

      <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> Director:</span>
      <div class="field-quote anim-left-right director-field">${director}</div>

      <span class="field-label anim-vertical"><img src="/images/icons8-location.apng" style="width:20px;height:20px;"> Product:</span>
      <div class="field-quote anim-horizontal">${renderChips(movie.product || "-")}</div>

      <span class="field-label anim-vertical"><img src="/images/icons8-star.apng" style="width:20px;height:20px;"> Stars:</span>
      <div class="field-quote anim-left-right stars-field">${stars}</div>

      <span class="field-label anim-vertical"><img src="/images/icons8-imdb-48.png" class="imdb-bell" style="width:20px;height:20px;"> IMDB:</span>
      <div class="field-quote anim-left-right"><span class="chip imdb-chip anim-horizontal">${imdb}</span></div>

      <span class="field-label anim-vertical"><img src="/images/icons8-calendar.apng" style="width:20px;height:20px;"> Release:</span>
      <div class="field-quote anim-left-right">${releaseInfo}</div>

      <span class="field-label anim-vertical"><img src="/images/icons8-comedy-96.png" class="genre-bell" style="width:20px;height:20px;"> Genre:</span>
      <div class="field-quote genre-grid anim-horizontal">${renderChips(movie.genre || "-")}</div>

      <div class="episodes-container anim-vertical" data-movie-id="${escapeHtml(movie.id)}">
        <div class="episodes-list anim-left-right">${episodesHtml}</div>
      </div>

      <div class="post-action-row movie-page-actions">
        <div class="button-wrap">
          <button class="go-btn anim-vertical" data-link="${escapeHtml(movie.link || "#")}"><span>Go to file</span></button>
          <div class="button-shadow"></div>
        </div>
      </div>
    </div>
  </div>`;

  const goBtn = container.querySelector(".go-btn");
  const episodeCards = container.querySelectorAll(".episode-card");

  episodeCards.forEach((ep) => {
    ep.addEventListener("click", () => {
      episodeCards.forEach((x) => x.classList.remove("active"));
      ep.classList.add("active");
      if (goBtn) goBtn.dataset.link = ep.dataset.link || "#";
    });
  });

  goBtn?.addEventListener("click", () => {
    const finalLink = buildTelegramBotUrlFromChannelLink(goBtn.dataset.link || "#");
    if (finalLink && finalLink !== "#") window.open(finalLink, "_blank", "noopener");
  });
}

function initFeatureAccordions() {
  const accordions = document.querySelectorAll(".feature-accordion");
  if (!accordions.length) return;

  accordions.forEach((acc) => {
    const header = acc.querySelector(".feature-accordion-header");
    const body = acc.querySelector(".feature-accordion-body");
    if (!header || !body) return;

    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");

    const toggleAccordion = () => {
      const isOpen = acc.classList.contains("open");
      accordions.forEach((other) => other.classList.remove("open"));
      if (!isOpen) acc.classList.add("open");
    };

    header.addEventListener("click", toggleAccordion);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });
}

async function hydrateSharedSectionsFromHome() {
  try {
    const resp = await fetch("/");
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const banner = doc.querySelector("#site-banner .banner-content");
    const bannerMount = document.getElementById("movieBannerMount");
    if (banner && bannerMount) bannerMount.innerHTML = banner.outerHTML;

    const features = doc.querySelector("#siteFeatures");
    const featuresMount = document.getElementById("movieFeaturesMount");
    if (features && featuresMount) {
      featuresMount.innerHTML = features.outerHTML;
      initFeatureAccordions();
    }
  } catch (err) {
    console.error("hydrateSharedSectionsFromHome error:", err);
  }
}

async function loadMoviePage() {
  const status = document.getElementById("moviePageStatus");
  const cardContainer = document.getElementById("moviePageCard");

  await hydrateSharedSectionsFromHome();

  const slug = parseSlug();
  if (!slug) {
    status.textContent = "اسلاگ پست مشخص نیست.";
    return;
  }

  const { data: movies, error } = await db.from("movies").select("*");
  if (error || !Array.isArray(movies)) {
    status.textContent = "خطا در دریافت اطلاعات پست.";
    return;
  }

  const movie = movies.find((item) => makeMovieSlug(item.title) === slug);
  if (!movie) {
    status.textContent = "پست مورد نظر پیدا نشد.";
    return;
  }

  const { data: episodes } = await db
    .from("movie_episodes")
    .select("*")
    .eq("movie_id", movie.id)
    .order("episode_number", { ascending: true });

  setSeo(movie, slug);
  renderMovieCard(cardContainer, movie, episodes || []);

  status.hidden = true;
  cardContainer.hidden = false;
}

document.addEventListener("DOMContentLoaded", loadMoviePage);
