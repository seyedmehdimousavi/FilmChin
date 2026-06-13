const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window._supabaseClient = db;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
let currentMovie = null;

function showToast(msg) {
  try {
    let container = document.getElementById("topToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "topToastContainer";
      container.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:90vw;";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.style.cssText = "pointer-events:auto;max-width:min(920px,95%);padding:10px 14px;background:rgba(0,74,124,0.85);color:#fff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.3);font-size:14px;line-height:1.2;text-align:center;opacity:0;transition:opacity 220ms ease,transform 220ms ease;transform:translateY(-6px);";
    toast.textContent = msg || "";
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = "1"; toast.style.transform = "translateY(0)"; });
    setTimeout(() => {
      toast.style.opacity = "0"; toast.style.transform = "translateY(-6px)";
      setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 250);
    }, 3000);
  } catch(err) { console.error("showToast error", err); }
}
let currentUser = null;
let favoriteMovieIds = new Set();
let actorAvatarMap = new Map();

const pageLang = localStorage.getItem("siteLanguage") || "en";
const movieI18n = {
  en: {
    backToHome: "← Back to homepage",
    loading: "Loading...",
    missingSlug: "Post slug is missing.",
    fetchError: "Error fetching post data.",
    notFound: "Requested post was not found.",
    pageLoadError: "Error loading post page.",
    postPageTitle: "FilmChiin | Post page",
    postPageDesc: "Full details of this post on FilmChiin",
    postOptions: "Post options",
    collection: "Collection",
    series: "Series",
    episodes: "episodes",
    synopsis: "Synopsis",
    director: "Director",
    product: "Product",
    stars: "Stars",
    release: "Release",
    genre: "Genre",
    goToFile: "Go to file",
    comments: "comments",
    commentsTitle: "Comments",
    yourName: "Your name",
    close: "close",
    writeComment: "Write a comment...",
    send: "Send",
    similarByActorsTitle: "Other movies with similar cast",
    bySameDirectorTitle: "Other movies by this director",
    noSimilarActors: "No similar-cast movies found.",
    noDirectorMovies: "No other movies found for this director.",
    similarByGenreTitle: "Similar movies by genre",
    noSimilarGenre: "No similar-genre movies found.",
    noActorsArchive: "Other movies of these actors are not available in archive.",
    noDirectorArchive: "Other movies of this director are not available in archive.",
    goToPage: "Go to page",
    postOptionAddFavorite: "Add to favorite",
    postOptionFavoriteStatusAdd: "Add to your favorites",
    postOptionFavoriteStatusIn: "In favorites",
    postOptionLoginRequired: "Login required",
    postOptionCopyLink: "Copy link",
    postOptionCopyLinkSub: "Copy movie page link",
    postOptionShareLink: "Share link",
    postOptionShareLinkSub: "Share movie link with other apps",
  },
  fa: {
    backToHome: "← بازگشت به صفحه اصلی",
    loading: "در حال بارگذاری...",
    missingSlug: "اسلاگ پست مشخص نیست.",
    fetchError: "خطا در دریافت اطلاعات پست.",
    notFound: "پست مورد نظر پیدا نشد.",
    pageLoadError: "خطا در بارگذاری صفحه پست.",
    postPageTitle: "FilmChiin | صفحه پست",
    postPageDesc: "جزئیات کامل این پست در FilmChiin",
    postOptions: "گزینه‌های پست",
    collection: "کالکشن",
    series: "سریال",
    episodes: "اپیزود",
    synopsis: "خلاصه",
    director: "کارگردان",
    product: "محصول",
    stars: "بازیگران",
    release: "انتشار",
    genre: "ژانر",
    goToFile: "دریافت فایل",
    comments: "نظر",
    commentsTitle: "نظرات",
    yourName: "نام شما",
    close: "بستن",
    writeComment: "نظر خود را بنویسید...",
    send: "ارسال",
    similarByActorsTitle: "فیلم‌های دیگر با بازیگران مشابه",
    bySameDirectorTitle: "فیلم‌های دیگر این کارگردان",
    noSimilarActors: "فیلم مشابه بر اساس بازیگران پیدا نشد.",
    noDirectorMovies: "فیلم دیگری از این کارگردان پیدا نشد.",
    similarByGenreTitle: "فیلم‌های مشابه بر اساس ژانر",
    noSimilarGenre: "فیلم مشابه بر اساس ژانر پیدا نشد.",
    noActorsArchive: "فیلم‌های دیگر این بازیگران در آرشیو موجود نیست",
    noDirectorArchive: "فیلم‌های دیگر این کارگردان در آرشیو موجود نیست",
    goToPage: "صفحه فیلم",
    postOptionAddFavorite: "افزودن به علاقه‌مندی",
    postOptionFavoriteStatusAdd: "افزودن به علاقه‌مندی‌ها",
    postOptionFavoriteStatusIn: "در علاقه‌مندی‌ها",
    postOptionLoginRequired: "نیاز به ورود",
    postOptionCopyLink: "کپی لینک",
    postOptionCopyLinkSub: "کپی لینک صفحه فیلم",
    postOptionShareLink: "اشتراک لینک",
    postOptionShareLinkSub: "اشتراک لینک فیلم با سایر برنامه‌ها",
  },
};

function mt(key) {
  return movieI18n[pageLang]?.[key] || movieI18n.en[key] || key;
}

function applyMovieStaticTranslations() {
  document.documentElement.lang = pageLang;
  document.documentElement.dir = pageLang === "fa" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = mt(key);
  });
}

