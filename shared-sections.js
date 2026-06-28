(function () {
  const featureI18n = {
    en: {
      siteFeaturesTitle: "FilmChiin site features",
      featureTitle1: "Create account",
      featureDesc1:
        "By creating an account, you unlock extra capabilities: build a personal favorites list and chat with admin.",
      featureTitle2: "Instant and advanced search",
      featureDesc2:
        "Search is fully instant. As you type, results filter immediately and matched text is highlighted in title, synopsis, cast, and other fields.",
      featureTitle3: "Customize homepage layout",
      featureDesc3:
        "Use SideMenu options to arrange homepage layout based on your preference.",
      featureTitle4: "Type and genre tabs",
      featureDesc4:
        "Homepage is separated by content type (movie, collection, series). You can also filter each tab by genres with one click.",
      featureTitle5: "Sort by IMDb rating",
      featureDesc5:
        "Sort visible list by IMDb score and quickly focus on higher-rated titles.",
      featureTitle6: "Sort by release year",
      featureDesc6:
        "Use release filter to prioritize newer/older titles based on your preference.",
      featureTitle7: "Live movie count",
      featureDesc7:
        "At the top of the homepage, the visible movie count updates immediately when search, genres, tabs, IMDb filters, or release filters change.",
      featureTitle8: "Episode list for collections/series",
      featureDesc8:
        "For collections and series, all episodes are shown in small cards in the same post and selecting an episode updates card info instantly.",
      featureTitle9: "One-click file access",
      featureDesc9:
        "With <strong>Go to file</strong>, <code>@Filmchinbot</code> sends the movie or episode file directly without needing channel join.",
      featureTitle10: "Comments in each post",
      featureDesc10:
        "Each post supports comments with custom UI and avatars; comment count is shown near the comment icon.",
      featureTitle11: "Popular movies and page list",
      featureDesc11:
        "Popular section is built from click stats and the floating panel lists current-page posts for quick navigation.",
      featureTitle12: "Copy or share movie links",
      featureDesc12:
        "Each post includes copy and share buttons for its dedicated movie page link, so you can open the post details and continue to the file from there.",
      featureTitle13: "Responsive Liquid Glass design",
      featureDesc13:
        "Parts of UI use a Liquid Glass-inspired design with smooth animations and balanced transparency on mobile/desktop.",
      featureTitle14: "Site language switch",
      featureDesc14:
        "From language settings, you can switch the UI between Persian and English. Core texts, headings, and feature descriptions update consistently based on your selected language.",
      featureTitle15: "Site color theme switch",
      featureDesc15:
        "With the color theme option, you can personalize the site look to match your taste. Your selected theme is applied across UI sections for a more consistent and pleasant browsing experience.",
      featureTitle16: "Admin announcements on homepage",
      featureDesc16:
        "Messages published from the admin panel appear as announcements on the homepage, and users can mark them as read after viewing them.",
      featureTitle17: "Dedicated genre page",
      featureDesc17:
        "Clicking any genre from the 'Genres' section opens a dedicated page showing all movies of that genre. Movies are displayed in a 3-column card layout, with a 'Show more' button to load additional films.",
      searchPlaceholder: "Search...",
    },
    fa: {
      siteFeaturesTitle: "لیست امکانات سایت FilmChiin",
      featureTitle1: "ساخت حساب کاربری",
      featureDesc1:
        "با ساخت حساب کاربری به قابلیت های بیشتری دسترسی دارید می‌توانید برای خودتان یک لیست اختصاصی از فیلم‌های مورد علاقه بسازید. میتوانید از چت با ادمین استفاده کنید.",
      featureTitle2: "جست‌وجوی لحظه‌ای و پیشرفته",
      featureDesc2:
        "جست‌وجوی سایت کاملاً لحظه‌ای است؛ با تایپ هر عبارت، نتایج بلافاصله فیلتر می‌شوند. عبارت جست‌وجوشده در عنوان، خلاصه، بازیگران و سایر فیلدها هایلایت می‌شود.",
      featureTitle3: "شخصی سازی چیدمان صفحه",
      featureDesc3:
        "از طریق گزینه های موجود در SideMenu میتوانید چیدمان صفحه اصلی را مطابق با سلیقه ی خود مرتب کنید.",
      featureTitle4: "فیلترفیلم هاوژانرها در تب‌های جداگانه",
      featureDesc4:
        "صفحه اصلی بر اساس نوع محتوا (فیلم سینمایی، کالکشن، سریال) با تب‌ها تفکیک شده است. علاوه بر آن، در هر تب می‌توانید با یک کلیک ژانر را فیلتر کنید.",
      featureTitle5: "مرتب‌سازی بر اساس امتیاز IMDb",
      featureDesc5:
        "لیست قابل مشاهده را می‌توانید بر اساس امتیاز IMDb مرتب کنید تا سریع‌تر به عناوین با امتیاز بالاتر برسید.",
      featureTitle6: "مرتب‌سازی بر اساس سال انتشار",
      featureDesc6:
        "با فیلتر سال انتشار می‌توانید عناوین جدیدتر یا قدیمی‌تر را بر اساس نیاز خود ببینید.",
      featureTitle7: "آمار دقیق تعداد فیلم‌ها در هر لحظه",
      featureDesc7:
        "در بالای صفحه اصلی، تعداد فیلم‌های در حال نمایش با توجه به فیلترها و جست‌وجوی فعلی نمایش داده می‌شود و بعد از هر تغییر به‌صورت لحظه‌ای به‌روزرسانی می‌شود.",
      featureTitle8: "لیست قسمت‌های سریال وکالکشن",
      featureDesc8:
        "برای سریال‌ها و کالکشن‌ها، تمام قسمت‌ها در قالب کارت‌های کوچک داخل همان پست نمایش داده می‌شوند و با انتخاب هر قسمت اطلاعات کارت فوراً آپدیت می‌شود.",
      featureTitle9: "دسترسی به فایل فقط با یک کلیک",
      featureDesc9:
        "با فشردن دکمه <strong>Go to file</strong> بات <code>@Filmchinbot</code> فایل فیلم یا قسمت سریال را برای شما ارسال می‌کند؛ بدون نیاز به جوین شدن در کانال.",
      featureTitle10: "کامنت و نمایش گفت‌وگو در همان پست",
      featureDesc10:
        "برای هر پست می‌توانید کامنت بگذارید و همه نظرات در همان کارت فیلم با طراحی اختصاصی و آواتارها نمایش داده می‌شوند.",
      featureTitle11: "فیلم‌های پرطرفدارولیست فیلم‌های صفحه",
      featureDesc11:
        "بخش فیلم‌های پرطرفدار بر اساس آمار کلیک‌ها ساخته می‌شود و دکمه شناور لیست فیلم‌های صفحه فعلی را نشان می‌دهد.",
      featureTitle12: "کپی یا اشتراک لینک هر فیلم",
      featureDesc12:
        "برای هر پست، دکمه‌هایی برای کپی و اشتراک لینک صفحه اختصاصی فیلم وجود دارد تا بتوانید اطلاعات پست را باز کنید و از همان‌جا به فایل بروید.",
      featureTitle13: "طراحی Liquid Glass واکنش‌گرا",
      featureDesc13:
        "بخش هایی از سایت با الهام از طراحی Liquid Glass ساخته شده است؛ کارت‌ها، دکمه‌ها و پنل‌ها تجربه کاربری روان و چشم‌نواز ایجاد می‌کنند.",
      featureTitle14: "امکان تغییر زبان سایت",
      featureDesc14:
        "در بخش تنظیمات زبان می‌توانید رابط کاربری سایت را بین فارسی و انگلیسی جابه‌جا کنید. تمام متن‌های اصلی، عنوان‌ها و توضیحات امکانات بر اساس زبان انتخابی شما به‌صورت یکپارچه تغییر می‌کنند.",
      featureTitle15: "امکان تغییر تم رنگی سایت",
      featureDesc15:
        "با گزینه تغییر تم رنگی، می‌توانید ظاهر سایت را متناسب با سلیقه خود شخصی‌سازی کنید. تم انتخابی روی بخش‌های مختلف رابط کاربری اعمال می‌شود تا تجربه مرور سایت هماهنگ‌تر و دلپذیرتر باشد.",
      featureTitle16: "اعلان‌های مدیریت در صفحه اصلی",
      featureDesc16:
        "پیام‌هایی که مدیریت از پنل ادمین منتشر می‌کند، به‌صورت اعلان در صفحه اصلی نمایش داده می‌شوند و کاربر می‌تواند بعد از خواندن، آن‌ها را علامت‌گذاری کند.",
      featureTitle17: "صفحه اختصاصی ژانر",
      featureDesc17:
        "با کلیک روی هر ژانر از بخش «ژانر ها» صفحه‌ای اختصاصی با تمامی فیلم‌های آن ژانر باز می‌شود. فیلم‌ها در قالب کارت‌های سه‌ستونه نمایش داده می‌شوند و دکمه «نمایش بیشتر» به کاربر امکان می‌دهد فیلم‌های بیشتری را ببیند.",
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
    const badge =
      profileBtn.querySelector("#commentBadge")?.outerHTML ||
      '<span id="commentBadge" class="badge" style="display: none">!</span>';
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
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY",
      );
      const { data: sessionData } = await db.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: dbUser } = await db
        .from("users")
        .select("username,avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      const avatarUrl = dbUser?.avatar_url
        ? db.storage.from("avatars").getPublicUrl(dbUser.avatar_url).data
            .publicUrl
        : null;
      setHeaderProfileAvatar(root, avatarUrl);
      const usernameEl = root.querySelector("#profileUsername");
      if (usernameEl)
        usernameEl.textContent = dbUser?.username || user.email || "User";
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
    if (searchInput)
      searchInput.setAttribute(
        "placeholder",
        featureI18n[lang].searchPlaceholder,
      );
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
      // بستن dropdown جستجو
      const dropdown = document.getElementById("searchLiveDropdown");
      if (dropdown) dropdown.style.display = "none";
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

    // Inject side menu if not present (movie/actor pages)
    if (!document.getElementById("sideMenu")) {
      const sourceSideMenu = doc.querySelector("#sideMenu");
      if (sourceSideMenu) {
        const menuClone = sourceSideMenu.cloneNode(true);
        document.body.appendChild(menuClone);
      }
    }
    // Inject menu overlay if not present
    if (!document.getElementById("menuOverlay")) {
      const sourceOverlay = doc.querySelector("#menuOverlay");
      if (sourceOverlay) {
        const overlayClone = sourceOverlay.cloneNode(true);
        document.body.appendChild(overlayClone);
        overlayClone.addEventListener("click", () => {
          document.getElementById("sideMenu")?.classList.remove("active");
          overlayClone.classList.remove("active");
          document.body.classList.remove("no-scroll", "menu-open");
        });
      }
    }
    // Inject favorites overlay if not present
    if (!document.getElementById("favoritesOverlay")) {
      const sourceFavOverlay = doc.querySelector("#favoritesOverlay");
      if (sourceFavOverlay) {
        const favClone = sourceFavOverlay.cloneNode(true);
        document.body.appendChild(favClone);
      }
    }

    // Wire up menu button in header
    const menuBtn = document.getElementById("menuBtn");
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");
    if (menuBtn && sideMenu) {
      menuBtn.addEventListener("click", () => {
        sideMenu.classList.toggle("active");
        if (menuOverlay) menuOverlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
      });
    }
    // Wire up favoriteMoviesBtn in header
    const favMoviesBtn = document.getElementById("favoriteMoviesBtn");
    if (favMoviesBtn) {
      // Clone to remove any stale listeners
      const newFavMoviesBtn = favMoviesBtn.cloneNode(true);
      favMoviesBtn.parentNode.replaceChild(newFavMoviesBtn, favMoviesBtn);
      newFavMoviesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const favOverlay = document.getElementById("favoritesOverlay");
        if (favOverlay) {
          favOverlay.setAttribute("aria-hidden", "false");
          if (typeof window.openFavoritesOverlayUI === "function") {
            window.openFavoritesOverlayUI();
          }
        }
      });
    }
    // Wire up favorites close button
    const favOverlay = document.getElementById("favoritesOverlay");
    if (favOverlay) {
      const favCloseBtn = favOverlay.querySelector(
        ".favorites-close-btn, [id*='CloseBtn'], .close-btn",
      );
      if (favCloseBtn) {
        favCloseBtn.addEventListener("click", () => {
          favOverlay.setAttribute("aria-hidden", "true");
        });
      }
      // Backdrop click closes overlay
      favOverlay.addEventListener("click", (e) => {
        if (e.target === favOverlay)
          favOverlay.setAttribute("aria-hidden", "true");
      });
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

    // Inject supportSheet if not present (for movie/actor pages)
    if (!document.getElementById("supportSheet")) {
      const sourceSupportSheet = doc.querySelector("#supportSheet");
      if (sourceSupportSheet) {
        const sheetClone = sourceSupportSheet.cloneNode(true);
        document.body.appendChild(sheetClone);
      }
    }

    // Wire up sidemenu interactions for movie/actor pages
    wireSideMenuOnSubPages();

    // Rebuild genre/country grids in injected sidemenu
    buildSideMenuGenres();
    buildSideMenuCountries();
  }

  // ===== Genre/Country grid builders for sub-pages (movie/actor) =====
  function buildSideMenuGenres() {
    const genreGrid = document.getElementById("genreGrid");
    if (!genreGrid) return;
    // Use movies from window._fcMovies if available (movie.js sets this)
    let movies = window._fcMovies || [];
    // اگر در حافظه نبود از sessionStorage بخوان
    if (!movies.length) {
      try {
        const cached = sessionStorage.getItem("filmchin_movies_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            movies = parsed;
            window._fcMovies = parsed;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!movies.length) return;
    const lang = localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
    const genreCounts = {};
    movies.forEach((m) => {
      if (m.genre)
        m.genre.split(" ").forEach((g) => {
          const name = g.trim();
          if (!name) return;
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        });
    });
    const genreEntries = Object.entries(genreCounts);
    const englishGenres = genreEntries.filter(([g]) =>
      /^[A-Za-z#]/.test(g.startsWith("#") ? g.slice(1) : g),
    );
    const persianGenres = genreEntries.filter(
      ([g]) => !/^[A-Za-z]/.test(g.startsWith("#") ? g.slice(1) : g),
    );
    const orderedGenres = (lang === "fa" ? persianGenres : englishGenres).sort(
      (a, b) => b[1] - a[1],
    );
    genreGrid.innerHTML = "";
    orderedGenres.forEach(([g, count]) => {
      const div = document.createElement("div");
      div.className = "genre-chip";
      div.setAttribute("dir", "auto");
      div.innerHTML = `${g.replace(/</g, "&lt;")} <span class="count">${count}</span>`;
      div.onclick = () => {
        // Navigate to genre page for this genre
        window.location.href = `/genre.html?genre=${encodeURIComponent(g)}`;
      };
      genreGrid.appendChild(div);
    });
  }

  function buildSideMenuCountries() {
    const countryGrid = document.getElementById("countryGrid");
    if (!countryGrid) return;
    let movies = window._fcMovies || [];
    // اگر در حافظه نبود از sessionStorage بخوان
    if (!movies.length) {
      try {
        const cached = sessionStorage.getItem("filmchin_movies_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            movies = parsed;
            window._fcMovies = parsed;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!movies.length) return;
    const countryCounts = {};
    movies.forEach((m) => {
      if (m.product)
        m.product.split(" ").forEach((c) => {
          const name = c.trim();
          // فقط توکن‌هایی که با # شروع می‌شوند
          if (!name || !name.startsWith("#")) return;
          countryCounts[name] = (countryCounts[name] || 0) + 1;
        });
    });
    const countryEntries = Object.entries(countryCounts).sort(
      (a, b) => b[1] - a[1],
    );
    countryGrid.innerHTML = "";
    countryEntries.forEach(([country, count]) => {
      const div = document.createElement("div");
      div.className = "genre-chip";
      div.setAttribute("dir", "auto");
      div.innerHTML = `${country.replace(/</g, "&lt;")} <span class="count">${count}</span>`;
      div.onclick = () => {
        window.location.href = `/?search=${encodeURIComponent(country)}`;
      };
      countryGrid.appendChild(div);
    });
  }

  // ===== Wire up injected side menu for movie/actor pages =====
  function wireSideMenuOnSubPages() {
    // Only run on sub-pages (not index.html which has script.js)
    if (
      !document.querySelector(
        ".movie-page-body, .actor-page-body, .genre-page-body",
      )
    )
      return;

    const sideMenu = document.getElementById("sideMenu");
    if (!sideMenu || sideMenu.dataset.wired === "1") return;
    sideMenu.dataset.wired = "1";

    const lang = localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";

    // Language map for sidemenu i18n keys
    const i18nMap = {
      en: {
        genres: "Genres",
        countries: "Countries",
        links: "Links",
        sortByMenu: "Sort by...",
        homepageManager: "Homepage Manager",
        animations: "Animations",
        tabs: "Tabs",
        subTabGenres: "Sub-tab genres",
        backToTopButton: "Back to Top Button",
        floatingSummaryPanel: "Floating Summary Panel",
        collapsePosts: "Collapse posts",
        languageLabel: "Language / زبان",
        themePaletteTitle: "Site color theme",
        popularMovies: "Popular movies",
        messageToAdmin: "Message to admin",
        sortByImdb: "Sort by imdb rating",
        sortByReleaseDate: "Sort by Release date",
      },
      fa: {
        genres: "ژانرها",
        countries: "کشورها",
        links: "لینک‌ها",
        sortByMenu: "مرتب‌سازی بر اساس...",
        homepageManager: "مدیریت صفحه اصلی",
        animations: "انیمیشن‌ها",
        tabs: "تب‌ها",
        subTabGenres: "زیرتب ژانرها",
        backToTopButton: "دکمه بازگشت به بالا",
        floatingSummaryPanel: "پنل شناور خلاصه",
        collapsePosts: "جمع‌کردن پست‌ها",
        languageLabel: "Language / زبان",
        themePaletteTitle: "تم رنگی سایت",
        popularMovies: "فیلم‌های پرطرفدار",
        messageToAdmin: "پیام به ادمین",
        sortByImdb: "مرتب‌سازی بر اساس امتیاز IMDb",
        sortByReleaseDate: "مرتب‌سازی بر اساس تاریخ انتشار",
      },
    };

    // Apply i18n to sidemenu
    function applySideMenuI18n(activeLang) {
      const map = i18nMap[activeLang] || i18nMap.en;
      sideMenu.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (map[key]) el.textContent = map[key];
      });
    }
    applySideMenuI18n(lang);

    // Accordion toggle (same as initSideMenuAccordions in script.js)
    const accordions = sideMenu.querySelectorAll(".sidemenu-accordion");
    accordions.forEach((acc) => {
      const header = acc.querySelector(".sidemenu-accordion-header");
      const body = acc.querySelector(".sidemenu-accordion-body");
      if (!header || !body) return;
      header.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = acc.classList.contains("open");
        accordions.forEach((other) => {
          if (other !== acc && other.classList.contains("open")) {
            other.classList.remove("open");
            const otherBody = other.querySelector(".sidemenu-accordion-body");
            if (otherBody) otherBody.style.maxHeight = "0";
          }
        });
        if (isOpen) {
          acc.classList.remove("open");
          body.style.maxHeight = "0";
        } else {
          acc.classList.add("open");
          body.style.maxHeight = body.scrollHeight + "px";
          // Lazy-load social links when links accordion is opened
          if (acc.id === "acc-links") {
            setTimeout(() => {
              if (typeof window.fetchSocialLinksSubPage === "function")
                window.fetchSocialLinksSubPage();
              // Recalculate height after content loaded
              setTimeout(() => {
                body.style.maxHeight = body.scrollHeight + "px";
              }, 600);
            }, 50);
          }
          // Lazy-load countries when country accordion is opened
          if (acc.id === "acc-country") {
            setTimeout(() => {
              body.style.maxHeight = body.scrollHeight + "px";
            }, 200);
          }
        }
      });
    });

    // Language buttons
    const langBtns = sideMenu.querySelectorAll(".language-option[data-lang]");
    const langIndicator = sideMenu.querySelector(".language-indicator");
    function setActiveLanguageUI(activeLang) {
      langBtns.forEach((btn, idx) => {
        const active = btn.dataset.lang === activeLang;
        btn.classList.toggle("active", active);
        if (active && langIndicator)
          langIndicator.style.transform = `translateX(${idx * 100}%)`;
      });
    }
    setActiveLanguageUI(lang);

    langBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextLang = btn.dataset.lang === "fa" ? "fa" : "en";
        localStorage.setItem("siteLanguage", nextLang);
        document.documentElement.lang = nextLang;
        document.documentElement.dir = nextLang === "fa" ? "rtl" : "ltr";
        setActiveLanguageUI(nextLang);
        applySideMenuI18n(nextLang);
        // Rebuild genre/country grids with new language
        if (typeof buildSideMenuGenres === "function")
          buildSideMenuGenres(nextLang);
        // Reload the page preserving scroll position to apply language fully
        sessionStorage.setItem("filmchin_scroll_y", String(window.scrollY));
        window.location.reload();
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Theme palette (color)
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
    function applyColorTheme(name) {
      const selected = colorThemes[name] || colorThemes.blue;
      const r = document.documentElement.style;
      r.setProperty("--theme-accent-rgb", selected.accentRgb);
      r.setProperty("--theme-accent-dark", selected.accentDark);
      r.setProperty("--theme-accent", selected.accent);
      r.setProperty("--theme-accent-light", selected.accentLight);
      r.setProperty("--theme-accent-contrast", selected.accentContrast);
      r.setProperty("--theme-bg-day", selected.bgDay);
      r.setProperty("--theme-bg-soft", selected.bgSoft);
      if (name === "blue") {
        r.setProperty("--go-file-bg", "#3b82f6");
        r.setProperty("--go-file-bg-hover", "#60a5fa");
        r.setProperty("--go-file-shadow-rgb", "59, 130, 246");
      } else {
        r.setProperty("--go-file-bg", selected.accent);
        r.setProperty("--go-file-bg-hover", selected.accentLight);
        r.setProperty("--go-file-shadow-rgb", selected.accentRgb);
      }
      // Update active dot
      sideMenu.querySelectorAll(".theme-palette-dot").forEach((dot) => {
        dot.classList.toggle("active", dot.dataset.themeColor === name);
      });
    }
    const savedTheme = localStorage.getItem("colorTheme") || "blue";
    applyColorTheme(savedTheme);
    sideMenu.querySelectorAll(".theme-palette-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const themeName = dot.dataset.themeColor;
        localStorage.setItem("colorTheme", themeName);
        applyColorTheme(themeName);
      });
    });

    // Dark/light theme toggle
    const themeSwitch = sideMenu.querySelector("#themeSwitchCheckbox");
    if (themeSwitch) {
      themeSwitch.checked = localStorage.getItem("theme") === "dark";
      themeSwitch.addEventListener("change", (e) => {
        const dark = e.target.checked;
        document.body.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
      });
    }

    // Homepage manager toggles (read state from localStorage, show current state)
    const PREF = {
      tabs: "homepage_tabs",
      subGenres: "homepage_subtab_genres",
      popular: "homepage_popular_movies",
      backToTop: "homepage_back_to_top",
      floating: "homepage_floating_panel",
      animations: "homepage_reduce_animations",
      collapsePosts: "homepage_collapse_posts",
    };
    const toggleMap = {
      toggleReduceAnimations: PREF.animations,
      toggleTabs: PREF.tabs,
      toggleSubTabGenres: PREF.subGenres,
      togglePopularMovies: PREF.popular,
      toggleBackToTop: PREF.backToTop,
      toggleFloatingPanel: PREF.floating,
      toggleCollapsePosts: PREF.collapsePosts,
    };
    // Default checked = true except collapsePosts
    const defaultChecked = { toggleCollapsePosts: false };
    Object.entries(toggleMap).forEach(([id, key]) => {
      const el = sideMenu.querySelector("#" + id);
      if (!el) return;
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        el.checked = stored === "1";
      } else {
        el.checked = id in defaultChecked ? defaultChecked[id] : true;
      }
      el.addEventListener("change", () => {
        localStorage.setItem(key, el.checked ? "1" : "0");
        // Settings will apply next time homepage loads
      });
    });

    // Favorites overlay open/close from sidemenu (if any favorites buttons exist)
    const favBtns = sideMenu.querySelectorAll(
      "[id*='Favorite'], [id*='favorite'], #favoriteMoviesBtn",
    );
    favBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const favOverlay = document.getElementById("favoritesOverlay");
        if (favOverlay) favOverlay.setAttribute("aria-hidden", "false");
      });
    });

    // Favorites overlay close button
    const favOverlay = document.getElementById("favoritesOverlay");
    if (favOverlay) {
      const closeBtn = favOverlay.querySelector(
        ".favorites-close-btn, [id*='Close'], .close-btn",
      );
      closeBtn?.addEventListener("click", () =>
        favOverlay.setAttribute("aria-hidden", "true"),
      );
      favOverlay.addEventListener("click", (e) => {
        if (e.target === favOverlay)
          favOverlay.setAttribute("aria-hidden", "true");
      });
    }

    // ===== Sort-by accordion: disabled on movie/actor pages =====
    const sortAccordion = sideMenu.querySelector("#acc-sort-by");
    if (sortAccordion) {
      const sortHeader = sortAccordion.querySelector(
        ".sidemenu-accordion-header",
      );
      if (sortHeader) {
        sortHeader.style.opacity = "0.5";
        sortHeader.style.cursor = "not-allowed";
        // Override the accordion click listener with a toast
        sortHeader.addEventListener(
          "click",
          (e) => {
            e.stopImmediatePropagation();
            const msg =
              lang === "fa"
                ? "مرتب‌سازی فقط در صفحه اصلی سایت در دسترس است"
                : "Sorting is only available on the homepage";
            // Show toast
            let container = document.getElementById("topToastContainer");
            if (!container) {
              container = document.createElement("div");
              container.id = "topToastContainer";
              container.style.cssText =
                "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:90vw;";
              document.body.appendChild(container);
            }
            const toast = document.createElement("div");
            toast.style.cssText =
              "pointer-events:auto;padding:10px 16px;background:rgba(0,74,124,0.9);color:#fff;border-radius:8px;font-size:14px;text-align:center;opacity:0;transition:opacity 220ms ease,transform 220ms ease;transform:translateY(-6px);";
            toast.textContent = msg;
            container.appendChild(toast);
            requestAnimationFrame(() => {
              toast.style.opacity = "1";
              toast.style.transform = "translateY(0)";
            });
            setTimeout(() => {
              toast.style.opacity = "0";
              toast.style.transform = "translateY(-6px)";
              setTimeout(() => toast.remove(), 250);
            }, 3000);
          },
          true,
        ); // capture=true so it fires before the accordion listener
      }
    }

    // ===== Chat to Admin (sub-page wiring) =====
    wireChatForSubPage(sideMenu, lang);

    // ===== Support Sheet (sub-page wiring) =====
    wireSupportForSubPage(sideMenu, lang);
  }

  // Chat wiring for movie/actor pages (uses window.db or creates its own Supabase client)
  function wireChatForSubPage(sideMenu, lang) {
    const chatBubble = sideMenu.querySelector("#chatBubble");
    const chatInput = sideMenu.querySelector("#chatInput");
    const chatSendBtn = sideMenu.querySelector("#chatSendBtn");
    const chatAttachBtn = sideMenu.querySelector("#chatAttachBtn");
    const chatAttachFile = sideMenu.querySelector("#chatAttachFile");
    const chatOverlay = sideMenu.querySelector("#chatOverlay");
    const chatBackBtn = sideMenu.querySelector("#userChatBackBtn");
    const chatMessagesList = sideMenu.querySelector("#chatMessagesList");
    const overlayInput = sideMenu.querySelector("#overlayInput");
    const overlaySendBtn = sideMenu.querySelector("#overlaySendBtn");
    const overlayAttachBtn = sideMenu.querySelector("#overlayAttachBtn");
    const overlayAttachFile = sideMenu.querySelector("#overlayAttachFile");

    if (!chatBubble || !chatOverlay) return;

    // Use existing Supabase client or create one
    function getDb() {
      if (window._supabaseClient) return window._supabaseClient;
      if (window.db) return window.db;
      // Fallback: create client if supabase SDK is loaded
      const url = window.SUPABASE_URL;
      const key = window.SUPABASE_KEY;
      if (url && key && window.supabase?.createClient) {
        const client = window.supabase.createClient(url, key);
        window._supabaseClient = client;
        return client;
      }
      return null;
    }
    // Wait for db to be ready (movie.js/actor.js may not have run yet)
    function waitForDb(callback) {
      const db = getDb();
      if (db) {
        callback(db);
        return;
      }
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const db2 = getDb();
        if (db2) {
          clearInterval(interval);
          callback(db2);
          return;
        }
        if (attempts > 20) clearInterval(interval); // give up after 2s
      }, 100);
    }

    const SUPABASE_STORAGE_BUCKET = "chat-attachments";
    let chatThreadId = null;

    function showChatToast(msg) {
      let container = document.getElementById("topToastContainer");
      if (!container) {
        container = document.createElement("div");
        container.id = "topToastContainer";
        container.style.cssText =
          "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:90vw;";
        document.body.appendChild(container);
      }
      const t = document.createElement("div");
      t.style.cssText =
        "pointer-events:auto;padding:10px 16px;background:rgba(0,74,124,0.9);color:#fff;border-radius:8px;font-size:14px;text-align:center;";
      t.textContent = msg;
      container.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }

    function openChatOverlay() {
      if (!chatOverlay) return;

      // ✅ اگر کاربر لاگین نیست → toast نشان بده و برگرد (مانند صفحه اصلی)
      const db = getDb();
      if (!db) {
        showChatToast(
          lang === "fa" ? "خطا در اتصال به سرویس" : "Service unavailable",
        );
        return;
      }
      db.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          showChatToast(
            lang === "fa"
              ? "برای ارسال پیام ابتدا لاگین کنید"
              : "Please log in to send messages",
          );
          return;
        }
        // کاربر لاگین است → چت را باز کن
        _doOpenChatOverlay();
      });
    }

    function _doOpenChatOverlay() {
      if (!chatOverlay) return;
      // بررسی کن آیا در صفحه فرعی (movie/actor) هستیم یا صفحه اصلی
      const isSubPage =
        document.querySelector(
          ".movie-page-body, .actor-page-body, .genre-page-body",
        ) !== null;
      if (!isSubPage) {
        // صفحه اصلی: overlay را به body منتقل کن تا position:fixed درست کار کند
        // (sideMenu دارای transform است که containing block جدید می‌سازد)
        if (chatOverlay.parentElement !== document.body) {
          document.body.appendChild(chatOverlay);
        }
        // سایدمنو را ببند تا overlay دیده شود
        const sideMenuEl = document.getElementById("sideMenu");
        const menuOverlayEl = document.getElementById("menuOverlay");
        sideMenuEl?.classList.remove("active");
        menuOverlayEl?.classList.remove("active");
        document.body.classList.remove("menu-open");
      } else {
        // صفحه‌های فرعی: overlay را مستقیماً داخل sideMenu بذار (نه داخل chatBubble)
        // چون chatBubble دارای position:relative است و overlay را محدود می‌کند
        const sideMenuEl = document.getElementById("sideMenu");
        if (sideMenuEl && chatOverlay.parentElement !== sideMenuEl) {
          sideMenuEl.appendChild(chatOverlay);
        }
        // سایدمنو را scroll-lock کن تا overlay درست دیده شود
        if (sideMenuEl) sideMenuEl.style.overflow = "hidden";
        // سایدمنو باید باز بماند تا چت دیده شود
        if (sideMenuEl && !sideMenuEl.classList.contains("active")) {
          sideMenuEl.classList.add("active");
          const menuOverlayEl = document.getElementById("menuOverlay");
          if (menuOverlayEl) menuOverlayEl.classList.add("active");
        }
      }
      chatOverlay.setAttribute("aria-hidden", "false");
      chatBubble.classList.add("chat-open");
      if (overlayInput) setTimeout(() => overlayInput.focus(), 100);
      loadChatMessages();
    }

    function closeChatOverlay() {
      if (chatOverlay) chatOverlay.setAttribute("aria-hidden", "true");
      chatBubble.classList.remove("chat-open");
      // بازیابی overflow سایدمنو در صفحه‌های فرعی
      const sideMenuEl = document.getElementById("sideMenu");
      if (sideMenuEl) sideMenuEl.style.overflow = "";
    }

    chatBubble.addEventListener("click", (e) => {
      if (!chatOverlay || chatOverlay.getAttribute("aria-hidden") !== "false")
        openChatOverlay();
    });
    chatInput?.addEventListener("focus", () => openChatOverlay());
    // دکمه بازگشت — با listener روی document چون overlay به body منتقل می‌شود
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("#userChatBackBtn");
      if (btn) closeChatOverlay();
    });

    async function ensureThread() {
      const db = getDb();
      if (!db) {
        showChatToast(
          lang === "fa"
            ? "خطا در اتصال به سرویس چت"
            : "Chat service unavailable",
        );
        return null;
      }
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) {
        showChatToast(
          lang === "fa"
            ? "برای ارسال پیام باید وارد شوید"
            : "Please log in to send messages",
        );
        return null;
      }
      if (chatThreadId) return chatThreadId;
      const { data: existing } = await db
        .from("user_admin_threads")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (existing?.id) {
        chatThreadId = existing.id;
        return chatThreadId;
      }
      const { data: created } = await db
        .from("user_admin_threads")
        .insert([
          { user_id: user.id, unread_for_admin: false, unread_for_user: false },
        ])
        .select("id")
        .single();
      if (created?.id) {
        chatThreadId = created.id;
        return chatThreadId;
      }
      return null;
    }

    async function sendChatMessage(text, imageUrl = null) {
      const db = getDb();
      if (!db) return;
      const tid = await ensureThread();
      if (!tid) return;
      if (!text && !imageUrl) return;
      await db
        .from("user_admin_messages")
        .insert([
          {
            thread_id: tid,
            role: "user",
            text: text || null,
            image_url: imageUrl || null,
          },
        ]);
      await db
        .from("user_admin_threads")
        .update({
          unread_for_admin: true,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", tid);
      loadChatMessages();
    }

    async function loadChatMessages() {
      const db = getDb();
      if (!db) return;
      const tid = await ensureThread();
      if (!tid) return;
      const { data } = await db
        .from("user_admin_messages")
        .select("*")
        .eq("thread_id", tid)
        .order("created_at", { ascending: true })
        .limit(500);
      renderChatMsgs(data || []);
    }

    function renderChatMsgs(arr) {
      if (!chatMessagesList) return;
      chatMessagesList.innerHTML = (arr || [])
        .map((m) => {
          const side = m.role === "user" ? "user" : "admin";
          const img = m.image_url
            ? `<img class="msg-image" src="${m.image_url.replace(/"/g, "&quot;")}" alt="image">`
            : "";
          const txt = m.text
            ? `<div class="msg-text">${m.text.replace(/</g, "&lt;")}</div>`
            : "";
          const time = new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `<div class="msg-row ${side}"><div class="msg-bubble ${side}">${img}${txt}<div class="msg-meta"><span>${time}</span></div></div></div>`;
        })
        .join("");
      setTimeout(() => {
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
      }, 30);
    }

    // Send from overlay
    const sendFn = async (inputEl, attachEl) => {
      const db = getDb();
      if (!db) return;
      const text = (inputEl?.value || "").trim();
      let imageUrl = null;
      if (attachEl?.files?.[0]) {
        const file = attachEl.files[0];
        const path = `chat/${Date.now()}_${file.name}`;
        const { data: uploaded } = await db.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .upload(path, file, { upsert: true });
        if (uploaded) {
          const { data: urlData } = db.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .getPublicUrl(path);
          imageUrl = urlData?.publicUrl || null;
        }
        attachEl.value = "";
      }
      if (!text && !imageUrl) return;
      if (inputEl) inputEl.value = "";
      // Disable send button after sending
      if (overlaySendBtn) overlaySendBtn.classList.add("disabled");
      await sendChatMessage(text, imageUrl);
    };

    // Enable/disable send button based on input
    function updateSendBtnState() {
      const hasText = (overlayInput?.value || "").trim().length > 0;
      if (overlaySendBtn) overlaySendBtn.classList.toggle("disabled", !hasText);
    }
    overlayInput?.addEventListener("input", updateSendBtnState);
    updateSendBtnState();

    overlaySendBtn?.addEventListener("click", () => {
      if (!overlaySendBtn.classList.contains("disabled"))
        sendFn(overlayInput, overlayAttachFile);
    });
    overlayInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendFn(overlayInput, overlayAttachFile);
      }
    });
    chatSendBtn?.addEventListener("click", () =>
      sendFn(chatInput, chatAttachFile),
    );
    chatInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendFn(chatInput, chatAttachFile);
      }
    });
    overlayAttachBtn?.addEventListener("click", () =>
      overlayAttachFile?.click(),
    );
    chatAttachBtn?.addEventListener("click", () => chatAttachFile?.click());

    // Also clear and reset send btn after sending
    const origSendFn = sendFn;
  } // end wireChatForSubPage

  // Support sheet wiring for movie/actor pages
  function wireSupportForSubPage(sideMenu, lang) {
    const chip = sideMenu.querySelector("#supportChip");
    if (!chip) return;

    // Ensure supportSheet exists in the DOM (should be injected during hydrate)
    function openSupportSheet() {
      const sheet = document.getElementById("supportSheet");
      if (!sheet) return;

      // Populate wallet list
      const listEl = document.getElementById("supportWalletList");
      const panel = sheet.querySelector(".support-sheet-panel");
      const titleEl = panel?.querySelector(".support-sheet-title");
      const hintEl = panel?.querySelector(".support-sheet-hint");
      if (titleEl)
        titleEl.textContent = lang === "fa" ? "حمایت از ما" : "Support us";
      if (hintEl)
        hintEl.textContent =
          lang === "fa"
            ? "کمک‌های کوچک تغییرات بزرگی ایجاد می‌کنند."
            : "Small helps make big changes.";

      if (listEl) {
        // Load wallets from Supabase
        const db = window._supabaseClient || window.db;
        if (db) {
          db.from("wallets")
            .select("name,address")
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              listEl.innerHTML = "";
              (data || []).forEach((w) => {
                const bubble = document.createElement("div");
                bubble.className = "support-wallet-bubble";
                bubble.innerHTML = `
                <div class="support-wallet-name">${(w.name || "").replace(/</g, "&lt;")}</div>
                <div class="support-wallet-addr-row">
                  <span class="support-wallet-addr">${(w.address || "").replace(/</g, "&lt;")}</span>
                  <button class="support-copy-btn" type="button">${lang === "fa" ? "کپی آدرس" : "Copy address"}</button>
                </div>
              `;
                bubble
                  .querySelector(".support-copy-btn")
                  ?.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const btn = bubble.querySelector(".support-copy-btn");
                    try {
                      await navigator.clipboard.writeText(w.address || "");
                    } catch {
                      const ta = document.createElement("textarea");
                      ta.value = w.address || "";
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      ta.remove();
                    }
                    if (btn) {
                      btn.textContent = lang === "fa" ? "کپی شد!" : "Copied!";
                      setTimeout(() => {
                        btn.textContent =
                          lang === "fa" ? "کپی آدرس" : "Copy address";
                      }, 1800);
                    }
                  });
                listEl.appendChild(bubble);
              });
            });
        }
      }

      sheet.classList.add("open");
      // Close sidemenu
      document.getElementById("sideMenu")?.classList.remove("active");
      document.getElementById("menuOverlay")?.classList.remove("active");
      document.body.classList.remove("no-scroll", "menu-open");

      // Wire close (backdrop)
      const backdrop = sheet.querySelector(".support-sheet-backdrop");
      const closeSheet = () => sheet.classList.remove("open");
      if (backdrop && !backdrop._wiredClose) {
        backdrop._wiredClose = true;
        backdrop.addEventListener("click", closeSheet);
      }
      const panel2 = sheet.querySelector(".support-sheet-panel");
      if (panel2 && !panel2._wiredStop) {
        panel2._wiredStop = true;
        panel2.addEventListener("click", (e) => e.stopPropagation());
      }
    }

    if (!chip._wiredSupport) {
      chip._wiredSupport = true;
      chip.addEventListener("click", openSupportSheet);
    }
  } // end wireSupportForSubPage

  // ===== Genre Hub Grid for sub-pages =====
  function buildGenreHubGrid() {
    const genreHubGrid = document.getElementById("genreHubGrid");
    if (!genreHubGrid) return;
    let movies = window._fcMovies || [];
    if (!movies.length) {
      try {
        const cached = sessionStorage.getItem("filmchin_movies_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            movies = parsed;
            window._fcMovies = parsed;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!movies.length) return;
    const lang = localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
    const hubI18n = {
      en: {
        title: "Genres",
        subtitle: "Click on a genre to browse movies and series.",
      },
      fa: {
        title: "ژانر ها",
        subtitle: "برای دانلود فیلم و سریال های ژانر مورد علاقه روش کلیک کن.",
      },
    };
    const genreCounts = {};
    movies.forEach((m) => {
      if (m.genre)
        m.genre.split(" ").forEach((g) => {
          const name = g.trim();
          if (!name) return;
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        });
    });
    const genreEntries = Object.entries(genreCounts);
    const persianGenres = genreEntries.filter(
      ([g]) => !/^[A-Za-z]/.test(g.startsWith("#") ? g.slice(1) : g),
    );
    const englishGenres = genreEntries.filter(([g]) =>
      /^[A-Za-z]/.test(g.startsWith("#") ? g.slice(1) : g),
    );
    const orderedGenres = (lang === "fa" ? persianGenres : englishGenres).sort(
      (a, b) => b[1] - a[1],
    );
    genreHubGrid.innerHTML = "";
    orderedGenres.forEach(([g, count]) => {
      const cleanName = g.startsWith("#") ? g.slice(1) : g;
      const chip = document.createElement("a");
      chip.className = "genre-hub-chip";
      chip.setAttribute("dir", "auto");
      chip.href = `/genre.html?genre=${encodeURIComponent(g)}`;
      chip.innerHTML = `<span class="genre-hub-chip-name">${cleanName.replace(/</g, "&lt;")}</span><span class="genre-hub-chip-count">${count}</span>`;
      genreHubGrid.appendChild(chip);
    });
    // Update header i18n
    const hubTitleEl = document.querySelector(".genre-hub-title");
    const hubSubEl = document.querySelector(".genre-hub-subtitle");
    const t = hubI18n[lang] || hubI18n.fa;
    if (hubTitleEl) hubTitleEl.textContent = t.title;
    if (hubSubEl) hubSubEl.textContent = t.subtitle;
  }
  window.FilmChiinSharedSections = {
    hydrate,
    buildSideMenuGenres,
    buildSideMenuCountries,
    buildGenreHubGrid,
  };
})();

