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

function normalizeListField(raw) {
  if (!raw) return "-";
  return String(raw)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join("، ");
}

function parseSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/movie/")) {
    return decodeURIComponent(pathname.replace("/movie/", "").replace(/\/+$/, ""));
  }

  const params = new URLSearchParams(window.location.search);
  return (params.get("slug") || "").trim();
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

function renderMovie(card, movie, episodes = []) {
  const title = escapeHtml(movie.title || "-");
  const synopsis = escapeHtml((movie.synopsis || "-").trim());
  const director = escapeHtml(normalizeListField(movie.director));
  const product = escapeHtml(normalizeListField(movie.product));
  const stars = escapeHtml(normalizeListField(movie.stars));
  const genre = escapeHtml(normalizeListField(movie.genre));
  const imdb = escapeHtml(movie.imdb || "-");
  const release = escapeHtml(movie.release_info || "-");
  const cover = escapeHtml(movie.cover || "https://via.placeholder.com/450x650?text=No+Image");

  const episodesHtml = episodes.length
    ? `<div class="movie-page-episodes"><h2>اپیزودها</h2>${episodes
        .map(
          (ep, idx) => `<div class="movie-page-episode">
            <strong>Episode ${idx + 1}</strong>
            <a href="${escapeHtml(ep.link || "#")}" target="_blank" rel="noopener">لینک فایل</a>
          </div>`
        )
        .join("")}</div>`
    : "";

  card.innerHTML = `
    <img class="movie-page-cover" src="${cover}" alt="${title}" />
    <div class="movie-page-content">
      <h1>${title}</h1>
      <p class="movie-page-synopsis">${synopsis}</p>
      <ul class="movie-page-meta">
        <li><span>Director:</span> ${director}</li>
        <li><span>Product:</span> ${product}</li>
        <li><span>Stars:</span> ${stars}</li>
        <li><span>Genre:</span> ${genre}</li>
        <li><span>IMDB:</span> ${imdb}</li>
        <li><span>Release:</span> ${release}</li>
      </ul>
      <a class="movie-page-go" href="${escapeHtml(movie.link || "#")}" target="_blank" rel="noopener">Go to file</a>
      ${episodesHtml}
    </div>
  `;
}

async function loadMoviePage() {
  const status = document.getElementById("moviePageStatus");
  const card = document.getElementById("moviePageCard");

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
  renderMovie(card, movie, episodes || []);

  status.hidden = true;
  card.hidden = false;
}

document.addEventListener("DOMContentLoaded", loadMoviePage);