const movieFeatureI18n = {
  en: {
    siteFeaturesTitle: "FilmChiin site features",
    featureTitle1: "Create account",
    featureDesc1: "By creating an account, you unlock extra capabilities: build a personal favorites list and chat with admin.",
    featureTitle2: "Instant and advanced search",
    featureDesc2: "Search is fully instant. As you type, results filter immediately and matched text is highlighted in title, synopsis, cast, and other fields.",
    featureTitle3: "Customize homepage layout",
    featureDesc3: "Use SideMenu options to arrange homepage layout based on your preference.",
    featureTitle4: "Type and genre tabs",
    featureDesc4: "Homepage is separated by content type (movie, collection, series). You can also filter each tab by genres with one click.",
    featureTitle5: "Sort by IMDb rating",
    featureDesc5: "Sort visible list by IMDb score and quickly focus on higher-rated titles.",
    featureTitle6: "Sort by release year",
    featureDesc6: "Use release filter to prioritize newer/older titles based on your preference.",
    featureTitle7: "Live movie count",
    featureDesc7: "At the top of the homepage, the visible movie count updates immediately when search, genres, tabs, IMDb filters, or release filters change.",
    featureTitle8: "Episode list for collections/series",
    featureDesc8: "For collections and series, all episodes are shown in small cards in the same post and selecting an episode updates card info instantly.",
    featureTitle9: "One-click file access",
    featureDesc9: "With <strong>Go to file</strong>, <code>@Filmchinbot</code> sends the movie or episode file directly without needing channel join.",
    featureTitle10: "Comments in each post",
    featureDesc10: "Each post supports comments with custom UI and avatars; comment count is shown near the comment icon.",
    featureTitle11: "Popular movies and page list",
    featureDesc11: "Popular section is built from click stats and the floating panel lists current-page posts for quick navigation.",
    featureTitle12: "Copy or share movie links",
    featureDesc12: "Each post includes copy and share buttons for its dedicated movie page link, so you can open the post details and continue to the file from there.",
    featureTitle13: "Responsive Liquid Glass design",
    featureDesc13: "Parts of UI use a Liquid Glass-inspired design with smooth animations and balanced transparency on mobile/desktop.",
    featureTitle14: "Site language switch",
    featureDesc14: "From language settings, you can switch the UI between Persian and English. Core texts, headings, and feature descriptions update consistently based on your selected language.",
    featureTitle15: "Site color theme switch",
    featureDesc15: "With the color theme option, you can personalize the site look to match your taste. Your selected theme is applied across UI sections for a more consistent and pleasant browsing experience.",
    featureTitle16: "Admin announcements on homepage",
    featureDesc16: "Messages published from the admin panel appear as announcements on the homepage, and users can mark them as read after viewing them.",
  },
  fa: {
    siteFeaturesTitle: "لیست امکانات سایت FilmChiin",
    featureTitle1: "ساخت حساب کاربری",
    featureDesc1: "با ساخت حساب کاربری به قابلیت های بیشتری دسترسی دارید می‌توانید برای خودتان یک لیست اختصاصی از فیلم‌های مورد علاقه بسازید. میتوانید از چت با ادمین استفاده کنید.",
    featureTitle2: "جست‌وجوی لحظه‌ای و پیشرفته",
    featureDesc2: "جست‌وجوی سایت کاملاً لحظه‌ای است؛ با تایپ هر عبارت، نتایج بلافاصله فیلتر می‌شوند. عبارت جست‌وجوشده در عنوان، خلاصه، بازیگران و سایر فیلدها هایلایت می‌شود.",
    featureTitle3: "شخصی سازی چیدمان صفحه",
    featureDesc3: "از طریق گزینه های موجود در SideMenu میتوانید چیدمان صفحه اصلی را مطابق با سلیقه ی خود مرتب کنید.",
    featureTitle4: "فیلترفیلم هاوژانرها در تب‌های جداگانه",
    featureDesc4: "صفحه اصلی بر اساس نوع محتوا (فیلم سینمایی، کالکشن، سریال) با تب‌ها تفکیک شده است. علاوه بر آن، در هر تب می‌توانید با یک کلیک ژانر را فیلتر کنید.",
    featureTitle5: "مرتب‌سازی بر اساس امتیاز IMDb",
    featureDesc5: "لیست قابل مشاهده را می‌توانید بر اساس امتیاز IMDb مرتب کنید تا سریع‌تر به عناوین با امتیاز بالاتر برسید.",
    featureTitle6: "مرتب‌سازی بر اساس سال انتشار",
    featureDesc6: "با فیلتر سال انتشار می‌توانید عناوین جدیدتر یا قدیمی‌تر را بر اساس نیاز خود ببینید.",
    featureTitle7: "آمار دقیق تعداد فیلم‌ها در هر لحظه",
    featureDesc7: "در بالای صفحه اصلی، تعداد فیلم‌های در حال نمایش با توجه به فیلترها و جست‌وجوی فعلی نمایش داده می‌شود و بعد از هر تغییر به‌صورت لحظه‌ای به‌روزرسانی می‌شود.",
    featureTitle8: "لیست قسمت‌های سریال وکالکشن",
    featureDesc8: "برای سریال‌ها و کالکشن‌ها، تمام قسمت‌ها در قالب کارت‌های کوچک داخل همان پست نمایش داده می‌شوند و با انتخاب هر قسمت اطلاعات کارت فوراً آپدیت می‌شود.",
    featureTitle9: "دسترسی به فایل فقط با یک کلیک",
    featureDesc9: "با فشردن دکمه <strong>Go to file</strong> بات <code>@Filmchinbot</code> فایل فیلم یا قسمت سریال را برای شما ارسال می‌کند؛ بدون نیاز به جوین شدن در کانال.",
    featureTitle10: "کامنت و نمایش گفت‌وگو در همان پست",
    featureDesc10: "برای هر پست می‌توانید کامنت بگذارید و همه نظرات در همان کارت فیلم با طراحی اختصاصی و آواتارها نمایش داده می‌شوند.",
    featureTitle11: "فیلم‌های پرطرفدارولیست فیلم‌های صفحه",
    featureDesc11: "بخش فیلم‌های پرطرفدار بر اساس آمار کلیک‌ها ساخته می‌شود و دکمه شناور لیست فیلم‌های صفحه فعلی را نشان می‌دهد.",
    featureTitle12: "کپی یا اشتراک لینک هر فیلم",
    featureDesc12: "برای هر پست، دکمه‌هایی برای کپی و اشتراک لینک صفحه اختصاصی فیلم وجود دارد تا بتوانید اطلاعات پست را باز کنید و از همان‌جا به فایل بروید.",
    featureTitle13: "طراحی Liquid Glass واکنش‌گرا",
    featureDesc13: "بخش هایی از سایت با الهام از طراحی Liquid Glass ساخته شده است؛ کارت‌ها، دکمه‌ها و پنل‌ها تجربه کاربری روان و چشم‌نواز ایجاد می‌کنند.",
    featureTitle14: "امکان تغییر زبان سایت",
    featureDesc14: "در بخش تنظیمات زبان می‌توانید رابط کاربری سایت را بین فارسی و انگلیسی جابه‌جا کنید. تمام متن‌های اصلی، عنوان‌ها و توضیحات امکانات بر اساس زبان انتخابی شما به‌صورت یکپارچه تغییر می‌کنند.",
    featureTitle15: "امکان تغییر تم رنگی سایت",
    featureDesc15: "با گزینه تغییر تم رنگی، می‌توانید ظاهر سایت را متناسب با سلیقه خود شخصی‌سازی کنید. تم انتخابی روی بخش‌های مختلف رابط کاربری اعمال می‌شود تا تجربه مرور سایت هماهنگ‌تر و دلپذیرتر باشد.",
    featureTitle16: "اعلان‌های مدیریت در صفحه اصلی",
    featureDesc16: "پیام‌هایی که مدیریت از پنل ادمین منتشر می‌کند، به‌صورت اعلان در صفحه اصلی نمایش داده می‌شوند و کاربر می‌تواند بعد از خواندن، آن‌ها را علامت‌گذاری کند.",
  },
};

