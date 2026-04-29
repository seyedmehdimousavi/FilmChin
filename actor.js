const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const pageLang = localStorage.getItem("siteLanguage") || "en";

const i18n = {
  en: {
    backToHome: "← Back to homepage",
    loading: "Loading...",
    actorMissing: "Actor name is missing.",
    actorNotFound: "No posts found for this actor.",
    actorMovies: "Actor movies",
    goToPage: "Go to page",
    episodes: "Episodes",
  },
  fa: {
    backToHome: "← بازگشت به صفحه اصلی",
    loading: "در حال بارگذاری...",
    actorMissing: "نام بازیگر مشخص نیست.",
    actorNotFound: "پستی برای این بازیگر پیدا نشد.",
    actorMovies: "فیلم‌های بازیگر",
    goToPage: "صفحه فیلم",
    episodes: "اپیزودها",
  },
};

function t(key) {
  return i18n[pageLang]?.[key] || i18n.en[key] || key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeActorSlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseActorSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/actor/")) {
    return decodeURIComponent(pathname.replace("/actor/", "").replace(/\/+$/, "")).trim();
  }
  return (new URLSearchParams(window.location.search).get("slug") || "").trim();
}

function extractCommaSeparatedNames(str) {
  if (!str) return [];
  return str
    .split(/[،,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  const colorThemes = {
    blue: { accentRgb: "0, 74, 124", accentDark: "#004a7c", accent: "#0091d5", accentLight: "#2185d5", accentContrast: "#0d47a1", bgDay: "#f1f4f9", bgSoft: "#e8f0fa" },
    green: { accentRgb: "27, 94, 32", accentDark: "#1b5e20", accent: "#2e9d57", accentLight: "#4caf50", accentContrast: "#145a32", bgDay: "#edf7ef", bgSoft: "#e0f2e4" },
    yellow: { accentRgb: "146, 121, 18", accentDark: "#927912", accent: "#c5a317", accentLight: "#d9b62f", accentContrast: "#725d0e", bgDay: "#fbf7e8", bgSoft: "#f4edd2" },
    red: { accentRgb: "140, 35, 35", accentDark: "#8c2323", accent: "#c84646", accentLight: "#d86464", accentContrast: "#6f1b1b", bgDay: "#faeeee", bgSoft: "#f4dede" },
    purple: { accentRgb: "73, 53, 126", accentDark: "#49357e", accent: "#6f4dbb", accentLight: "#8a6ad1", accentContrast: "#39295f", bgDay: "#f2eefb", bgSoft: "#e7e0f7" },
    teal: { accentRgb: "17, 95, 104", accentDark: "#115f68", accent: "#188a94", accentLight: "#21a4b0", accentContrast: "#0d4b51", bgDay: "#eaf7f8", bgSoft: "#def0f2" },
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
}

function applyInnerPageHeaderOffset() {
  const header = document.querySelector(".main-header");
  if (!header) return;
  const offset = Math.max(0, Math.ceil(header.getBoundingClientRect().height));
  document.documentElement.style.setProperty("--inner-header-offset", `${offset + 12}px`);
}

function disableHomeOnlyUiOnInnerPages() {
  document.querySelectorAll(".movie-type-tabs .tab-link").forEach((link) => {
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (e) => e.preventDefault());
  });
  const tabGenres = document.querySelector(".tab-genres-wrapper");
  if (tabGenres) {
    tabGenres.classList.add("is-disabled");
    tabGenres.setAttribute("aria-disabled", "true");
  }
  document.getElementById("storyToggle")?.classList.add("is-disabled");
  document.getElementById("storyPanel")?.classList.add("is-disabled");
}

function bindGlobalInnerSearchRedirect() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = (searchInput.value || "").trim();
    if (!q) return;
    e.preventDefault();
    localStorage.setItem("filmchin_pending_search", q);
    window.location.href = `/?search=${encodeURIComponent(q)}`;
  });
}

function hydrateSharedSectionsFromHomeSync() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/", false);
  xhr.send(null);
  if (xhr.status < 200 || xhr.status >= 300 || !xhr.responseText) return;
  const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
  const header = doc.querySelector(".main-header");
  const menuOverlay = doc.querySelector("#menuOverlay");
  const sideMenu = doc.querySelector("#sideMenu");
  const tabs = doc.querySelector(".movie-type-tabs");
  const tabGenres = doc.querySelector(".tab-genres-wrapper");
  const bottomDock = doc.querySelector(".mobile-bottom-dock");
  const floating = doc.querySelector(".floating-btn-container");
  const goTop = doc.querySelector(".go-top-container");
  const features = doc.querySelector("#siteFeatures");
  if (header) document.getElementById("sharedHeaderMount").innerHTML = header.outerHTML;
  if (menuOverlay) document.getElementById("sharedMenuOverlayMount").innerHTML = menuOverlay.outerHTML;
  if (sideMenu) document.getElementById("sharedSideMenuMount").innerHTML = sideMenu.outerHTML;
  if (tabs) document.getElementById("sharedTabsMount").innerHTML = tabs.outerHTML;
  if (tabGenres) document.getElementById("sharedTabGenresMount").innerHTML = tabGenres.outerHTML;
  if (bottomDock) document.getElementById("sharedBottomDockMount").innerHTML = bottomDock.outerHTML;
  if (floating) document.getElementById("sharedFloatingMount").innerHTML = floating.outerHTML;
  if (goTop) document.getElementById("sharedGoTopMount").innerHTML = goTop.outerHTML;
  if (features) document.getElementById("movieFeaturesMount").innerHTML = features.outerHTML;
  bindGlobalInnerSearchRedirect();
  applyInnerPageHeaderOffset();
  disableHomeOnlyUiOnInnerPages();
}

