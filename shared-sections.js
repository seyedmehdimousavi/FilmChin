(function () {
  const featureI18n = {
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
      searchPlaceholder: "Search...",
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
      searchPlaceholder: "جست‌وجو...",
    },
  };

  let homeDocPromise = null;

  function getLang() {
    return localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
  }

  async function getHomeDoc() {
    if (!homeDocPromise) {
      homeDocPromise = fetch("/")
        .then((resp) => resp.text())
        .then((html) => new DOMParser().parseFromString(html, "text/html"));
    }
    return homeDocPromise;
  }

  function applySavedTheme() {
    const dark = localStorage.getItem("theme") === "dark";
    document.body.classList.toggle("dark", dark);

    const colorThemes = {
      blue: { accentRgb: "30, 136, 229", accentDark: "#1565c0", accent: "#1e88e5", accentLight: "#42a5f5", accentContrast: "#0d47a1", bgDay: "#f2f7ff", bgSoft: "#e5f0ff" },
      green: { accentRgb: "46, 157, 87", accentDark: "#227a43", accent: "#2e9d57", accentLight: "#45b36e", accentContrast: "#195b32", bgDay: "#f1faf4", bgSoft: "#e1f3e7" },
      yellow: { accentRgb: "197, 163, 23", accentDark: "#9f8010", accent: "#c5a317", accentLight: "#d6b63e", accentContrast: "#6b5505", bgDay: "#fdf9ec", bgSoft: "#f8efcf" },
      red: { accentRgb: "200, 70, 70", accentDark: "#9b2d2d", accent: "#c84646", accentLight: "#dc6666", accentContrast: "#6e2020", bgDay: "#fcf2f2", bgSoft: "#f6e0e0" },
      purple: { accentRgb: "123, 97, 255", accentDark: "#5f46d2", accent: "#7b61ff", accentLight: "#a68fff", accentContrast: "#47329e", bgDay: "#f7f4ff", bgSoft: "#eee8ff" },
      teal: { accentRgb: "76, 201, 240", accentDark: "#2c9bc0", accent: "#4cc9f0", accentLight: "#7fdcf7", accentContrast: "#1f6e87", bgDay: "#f2fbff", bgSoft: "#e2f6ff" },
    };
    const selected = colorThemes[localStorage.getItem("colorTheme") || "blue"] || colorThemes.blue;
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

  function getCachedCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }

  function setHeaderProfileAvatar(root, avatarUrl) {
    const profileBtn = root.querySelector("#profileBtn");
    if (!profileBtn) return;
    const badge = profileBtn.querySelector("#commentBadge")?.outerHTML || '<span id="commentBadge" class="badge" style="display: none">!</span>';
    const src = avatarUrl || "/images/icons8-user-96.png";
    profileBtn.innerHTML = `<img src="${src}" alt="user" />${badge}`;
  }

  async function hydrateHeaderProfile(root) {
    const cached = getCachedCurrentUser();
    if (cached?.avatarUrl) setHeaderProfileAvatar(root, cached.avatarUrl);
    if (cached?.username) {
      const usernameEl = root.querySelector("#profileUsername");
      if (usernameEl) usernameEl.textContent = cached.username;
    }

    if (!window.supabase?.createClient) return;
    try {
      const db = window.supabase.createClient(
        "https://gwsmvcgjdodmkoqupdal.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY"
      );
      const { data: sessionData } = await db.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: dbUser } = await db.from("users").select("username,avatar_url").eq("id", user.id).maybeSingle();
      const avatarUrl = dbUser?.avatar_url ? db.storage.from("avatars").getPublicUrl(dbUser.avatar_url).data.publicUrl : null;
      setHeaderProfileAvatar(root, avatarUrl);
      const usernameEl = root.querySelector("#profileUsername");
      if (usernameEl) usernameEl.textContent = dbUser?.username || user.email || "User";
    } catch (err) {
      console.warn("shared profile hydrate error", err);
    }
  }

  function initHeaderInteractions(root) {
    const lang = getLang();
    const searchInput = root.querySelector("#search");
    const searchCloseBtn = root.querySelector("#searchCloseBtn");
    const profileBtn = root.querySelector("#profileBtn");
    const themeSwitchCheckbox = root.querySelector("#themeSwitchCheckbox");

    if (profileBtn) profileBtn.setAttribute("href", "/admin.html");
    hydrateHeaderProfile(root);
    if (searchInput) searchInput.setAttribute("placeholder", featureI18n[lang].searchPlaceholder);
    const syncThemeSwitchFromStorage = () => {
      const dark = localStorage.getItem("theme") === "dark";
      document.body.classList.toggle("dark", dark);
      if (themeSwitchCheckbox) themeSwitchCheckbox.checked = dark;
    };

    if (themeSwitchCheckbox) {
      syncThemeSwitchFromStorage();
      themeSwitchCheckbox.addEventListener("change", (e) => {
        const dark = e.target.checked;
        document.body.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
      });
      window.addEventListener("pageshow", syncThemeSwitchFromStorage);
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) syncThemeSwitchFromStorage();
      });
    }

    const updateSearchDecor = () => {
      if (!searchInput || !searchCloseBtn || !profileBtn) return;
      const hasText = searchInput.value.trim() !== "";
      profileBtn.style.display = hasText ? "none" : "flex";
      searchCloseBtn.style.display = hasText ? "flex" : "none";
    };

    if (searchInput) {
      searchInput.addEventListener("input", updateSearchDecor);
      searchInput.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const query = searchInput.value.trim();
        if (!query) return;
        localStorage.setItem("filmchin_pending_search", query);
        const url = new URL("/", window.location.origin);
        url.searchParams.set("search", query);
        window.location.href = url.toString();
      });
      updateSearchDecor();
    }

    searchCloseBtn?.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      searchInput.focus();
    });

    root.querySelectorAll(".tab-link").forEach((link) => {
      const type = link.getAttribute("data-type") || "all";
      const url = new URL("/", window.location.origin);
      if (type !== "all") url.searchParams.set("tab", type);
      link.href = url.pathname + url.search;
    });
  }

  function applyFeatureTranslations(root) {
    const map = featureI18n[getLang()] || featureI18n.en;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (map[key]) el.textContent = map[key];
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (map[key]) el.innerHTML = map[key];
    });
  }

  function initFeatureAccordions(root) {
    const accordions = root.querySelectorAll(".feature-accordion");
    accordions.forEach((acc) => {
      const header = acc.querySelector(".feature-accordion-header");
      if (!header) return;
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

  async function hydrate() {
    applySavedTheme();
    const lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    const doc = await getHomeDoc();

    const sourceHeader = doc.querySelector(".main-header");
    const targetHeader = document.querySelector(".main-header");
    if (sourceHeader && targetHeader) {
      targetHeader.className = sourceHeader.className;
      targetHeader.innerHTML = sourceHeader.innerHTML;
      document.body.classList.add("shared-header-ready");
      initHeaderInteractions(targetHeader);
    }

    const sourceFeatures = doc.querySelector("#siteFeatures");
    const featuresMount = document.getElementById("movieFeaturesMount");
    if (sourceFeatures && featuresMount) {
      featuresMount.innerHTML = sourceFeatures.outerHTML;
      const renderedFeatures = featuresMount.querySelector("#siteFeatures");
      if (renderedFeatures) {
        applyFeatureTranslations(renderedFeatures);
        initFeatureAccordions(renderedFeatures);
      }
    }
  }

  window.FilmChiinSharedSections = { hydrate };
})();

// ===== PATCH: Dock functionality for movie/actor pages =====
(function initSharedDock() {
  function setupDock() {
    const dock = document.querySelector(".mobile-bottom-dock");
    if (!dock) return;

    // ---- Menu button → navigate home and open sidemenu ----
    const menuBtn = dock.querySelector("#bottomMenuBtn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        const url = new URL("/", window.location.origin);
        url.searchParams.set("openMenu", "1");
        window.location.href = url.toString();
      });
    }

    // ---- Favorites button → navigate home and open favorites ----
    const favBtn = dock.querySelector("#bottomFavoritesBtn");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const url = new URL("/", window.location.origin);
        url.searchParams.set("openFavorites", "1");
        window.location.href = url.toString();
      });
    }

    // ---- Search button → focus the header search input ----
    const searchBtn = dock.querySelector("#bottomSearchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("search");
        if (searchInput) {
          try { searchInput.focus({ preventScroll: true }); } catch { searchInput.focus(); }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    // ---- Keyboard detection: hide dock when keyboard open ----
    function checkKeyboard() {
      const vvHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const winHeight = window.screen.height;
      const keyboardOpen = vvHeight < winHeight * 0.70;
      document.body.classList.toggle("keyboard-open", keyboardOpen);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", checkKeyboard);
    } else {
      window.addEventListener("resize", checkKeyboard);
    }
    checkKeyboard();
  }

  // ---- Social links i18n ----
  function updateSocialLinksLang() {
    const lang = localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
    const label = document.querySelector("#socialLinksSection .social-link-label");
    const bubble = document.querySelector("#socialLinksSection .social-link-join-bubble");
    if (label) label.textContent = lang === "fa" ? "کانال تلگرام" : "Telegram Channel";
    if (bubble) bubble.textContent = lang === "fa" ? "جوین" : "Join";
  }

  // Run after hydrate
  const origHydrate = window.FilmChiinSharedSections?.hydrate;
  if (origHydrate) {
    window.FilmChiinSharedSections.hydrate = async function() {
      await origHydrate();
      setupDock();
      updateSocialLinksLang();
    };
  }

  // Also run on DOMContentLoaded for pages that already have dock
  document.addEventListener("DOMContentLoaded", () => {
    setupDock();
    updateSocialLinksLang();
  });
})();