function applyMovieFeatureTranslations() {
  const root = document.getElementById("movieFeaturesMount");
  if (!root) return;
  const map = movieFeatureI18n[pageLang] || movieFeatureI18n.en;
  const title = root.querySelector("h2[data-i18n='siteFeaturesTitle']");
  if (title) title.textContent = map.siteFeaturesTitle;
  root.querySelectorAll(".feature-title").forEach((el, idx) => {
    const key = `featureTitle${idx + 1}`;
    if (map[key]) el.textContent = map[key];
  });
  root.querySelectorAll(".feature-accordion-body p").forEach((el, idx) => {
    const key = `featureDesc${idx + 1}`;
    if (map[key]) el.innerHTML = map[key];
  });
}

function applyMoviePostOptionsTranslations() {
  const setText = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = mt(key); };
  setText("postOptionsTitle", "postOptions");
  const closeBtn = document.getElementById("postOptionsCloseBtn");
  if (closeBtn) closeBtn.setAttribute("aria-label", mt("close"));
  const favTitle = document.querySelector("#postOptionFavorite .post-option-title");
  if (favTitle) favTitle.textContent = mt("postOptionAddFavorite");
  setText("postOptionFavoriteStatus", "postOptionFavoriteStatusAdd");
  const copyTitle = document.querySelector("#postOptionCopyLink .post-option-title");
  if (copyTitle) copyTitle.textContent = mt("postOptionCopyLink");
  const copySub = document.querySelector("#postOptionCopyLink .post-option-subtitle");
  if (copySub) copySub.textContent = mt("postOptionCopyLinkSub");
  const shareTitle = document.querySelector("#postOptionShareLink .post-option-title");
  if (shareTitle) shareTitle.textContent = mt("postOptionShareLink");
  const shareSub = document.querySelector("#postOptionShareLink .post-option-subtitle");
  if (shareSub) shareSub.textContent = mt("postOptionShareLinkSub");
}

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

function makeActorSlug(name) {
  if (!name) return "";
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ا-ی]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildMoviePageHref(title) {
  const slug = makeMovieSlug(title || "");
  return slug ? `/movie.html?slug=${encodeURIComponent(slug)}` : "/movie.html";
}

function buildActorPageHref(name) {
  const slug = makeActorSlug(name || "");
  return slug ? `/actor.html?slug=${encodeURIComponent(slug)}` : "/actor.html";
}

function parseSlug() {
  const pathname = window.location.pathname || "";
  if (pathname.startsWith("/movie/")) {
    return decodeURIComponent(pathname.replace("/movie/", "").replace(/\/+$/, ""));
  }
  return (new URLSearchParams(window.location.search).get("slug") || "").trim();
}

function applyMovieHeroBackground(coverUrl) {
  const body = document.body;
  if (!body) return;
  if (!coverUrl) {
    body.style.removeProperty("--movie-hero-url");
    return;
  }
  body.style.setProperty("--movie-hero-url", `url("${coverUrl}")`);
}