function buildActorEpisodesMap(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    const key = String(item.movie_id || "");
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function renderActorPosts(posts, episodesMap = new Map()) {
  const container = document.getElementById("actorMoviesList");
  container.innerHTML = posts
    .map((m) => {
      const cover = escapeHtml(m.cover || "https://via.placeholder.com/120x80?text=No+Cover");
      const title = escapeHtml(m.title || "-");
      const synopsis = escapeHtml(m.synopsis || "-");
      const url = `/movie/${encodeURIComponent(String(m.title || "").toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))}`;
      const movieEpisodes = episodesMap.get(String(m.id)) || [];
      const showEpisodes = m.type === "collection" && movieEpisodes.length > 0;
      const episodesHtml = showEpisodes
        ? `<div class="actor-episodes-block">
            <span class="field-label"><img src="/images/icons8-video.apng" style="width:20px;height:20px;"> ${t("episodes")}:</span>
            <div class="episodes-container actor-episodes-container">
              <div class="episodes-list actor-episodes-list">
                ${movieEpisodes.map((ep, idx) => {
                  const epTitle = escapeHtml(ep.title || `Episode ${idx + 1}`);
                  const epCover = escapeHtml(ep.cover || m.cover || "https://via.placeholder.com/120x80?text=No+Cover");
                  const scrollable = epTitle.length > 16 ? "scrollable" : "";
                  return `<div class="episode-card actor-episode-card"><img src="${epCover}" alt="${epTitle}" class="episode-cover"><span class="episode-title ${scrollable}"><span>${epTitle}</span></span></div>`;
                }).join("")}
              </div>
            </div>
          </div>`
        : "";
      return `
      <article class="movie-card no-reveal actor-post-card">
        <div class="cover-container"><div class="cover-blur" style="background-image:url('${cover}')"></div><img class="cover-image" src="${cover}" alt="${title}"></div>
        <div class="movie-info">
          <div class="movie-title"><a class="movie-name movie-detail-link" href="${url}">${title}</a></div>
          <span class="field-label"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> Synopsis:</span>
          <div class="field-quote synopsis-quote"><div class="quote-text">${synopsis}</div></div>
          ${episodesHtml}
          <div class="post-action-row movie-page-actions actor-post-actions">
            <div class="button-wrap">
              <button class="go-page-btn actor-go-page-btn" data-url="${url}"><span>${t("goToPage")}</span></button>
              <div class="button-shadow"></div>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");

  container.querySelectorAll(".actor-go-page-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = btn.dataset.url || "#";
      if (url !== "#") window.location.href = url;
    });
  });
}

async function loadActorPage() {
  const status = document.getElementById("actorPageStatus");
  const actorHeader = document.getElementById("actorHeader");
  const actorMoviesBlock = document.getElementById("actorMoviesBlock");
  const actorNameEl = document.getElementById("actorName");
  const actorAvatar = document.getElementById("actorAvatar");
  const actorAvatarFallback = document.getElementById("actorAvatarFallback");

  document.documentElement.lang = pageLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  applySavedTheme();
  const slug = parseActorSlug();
  if (!slug) {
    status.textContent = t("actorMissing");
    return;
  }

  const { data: movies, error } = await db.from("movies").select("id,title,cover,synopsis,stars,type,created_at").order("created_at", { ascending: false });
  if (error || !Array.isArray(movies)) {
    status.textContent = t("actorNotFound");
    return;
  }

  const posts = movies.filter((m) => extractCommaSeparatedNames(m.stars || "").some((name) => makeActorSlug(name) === slug));
  if (!posts.length) {
    status.textContent = t("actorNotFound");
    return;
  }

  const actorName = extractCommaSeparatedNames(posts[0].stars || "").find((name) => makeActorSlug(name) === slug) || slug;
  actorNameEl.textContent = actorName;
  document.title = `FilmChiin | ${actorName}`;

  const { data: actorRow } = await db.from("actors").select("profile_url").eq("slug", slug).maybeSingle();
  if (actorRow?.profile_url) {
    actorAvatar.src = actorRow.profile_url;
    actorAvatar.hidden = false;
    actorAvatarFallback.hidden = true;
    actorAvatar.onerror = () => {
      actorAvatar.hidden = true;
      actorAvatarFallback.hidden = false;
    };
  } else {
    actorAvatar.hidden = true;
    actorAvatarFallback.hidden = false;
  }

  const collectionIds = posts.filter((m) => m.type === "collection").map((m) => m.id);
  let episodesMap = new Map();
  if (collectionIds.length) {
    const { data: movieItems } = await db
      .from("movie_items")
      .select("movie_id,title,cover,order_index")
      .in("movie_id", collectionIds)
      .order("order_index", { ascending: true });
    episodesMap = buildActorEpisodesMap(movieItems || []);
  }

  renderActorPosts(posts, episodesMap);
  status.hidden = true;
  actorHeader.hidden = false;
  actorMoviesBlock.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const backLink = document.querySelector(".movie-page-back");
  backLink?.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.history.length > 1) return window.history.back();
    window.location.href = "/";
  });
  loadActorPage();
});

try {
  hydrateSharedSectionsFromHomeSync();
} catch (e) {
  console.error("hydrateSharedSectionsFromHomeSync error:", e);
}