// ===== PATCH: Live search dropdown on movie/actor pages =====
(function initSharedSearchDropdown() {
  const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";

  let moviesCache = null;
  let episodesCacheMap = new Map();
  let coverCycleTimers = new Map();

  async function getMovies() {
    if (moviesCache) return moviesCache;
    if (!window.supabase?.createClient) return [];
    try {
      const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await db.from("movies").select("id,title,cover,type,synopsis,stars,director").order("updated_at", { ascending: false });
      moviesCache = data || [];
      return moviesCache;
    } catch { return []; }
  }

  async function getEpisodes(movieIds) {
    if (!window.supabase?.createClient || !movieIds.length) return new Map();
    const missing = movieIds.filter(id => !episodesCacheMap.has(id));
    if (missing.length) {
      try {
        const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data } = await db.from("movie_items").select("movie_id,cover,order_index")
          .in("movie_id", missing).order("order_index", { ascending: true });
        const grouped = new Map();
        (data || []).forEach(ep => {
          if (!grouped.has(ep.movie_id)) grouped.set(ep.movie_id, []);
          grouped.get(ep.movie_id).push(ep.cover);
        });
        missing.forEach(id => episodesCacheMap.set(id, grouped.get(id) || []));
      } catch {}
    }
    return episodesCacheMap;
  }

  function makeMovieSlug(title) {
    return String(title || "").toLowerCase().trim()
      .replace(/[\(\)\[\]\{\}]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
      .replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  function buildMoviePageHref(title) {
    const slug = makeMovieSlug(title || "");
    return slug ? `/movie.html?slug=${encodeURIComponent(slug)}` : "/movie.html";
  }

  function scoreMovie(movie, query) {
    const q = query.toLowerCase();
    const title = (movie.title || "").toLowerCase();
    const synopsis = (movie.synopsis || "").toLowerCase();
    const stars = (movie.stars || "").toLowerCase();
    const director = (movie.director || "").toLowerCase();
    if (title.includes(q)) return 3;
    if (stars.includes(q) || director.includes(q)) return 2;
    if (synopsis.includes(q)) return 1;
    return 0;
  }

  function stopCoverCycle(itemId) {
    const t = coverCycleTimers.get(itemId);
    if (t) clearInterval(t);
    coverCycleTimers.delete(itemId);
  }

  function startCoverCycle(wrap, covers, movieId) {
    stopCoverCycle(movieId);
    if (!covers || covers.length <= 1) return;
    let idx = 0;
    const imgs = wrap.querySelectorAll("img");
    if (imgs.length < 2) {
      // Build two images for crossfade
      const img2 = document.createElement("img");
      img2.style.cssText = "opacity:0;";
      img2.src = covers[1 % covers.length];
      wrap.appendChild(img2);
    }
    const timer = setInterval(() => {
      idx = (idx + 1) % covers.length;
      const allImgs = wrap.querySelectorAll("img");
      const next = covers[idx];
      // fade current out, show next
      allImgs.forEach(im => { im.style.opacity = "0"; });
      const newImg = wrap.querySelector("img") || document.createElement("img");
      newImg.src = next;
      newImg.style.opacity = "1";
    }, 2000);
    coverCycleTimers.set(movieId, timer);
  }

  function renderDropdown(dropdown, results, query) {
    if (!results.length) {
      dropdown.innerHTML = `<div class="search-dropdown-no-results">No results found</div>`;
      return;
    }

    dropdown.innerHTML = results.map((m, i) => {
      const href = buildMoviePageHref(m.title);
      const borderClass = m.type === "collection" ? "collection-border" : m.type === "series" ? "serial-border" : "";
      const coverHtml = m.type === "collection"
        ? `<div class="search-dropdown-cover-wrap" data-movie-id="${m.id}"><img src="${m.cover || ''}" alt="${m.title || ''}" class="search-dropdown-cover" /></div>`
        : `<img src="${m.cover || ''}" alt="${m.title || ''}" class="search-dropdown-cover" />`;
      return `<div class="search-dropdown-item ${borderClass}" data-href="${href}" data-movie-id="${m.id}" data-type="${m.type || 'single'}">
        ${coverHtml}
        <span class="search-dropdown-title">${m.title || ''}</span>
        <button class="search-dropdown-open-btn" data-href="${href}" tabindex="-1">Open</button>
      </div>`;
    }).join("");

    // Attach click handlers
    dropdown.querySelectorAll(".search-dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".search-dropdown-open-btn")) {
          e.stopPropagation();
          window.open(e.target.closest(".search-dropdown-open-btn").dataset.href, "_blank");
          return;
        }
        const href = item.dataset.href;
        if (href) window.location.href = href;
      });
      // Long press → open in new tab
      let pressTimer;
      item.addEventListener("pointerdown", () => {
        pressTimer = setTimeout(() => {
          const href = item.dataset.href;
          if (href) window.open(href, "_blank");
        }, 600);
      });
      item.addEventListener("pointerup", () => clearTimeout(pressTimer));
      item.addEventListener("pointerleave", () => clearTimeout(pressTimer));
    });

    // Start cover cycling for collections
    results.forEach((m) => {
      if (m.type !== "collection") return;
      const wrap = dropdown.querySelector(`.search-dropdown-cover-wrap[data-movie-id="${m.id}"]`);
      if (!wrap) return;
      const epMap = episodesCacheMap.get(m.id);
      if (epMap && epMap.length > 0) {
        const allCovers = [m.cover, ...epMap].filter(Boolean);
        startCoverCycle(wrap, allCovers, m.id);
      }
    });
  }

  let searchDebounce = null;

  async function onSearchInput(searchInput, dropdown) {
    const query = searchInput.value.trim();
    if (!query) {
      dropdown.style.display = "none";
      coverCycleTimers.forEach((t) => clearInterval(t));
      coverCycleTimers.clear();
      return;
    }

    const allMovies = await getMovies();
    const scored = allMovies
      .map(m => ({ movie: m, score: scoreMovie(m, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score || 0)
      .slice(0, 10)
      .map(r => r.movie);

    // Pre-fetch episodes for collections in results
    const collectionIds = scored.filter(m => m.type === "collection").map(m => m.id);
    if (collectionIds.length) await getEpisodes(collectionIds);

    if (scored.length === 0 && !query) {
      dropdown.style.display = "none";
      return;
    }

    renderDropdown(dropdown, scored, query);
    dropdown.style.display = "block";
  }

  function attachSearchDropdown(searchInput) {
    // Check if dropdown already exists (index.html)
    let dropdown = document.getElementById("searchLiveDropdown");
    if (!dropdown) {
      // Create and inject after the input
      dropdown = document.createElement("div");
      dropdown.id = "searchLiveDropdown";
      dropdown.className = "search-live-dropdown";
      dropdown.style.display = "none";
      const wrap = searchInput.closest(".search-input-wrap") || searchInput.parentElement;
      if (wrap) {
        wrap.style.position = "relative";
        wrap.appendChild(dropdown);
      }
    }

    searchInput.addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => onSearchInput(searchInput, dropdown), 200);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Prevent dropdown from closing when clicking inside it
    dropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    if (searchInput) attachSearchDropdown(searchInput);
  });
})();