function extractHashtagTokens(str) {
  if (!str) return [];
  return (str.match(/#[^\s,،]+/g) || []).map((tag) => tag.trim()).filter(Boolean);
}

function isEnglishHashtag(tag) {
  const clean = String(tag || "").replace(/^#+/, "");
  return /^[A-Za-z]/.test(clean);
}

function isPersianHashtag(tag) {
  const clean = String(tag || "").replace(/^#+/, "");
  return /[\u0600-\u06FF]/.test(clean) && !/^[A-Za-z]/.test(clean);
}

function filterHashtagsByLanguage(tags) {
  const lang = pageLang === "fa" ? "fa" : "en";
  if (lang === "fa") return tags.filter(isPersianHashtag);
  return tags.filter(isEnglishHashtag);
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

function getActorAvatarHtml(name) {
  const actorAvatar = actorAvatarMap.get(makeActorSlug(name));
  if (actorAvatar) {
    return `<img class="actor-chip-avatar" src="${escapeHtml(actorAvatar)}" alt="${escapeHtml(name)}">`;
  }
  return `<span class="actor-chip-avatar-fallback"><i class="bi bi-person"></i></span>`;
}

function buildActorChip(value) {
  const safeValue = escapeHtml(value);
  const avatar = getActorAvatarHtml(value);
  return `<a class="person-chip actor-chip" dir="auto" href="${buildActorPageHref(value)}">${avatar}<span>${safeValue}</span></a>`;
}

async function fetchActorAvatars() {
  try {
    const { data, error } = await db.from("actors").select("name,slug,profile_url");
    if (error || !Array.isArray(data)) return;
    actorAvatarMap = new Map();
    data.forEach((row) => {
      const key = String(row.slug || makeActorSlug(row.name || "")).trim();
      if (!key) return;
      actorAvatarMap.set(key, row.profile_url || "");
    });
  } catch (e) {
    console.warn("fetchActorAvatars error", e);
  }
}

function renderChips(str, mode = "hashtags") {
  if (!str || str === "-") return '<span class="chip">-</span>';

  if (mode === "names") {
    const names = extractCommaSeparatedNames(str);
    if (!names.length) return `<span class="chip">${escapeHtml(str)}</span>`;
    return names.map((name) => buildSearchChip(name, "person-chip")).join(' <span class="chip-separator">,</span> ');
  }

  if (mode === "actors") {
    const names = extractCommaSeparatedNames(str);
    if (!names.length) return `<span class="chip">${escapeHtml(str)}</span>`;
    return names.map((name) => buildActorChip(name)).join(' <span class="chip-separator">,</span> ');
  }

  const tags = extractHashtagTokens(str);
  if (tags.length) {
    const visibleTags = mode === "genre" ? filterHashtagsByLanguage(tags) : tags;
    if (!visibleTags.length) return '<span class="chip">-</span>';
    return visibleTags.map((tag) => buildSearchChip(tag, "genre-chip-mini")).join("");
  }

  return String(str)
    .split(" ")
    .filter((g) => g.trim())
    .map((g) => buildSearchChip(g, "country-chip"))
    .join("");
}


function classifySynopsisChar(ch) {
  if (/\s/.test(ch)) return "neutral";
  if (/[\u0600-\u06FF]/.test(ch)) return "fa";
  if (/[A-Za-z0-9]/.test(ch)) return "en";
  return "neutral";
}

function buildSynopsisSegments(rawText) {
  const text = String(rawText || "").trim();
  if (!text || text === "-") return [{ dir: "fa", text: "-" }];

  const segments = [];
  let current = "";
  let currentDir = "en";

  for (const ch of text) {
    const kind = classifySynopsisChar(ch);
    const nextDir = kind === "neutral" ? currentDir : kind;

    if (current && nextDir !== currentDir) {
      segments.push({ dir: currentDir, text: current.trim() });
      current = "";
    }

    currentDir = nextDir;
    current += ch;
  }

  if (current.trim()) {
    segments.push({ dir: currentDir, text: current.trim() });
  }

  const merged = [];
  segments.forEach((seg) => {
    if (!seg.text) return;
    const prev = merged[merged.length - 1];
    if (prev && prev.dir === seg.dir) prev.text = `${prev.text} ${seg.text}`.trim();
    else merged.push(seg);
  });

  return merged.length ? merged : [{ dir: "fa", text }];
}

function makeSynopsisHtml(rawText) {
  const lang = pageLang === "fa" ? "fa" : "en";
  const segments = buildSynopsisSegments(rawText).filter((seg) => {
    if (lang === "en") return true;
    return seg.dir !== "en";
  });

  if (!segments.length) {
    return `<span class="synopsis-segment synopsis-fa" dir="rtl">-</span>`;
  }

  return segments
    .map((seg) => `<span class="synopsis-segment synopsis-${seg.dir}" dir="${seg.dir === "fa" ? "rtl" : "ltr"}">${escapeHtml(seg.text)}</span>`)
    .join("");
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

  const goPageColors = { blue: "#1e88e5", green: "#2e9d57", yellow: "#c5a317", red: "#c84646", purple: "#6f4dbb", teal: "#188a94" };
  const themeName = localStorage.getItem("colorTheme") || "blue";
  s.setProperty("--go-page-bg", goPageColors[themeName] || "#7c4dff");
}

function setSeo(movie, slug) {
  const movieTitle = movie?.title || "";
  const year = movie?.year || "";
  const genre = Array.isArray(movie?.genre)
    ? movie.genre.join(", ")
    : (movie?.genre || "");
  const director = movie?.director || "";
  const imdb = movie?.imdb ? `امتیاز IMDb: ${movie.imdb}` : "";

  // عنوان بهینه برای گوگل
  const titleParts = [movieTitle];
  if (year) titleParts.push(year);
  const seoTitle = titleParts.length > 1
    ? `دانلود ${titleParts.join(" ")} | فیلمچین FilmChiin`
    : `FilmChiin | دانلود فیلم و سریال`;

  // توضیح غنی
  const rawDesc = (movie?.synopsis || "").trim();
  const descParts = [];
  if (movieTitle) descParts.push(`دانلود ${movieTitle}`);
  if (year) descParts.push(year);
  if (genre) descParts.push(genre);
  if (imdb) descParts.push(imdb);
  const seoDesc = rawDesc
    ? rawDesc.substring(0, 155)
    : (descParts.join(" | ") || "دانلود فیلم و سریال با لینک مستقیم در فیلمچین");

  const cover = movie?.cover || "https://filmchiin.ir/images/banner-icon.png";

  // canonical — clean URL بدون .html
  const canonical = `https://filmchiin.ir/movie/${encodeURIComponent(slug)}`;

  // آپدیت متا تگ‌ها
  document.title = seoTitle;
  const setMeta = (selector, content) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  };
  setMeta('meta[name="description"]', seoDesc);
  setMeta('meta[name="keywords"]', `دانلود ${movieTitle}, ${movieTitle} ${year}, فیلمچین, filmchiin, دانلود فیلم`);
  setMeta('meta[property="og:title"]', seoTitle);
  setMeta('meta[property="og:description"]', seoDesc);
  setMeta('meta[property="og:image"]', cover);
  setMeta('meta[property="og:url"]', canonical);
  setMeta('meta[name="twitter:title"]', seoTitle);
  setMeta('meta[name="twitter:description"]', seoDesc);
  setMeta('meta[name="twitter:image"]', cover);

  // canonical link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.rel = "canonical";
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", canonical);

  // JSON-LD Structured Data (Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movieTitle,
    "url": canonical,
    "image": cover,
    "description": seoDesc,
    ...(year ? { "datePublished": String(year) } : {}),
    ...(director ? { "director": { "@type": "Person", "name": director } } : {}),
    ...(movie?.imdb ? { "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(movie.imdb),
      "bestRating": "10",
      "ratingCount": "1000"
    }} : {}),
    ...(genre ? { "genre": genre.split(",").map(g => g.trim()) } : {}),
    "publisher": {
      "@type": "Organization",
      "name": "FilmChiin | فیلمچین",
      "url": "https://filmchiin.ir",
      "logo": "https://filmchiin.ir/images/banner-icon.png"
    }
  };

  let ldEl = document.getElementById("movieJsonLd");
  if (!ldEl) {
    ldEl = document.createElement("script");
    ldEl.type = "application/ld+json";
    ldEl.id = "movieJsonLd";
    document.head.appendChild(ldEl);
  }
  ldEl.textContent = JSON.stringify(jsonLd, null, 2);

  // آپدیت html lang و dir بر اساس زبان ذخیره‌شده کاربر
  document.documentElement.setAttribute("lang", pageLang);
  document.documentElement.setAttribute("dir", pageLang === "fa" ? "rtl" : "ltr");
}

function openPostOptions() {
  const overlay = document.getElementById("postOptionsOverlay");
  const title = document.getElementById("postOptionsTitle");
  if (!overlay || !currentMovie) return;
  if (title) title.textContent = currentMovie.title || mt("postOptions");
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
    statusEl.textContent = mt("postOptionLoginRequired");
    return;
  }
  const isFavorite = favoriteMovieIds.has(currentMovie.id);
  btn.classList.toggle("favorite-active", isFavorite);
  statusEl.textContent = isFavorite ? mt("postOptionFavoriteStatusIn") : mt("postOptionFavoriteStatusAdd");
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
    const url = `${window.location.origin}/movie.html?slug=${encodeURIComponent(slug)}`;
    await navigator.clipboard.writeText(url);
    closePostOptions();
  });

  document.getElementById("postOptionShareLink")?.addEventListener("click", async () => {
    const url = `${window.location.origin}/movie.html?slug=${encodeURIComponent(slug)}`;
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
    showToast(pageLang === "fa" ? "کامنت بعد از تایید ادمین نمایش داده خواهد شد" : "Comment will be shown after admin approval");
    await refresh();
    sendBtn.disabled = false;
  });

  refresh();
}

