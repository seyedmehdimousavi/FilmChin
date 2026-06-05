(function () {
  const featureI18n = {
    en: {
      siteFeaturesTitle: "FilmChiin site features",
      featureTitle1: "Create account",
      featureTitle2: "Instant and advanced search",
      featureTitle3: "Customize homepage layout",
      featureTitle4: "Type and genre tabs",
      featureTitle5: "Sort by IMDb rating",
      featureTitle6: "Sort by release year",
      featureTitle7: "Episode list for collections/series",
      featureTitle8: "One-click file access",
      featureTitle9: "Comments in each post",
      featureTitle10: "Popular movies and page list",
      featureTitle11: "Responsive Liquid Glass design",
      featureTitle12: "Site language switch",
      featureTitle13: "Site color theme switch",
      featureDesc1: "By creating an account, you unlock extra capabilities: build a personal favorites list and chat with admin.",
      featureDesc2: "Search is fully instant. As you type, results filter immediately and matched text is highlighted in title, synopsis, cast, and other fields.",
      featureDesc3: "Use SideMenu options to arrange homepage layout based on your preference.",
      featureDesc4: "Homepage is separated by content type (movie, collection, series). You can also filter each tab by genres with one click.",
      featureDesc5: "Sort visible list by IMDb score and quickly focus on higher-rated titles.",
      featureDesc6: "Use release filter to prioritize newer/older titles based on your preference.",
      featureDesc7: "For collections and series, all episodes are shown in small cards in the same post and selecting an episode updates card info instantly.",
      featureDesc8: "With <strong>Go to file</strong>, <code>@Filmchinbot</code> sends movie/episode file directly without needing channel join.",
      featureDesc9: "Each post supports comments with custom UI and avatars; comment count is shown near the comment icon.",
      featureDesc10: "Popular section is built from click stats and the floating panel lists current-page posts for quick navigation.",
      featureDesc11: "Parts of UI use a Liquid Glass-inspired design with smooth animations and balanced transparency on mobile/desktop.",
      featureDesc12: "From language settings, you can switch the UI between Persian and English. Core texts, headings, and feature descriptions update consistently based on your selected language.",
      featureDesc13: "With the color theme option, you can personalize the site look to match your taste. Your selected theme is applied across UI sections for a more consistent and pleasant browsing experience.",
      searchPlaceholder: "Search...",
    },
    fa: {
      siteFeaturesTitle: "لیست امکانات سایت FilmChiin",
      featureTitle1: "ساخت حساب کاربری",
      featureTitle2: "جست‌وجوی لحظه‌ای و پیشرفته",
      featureTitle3: "شخصی سازی چیدمان صفحه",
      featureTitle4: "فیلترفیلم هاوژانرها در تب‌های جداگانه",
      featureTitle5: "مرتب‌سازی بر اساس امتیاز IMDb",
      featureTitle6: "مرتب‌سازی بر اساس سال انتشار",
      featureTitle7: "لیست قسمت‌های سریال وکالکشن",
      featureTitle8: "دسترسی به فایل فقط با یک کلیک",
      featureTitle9: "کامنت و نمایش گفت‌وگو در همان پست",
      featureTitle10: "فیلم‌های پرطرفدارولیست فیلم‌های صفحه",
      featureTitle11: "طراحی Liquid Glass واکنش‌گرا",
      featureTitle12: "امکان تغییر زبان سایت",
      featureTitle13: "امکان تغییر تم رنگی سایت",
      featureDesc1: "با ساخت حساب کاربری به قابلیت های بیشتری دسترسی دارید می‌توانید برای خودتان یک لیست اختصاصی از فیلم‌های مورد علاقه بسازید. میتوانید از چت با ادمین استفاده کنید.",
      featureDesc2: "جست‌وجوی سایت کاملاً لحظه‌ای است؛ با تایپ هر عبارت، نتایج بلافاصله فیلتر می‌شوند. عبارت جست‌وجوشده در عنوان، خلاصه، بازیگران و سایر فیلدها هایلایت می‌شود.",
      featureDesc3: "از طریق گزینه های موجود در SideMenu میتوانید چیدمان صفحه اصلی را مطابق با سلیقه ی خود مرتب کنید.",
      featureDesc4: "صفحه اصلی بر اساس نوع محتوا (فیلم سینمایی، کالکشن، سریال) با تب‌ها تفکیک شده است. علاوه بر آن، در هر تب می‌توانید با یک کلیک ژانر را فیلتر کنید.",
      featureDesc5: "لیست قابل مشاهده را می‌توانید بر اساس امتیاز IMDb مرتب کنید تا سریع‌تر به عناوین با امتیاز بالاتر برسید.",
      featureDesc6: "با فیلتر سال انتشار می‌توانید عناوین جدیدتر یا قدیمی‌تر را بر اساس نیاز خود ببینید.",
      featureDesc7: "برای سریال‌ها و کالکشن‌ها، تمام قسمت‌ها در قالب کارت‌های کوچک داخل همان پست نمایش داده می‌شوند و با انتخاب هر قسمت اطلاعات کارت فوراً آپدیت می‌شود.",
      featureDesc8: "با فشردن دکمه <strong>Go to file</strong> بات <code>@Filmchinbot</code> فایل فیلم یا قسمت سریال را برای شما ارسال می‌کند؛ بدون نیاز به جوین شدن در کانال.",
      featureDesc9: "برای هر پست می‌توانید کامنت بگذارید و همه نظرات در همان کارت فیلم با طراحی اختصاصی و آواتارها نمایش داده می‌شوند.",
      featureDesc10: "بخش فیلم‌های پرطرفدار بر اساس آمار کلیک‌ها ساخته می‌شود و دکمه شناور لیست فیلم‌های صفحه فعلی را نشان می‌دهد.",
      featureDesc11: "بخش هایی از سایت با الهام از طراحی Liquid Glass ساخته شده است؛ کارت‌ها، دکمه‌ها و پنل‌ها تجربه کاربری روان و چشم‌نواز ایجاد می‌کنند.",
      featureDesc12: "در بخش تنظیمات زبان می‌توانید رابط کاربری سایت را بین فارسی و انگلیسی جابه‌جا کنید. تمام متن‌های اصلی، عنوان‌ها و توضیحات امکانات بر اساس زبان انتخابی شما به‌صورت یکپارچه تغییر می‌کنند.",
      featureDesc13: "با گزینه تغییر تم رنگی، می‌توانید ظاهر سایت را متناسب با سلیقه خود شخصی‌سازی کنید. تم انتخابی روی بخش‌های مختلف رابط کاربری اعمال می‌شود تا تجربه مرور سایت هماهنگ‌تر و دلپذیرتر باشد.",
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
    if (themeSwitchCheckbox) {
      themeSwitchCheckbox.checked = localStorage.getItem("theme") === "dark";
      themeSwitchCheckbox.addEventListener("change", (e) => {
        const dark = e.target.checked;
        document.body.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
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
    document.documentElement.lang = getLang();
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