// ===== PATCH: Dock functionality for movie/actor pages =====
(function initSharedDock() {
  function setupDock() {
    const dock = document.querySelector(".mobile-bottom-dock");
    if (!dock) return;

    // ---- Menu button → open local sideMenu if injected, else navigate home ----
    const menuBtn = dock.querySelector("#bottomMenuBtn");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        const sideMenu = document.getElementById("sideMenu");
        const menuOverlay = document.getElementById("menuOverlay");
        if (sideMenu) {
          sideMenu.classList.toggle("active");
          if (menuOverlay) menuOverlay.classList.toggle("active");
          document.body.classList.toggle("no-scroll");
        } else {
          const url = new URL("/", window.location.origin);
          url.searchParams.set("openMenu", "1");
          window.location.href = url.toString();
        }
      });
    }

    // ---- Favorites button → open local favoritesOverlay (always injected via hydrate) ----
    const favBtn = dock.querySelector("#bottomFavoritesBtn");
    if (favBtn) {
      // Remove old listeners by cloning
      const newFavBtn = favBtn.cloneNode(true);
      favBtn.parentNode.replaceChild(newFavBtn, favBtn);
      newFavBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openFavoritesOverlayUI === "function") {
          // Main page: use full function
          window.openFavoritesOverlayUI();
          return;
        }
        // Sub-pages (movie/actor): use standalone loader
        if (typeof window.openFavoritesSubPage === "function") {
          window.openFavoritesSubPage();
        }
      });
    }

    // ---- Search button → focus the header search input ----
    const searchBtn = dock.querySelector("#bottomSearchBtn");
    if (searchBtn) {
      searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("search");
        if (searchInput) {
          try {
            searchInput.focus({ preventScroll: true });
          } catch {
            searchInput.focus();
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }

    // ---- Keyboard detection: hide dock when keyboard open ----
    function checkKeyboard() {
      const vvHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      const winHeight = window.screen.height;
      const keyboardOpen = vvHeight < winHeight * 0.7;
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
    const label = document.querySelector(
      "#socialLinksSection .social-link-label",
    );
    const bubble = document.querySelector(
      "#socialLinksSection .social-link-join-bubble",
    );
    if (label)
      label.textContent = lang === "fa" ? "کانال تلگرام" : "Telegram Channel";
    if (bubble) bubble.textContent = lang === "fa" ? "جوین" : "Join";
  }

  // ---- Favorites standalone loader for sub-pages (movie/actor) ----
  // از همان منطق صفحه اصلی استفاده می‌کند: favorites از DB + movies از window._fcMovies (کش) یا DB
  const SUBPAGE_FAV_PAGE_SIZE = 9;
  let subpageFavPage = 1;
  let subpageFavData = []; // [{fav, movie}]

  async function openFavoritesSubPage() {
    const db = window._supabaseClient || window.db;
    const lang = localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
    if (!db) return;

    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      _subpageShowToast(
        lang === "fa"
          ? "برای مشاهده علاقه‌مندی‌ها باید وارد شوید"
          : "Please log in to view favorites",
        true,
      );
      return;
    }

    const favOverlay = document.getElementById("favoritesOverlay");
    if (!favOverlay) return;
    favOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    // Wire close button
    const closeBtn = favOverlay.querySelector("#favoritesCloseBtn");
    if (closeBtn && !closeBtn._wiredClose) {
      closeBtn._wiredClose = true;
      closeBtn.addEventListener("click", () => {
        favOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
      });
    }
    // Wire pagination buttons (wire once)
    const prevBtn = favOverlay.querySelector("#favoritesPrev");
    const nextBtn = favOverlay.querySelector("#favoritesNext");
    if (prevBtn && !prevBtn._wiredSubpage) {
      prevBtn._wiredSubpage = true;
      prevBtn.addEventListener("click", () => {
        if (subpageFavPage > 1) {
          subpageFavPage--;
          _renderSubpageFavGrid(lang);
        }
      });
    }
    if (nextBtn && !nextBtn._wiredSubpage) {
      nextBtn._wiredSubpage = true;
      nextBtn.addEventListener("click", () => {
        const totalPages =
          Math.ceil(subpageFavData.length / SUBPAGE_FAV_PAGE_SIZE) || 1;
        if (subpageFavPage < totalPages) {
          subpageFavPage++;
          _renderSubpageFavGrid(lang);
        }
      });
    }

    const grid = document.getElementById("favoritesGrid");
    if (!grid) return;
    grid.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted,#888)">${lang === "fa" ? "در حال بارگذاری..." : "Loading..."}</div>`;

    try {
      // 1) بگیر favorites از DB (همان روش صفحه اصلی)
      const { data: favRows, error: favErr } = await db
        .from("favorites")
        .select("movie_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favErr || !favRows || !favRows.length) {
        grid.innerHTML = `<div class="favorites-empty">${lang === "fa" ? "هنوز فیلمی به علاقه‌مندی‌ها اضافه نشده" : "No favorite movies yet."}</div>`;
        _updateSubpagePageInfo(0, 0);
        return;
      }

      // 2) بگیر movies از کش window._fcMovies (همان منبع صفحه اصلی)
      let allMovies =
        Array.isArray(window._fcMovies) && window._fcMovies.length
          ? window._fcMovies
          : null;

      // اگر کش موجود نبود، از sessionStorage بخوان
      if (!allMovies) {
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
      }

      // اگر هنوز هم موجود نبود، از DB بگیر
      if (!allMovies) {
        const { data: dbMovies } = await db.from("movies").select("*");
        allMovies = dbMovies || [];
        window._fcMovies = allMovies;
        try {
          sessionStorage.setItem(
            "filmchin_movies_cache",
            JSON.stringify(allMovies),
          );
        } catch (e) {
          /* quota */
        }
        // ساخت سایدمنو ژانر/کشور
        setTimeout(() => {
          if (window.FilmChiinSharedSections?.buildSideMenuGenres)
            window.FilmChiinSharedSections.buildSideMenuGenres();
          if (window.FilmChiinSharedSections?.buildSideMenuCountries)
            window.FilmChiinSharedSections.buildSideMenuCountries();
        }, 100);
      }

      // 3) ترکیب favorites + movies (همان منطق buildFavoritesWithMovies صفحه اصلی)
      subpageFavData = favRows
        .map((fav) => {
          const movie = allMovies.find(
            (m) => String(m.id) === String(fav.movie_id),
          );
          return movie ? { fav, movie } : null;
        })
        .filter(Boolean);

      if (!subpageFavData.length) {
        grid.innerHTML = `<div class="favorites-empty">${lang === "fa" ? "هیچ فیلمی پیدا نشد" : "No movies found."}</div>`;
        _updateSubpagePageInfo(0, 0);
        return;
      }

      subpageFavPage = 1;
      _renderSubpageFavGrid(lang);
    } catch (err) {
      console.error("openFavoritesSubPage error", err);
      const grid2 = document.getElementById("favoritesGrid");
      if (grid2)
        grid2.innerHTML = `<div style="padding:20px;text-align:center;color:red">${lang === "fa" ? "خطا در بارگذاری" : "Error loading favorites"}</div>`;
    }
  }

  function _renderSubpageFavGrid(lang) {
    const grid = document.getElementById("favoritesGrid");
    if (!grid) return;

    const totalPages =
      Math.ceil(subpageFavData.length / SUBPAGE_FAV_PAGE_SIZE) || 1;
    if (subpageFavPage < 1) subpageFavPage = 1;
    if (subpageFavPage > totalPages) subpageFavPage = totalPages;

    const start = (subpageFavPage - 1) * SUBPAGE_FAV_PAGE_SIZE;
    const slice = subpageFavData.slice(start, start + SUBPAGE_FAV_PAGE_SIZE);

    grid.innerHTML = slice
      .map(({ movie: m }) => {
        const title = (m.title || "").replace(/</g, "&lt;");
        const cover = (
          m.cover ||
          m.poster ||
          "/images/placeholder.png"
        ).replace(/"/g, "&quot;");
        return `<div class="favorite-item" data-movie-id="${m.id}" style="cursor:pointer">
        <img src="${cover}" alt="${title}" class="favorite-cover" loading="lazy" onerror="this.src='/images/placeholder.png'">
        <div class="favorite-title" dir="auto">${title}</div>
        <div class="favorite-meta"></div>
        <div class="favorite-actions">
          <div class="button-wrap">
            <button class="favorite-goto-btn subpage-fav-goto" data-id="${m.id}"
              style="font-size:12px;padding:4px 10px;">
              <span>${lang === "fa" ? "صفحه فیلم" : "Go to page"}</span>
            </button>
            <div class="button-shadow"></div>
          </div>
        </div>
      </div>`;
      })
      .join("");

    // Wire go-to buttons
    grid.querySelectorAll(".subpage-fav-goto").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (id) window.location.href = `/movie.html?id=${id}`;
      });
    });
    // Wire card click (whole card)
    grid.querySelectorAll(".favorite-item").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.movieId;
        if (id) window.location.href = `/movie.html?id=${id}`;
      });
    });

    _updateSubpagePageInfo(subpageFavPage, totalPages);

    const prevBtn = document.getElementById("favoritesPrev");
    const nextBtn = document.getElementById("favoritesNext");
    if (prevBtn) prevBtn.disabled = subpageFavPage <= 1;
    if (nextBtn) nextBtn.disabled = subpageFavPage >= totalPages;
  }

  function _updateSubpagePageInfo(page, total) {
    const pageInfo = document.getElementById("favoritesPageInfo");
    if (pageInfo) pageInfo.textContent = `${page} / ${total}`;
  }

  function _subpageShowToast(msg, isError = false) {
    let container = document.getElementById("topToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "topToastContainer";
      container.style.cssText =
        "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;";
      document.body.appendChild(container);
    }
    const t = document.createElement("div");
    t.style.cssText = `pointer-events:auto;padding:10px 16px;background:${isError ? "rgba(180,20,20,0.9)" : "rgba(0,74,124,0.9)"};color:#fff;border-radius:8px;font-size:14px;`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  window.openFavoritesSubPage = openFavoritesSubPage;

  // ---- Social links loader for sub-pages ----
  async function fetchSocialLinksSubPage() {
    const db = window._supabaseClient || window.db;
    if (!db) return;
    const grid = document.getElementById("socialGrid");
    if (!grid || grid.children.length > 0) return;
    try {
      const { data, error } = await db
        .from("social_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) return;
      grid.innerHTML = data
        .map(
          (s) =>
            `<a href="${(s.url || "").replace(/"/g, "&quot;")}" target="_blank" rel="noopener" class="social-item"><img src="${(s.icon || "").replace(/"/g, "&quot;")}" alt="${(s.title || "").replace(/"/g, "&quot;")}"><span>${(s.title || "").replace(/</g, "&lt;")}</span></a>`,
        )
        .join("");
    } catch (e) {
      console.error("fetchSocialLinksSubPage error", e);
    }
  }
  window.fetchSocialLinksSubPage = fetchSocialLinksSubPage;

  // بارگذاری نسخه اپ از Supabase برای صفحات فرعی
  async function loadAppVersionSubPage() {
    const el = document.getElementById("appVersion");
    if (!el) return;
    // اگر مقدار پیش‌فرض placeholder است لود کن
    const SUPABASE_URL = "https://etevwqbiynardwsezasn.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0ZXZ3cWJpeW5hcmR3c2V6YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NjI0MzMsImV4cCI6MjA5NzEzODQzM30.1yPLfjydENjHacsI3PXLvekF7kIIWZDtaTARyDt5tUw";
    try {
      if (!window.supabase?.createClient) return;
      const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await db
        .from("app_meta")
        .select("value")
        .eq("key", "version")
        .single();
      if (!error && data?.value) {
        el.textContent = "v" + data.value;
      }
    } catch (err) {
      console.warn("loadAppVersionSubPage error:", err);
    }
  }

  // Run after hydrate
  const origHydrate = window.FilmChiinSharedSections?.hydrate;
  if (origHydrate) {
    window.FilmChiinSharedSections.hydrate = async function () {
      await origHydrate();
      setupDock();
      updateSocialLinksLang();
      // Load social links for injected sidemenu
      setTimeout(() => fetchSocialLinksSubPage(), 600);
      // Load real app version into sideMenu
      setTimeout(() => loadAppVersionSubPage(), 300);
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
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0ZXZ3cWJpeW5hcmR3c2V6YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NjI0MzMsImV4cCI6MjA5NzEzODQzM30.1yPLfjydENjHacsI3PXLvekF7kIIWZDtaTARyDt5tUw";

  let moviesCache = null;
  let episodesCacheMap = new Map();
  let coverCycleTimers = new Map();

  async function getMovies() {
    if (moviesCache) return moviesCache;
    if (!window.supabase?.createClient) return [];
    try {
      const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await db
        .from("movies")
        .select("id,title,cover,type,synopsis,stars,director")
        .order("updated_at", { ascending: false });
      moviesCache = data || [];
      return moviesCache;
    } catch {
      return [];
    }
  }

  async function getEpisodes(movieIds) {
    if (!window.supabase?.createClient || !movieIds.length) return new Map();
    const missing = movieIds.filter((id) => !episodesCacheMap.has(id));
    if (missing.length) {
      try {
        const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data } = await db
          .from("movie_items")
          .select("movie_id,cover,order_index")
          .in("movie_id", missing)
          .order("order_index", { ascending: true });
        const grouped = new Map();
        (data || []).forEach((ep) => {
          if (!grouped.has(ep.movie_id)) grouped.set(ep.movie_id, []);
          grouped.get(ep.movie_id).push(ep.cover);
        });
        missing.forEach((id) =>
          episodesCacheMap.set(id, grouped.get(id) || []),
        );
      } catch {}
    }
    return episodesCacheMap;
  }

  function makeMovieSlug(title) {
    return String(title || "")
      .toLowerCase()
      .trim()
      .replace(/[\(\)\[\]\{\}]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function buildMoviePageHref(title) {
    const slug = makeMovieSlug(title || "");
    return slug
      ? `/movie.html?slug=${encodeURIComponent(slug)}`
      : "/movie.html";
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
      allImgs.forEach((im) => {
        im.style.opacity = "0";
      });
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

    dropdown.innerHTML = results
      .map((m, i) => {
        const href = buildMoviePageHref(m.title);
        const borderClass =
          m.type === "collection"
            ? "collection-border"
            : m.type === "series"
              ? "serial-border"
              : "";
        const coverHtml =
          m.type === "collection"
            ? `<div class="search-dropdown-cover-wrap" data-movie-id="${m.id}"><img src="${m.cover || ""}" alt="${m.title || ""}" class="search-dropdown-cover" /></div>`
            : `<img src="${m.cover || ""}" alt="${m.title || ""}" class="search-dropdown-cover" />`;
        return `<div class="search-dropdown-item ${borderClass}" data-href="${href}" data-movie-id="${m.id}" data-type="${m.type || "single"}">
        ${coverHtml}
        <span class="search-dropdown-title">${m.title || ""}</span>
        <button class="search-dropdown-open-btn" data-href="${href}" tabindex="-1">Open</button>
      </div>`;
      })
      .join("");

    // Attach click handlers
    dropdown.querySelectorAll(".search-dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".search-dropdown-open-btn")) {
          e.stopPropagation();
          window.open(
            e.target.closest(".search-dropdown-open-btn").dataset.href,
            "_blank",
          );
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
      const wrap = dropdown.querySelector(
        `.search-dropdown-cover-wrap[data-movie-id="${m.id}"]`,
      );
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
      .map((m) => ({ movie: m, score: scoreMovie(m, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || 0)
      .slice(0, 10)
      .map((r) => r.movie);

    // Pre-fetch episodes for collections in results
    const collectionIds = scored
      .filter((m) => m.type === "collection")
      .map((m) => m.id);
    if (collectionIds.length) await getEpisodes(collectionIds);

    if (scored.length === 0 && !query) {
      dropdown.style.display = "none";
      return;
    }

    renderDropdown(dropdown, scored, query);
    dropdown.style.display = "block";
  }

  function attachSearchDropdown(searchInput) {
    // جلوگیری از attach مجدد
    if (searchInput.dataset.dropdownAttached === "1") return;
    searchInput.dataset.dropdownAttached = "1";

    // Check if dropdown already exists (index.html)
    let dropdown = document.getElementById("searchLiveDropdown");
    if (!dropdown) {
      // Create and inject after the input
      dropdown = document.createElement("div");
      dropdown.id = "searchLiveDropdown";
      dropdown.className = "search-live-dropdown";
      dropdown.style.display = "none";
      const wrap =
        searchInput.closest(".search-input-wrap") || searchInput.parentElement;
      if (wrap) {
        wrap.style.position = "relative";
        wrap.appendChild(dropdown);
      }
    }

    searchInput.addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(
        () => onSearchInput(searchInput, dropdown),
        200,
      );
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

  // برای صفحات movie/actor که #search بعد از hydration اضافه می‌شود
  const origHydrateForSearch = window.FilmChiinSharedSections?.hydrate;
  if (origHydrateForSearch) {
    const patchedHydrate = window.FilmChiinSharedSections.hydrate;
    window.FilmChiinSharedSections._searchDropdownPatched = true;
    // این patch در initSharedDock انجام می‌شود — اینجا فقط fallback
  }
  // اجرای مستقیم بعد از hydrate از طریق override
  (function waitForSearchAfterHydrate() {
    let tried = 0;
    const interval = setInterval(() => {
      tried++;
      const searchInput = document.getElementById("search");
      const dropdown = document.getElementById("searchLiveDropdown");
      if (searchInput && !searchInput.dataset.dropdownAttached) {
        attachSearchDropdown(searchInput);
        searchInput.dataset.dropdownAttached = "1";
        clearInterval(interval);
      }
      if (tried > 40) clearInterval(interval);
    }, 200);
  })();
})();

(function initActionButtons() {
  const labelSets = {
    file: {
      en: { idle: "Go to file", loading: "Receiving", done: "Received" },
      fa: { idle: "Go to file", loading: "در حال دریافت", done: "دریافت شد" },
    },
    allEpisodes: {
      en: { idle: "Get all episodes", loading: "Receiving", done: "Received" },
      fa: {
        idle: "دریافت همه اپیزودها",
        loading: "در حال دریافت",
        done: "دریافت شد",
      },
    },
  };

  function lang() {
    return localStorage.getItem("siteLanguage") === "fa" ? "fa" : "en";
  }

  function variantOf(btn) {
    return btn?.classList.contains("get-all-btn") ? "allEpisodes" : "file";
  }

  function text(btn, key) {
    const set = labelSets[variantOf(btn)] || labelSets.file;
    return (set[lang()] || set.en)[key] || set.en[key];
  }

  function syncGoFileThemeVars() {
    const rootStyle = document.documentElement.style;
    const selectedTheme = localStorage.getItem("colorTheme") || "blue";
    if (selectedTheme === "blue") {
      rootStyle.setProperty("--go-file-bg", "#3b82f6");
      rootStyle.setProperty("--go-file-bg-hover", "#60a5fa");
      return;
    }
    rootStyle.setProperty("--go-file-bg", "var(--theme-accent)");
    rootStyle.setProperty("--go-file-bg-hover", "var(--theme-accent-light)");
  }

  function markup(label) {
    return `
      <span class="fc-btn-inner">
        <span class="svg-container" aria-hidden="true">
          <svg class="download-icon" width="18" height="18" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="download-arrow" d="M13 9L9 13M9 13L5 9M9 13V1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 17V18C1 18.7956 1.31607 19.5587 1.87868 20.1213C2.44129 20.6839 3.20435 21 4 21H14C14.7956 21 15.5587 20.6839 16.1213 20.1213C16.6839 19.5587 17 18.7956 17 18V17" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="download-loader hidden"></span>
          <svg class="check-svg hidden" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM15.1071 7.9071C15.4976 7.51658 15.4976 6.88341 15.1071 6.49289C14.7165 6.10237 14.0834 6.10237 13.6929 6.49289L8.68568 11.5001L7.10707 9.92146C6.71655 9.53094 6.08338 9.53094 5.69286 9.92146C5.30233 10.312 5.30233 10.9452 5.69286 11.3357L7.97857 13.6214C8.3691 14.0119 9.00226 14.0119 9.39279 13.6214L15.1071 7.9071Z" fill="#fff"/>
          </svg>
        </span>
        <span class="button-copy">${label}</span>
      </span>`;
  }

  function setState(btn, state) {
    const icon = btn.querySelector(".download-icon");
    const loader = btn.querySelector(".download-loader");
    const check = btn.querySelector(".check-svg");
    const copy = btn.querySelector(".button-copy");
    icon?.classList.toggle("hidden", state !== "idle");
    loader?.classList.toggle("hidden", state !== "loading");
    check?.classList.toggle("hidden", state !== "done");
    if (copy) copy.textContent = text(btn, state);
  }

  // پیدا کردن المان‌های مطابق selector، حتی اگر خودِ root با selector تطابق داشته باشد
  // (در پیاده‌سازی قبلی این حالت در نظر گرفته نشده بود و باعث می‌شد بعضی دکمه‌ها enhance نشوند)
  function collect(root, selector) {
    if (!root || root.nodeType !== 1) return [];
    const list = root.matches?.(selector) ? [root] : [];
    if (root.querySelectorAll) list.push(...root.querySelectorAll(selector));
    return list;
  }

  function enhance(root = document) {
    syncGoFileThemeVars();

    // دکمه‌های پویا: دریافت فایل / دریافت همه اپیزودها (آیکن + اسپینر + تیک)
    collect(root, ".go-btn, .get-all-btn").forEach((btn) => {
      if (btn.dataset.fcEnhanced === "1") return;
      btn.dataset.fcEnhanced = "1";
      btn.classList.add("fc-action-btn");
      btn.closest(".button-wrap")?.classList.add("fc-action-wrap");
      btn.innerHTML = markup(text(btn, "idle"));
    });

    // دکمه‌ی ایستا: صفحه فیلم — فقط همان پوسته‌ی رنگی، بدون انیمیشن/تعویض متن
    collect(root, ".go-page-btn").forEach((btn) => {
      if (btn.dataset.fcEnhanced === "1") return;
      btn.dataset.fcEnhanced = "1";
      btn.classList.add("fc-action-btn");
      btn.closest(".button-wrap")?.classList.add("fc-action-wrap");
    });
  }

  // کلیک روی دکمه‌های پویا → حالت "در حال دریافت" سپس بعد از یک تاخیر کوتاه "دریافت شد"
  // (به‌جای تکیه بر animationend که در پیاده‌سازی قبلی منبع باگ بود)
  document.addEventListener(
    "click",
    (event) => {
      const btn = event.target.closest(
        ".go-btn.fc-action-btn, .get-all-btn.fc-action-btn",
      );
      if (!btn || btn.dataset.fcClicked === "1") return;
      btn.dataset.fcClicked = "1";
      setState(btn, "loading");
      setTimeout(() => setState(btn, "done"), 1400);
    },
    true,
  );

  document.addEventListener("DOMContentLoaded", () => enhance());
  window.addEventListener("storage", syncGoFileThemeVars);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) enhance(node);
      });
    });
  });
  if (document.documentElement)
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  window.FilmChiinEnhanceActionButtons = enhance;
  window.FilmChiinSyncGoFileThemeVars = syncGoFileThemeVars;
})();