function buildSimilarByGenre(current, allMovies) {
  const currentGenres = new Set(extractHashtagTokens(current.genre || ""));
  if (!currentGenres.size) return [];

  return allMovies
    .filter((m) => m.id !== current.id)
    .map((m) => {
      const g = new Set(extractHashtagTokens(m.genre || ""));
      let overlap = 0;
      currentGenres.forEach((x) => { if (g.has(x)) overlap += 1; });
      return { movie: m, overlap, total: g.size || 999 };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.total - b.total;
    })
    .slice(0, 15)
    .map((x) => x.movie);
}

function normalizeNameTokens(str) {
  return extractCommaSeparatedNames(str || "")
    .map((n) => n.toLowerCase().replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function buildSimilarByActors(current, allMovies) {
  const currentActors = normalizeNameTokens(current.stars || "");
  const currentSet = new Set(currentActors);
  if (!currentSet.size) return [];

  return allMovies
    .filter((m) => m.id !== current.id)
    .map((m) => {
      const actors = normalizeNameTokens(m.stars || "");
      const actorsSet = new Set(actors);
      let overlap = 0;
      currentSet.forEach((a) => { if (actorsSet.has(a)) overlap += 1; });
      return { movie: m, overlap, total: actorsSet.size || 999 };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.total - b.total;
    })
    .slice(0, 15)
    .map((x) => x.movie);
}

function buildBySameDirector(current, allMovies) {
  const currentDirectors = new Set(normalizeNameTokens(current.director || ""));
  if (!currentDirectors.size) return [];

  return allMovies
    .filter((m) => m.id !== current.id)
    .map((m) => {
      const directors = new Set(normalizeNameTokens(m.director || ""));
      let overlap = 0;
      currentDirectors.forEach((d) => { if (directors.has(d)) overlap += 1; });
      return { movie: m, overlap, total: directors.size || 999 };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return a.total - b.total;
    })
    .slice(0, 15)
    .map((x) => x.movie);
}

function renderSimilarMovies(container, similarMovies, titleKey, emptyKey) {
  const html = (similarMovies || [])
    .map((m) => {
      const title = escapeHtml(m.title || "-");
      const cover = escapeHtml(m.cover || "https://via.placeholder.com/300x200?text=No+Cover");
      const url = buildMoviePageHref(m.title || "");
      return `
        <div class="favorite-item coming-soon-grid-item similar-movie-card" data-url="${escapeHtml(url)}">
          <div class="coming-soon-poster-wrap">
            <img src="${cover}" alt="${title}" class="favorite-cover" loading="lazy" />
          </div>
          <div class="favorite-title" dir="auto">${title}</div>
          <div class="favorite-actions">
            <div class="button-wrap">
              <button class="coming-soon-info-btn similar-go-btn" data-url="${escapeHtml(url)}" type="button">
                <span>${mt("goToPage")}</span>
              </button>
              <div class="button-shadow"></div>
            </div>
          </div>
        </div>`;
    })
    .join("");

  const section = document.createElement("div");
  section.className = "similar-movies-section";
  section.innerHTML = `
    <div class="similar-block-card">
      <div class="similar-movies-title"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> <strong>${mt(titleKey)}</strong></div>
      <div class="favorites-grid coming-soon-grid similar-movies-container">${html || `<div class="similar-empty-message"><strong>${mt(emptyKey)}</strong></div>`}</div>
    </div>
  `;
  container.appendChild(section);

  section.querySelectorAll(".similar-movie-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".similar-go-btn")) return;
      e.stopPropagation();
      const wasActive = card.classList.contains("coming-soon-card-active");
      section
        .querySelectorAll(".similar-movie-card.coming-soon-card-active")
        .forEach((item) => {
          if (item !== card) item.classList.remove("coming-soon-card-active");
        });
      card.classList.toggle("coming-soon-card-active", !wasActive);
    });
  });

  section.querySelectorAll(".similar-go-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url || "#";
      if (url && url !== "#") window.location.href = url;
    });
  });
}

function renderMovieCard(container, movie, allMovies, episodes = []) {
  const cover = escapeHtml(movie.cover || "https://via.placeholder.com/300x200?text=No+Image");
  const title = escapeHtml(movie.title || "-");
  const synopsis = makeSynopsisHtml(movie.synopsis || "-");

  const badgeHtml =
    movie.type && movie.type !== "single"
      ? `<span class="collection-badge ${movie.type === "collection" ? "badge-collection" : "badge-serial"}">${movie.type === "collection" ? mt("collection") : mt("series")}<span class="badge-count anim-left-right">${(episodes || []).length} ${mt("episodes")}</span></span>`
      : "";

  const episodesHtml = (episodes || [])
    .map((ep, idx) => {
      const epTitle = escapeHtml(ep.title || `Episode ${idx + 1}`);
      const epCover = escapeHtml(ep.cover || "https://via.placeholder.com/120x80?text=No+Cover");
      const scrollable = epTitle.length > 16 ? "scrollable" : "";
      return `<div class="episode-card ${idx === 0 ? "active" : ""}" data-link="${escapeHtml(ep.link || "#")}" data-title="${epTitle}"><img src="${epCover}" alt="${epTitle}" class="episode-cover"><span class="episode-title ${scrollable}"><span>${epTitle}</span></span></div>`;
    })
    .join("");

  container.innerHTML = `
  <div class="movie-card no-reveal movie-page-card-only" data-movie-id="${escapeHtml(movie.id)}">
    <div class="cover-container anim-vertical"><div class="cover-blur anim-vertical" style="background-image: url('${cover}');"></div><img class="cover-image anim-vertical" src="${cover}" alt="${title}"></div>
    <div class="movie-info anim-vertical">
      <div class="movie-title anim-left-right"><span class="movie-name anim-horizontal">${title}</span>${badgeHtml}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> ${mt("synopsis")}: </span><div class="field-quote anim-left-right synopsis-quote"><div class="quote-text anim-horizontal">${synopsis}</div></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> ${mt("director")}: </span><div class="field-quote anim-left-right director-field">${renderChips(movie.director || "-", "names")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-location.apng" style="width:20px;height:20px;"> ${mt("product")}: </span><div class="field-quote anim-horizontal product-field">${renderChips(movie.product || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-star.apng" style="width:20px;height:20px;"> ${mt("stars")}: </span><div class="field-quote anim-left-right stars-field">${renderChips(movie.stars || "-", "actors")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-imdb-48.png" class="imdb-bell" style="width:20px;height:20px;"> IMDB:</span><div class="field-quote anim-left-right"><span class="chip imdb-chip anim-horizontal">${escapeHtml(movie.imdb || "-")}</span></div>
      <span class="field-label anim-vertical"><img src="/images/icons8-calendar.apng" style="width:20px;height:20px;"> ${mt("release")}: </span><div class="field-quote anim-left-right release-field">${escapeHtml(movie.release_info || "-")}</div>
      <span class="field-label anim-vertical"><img src="/images/icons8-comedy-96.png" class="genre-bell" style="width:20px;height:20px;"> ${mt("genre")}: </span><div class="field-quote genre-grid anim-horizontal genre-field">${renderChips(movie.genre || "-", "genre")}</div>
      <div class="episodes-container anim-vertical" data-movie-id="${escapeHtml(movie.id)}"><div class="episodes-list anim-left-right">${episodesHtml}</div></div>
      <div class="post-action-row movie-page-actions"><div class="button-wrap"><button class="go-btn anim-vertical" data-link="${escapeHtml((episodes[0] && episodes[0].link) || movie.link || "#")}"><span>${mt("goToFile")}</span></button><div class="button-shadow"></div></div></div>
      <div class="comment-summary anim-horizontal"><div class="avatars"></div><div class="comments-count">0 ${mt("comments")}</div><div class="enter-comments"><img src="/images/icons8-comment.apng" style="width:22px;height:22px;"></div></div>
      <div class="comments-panel" aria-hidden="true"><div class="comments-panel-inner"><div class="comments-panel-header"><div class="comments-title">${mt("commentsTitle")}</div></div><div class="comments-list"></div><div class="comment-input-row"><div class="name-comments-close"><input class="comment-name" placeholder="${mt("yourName")}" maxlength="60" /><div class="button-wrap"><button class="comments-close"><span>${mt("close")}</span></button><div class="button-shadow"></div></div></div><textarea class="comment-text" placeholder="${mt("writeComment")}" rows="2"></textarea><div class="button-wrap"><button class="comment-send"><span>${mt("send")}</span></button><div class="button-shaddow"></div></div></div></div></div>
    </div>
  </div>`;

  const card = container.querySelector(".movie-card");
  const goBtn = container.querySelector(".go-btn");
  const episodeCards = container.querySelectorAll(".episode-card");

  card?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".go-btn") || target.closest(".episode-card") || target.closest(".quote-toggle-btn") || target.closest(".quote-text") || target.closest(".synopsis-quote") || target.closest(".synopsis-segment") || target.closest("a") || target.closest(".comment-summary") || target.closest(".comments-panel")) return;
    openPostOptions();
  });

  const movieNameEl = container.querySelector(".movie-name");
  const quoteTextEl = container.querySelector(".quote-text");
  const directorFieldEl = container.querySelector(".director-field");
  const productFieldEl = container.querySelector(".product-field");
  const starsFieldEl = container.querySelector(".stars-field");
  const imdbChipEl = container.querySelector(".imdb-chip");
  const releaseFieldEl = container.querySelector(".release-field");
  const genreFieldEl = container.querySelector(".genre-field");
  const coverImgEl = container.querySelector(".cover-image");
  const coverBlurEl = container.querySelector(".cover-blur");

  episodeCards.forEach((epCard, idx) => {
    epCard.addEventListener("click", () => {
      episodeCards.forEach((x) => x.classList.remove("active"));
      epCard.classList.add("active");

      const ep = episodes[idx] || movie;
      if (goBtn) goBtn.dataset.link = ep.link || "#";

      if (movie.type === "collection") {
        if (movieNameEl) movieNameEl.textContent = ep.title || movie.title;
        if (quoteTextEl) quoteTextEl.innerHTML = makeSynopsisHtml(ep.synopsis || movie.synopsis || "-");
        if (directorFieldEl) directorFieldEl.innerHTML = renderChips(ep.director || movie.director || "-", "names");
        if (productFieldEl) productFieldEl.innerHTML = renderChips(ep.product || movie.product || "-");
        if (starsFieldEl) starsFieldEl.innerHTML = renderChips(ep.stars || movie.stars || "-", "actors");
        if (imdbChipEl) imdbChipEl.textContent = ep.imdb || movie.imdb || "-";
        if (releaseFieldEl) releaseFieldEl.textContent = ep.release_info || movie.release_info || "-";
        if (genreFieldEl) genreFieldEl.innerHTML = renderChips(ep.genre || movie.genre || "-", "genre");
        if (coverImgEl) coverImgEl.src = ep.cover || movie.cover || "";
        if (coverBlurEl) coverBlurEl.style.backgroundImage = `url('${ep.cover || movie.cover || ""}')`;
      } else if (movie.type === "serial") {
        if (movieNameEl) movieNameEl.textContent = ep.title || movie.title;
      }
    });
  });

  goBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const finalLink = buildTelegramBotUrlFromChannelLink(goBtn.dataset.link || "#");
    if (finalLink && finalLink !== "#") window.open(finalLink, "_blank", "noopener");
  });

  attachCommentsHandlers(card, movie.id);
  renderSimilarMovies(container, buildSimilarByGenre(movie, allMovies), "similarByGenreTitle", "noSimilarGenre");
  renderSimilarMovies(container, buildSimilarByActors(movie, allMovies), "similarByActorsTitle", "noActorsArchive");
  renderSimilarMovies(container, buildBySameDirector(movie, allMovies), "bySameDirectorTitle", "noDirectorArchive");
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
  if (window.FilmChiinSharedSections?.hydrate) {
    await window.FilmChiinSharedSections.hydrate();
    return;
  }

  const resp = await fetch("/");
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const header = doc.querySelector(".main-header");
  const features = doc.querySelector("#siteFeatures");
  if (header) {
    const targetHeader = document.querySelector(".main-header");
    targetHeader.className = header.className;
    targetHeader.innerHTML = header.innerHTML;
    document.body.classList.add("shared-header-ready");
  }
  if (features) {
    document.getElementById("movieFeaturesMount").innerHTML = features.outerHTML;
    applyMovieFeatureTranslations();
    initFeatureAccordions();
  }
}

async function loadMoviePage() {
  const status = document.getElementById("moviePageStatus");
  const cardContainer = document.getElementById("moviePageCard");

  try {
    applyMovieStaticTranslations();
    applyMoviePostOptionsTranslations();
    applySavedTheme();
    try {
      await hydrateSharedSectionsFromHome();
    } catch (err) {
      console.error("hydrateSharedSectionsFromHome error:", err);
    }

    const slug = parseSlug();
    if (!slug) return (status.textContent = mt("missingSlug"));

    // ===== نمایش فوری از کش sessionStorage =====
    let quickMovie = null;
    try {
      const cached = sessionStorage.getItem("filmchin_quick_movie");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && makeMovieSlug(parsed.title || "") === slug) {
          quickMovie = parsed;
        }
        sessionStorage.removeItem("filmchin_quick_movie");
      }
    } catch(e) { /* ignore */ }

    if (quickMovie) {
      currentMovie = quickMovie;
      applyMovieHeroBackground(quickMovie.cover || "");
      await loadCurrentUserAndFavorites();
      bindPostOptions(slug);
      syncFavoriteOptionUi();
      setSeo(quickMovie, slug);
      // رندر کارت اصلی فوری (بدون فیلم‌های مشابه)
      renderMovieCard(cardContainer, quickMovie, [], []);
      status.hidden = true;
      cardContainer.hidden = false;

      // لود کامل در پس‌زمینه برای فیلم‌های مشابه
      fetchActorAvatars().catch(() => {});
      db.from("movies").select("*").then(({ data: allMovies, error }) => {
        if (error || !Array.isArray(allMovies)) return;
        window._fcMovies = allMovies;
        setTimeout(() => {
          if (window.FilmChiinSharedSections?.buildSideMenuGenres) window.FilmChiinSharedSections.buildSideMenuGenres();
          if (window.FilmChiinSharedSections?.buildSideMenuCountries) window.FilmChiinSharedSections.buildSideMenuCountries();
        }, 200);
        const fullMovie = allMovies.find((item) => makeMovieSlug(item.title) === slug) || quickMovie;
        currentMovie = fullMovie;
        // افزودن فیلم‌های مشابه بعد از لود
        cardContainer.querySelectorAll(".similar-movies-section").forEach(el => el.remove());
        renderSimilarMovies(cardContainer, buildSimilarByGenre(fullMovie, allMovies), "similarByGenreTitle", "noSimilarGenre");
        renderSimilarMovies(cardContainer, buildSimilarByActors(fullMovie, allMovies), "similarByActorsTitle", "noActorsArchive");
        renderSimilarMovies(cardContainer, buildBySameDirector(fullMovie, allMovies), "bySameDirectorTitle", "noDirectorArchive");
      });
      return;
    }

    // ===== بدون کش: لود معمولی =====
    await fetchActorAvatars();
    const { data: movies, error } = await db.from("movies").select("*");
    if (error || !Array.isArray(movies)) return (status.textContent = mt("fetchError"));

    const movie = movies.find((item) => makeMovieSlug(item.title) === slug);
    if (!movie) return (status.textContent = mt("notFound"));

    // ذخیره برای live search dropdown و genre/country grid در سایدمنو
    window._fcMovies = movies;
    // ساخت genre و country grid در sidemenu بعد از لود فیلم‌ها
    setTimeout(() => {
      if (window.FilmChiinSharedSections?.buildSideMenuGenres) {
        window.FilmChiinSharedSections.buildSideMenuGenres();
      }
      if (window.FilmChiinSharedSections?.buildSideMenuCountries) {
        window.FilmChiinSharedSections.buildSideMenuCountries();
      }
    }, 200);

    currentMovie = movie;
    applyMovieHeroBackground(movie.cover || "");

    const { data: items } = await db.from("movie_items").select("*").eq("movie_id", movie.id).order("order_index", { ascending: true });
    const episodes = (movie.type === "collection" || movie.type === "serial")
      ? [
          {
            title: movie.title,
            cover: movie.cover,
            link: movie.link,
            synopsis: movie.synopsis,
            director: movie.director,
            product: movie.product,
            stars: movie.stars,
            imdb: movie.imdb,
            release_info: movie.release_info,
            genre: movie.genre,
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
  } catch (err) {
    console.error("loadMoviePage error:", err);
    status.textContent = mt("pageLoadError");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const backLink = document.querySelector(".movie-page-back");
  backLink?.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "/";
  });
  loadMoviePage();

  // Dock: menu → open side menu locally (injected via hydration)
  document.querySelector("#bottomMenuBtn")?.addEventListener("click", () => {
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");
    if (sideMenu) {
      sideMenu.classList.toggle("active");
      if (menuOverlay) menuOverlay.classList.toggle("active");
    } else {
      window.location.href = new URL("/?openMenu=1", window.location.origin).href;
    }
  });

  // Dock: favorites → open favorites overlay locally if available
  document.querySelector("#bottomFavoritesBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const favBtn = document.getElementById("favoriteMoviesBtn");
    if (favBtn) {
      favBtn.click();
    } else {
      window.location.href = new URL("/?openFavorites=1", window.location.origin).href;
    }
  });

  // Dock: search → focus search input + init live dropdown
  document.querySelector("#bottomSearchBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const si = document.getElementById("search");
    if (si) {
      try { si.focus({ preventScroll: true }); } catch { si.focus(); }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Live search dropdown in movie page (uses all movies from page load)
  (function initMoviePageLiveSearch() {
    // Wait for header to hydrate then attach
    const attachDropdown = () => {
      const searchInput = document.getElementById("search");
      const dropdown = document.getElementById("searchLiveDropdown");
      if (!searchInput || !dropdown) return;

      let debounce = null;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          const query = searchInput.value.trim();
          if (!query) { dropdown.style.display = "none"; return; }

          // Use movies fetched in loadMoviePage (stored as window._fcMovies)
          const allMovies = Array.isArray(window._fcMovies) ? window._fcMovies : [];
          const q = query.toLowerCase();
          const scored = allMovies
            .map(m => {
              const title = (m.title || "").toLowerCase();
              const synopsis = (m.synopsis || "").toLowerCase();
              const stars = (m.stars || "").toLowerCase();
              const director = (m.director || "").toLowerCase();
              let score = 0;
              if (title.includes(q)) score = 3;
              else if (stars.includes(q) || director.includes(q)) score = 2;
              else if (synopsis.includes(q)) score = 1;
              return { m, score };
            })
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(r => r.m);

          if (!scored.length) { dropdown.style.display = "none"; return; }

          const lang = localStorage.getItem("siteLanguage") || "en";
          const openLabel = lang === "fa" ? "باز کن" : "Open";

          dropdown.innerHTML = scored.map(m => {
            const slug = String(m.title || "").toLowerCase().trim()
              .replace(/[\(\)\[\]\{\}]/g, "").replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
              .replace(/-+/g, "-").replace(/^-|-$/g, "");
            const href = slug ? `/movie.html?slug=${encodeURIComponent(slug)}` : "/movie.html";
            const borderClass = m.type === "collection" ? "collection-border" : m.type === "serial" ? "serial-border" : "";
            return `<div class="search-dropdown-item ${borderClass}" data-href="${href}">
              <img src="${m.cover || ""}" alt="" class="search-dropdown-cover" />
              <span class="search-dropdown-title">${m.title || ""}</span>
              <button class="search-dropdown-open-btn" data-href="${href}">${openLabel}</button>
            </div>`;
          }).join("");

          dropdown.querySelectorAll(".search-dropdown-item").forEach(item => {
            item.addEventListener("click", (e) => {
              if (e.target.closest(".search-dropdown-open-btn")) {
                e.stopPropagation();
                window.open(item.dataset.href, "_blank");
                return;
              }
              window.location.href = item.dataset.href;
            });
          });

          dropdown.style.display = "block";
        }, 180);
      });

      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = "none";
        }
      });
      dropdown.addEventListener("click", e => e.stopPropagation());

      // Enter → go home with search query
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = searchInput.value.trim();
          if (q) window.location.href = `/?search=${encodeURIComponent(q)}`;
        }
      });
    };

    // Try immediately, then retry after hydration
    attachDropdown();
    setTimeout(attachDropdown, 800);
    setTimeout(attachDropdown, 2000);
  })();
});
