// -------------------- Supabase config --------------------
const SUPABASE_URL = "https://gwsmvcgjdodmkoqupdal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c212Y2dqZG9kbWtvcXVwZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDczNjEsImV4cCI6MjA3MjEyMzM2MX0.OVXO9CdHtrCiLhpfbuaZ8GVDIrUlA8RdyQwz2Bk2cDY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/"
    ) {
      await supabase.from("visits").insert([
        {
          path: window.location.pathname,
          ua: navigator.userAgent,
          referrer: document.referrer || null,
        },
      ]);
    }
  } catch (err) {
    console.error("visit log error:", err);
  }

  await loadAuthState();
});

// -------------------- App state --------------------
let currentUser = null;
let movies = [];
let messages = [];
let editingMovie = null;

const PAGE_SIZE = 10;
let currentPage = 1;
let episodesByMovie = new Map();
let imdbMinRating = null;
// ===== Year filter global state =====
let yearMinFilter = null;      // حداقل سالی که از اسپینر انتخاب شده
let lastFilterPriority = null; // "year" یا "imdb"
// ✅ Favorites state
const FAVORITES_PAGE_SIZE = 6;
let favoriteMovieIds = new Set();
let favoritesRaw = [];
let favoritesLoaded = false;
let favoritesPage = 1;

// برای منوی گزینه‌های پست
let currentOptionsMovie = null;

// ======= Deep link for single movie (/movie/slug) =======
let deepLinkSlug = null;

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname || "";
  if (path.startsWith("/movie/")) {
    // "/movie/xxx" → فقط بخش بعد از /movie/
    deepLinkSlug = decodeURIComponent(
      path.replace("/movie/", "").replace(/\/+$/, "")
    );
  }
});

/* ======================
   PAGE URL HELPERS
   ====================== */
function getPageFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("page");
    const p = parseInt(raw || "1", 10);
    if (!Number.isFinite(p) || p < 1) return 1;
    return p;
  } catch (e) {
    console.warn("getPageFromUrl error:", e);
    return 1;
  }
}

function setPageInUrl(page) {
  try {
    const url = new URL(window.location.href);
    if (!Number.isFinite(page) || page <= 1) {
      // صفحه ۱ → پارامتر رو حذف کنیم تا URL تمیز بمونه
      url.searchParams.delete("page");
    } else {
      url.searchParams.set("page", String(page));
    }
    window.history.replaceState({}, "", url);
  } catch (e) {
    console.warn("setPageInUrl error:", e);
  }
}

// ---- Central auth state loader (fixed) ----
async function loadAuthState() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("session error:", error);
      currentUser = null;
      localStorage.removeItem("currentUser");
      setUserProfile(null);
      return null;
    }

    const user = session?.user;
    if (!user) {
      currentUser = null;
      localStorage.removeItem("currentUser");
      setUserProfile(null);
      return null;
    }

    const { data: dbUser, error: dbErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (dbErr) {
      console.error("dbUser error:", dbErr);
      currentUser = null;
      localStorage.removeItem("currentUser");
      setUserProfile(null);
      return null;
    }

    if (!dbUser) {
      currentUser = null;
      localStorage.removeItem("currentUser");
      setUserProfile(null);
      return null;
    }

    const avatarUrl = dbUser?.avatar_url
      ? supabase.storage.from("avatars").getPublicUrl(dbUser.avatar_url).data
          .publicUrl
      : null;

    const role = dbUser?.role
      ? dbUser.role
      : dbUser?.is_admin
      ? "admin"
      : "user";

    currentUser = {
      id: user.id,
      email: user.email,
      username: dbUser?.username || user.email,
      avatarUrl,
      role,
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    setUserProfile(avatarUrl);
    const usernameEl = document.getElementById("profileUsername");
    if (usernameEl && currentUser) {
      usernameEl.textContent = currentUser.username;
    }

    // ✅ بعد از گرفتن currentUser → favorites را لود کن
    await loadFavoritesForCurrentUser();

    return currentUser;
  } catch (err) {
    console.error("loadAuthState error:", err);
    currentUser = null;
    localStorage.removeItem("currentUser");
    setUserProfile(null);

    // اگر خطا شد favorites پاک شود
    favoriteMovieIds = new Set();
    favoritesRaw = [];
    favoritesLoaded = false;

    return null;
  }
}

// ✅ NEW: لود favorites برای کاربر
async function loadFavoritesForCurrentUser() {
  if (!currentUser) {
    favoriteMovieIds = new Set();
    favoritesRaw = [];
    favoritesLoaded = true;
    return;
  }

  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("movie_id, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadFavoritesForCurrentUser error:", error);
      return;
    }

    favoritesRaw = data || [];
    favoriteMovieIds = new Set((favoritesRaw || []).map((f) => f.movie_id));
    favoritesLoaded = true;
  } catch (err) {
    console.error("loadFavoritesForCurrentUser exception:", err);
  }
}

// -------------------- Toast & Spinner helpers --------------------
function showToast(message, type = "success") {
  const c = document.getElementById("toast-container");
  if (!c) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 3000);
}
function setButtonLoading(btn, text) {
  if (!btn) return;
  btn.dataset.originalText = btn.innerHTML;
  btn.classList.add("btn-loading");
  btn.innerHTML = `<span class="spinner"></span>${text}`;
  btn.disabled = true;
}
function clearButtonLoading(btn) {
  if (!btn) return;
  btn.classList.remove("btn-loading");
  btn.innerHTML = btn.dataset.originalText || "Submit";
  btn.disabled = false;
}

// -------------------- User Auth --------------------
const signupEmail = document.getElementById("signupEmail");
const signupUsername = document.getElementById("signupUsername");
const signupPassword = document.getElementById("signupPassword");
const signupAvatar = document.getElementById("signupAvatar");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const profileBtn = document.getElementById("profileBtn");
const authModal = document.getElementById("authModal");
const profileMenu = document.getElementById("profileMenu");

// تب‌ها
document.querySelectorAll(".auth-tabs .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".auth-tabs .tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document
      .querySelector(`.tab-content[data-tab="${btn.dataset.tab}"]`)
      .classList.add("active");
  });
});

// محدودیت حجم عکس پروفایل
signupAvatar?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file && file.size > 500 * 1024) {
    alert("حجم عکس نباید بیشتر از 500KB باشد");
    e.target.value = "";
  }
});

// -------------------- ثبت‌نام دو مرحله‌ای --------------------
const signupForm = document.getElementById("signupForm");
const signupStep1 = document.getElementById("signupStep1");
const signupStep2 = document.getElementById("signupStep2");
const signupNextBtn = document.getElementById("signupNextBtn");

let signupStage = 1;
let pendingUserId = null;
let pendingEmail = null;
let pendingUsername = null;
let pendingPassword = null;

// دکمه بعدی در مرحله اول یا تکمیل در مرحله دوم
signupNextBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

  if (signupStage === 1) {
    const email = signupEmail.value.trim();
    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();

    if (!email || !username || !password) {
      showToast("لطفاً تمام فیلدها را پر کنید.", "error");
      return;
    }

    setButtonLoading(signupNextBtn, "در حال ثبت‌نام...");

    try {
      // 🔹 چک بلاک بودن قبل از ثبت‌نام
      const { data: blocked, error: blockErr } = await supabase
        .from("blocked_users")
        .select("id")
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (blockErr) {
        console.error("blocked_users check error:", blockErr);
        showToast("خطا در بررسی بلاک ❌", "error");
        clearButtonLoading(signupNextBtn);
        return;
      }

      if (blocked) {
        showToast("این ایمیل یا نام کاربری بلاک شده است ❌", "error");
        clearButtonLoading(signupNextBtn);
        return;
      }

      // ادامه ثبت‌نام
      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signErr || !signData?.user)
        throw signErr || new Error("ثبت‌نام ناموفق");

      pendingUserId = signData.user.id;
      pendingEmail = email;
      pendingUsername = username;
      pendingPassword = password;

      if (!signData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
      }

      signupStep1.classList.remove("active-step");
      signupStep1.style.display = "none";
      signupStep2.style.display = "block";
      requestAnimationFrame(() => signupStep2.classList.add("active-step"));

      signupStage = 2;
      signupNextBtn.innerHTML = "تکمیل ثبت‌نام";
      showToast("اکنون تصویر پروفایل خود را انتخاب کنید ✅", "success");
    } catch (err) {
      console.error("signup step1 error:", err);
      showToast("خطا در ثبت حساب ❌", "error");
    } finally {
      clearButtonLoading(signupNextBtn);
    }
  } else if (signupStage === 2) {
    const avatar = signupAvatar.files[0];
    if (!avatar) {
      showToast("لطفاً تصویر پروفایل را انتخاب کنید.", "error");
      return;
    }

    setButtonLoading(signupNextBtn, "در حال آپلود...");

    try {
      // بررسی session معتبر
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck?.session) {
        console.warn(
          "⚠️ session lost before avatar upload, attempting re-login..."
        );
        const { error: reLoginErr } = await supabase.auth.signInWithPassword({
          email: pendingEmail,
          password: pendingPassword,
        });
        if (reLoginErr) throw reLoginErr;
      }

      const filePath = `${pendingUserId}/${Date.now()}_${avatar.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar);
      if (uploadErr) throw uploadErr;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const avatarUrl = publicData?.publicUrl || null;

      const { error: upsertErr } = await supabase.from("users").upsert(
        [
          {
            id: pendingUserId,
            email: pendingEmail,
            username: pendingUsername,
            password: pendingPassword,
            avatar_url: filePath,
            role: "user",
          },
        ],
        { onConflict: "id" }
      );

      if (upsertErr) throw upsertErr;

      currentUser = {
        id: pendingUserId,
        email: pendingEmail,
        username: pendingUsername,
        avatarUrl,
        role: "user",
      };
      setUserProfile(avatarUrl);
      const usernameEl = document.getElementById("profileUsername");
      if (usernameEl && currentUser) {
        usernameEl.textContent = currentUser.username;
      }
      showToast("ثبت‌نام تکمیل شد ✅", "success");
      authModal.style.display = "none";
    } catch (err) {
      console.error("signup step2 error:", err);
      showToast("خطا در آپلود آواتار ❌", "error");
    } finally {
      clearButtonLoading(signupNextBtn);
      signupStage = 1;
      pendingUserId = null;
      pendingEmail = null;
      pendingUsername = null;
      pendingPassword = null;

      signupForm.reset();
      requestAnimationFrame(() => {
        signupStep1.style.display = "block";
        signupStep2.style.display = "none";
        signupStep1.classList.add("active-step");
        signupStep2.classList.remove("active-step");
        signupNextBtn.innerHTML = `<img src="/images/nextsignup.png" alt="Next" style="height:22px;vertical-align:middle;">`;
      });
    }
  }
});

// -------------------- Login --------------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.currentTarget.querySelector("button[type='submit']");
  setButtonLoading(btn, "در حال ورود...");

  try {
    const email = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    // 🔹 چک بلاک بودن قبل از ورود
    const { data: blocked, error: blockErr } = await supabase
      .from("blocked_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (blockErr) {
      console.error("blocked_users check error:", blockErr);
      showToast("خطا در بررسی بلاک ❌", "error");
      clearButtonLoading(btn);
      return;
    }

    if (blocked) {
      showToast("این حساب بلاک شده است ❌", "error");
      clearButtonLoading(btn);
      return;
    }

    // ادامه ورود
    const { data: signInData, error: signInErr } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signInErr || !signInData.user) throw signInErr;

    const userId = signInData.user.id;
    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const avatarUrl = dbUser?.avatar_url
      ? supabase.storage.from("avatars").getPublicUrl(dbUser.avatar_url).data
          .publicUrl
      : null;

    const role = dbUser?.role
      ? dbUser.role
      : dbUser?.is_admin
      ? "admin"
      : "user";

    currentUser = {
      id: userId,
      username: dbUser?.username || email,
      avatarUrl,
      role,
    };

    setUserProfile(avatarUrl);
    const usernameEl = document.getElementById("profileUsername");
    if (usernameEl && currentUser) {
      usernameEl.textContent = currentUser.username;
    }

    showToast("ورود موفقیت‌آمیز ✅", "success");
    authModal.style.display = "none";
  } catch (err) {
    console.error("login error:", err);
    showToast("خطا در ورود ❌", "error");
  } finally {
    clearButtonLoading(btn);
  }
});

// تغییر آیکون پروفایل
function setUserProfile(avatarUrl) {
  const profileBtnEl = document.getElementById("profileBtn");
  if (!profileBtnEl) return;
  if (avatarUrl) {
    profileBtnEl.innerHTML = `<img src="${avatarUrl}" style="width:44px;height:44px;border-radius:50%;">`;
  } else {
    profileBtnEl.innerHTML = `<img src="/images/icons8-user-96.png" alt="user"/>`;
  }
}

// کلیک روی پروفایل
profileBtn?.addEventListener("click", async () => {
  await loadAuthState();
  if (!currentUser) {
    authModal.style.display = "flex";
    return;
  }

  const isAdminRole = ["owner", "admin"].includes(currentUser?.role);

  if (isAdminRole) {
    if (window.location.pathname.includes("admin.html")) {
      // ادمین داخل پنل → فقط حباب باز بشه
      profileMenu.classList.toggle("hidden");
    } else {
      // ادمین داخل سایت → بره به پنل
      window.location.href = "admin.html";
    }
  } else {
    // کاربر عادی → همیشه حباب باز بشه
    profileMenu.classList.toggle("hidden");
  }
});

// خروج از حساب
async function doLogoutAndRefresh() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast("خروج انجام شد ✅", "success");
  } catch (err) {
    console.error("signOut error:", err);
    showToast("خطا در خروج ❌", "error");
  } finally {
    currentUser = null;
    setUserProfile(null);
    profileMenu?.classList.add("hidden");

    // ✅ پاک کردن favorites در خروج
    favoriteMovieIds = new Set();
    favoritesRaw = [];
    favoritesLoaded = false;

    setTimeout(() => {
      if (window.location.pathname.includes("admin")) {
        window.location.href = "index.html";
      } else {
        window.location.reload();
      }
    }, 200);
  }
}

document.querySelectorAll("#logoutBtn").forEach((btn) => {
  btn.removeEventListener?.("click", doLogoutAndRefresh);
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    doLogoutAndRefresh();
  });
});

// بستن مودال با کلیک بیرون
window.addEventListener("click", (e) => {
  if (authModal && e.target === authModal) authModal.style.display = "none";
  if (
    profileMenu &&
    !profileMenu.classList.contains("hidden") &&
    !profileBtn.contains(e.target)
  )
    profileMenu.classList.add("hidden");
});
// -------------------- Utilities --------------------
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeHighlightHtml(text, query) {
  const source = text || "";
  const q = (query || "").trim();
  if (!q) return escapeHtml(source);

  const pattern = new RegExp(escapeRegExp(q), "gi");
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    result += escapeHtml(source.slice(lastIndex, match.index));
    result += `<mark class="search-highlight">${escapeHtml(match[0])}</mark>`;
    lastIndex = pattern.lastIndex;
  }

  result += escapeHtml(source.slice(lastIndex));
  return result;
}

/**
 * متن ساده را به HTML امن + هایلایت تبدیل می‌کند.
 * - text: متن خام
 * - query: عبارت جست‌وجو (case-insensitive)
 */
function makeHighlightHtml(text, query) {
  const source = text || "";
  const q = (query || "").trim();
  if (!q) return escapeHtml(source);

  const pattern = new RegExp(escapeRegExp(q), "gi");
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    // تکه قبل از تطبیق
    result += escapeHtml(source.slice(lastIndex, match.index));
    // خود تطبیق هایلایت‌شده
    result += `<mark class="search-highlight">${escapeHtml(match[0])}</mark>`;
    lastIndex = pattern.lastIndex;
  }

  // تکه باقی‌مانده
  result += escapeHtml(source.slice(lastIndex));
  return result;
}

// ساخت slug از عنوان فیلم برای تطبیق با آدرس /movie/slug
function makeMovieSlug(title) {
  if (!title) return "";
  return (
    String(title)
      .toLowerCase()
      .trim()
      // حذف پرانتز و براکت
      .replace(/[\(\)\[\]\{\}]/g, "")
      // تبدیل هر چیز غیر حرف/عدد به -
      .replace(/[^a-z0-9ا-ی]+/gi, "-")
      // حذف - های تکراری
      .replace(/-+/g, "-")
      // حذف - از ابتدا و انتها
      .replace(/^-|-$/g, "")
  );
}

function buildTelegramBotUrlFromChannelLink(rawLink) {
  const trimmed = (rawLink || "").trim();
  if (!trimmed || trimmed === "#") return trimmed;

  // اگر همین حالا لینک بات باشد
  if (/^https?:\/\/t\.me\/Filmchinbot\?start=/i.test(trimmed)) {
    return trimmed;
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const host = url.hostname.toLowerCase();
  if (host !== "t.me" && host !== "telegram.me") {
    return trimmed; // لینک تلگرامی نیست
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return trimmed;

  // -------------------------------------------------------
  // 1) کانال خصوصی: /c/2195618604/403
  // -------------------------------------------------------
  if (parts[0] === "c" && parts.length >= 3) {
    const internalId = parts[1];
    const messageId = parts[2];

    if (/^[0-9]+$/.test(internalId) && /^[0-9]+$/.test(messageId)) {
      const payload = `forward_${internalId}_${messageId}`;
      return `https://t.me/Filmchinbot?start=${payload}`;
    }
  }

  // -------------------------------------------------------
  // 2) گروه public بدون تاپیک: /username/403
  // -------------------------------------------------------
  if (parts.length === 2) {
    const username = parts[0];
    const messageId = parts[1];

    if (/^[A-Za-z0-9_]+$/.test(username) && /^[0-9]+$/.test(messageId)) {
      const payload = `forward_${username}_${messageId}`;
      return `https://t.me/Filmchinbot?start=${payload}`;
    }
  }

  // -------------------------------------------------------
  // 3) گروه تاپیک‌دار: /username/topicId/messageId
  // ما topicId را حذف می‌کنیم و فقط messageId را استفاده می‌کنیم
  // -------------------------------------------------------
  if (parts.length === 3) {
    const username = parts[0];
    const messageId = parts[2]; // بخش آخر همیشه messageId واقعی است

    if (/^[A-Za-z0-9_]+$/.test(username) && /^[0-9]+$/.test(messageId)) {
      const payload = `forward_${username}_${messageId}`;
      return `https://t.me/Filmchinbot?start=${payload}`;
    }
  }

  // اگر هیچ ساختاری تطابق نداشت → بدون تغییر
  return trimmed;
}
// ===================== GLOBAL: normalize all Go to file links via Telegram bot =====================
// این لیسنر روی همه دکمه‌های .go-btn در صفحه کار می‌کند (کارت‌ها، مودال‌ها، ...)

document.addEventListener(
  "click",
  (e) => {
    const btn = e.target.closest(".go-btn");
    if (!btn) return;

    const rawLink =
      btn.dataset.link ||
      btn.getAttribute("data-link") ||
      btn.getAttribute("href") ||
      "";

    if (!rawLink) return;

    const finalLink = buildTelegramBotUrlFromChannelLink(rawLink);

    if (!finalLink || finalLink === rawLink) return;

    btn.dataset.link = finalLink;
    if (btn.tagName === "A") {
      btn.setAttribute("href", finalLink);
    }
  },
  true
);



function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
}
function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// -------------------- Upload Toast + Progress --------------------
function showUploadToast(message) {
  const container = document.getElementById("toast-container");
  container.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="message">${message}</div>
    <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
  `;
  container.appendChild(toast);
}

function updateUploadProgress(percent) {
  const fill = document.querySelector(".progress-fill");
  if (fill) fill.style.width = percent + "%";
}

function clearUploadToast() {
  const container = document.getElementById("toast-container");
  container.innerHTML = "";
}

// -------------------- Whole-post progress controller --------------------
let __postProgress = {
  totalParts: 0,
  completedParts: 0,
};

function startPostProgress(totalParts, message = "در حال پردازش...") {
  __postProgress = { totalParts, completedParts: 0 };
  showUploadToast(message);
  updateUploadProgress(0);
}

function updatePartProgress(percentWithinPart) {
  const { totalParts, completedParts } = __postProgress;
  const partWeight = totalParts > 0 ? 100 / totalParts : 100;
  const overall = Math.min(
    100,
    completedParts * partWeight + (percentWithinPart / 100) * partWeight
  );
  updateUploadProgress(Math.round(overall));
}

function completePart() {
  __postProgress.completedParts += 1;
  updatePartProgress(100);
}

function finishPostProgress(success = true) {
  updateUploadProgress(100);
  showUploadToast(success ? "انجام شد ✅" : "خطا در پردازش ❌");
  setTimeout(clearUploadToast, success ? 1800 : 3200);
}

// -------------------- Upload file with real progress via XHR --------------------
async function uploadWithProgress(file, path) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        return reject(new Error("No active session. Please login as admin."));
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/covers/${path}`);

      // apikey هم باید باشه، ولی Authorization باید با توکن session باشه
      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          updatePartProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true });
        } else {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}

// -------------------- Toast --------------------
function showToast(message) {
  try {
    let container = document.getElementById("topToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "topToastContainer";
      container.style.position = "fixed";
      container.style.top = "12px";
      container.style.left = "50%";
      container.style.transform = "translateX(-50%)";
      container.style.zIndex = "2147483647";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.gap = "8px";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "top-toast";
    toast.style.pointerEvents = "auto";
    toast.style.maxWidth = "min(920px, 95%)";
    toast.style.padding = "10px 14px";
    toast.style.background = "rgba(0,74,124,0.6)";
    toast.style.color = "#fff";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    toast.style.fontSize = "14px";
    toast.style.lineHeight = "1.2";
    toast.style.textAlign = "center";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 220ms ease, transform 220ms ease";
    toast.style.transform = "translateY(-6px)";
    toast.textContent = message || "";
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      setTimeout(() => {
        try {
          container.removeChild(toast);
        } catch (e) {}
      }, 240);
    }, 3000);
  } catch (err) {
    console.error("showToast error", err);
  }
}

// -------------------- Dialog --------------------
function showDialog({ message = "", type = "alert", defaultValue = "" } = {}) {
  return new Promise((resolve) => {
    try {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.background = "rgba(0,0,0,0.5)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "2147483646";
      const box = document.createElement("div");
      box.style.background = "#fff";
      box.style.color = "#111";
      box.style.padding = "18px";
      box.style.borderRadius = "10px";
      box.style.width = "92%";
      box.style.maxWidth = "420px";
      box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
      box.style.display = "flex";
      box.style.flexDirection = "column";
      box.style.gap = "12px";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      const msg = document.createElement("div");
      msg.style.fontSize = "16px";
      msg.style.textAlign = "center";
      msg.style.whiteSpace = "pre-wrap";
      msg.textContent = message;
      box.appendChild(msg);
      let inputEl = null;
      if (type === "prompt") {
        inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.value = defaultValue ?? "";
        inputEl.style.width = "100%";
        inputEl.style.padding = "8px";
        inputEl.style.fontSize = "15px";
        inputEl.style.border = "1px solid #ccc";
        inputEl.style.borderRadius = "6px";
        inputEl.style.boxSizing = "border-box";
        box.appendChild(inputEl);
        setTimeout(() => inputEl && inputEl.focus(), 50);
      }
      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "10px";
      btnRow.style.marginTop = "6px";
      const makeButton = (text, opts = {}) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.style.flex = opts.full ? "1" : "1";
        btn.style.padding = "10px";
        btn.style.fontSize = "15px";
        btn.style.cursor = "pointer";
        btn.style.minWidth = "88px";
        btn.style.textAlign = "center";
        btn.style.background = opts.primary ? "#0d6efd" : "#e0e0e0";
        btn.style.color = opts.primary ? "#fff" : "#111";
        return btn;
      };
      if (type === "confirm") {
        const cancelBtn = makeButton("Cancel");
        const okBtn = makeButton("OK", { primary: true });
        cancelBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(false);
        };
        okBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(true);
        };
        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(okBtn);
      } else if (type === "prompt") {
        const cancelBtn = makeButton("Cancel");
        const okBtn = makeButton("OK", { primary: true });
        cancelBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(null);
        };
        okBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(inputEl ? inputEl.value : "");
        };
        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(okBtn);
      } else {
        const okBtn = makeButton("OK", { primary: true, full: true });
        okBtn.style.width = "100%";
        okBtn.onclick = () => {
          document.body.removeChild(overlay);
          resolve(true);
        };
        btnRow.appendChild(okBtn);
      }
      box.appendChild(btnRow);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      const keyHandler = (ev) => {
        if (ev.key === "Escape") {
          ev.preventDefault();
          try {
            document.body.removeChild(overlay);
          } catch (e) {}
          resolve(type === "prompt" ? null : false);
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          if (type === "prompt") {
            resolve(inputEl ? inputEl.value : "");
            try {
              document.body.removeChild(overlay);
            } catch (e) {}
          } else if (type === "confirm" || type === "alert") {
            resolve(true);
            try {
              document.body.removeChild(overlay);
            } catch (e) {}
          }
        }
      };
      overlay._handler = keyHandler;
      document.addEventListener("keydown", keyHandler);
      const observer = new MutationObserver(() => {
        if (!document.body.contains(overlay)) {
          try {
            document.removeEventListener("keydown", keyHandler);
          } catch (e) {}
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: false });
    } catch (err) {
      console.error("showDialog error", err);
      if (type === "prompt") {
        const res = window.prompt(message, defaultValue || "");
        resolve(res === null ? null : res);
      } else if (type === "confirm") {
        const ok = window.confirm(message);
        resolve(ok);
      } else {
        window.alert(message);
        resolve(true);
      }
    }
  });
}

// -------------------- Floating Stories --------------------
const storyToggle = document.getElementById("storyToggle");
const storyPanel = document.getElementById("storyPanel");
const storyToggleIcon = document.getElementById("storyToggleIcon");
const storiesContainer = storyPanel?.querySelector(".stories");
const goPaginationBtn = storyPanel?.querySelector(".go-pagination");

// Toggle panel and rotate icon
if (storyToggle && storyPanel && storyToggleIcon) {
  storyToggle.addEventListener("click", () => {
    const isOpen = storyPanel.classList.toggle("open");
    storyToggle.classList.toggle("open", isOpen); // rotation via CSS
  });
}

// Fill stories for current page
function renderStoriesForPage(pageItems) {
  if (!storiesContainer) return;
  storiesContainer.innerHTML = pageItems
    .map((m, idx) => {
      const rawTitle = (m.title || "").trim();
      const title = escapeHtml(rawTitle);
      const cover = escapeHtml(m.cover || "https://via.placeholder.com/80");

      const isLong = rawTitle.length > 14;
      const titleHtml = isLong
        ? `<span>${title}</span>` // داخل span برای انیمیشن
        : title;

      return `
      <div class="story" onclick="scrollToMovie(${idx})">
        <div class="story-circle">
          <img src="${cover}" alt="${title}">
        </div>
        <span class="story-title ${isLong ? "scrolling" : ""}" title="${title}">
          ${titleHtml}
        </span>
      </div>
    `;
    })
    .join("");
}

function updateMoviesSchemaStructuredData(allMovies) {
  try {
    const head =
      document.head || document.getElementsByTagName("head")[0];
    if (!head) return;

    // اسکریپت‌های قبلی این اسکیما را حذف کن تا تکراری نشود
    const oldScripts = head.querySelectorAll(
      'script[data-seo-movies-schema="1"]'
    );
    oldScripts.forEach((el) => el.remove());

    if (!Array.isArray(allMovies) || allMovies.length === 0) return;

    // برای جلوگیری از زیاد شدن حجم، مثلا حداکثر 50 فیلم
    const maxItems = 50;
    const items = allMovies.slice(0, maxItems);

    const schemaMovies = items
      .map((m) => {
        const title = (m.title || m.name || "").trim();
        const image = (m.cover || "").trim();
        const description = (m.synopsis || "").trim();
        const genres = (m.genre || "")
          .split(" ")
          .map((g) => g.trim())
          .filter(Boolean);

        // تلاش برای استخراج سال از release_info (مثلا: 2024، 2023 و ...)
        let year = "";
        if (m.release_info) {
          const match = String(m.release_info).match(/(19|20)\d{2}/);
          if (match) {
            year = match[0];
          }
        }

        const ratingVal = parseFloat(m.imdb || "");
        const hasRating = !Number.isNaN(ratingVal) && ratingVal > 0;

        // اگر حتی عنوان نداشته باشد، بی‌خیال این مورد می‌شویم
        if (!title) return null;

        const baseSchema = {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: title,
        };

        if (image) baseSchema.image = image;
        if (description) baseSchema.description = description;
        if (genres.length) baseSchema.genre = genres;
        if (year) baseSchema.datePublished = year;

        if (hasRating) {
          baseSchema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: ratingVal.toString(),
          };
        }

        return baseSchema;
      })
      .filter(Boolean);

    if (!schemaMovies.length) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-movies-schema", "1");
    script.textContent = JSON.stringify(schemaMovies);

    head.appendChild(script);
  } catch (err) {
    console.error("updateMoviesSchemaStructuredData error:", err);
  }
}

function initFeatureAccordions() {
  const accordions = document.querySelectorAll(".feature-accordion");
  if (!accordions.length) return;

  accordions.forEach((acc) => {
    const header = acc.querySelector(".feature-accordion-header");
    const body = acc.querySelector(".feature-accordion-body");

    // اگر ساختار ناقص باشد، رد شو
    if (!header || !body) return;

    // دسترسی بهتر برای div
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");

    const toggleAccordion = () => {
      const isOpen = acc.classList.contains("open");

      // بستن همه آکاردئون‌ها
      accordions.forEach((other) => {
        other.classList.remove("open");
      });

      // اگر قبلاً بسته بوده، الان باز شود
      if (!isOpen) {
        acc.classList.add("open");
      }
    };

    // کلیک با ماوس / لمس
    header.addEventListener("click", toggleAccordion);

    // پشتیبانی از Enter و Space برای div (جهت دسترسی‌پذیری بهتر)
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion();
      }
    });
  });
}
// Scroll to card
function scrollToMovie(index) {
  const cards = document.querySelectorAll(".movie-card");
  if (cards[index]) {
    cards[index].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Go to pagination + close panel
goPaginationBtn?.addEventListener("click", () => {
  // 1️⃣ اسکرول به pagination
  document.getElementById("pagination")?.scrollIntoView({ behavior: "smooth" });

  // 2️⃣ بستن پنل در صورت باز بودن
  if (storyPanel.classList.contains("open")) {
    storyPanel.classList.remove("open");
    storyToggle.classList.remove("open");
  }
});

// Helper to escape HTML
function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
  );
}

// -------------------- Comments --------------------
async function loadComments(movieId) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("movie_id", movieId)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) {
      console.error("Supabase select error (loadComments):", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in loadComments:", err);
    return [];
  }
}
function attachCommentsHandlers(card, movieId) {
  const avatarsEl = card.querySelector(".avatars");
  const countEl = card.querySelector(".comments-count");
  const enterBtn = card.querySelector(".enter-comments");
  const summaryRow = card.querySelector(".comment-summary");
  const panel = card.querySelector(".comments-panel");
  const closeBtn = card.querySelector(".comments-close");
  const commentsList = card.querySelector(".comments-list");
  const nameInput = card.querySelector(".comment-name");
  const textInput = card.querySelector(".comment-text");
  const sendBtn = card.querySelector(".comment-send");

  function renderComments(arr) {
    const latest = (arr || []).slice(-3).map((c) => c.name || "Guest");
    if (avatarsEl)
      avatarsEl.innerHTML = latest
        .map((n) => `<div class="avatar">${escapeHtml(initials(n))}</div>`)
        .join("");
    if (countEl) countEl.textContent = `${(arr || []).length} comments`;
    if (commentsList) {
      commentsList.innerHTML = (arr || [])
        .map(
          (c) => `
        <div class="comment-row">
          <div class="comment-avatar">${escapeHtml(initials(c.name))}</div>
          <div class="comment-body">
            <div class="comment-meta"><strong>${escapeHtml(
              c.name
            )}</strong> · <span class="comment-time">${timeAgo(
            c.created_at
          )}</span></div>
            <div class="comment-text-content">${escapeHtml(c.text)}</div>
          </div>
        </div>
      `
        )
        .join("");
      setTimeout(() => {
        commentsList.scrollTop = commentsList.scrollHeight;
      }, 60);
    }
  }
  async function refresh() {
    try {
      renderComments(await loadComments(movieId));
    } catch {
      renderComments([]);
    }
  }

  function openComments() {
    refresh();
    if (panel && !panel.classList.contains("open")) {
      // یک استیت برای بک‌باتن ثبت کن
      history.pushState({ overlay: "comments", movieId }, "");
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
    }
  }

  function closeComments() {
    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
  }

  enterBtn?.addEventListener("click", openComments);
  summaryRow?.addEventListener("click", openComments);
  closeBtn?.addEventListener("click", closeComments);

  sendBtn?.addEventListener("click", async () => {
    let name = (nameInput?.value || "Guest").trim() || "Guest";
    const text = (textInput?.value || "").trim();
    if (name.length > 16) {
      showToast("Your name must not exceed 15 characters");
      return;
    }
    if (!text) {
      showToast("Please type a comment");
      return;
    }
    sendBtn.disabled = true;
    const originalText = sendBtn.textContent;
    sendBtn.textContent = "Sending...";
    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          { movie_id: movieId, name, text, approved: false, published: false },
        ]);
      if (error) {
        console.error("Error inserting comment:", error);
        showToast(
          "Error saving comment: " + (error.message || JSON.stringify(error))
        );
      } else {
        if (nameInput) nameInput.value = "";
        if (textInput) textInput.value = "";
        await refresh();
        showToast(
          "Comment submitted and will be displayed after admin approval."
        );
      }
    } catch (err) {
      console.error("Insert comment exception:", err);
      showToast("Error saving comment: " + (err.message || String(err)));
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = originalText || "Send";
    }
  });
  refresh();
}

// -------------------- DOM Ready --------------------
document.addEventListener("DOMContentLoaded", () => {
  // Element references
  const themeToggle = document.getElementById("themeToggle");
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");

  const menuUsername = document.getElementById("menuUsername");
  const menuUserId = document.getElementById("menuUserId");

  const logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");

  const searchInput = document.getElementById("search");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderPagedMovies(true);
    });
  }

  const moviesGrid = document.getElementById("moviesGrid");
  const movieCount = document.getElementById("movieCount");
  const genreGrid = document.getElementById("genreGrid");
/**
   * اعمال هایلایت روی کارت‌های فیلم داخل moviesGrid
   * - query: متن جست‌وجو (همان چیزی که کاربر تایپ کرده یا با کلیک روی ژانر/پروداکت ست شده)
   */
  function applySearchHighlightsInGrid(query) {
  if (!moviesGrid) return;
  const root = moviesGrid;

  // 1) پاک کردن هایلایت‌های قبلی
  const oldMarks = root.querySelectorAll("mark.search-highlight");
  oldMarks.forEach((markEl) => {
    const textNode = document.createTextNode(markEl.textContent || "");
    const parent = markEl.parentNode;
    if (!parent) return;
    parent.replaceChild(textNode, markEl);
    parent.normalize();
  });

  const q = (query || "").trim();
  if (!q) return;

  const selectors = [
    ".movie-name",       // عنوان
    ".quote-text",       // synopsis
    ".genre-chip-mini",  // ژانر
    ".country-chip"      // Product / کشور
  ];

  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => {
      const raw = el.textContent;
      if (!raw) return;
      const html = makeHighlightHtml(raw, q);
      el.innerHTML = html;
    });
  });
}

  /* -------------------------------------------------------
     NEW FAVORITES + POST OPTIONS OVERLAYS (FULL DEFINITIONS)
     ------------------------------------------------------- */

  // Post options overlay
  const postOptionsOverlay = document.getElementById("postOptionsOverlay");
  const postOptionsModal = document.getElementById("postOptionsModal");
  const postOptionsTitle = document.getElementById("postOptionsTitle");
  const postOptionFavorite = document.getElementById("postOptionFavorite");
  const postOptionCopyLink = document.getElementById("postOptionCopyLink");
  const postOptionShareLink = document.getElementById("postOptionShareLink");
  const postOptionsCloseBtn = document.getElementById("postOptionsCloseBtn");

  // Favorites overlay
  const favoritesOverlay = document.getElementById("favoritesOverlay");
  const favoritesGrid = document.getElementById("favoritesGrid");
  const favoritesPageInfo = document.getElementById("favoritesPageInfo");
  const favoritesPrevBtn = document.getElementById("favoritesPrev");
  const favoritesNextBtn = document.getElementById("favoritesNext");
  const favoritesCloseBtn = document.getElementById("favoritesCloseBtn");

  const favoriteMoviesBtn = document.getElementById("favoriteMoviesBtn");
  // ===================== Post Options (card click) =====================

  function updatePostOptionsFavoriteUI(isFavorite) {
    if (!postOptionFavorite) return;
    const statusEl = postOptionFavorite.querySelector(".post-option-status");

    if (isFavorite) {
      postOptionFavorite.classList.add("favorite-active");
      if (statusEl) statusEl.textContent = "In favorites";
    } else {
      postOptionFavorite.classList.remove("favorite-active");
      if (statusEl) statusEl.textContent = "";
    }
  }

  function openPostOptions(movie) {
    if (!postOptionsOverlay || !movie) return;
    currentOptionsMovie = movie;

    if (postOptionsTitle) {
      postOptionsTitle.textContent =
        movie.title || movie.name || "Post options";
    }

    const isFavorite = favoriteMovieIds.has(movie.id);
    updatePostOptionsFavoriteUI(isFavorite);

    postOptionsOverlay.classList.add("open");
    postOptionsOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll", "post-options-open");

    // برای Back button
    history.pushState({ overlay: "postOptions", movieId: movie.id }, "");
  }

  function closePostOptions() {
    if (!postOptionsOverlay) return;
    postOptionsOverlay.classList.remove("open");
    postOptionsOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll", "post-options-open");
    currentOptionsMovie = null;
  }

  async function toggleFavoriteForCurrentMovie() {
    if (!currentOptionsMovie) return;

    await loadAuthState();
    if (!currentUser) {
      showToast("برای افزودن به لیست علاقه‌مندی باید لاگین کنید", "error");
      const authModal = document.getElementById("authModal");
      if (authModal) authModal.style.display = "flex";
      return;
    }

    const movieId = currentOptionsMovie.id;
    const isFavorite = favoriteMovieIds.has(movieId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("movie_id", movieId);

        if (error) throw error;

        favoriteMovieIds.delete(movieId);
        favoritesRaw = (favoritesRaw || []).filter(
          (f) => f.movie_id !== movieId
        );
        updatePostOptionsFavoriteUI(false);
        showToast("Removed from favorites ✅", "success");
      } else {
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: currentUser.id,
            movie_id: movieId,
          },
        ]);

        if (error) throw error;

        favoriteMovieIds.add(movieId);
        favoritesRaw = [
          { movie_id: movieId, created_at: new Date().toISOString() },
          ...(favoritesRaw || []),
        ];
        updatePostOptionsFavoriteUI(true);
        showToast("Added to favorites ✅", "success");
      }
    } catch (err) {
      console.error("toggleFavoriteForCurrentMovie error:", err);
      showToast("خطا در به‌روزرسانی لیست علاقه‌مندی ❌", "error");
    }
  }

  async function copyCurrentMovieLink() {
    if (!currentOptionsMovie) return;
    const t = (
      currentOptionsMovie.title ||
      currentOptionsMovie.name ||
      ""
    ).trim();
    if (!t) {
      showToast("عنوان فیلم یافت نشد ❌", "error");
      return;
    }

    const slug = makeMovieSlug(t);
    if (!slug) {
      showToast("نمی‌توان slug مناسب ساخت ❌", "error");
      return;
    }

    const origin =
      (window.location && window.location.origin) || "https://filmchiin.ir";
    const url = origin.replace(/\/+$/, "") + "/movie/" + slug;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      showToast("Post link copied ✅", "success");
    } catch (err) {
      console.error("copyCurrentMovieLink error:", err);
      showToast("خطا در کپی کردن لینک ❌", "error");
    }
  }

  async function shareCurrentMovieLink() {
    if (!currentOptionsMovie) return;

    const t = (
      currentOptionsMovie.title ||
      currentOptionsMovie.name ||
      ""
    ).trim();
    if (!t) {
      showToast("عنوان فیلم یافت نشد ❌", "error");
      return;
    }

    const slug = makeMovieSlug(t);
    if (!slug) {
      showToast("نمی‌توان slug مناسب ساخت ❌", "error");
      return;
    }

    const origin =
      (window.location && window.location.origin) || "https://filmchiin.ir";
    const url = origin.replace(/\/+$/, "") + "/movie/" + slug;

    // Web Share API (مخصوص موبایل/مرورگرهایی که پشتیبانی می‌کنند)
    if (navigator.share) {
      try {
        await navigator.share({
          title: t,
          text: t,
          url,
        });
        showToast("Link shared ✅", "success");
      } catch (err) {
        // اگر کاربر خودِ share را کنسل کرد، خطا مهم نیست
        if (!err || err.name !== "AbortError") {
          console.error("shareCurrentMovieLink error:", err);
          showToast("خطا در اشتراک‌گذاری لینک ❌", "error");
        }
      }
    } else {
      // fallback: فقط لینک را کپی می‌کنیم
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const tmp = document.createElement("textarea");
          tmp.value = url;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          document.body.removeChild(tmp);
        }
        showToast("Post link copied ✅", "success");
      } catch (err) {
        console.error("shareCurrentMovieLink fallback error:", err);
        showToast("خطا در کپی کردن لینک ❌", "error");
      }
    }
  }

  // اتصال دکمه‌ها و کلیک بیرون
  postOptionFavorite?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteForCurrentMovie();
  });

  postOptionCopyLink?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyCurrentMovieLink();
  });

  postOptionShareLink?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    shareCurrentMovieLink();
  });

  postOptionsCloseBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePostOptions();
  });

  postOptionsOverlay?.addEventListener("click", (e) => {
    if (
      e.target === postOptionsOverlay ||
      e.target.classList.contains("post-options-backdrop")
    ) {
      closePostOptions();
    }
  });

  // ===================== Favorite Movies Overlay =====================

  function buildFavoritesWithMovies() {
    if (!Array.isArray(favoritesRaw)) return [];
    return favoritesRaw
      .map((fav) => {
        const movie = (movies || []).find((m) => m.id === fav.movie_id);
        if (!movie) return null;
        return { fav, movie };
      })
      .filter(Boolean);
  }

  function renderFavoritesGrid() {
    if (!favoritesGrid) return;

    const items = buildFavoritesWithMovies();
    if (!items.length) {
      favoritesGrid.innerHTML =
        '<div class="favorites-empty">No favorite movies yet.</div>';
      if (favoritesPageInfo) favoritesPageInfo.textContent = "0 / 0";
      return;
    }

    const totalPages = Math.max(
      1,
      Math.ceil(items.length / FAVORITES_PAGE_SIZE)
    );
    if (favoritesPage < 1) favoritesPage = 1;
    if (favoritesPage > totalPages) favoritesPage = totalPages;

    const start = (favoritesPage - 1) * FAVORITES_PAGE_SIZE;
    const slice = items.slice(start, start + FAVORITES_PAGE_SIZE);

    favoritesGrid.innerHTML = slice
      .map(({ movie }) => {
        const cover = escapeHtml(
          movie.cover || "https://via.placeholder.com/300x200?text=No+Image"
        );
        const title = escapeHtml(movie.title || movie.name || "-");
        const imdb = escapeHtml(movie.imdb || "");
        const release = escapeHtml(movie.release_info || "");

        return `
          <div class="favorite-item">
            <img src="${cover}" alt="${title}" class="favorite-cover" loading="lazy" />
            <div class="favorite-title" dir="auto">${title}</div>
            <div class="favorite-meta"></div>
            <div class="favorite-actions">
              <div class="button-wrap">
                <button
                  class="favorite-goto-btn"
                  data-movie-id="${movie.id}"
                  type="button"
                >
                  <span>Go to post</span>
                </button>
                <div class="button-shadow"></div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    if (favoritesPageInfo) {
      favoritesPageInfo.textContent = `${favoritesPage} / ${totalPages}`;
    }

    if (favoritesPrevBtn) favoritesPrevBtn.disabled = favoritesPage <= 1;
    if (favoritesNextBtn)
      favoritesNextBtn.disabled = favoritesPage >= totalPages;

    // اتصال Go to post
    favoritesGrid.querySelectorAll(".favorite-goto-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const movieId = btn.dataset.movieId;
        if (movieId) {
          navigateToMovieFromFavorites(movieId);
        }
      });
    });
  }

  async function openFavoritesOverlayUI() {
    await loadAuthState();
    if (!currentUser) {
      showToast("برای مشاهده لیست علاقه‌مندی باید لاگین کنید", "error");
      const authModal = document.getElementById("authModal");
      if (authModal) authModal.style.display = "flex";
      return;
    }

    if (!favoritesLoaded) {
      await loadFavoritesForCurrentUser();
    }

    favoritesPage = 1;
    renderFavoritesGrid();

    if (!favoritesOverlay) return;

    favoritesOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    // برای Back button
    history.pushState({ overlay: "favorites" }, "");
  }

  function closeFavoritesOverlay() {
    if (!favoritesOverlay) return;
    favoritesOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  // ناوبری از Favorite به کارت پست
  async function navigateToMovieFromFavorites(movieId) {
    try {
      closeFavoritesOverlay();

      // اگر movies خالی است، صبر کنیم تا لود شود
      if (!Array.isArray(movies) || !movies.length) {
        await fetchMovies();
      }

      const q = (searchInput?.value || "").toLowerCase();

      // کپی از منطق فیلتر در renderPagedMovies
      let filtered = movies.filter((m) => {
        const movieMatch = Object.values(m).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(q)
        );

        let episodeMatch = false;
        if (!movieMatch && (m.type === "collection" || m.type === "serial")) {
          const eps = episodesByMovie.get(m.id) || [];
          for (let idx = 0; idx < eps.length; idx++) {
            const ep = eps[idx];
            if (
              Object.values(ep).some(
                (val) =>
                  typeof val === "string" && val.toLowerCase().includes(q)
              )
            ) {
              episodeMatch = true;
              break;
            }
          }
        }

        return movieMatch || episodeMatch;
      });

      if (currentTypeFilter !== "all") {
        filtered = filtered.filter((m) => {
          const t = (m.type || "").toLowerCase();
          if (currentTypeFilter === "series") {
            return t === "serial";
          }
          return t === currentTypeFilter;
        });
      }

      if (currentTabGenre) {
        filtered = filtered.filter((m) => {
          return (m.genre || "").split(" ").includes(currentTabGenre);
        });
      }

      if (imdbMinRating !== null) {
        filtered = filtered.filter((m) => {
          const val = parseFloat(m.imdb || "0");
          return val >= imdbMinRating;
        });
      }

      const index = filtered.findIndex((m) => m.id === movieId);
      if (index === -1) {
        showToast("این فیلم در لیست فعلی پیدا نشد", "error");
        return;
      }

      const totalPages = computeTotalPages(filtered.length);
      const targetPage = Math.floor(index / PAGE_SIZE) + 1;
      currentPage = Math.min(Math.max(targetPage, 1), totalPages);

      await renderPagedMovies(true);

      const card = document.querySelector(
        `.movie-card[data-movie-id="${movieId}"]`
      );
      if (card) {
        card.classList.add("highlight-favorite");
        card.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          card.classList.remove("highlight-favorite");
        }, 1500);
      }
    } catch (err) {
      console.error("navigateToMovieFromFavorites error:", err);
    }
  }

  // اتصال دکمه‌ها
  favoriteMoviesBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // بستن حباب پروفایل
    profileMenu?.classList.add("hidden");
    openFavoritesOverlayUI();
  });

  favoritesCloseBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeFavoritesOverlay();
  });

  favoritesPrevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (favoritesPage > 1) {
      favoritesPage--;
      renderFavoritesGrid();
    }
  });

  favoritesNextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    favoritesPage++;
    renderFavoritesGrid();
  });

  const adminMessagesContainer = document.getElementById("adminMessages");
  const paginationContainer = document.getElementById("pagination");

  const addMovieForm = document.getElementById("addMovieForm");
  const movieList = document.getElementById("movieList");

  const addMessageForm = document.getElementById("addMessageForm");
  const messageList = document.getElementById("messageList");
  const adminSearch = document.getElementById("adminSearch");

  // ===== Theme switch + Background Blur =====

  const themeSwitchCheckbox = document.getElementById("themeSwitchCheckbox");

  function applyThemeSmooth(dark) {
    const bg = document.getElementById("siteBgBlur");
    if (bg) {
      bg.style.opacity = 0; // برای تقویت ترنزیشن
      setTimeout(() => {
        // فقط کافی است کلاس body عوض شود → CSS خودش تصویر را ست می‌کند
        bg.style.opacity = 1;
      }, 10);
    }
    setTimeout(() => {
      if (dark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, 70);
  }

  // تغییر با سوییچر
  if (themeSwitchCheckbox) {
    themeSwitchCheckbox.addEventListener("change", (e) => {
      applyThemeSmooth(e.target.checked);
    });
  }

  // مقدار ذخیره‌شده
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") themeSwitchCheckbox.checked = true;

  applyThemeSmooth(savedTheme === "dark");
  // Side menu
  if (menuBtn && sideMenu && menuOverlay) {
    const openMenu = () => {
      sideMenu.classList.add("active");
      menuOverlay.classList.add("active");
      document.body.classList.add("no-scroll", "menu-open");
    };
    const closeMenu = () => {
      sideMenu.classList.remove("active");
      menuOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll", "menu-open");
      closeChatOverlay();
    };
    menuBtn.addEventListener("click", openMenu);
    menuOverlay.addEventListener("click", closeMenu);
    document.addEventListener("click", (e) => {
      if (!sideMenu.classList.contains("active")) return;
      const clickedInsideMenu = sideMenu.contains(e.target);
      const clickedMenuBtn = menuBtn.contains(e.target);
      if (!clickedInsideMenu && !clickedMenuBtn) closeMenu();
    });
  }

  // Fetch data

  async function fetchMovies() {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("fetch movies error", error);
        movies = [];
      } else {
        movies = data || [];
      }

      // دریافت اپیزودها
      await fetchEpisodes();

      // صفحه فعلی را از URL بخوان
      currentPage = getPageFromUrl();

      // رندر فیلم‌ها در صفحه
      await renderPagedMovies(); // note: await for inner supabase calls in bundles

      // 🔹 مهم‌ترین بخش: اگر لینک مستقیم فیلم باشد، مودال را باز کن
      if (typeof handleDeepLinkMovieOpen === "function") {
        handleDeepLinkMovieOpen();
      }

      // ساخت گرید ژانر
      buildGenreGrid();

      // اگر در صفحه ادمین هستیم، لیست محدود رندر کن
      if (document.getElementById("movieList")) {
        renderAdminMovieList(movies.slice(0, 10));
      }
    } catch (err) {
      console.error("fetchMovies catch", err);
      movies = [];
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("id", { ascending: false });
      if (error) {
        console.error("fetch messages error", error);
        messages = [];
      } else {
        messages = data || [];
      }
      renderMessages();
      if (document.getElementById("messageList")) renderAdminMessages();
    } catch (err) {
      console.error(err);
      messages = [];
    }
  }
  async function fetchEpisodes() {
    try {
      const { data, error } = await supabase
        .from("movie_items")
        .select("*")
        .order("movie_id", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) {
        console.error("fetch episodes error", error);
        episodesByMovie.clear();
        return;
      }

      // ساخت کش: movie_id → episodes[]
      episodesByMovie.clear();
      (data || []).forEach((ep) => {
        const list = episodesByMovie.get(ep.movie_id) || [];
        list.push(ep);
        episodesByMovie.set(ep.movie_id, list);
      });
    } catch (err) {
      console.error("fetchEpisodes catch", err);
      episodesByMovie.clear();
    }
  }

  // Messages UI
  function markMessageAsRead(id) {
    let readIds = JSON.parse(localStorage.getItem("readMessages") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("readMessages", JSON.stringify(readIds));
    }
  }

  function isMessageRead(id) {
    let readIds = JSON.parse(localStorage.getItem("readMessages") || "[]");
    return readIds.includes(id);
  }
  function renderMessages() {
    if (!adminMessagesContainer) return;
    adminMessagesContainer.innerHTML = "";
    (messages || []).forEach((m) => {
      if (isMessageRead(m.id)) return;

      const div = document.createElement("div");
      div.className = "message-bubble";
      div.innerHTML = `
      <div class="msg-header">
        <div class="msg-avatar-wrapper">
          <img class="msg-avatar" src="/images/Admin-logo.png" alt="admin">
          <img class="msg-icon" src="/images/icons8-message.apng" alt="msg-icon">
        </div>
        <div class="msg-meta">
          <span class="msg-title">Admin</span>
          <span class="msg-time">now</span>
        </div>
      </div>
      <div class="msg-body">${escapeHtml(m.text)}</div>
      <div class="button-wrap">
      <button class="msg-close" aria-label="close message"><span>Mark as Read</span></button><div class="button-shadow"></div></div>
    `;
      div.querySelector(".msg-close").addEventListener("click", () => {
        markMessageAsRead(m.id); // 👈 ذخیره در localStorage
        div.remove();
      });
      adminMessagesContainer.appendChild(div);
    });
  }
  // Genre grid
  function buildGenreGrid() {
    if (!genreGrid) return;
    const genreSet = new Set();
    (movies || []).forEach((m) => {
      if (m.genre)
        m.genre.split(" ").forEach((g) => {
          if (g.trim() !== "") genreSet.add(g);
        });
    });
    genreGrid.innerHTML = "";
    [...genreSet].sort().forEach((g) => {
      const div = document.createElement("div");
      div.className = "genre-chip";
      div.textContent = g;

      // 👇 این خط اضافه شد
      div.setAttribute("dir", "auto");

      div.onclick = () => {
        if (searchInput) {
          searchInput.value = g;
          searchInput.setAttribute("dir", "auto"); // 👈 برای سرچ هم درست نمایش داده بشه
        }
        currentPage = 1;
        renderPagedMovies();
        document.getElementById("sideMenu")?.classList.remove("active");
        document.getElementById("menuOverlay")?.classList.remove("active");
        document.body.classList.remove("no-scroll", "menu-open");
      };
      genreGrid.appendChild(div);
    });
  }

  const genreToggle = document.getElementById("genreToggle");
  const genreSubmenu = document.getElementById("genreSubmenu");
  if (genreToggle && genreSubmenu) {
    genreToggle.addEventListener("click", () => {
      const isOpen = genreSubmenu.style.display === "block";
      genreSubmenu.style.display = isOpen ? "none" : "block";
    });
    document.getElementById("sideMenu")?.addEventListener("click", (e) => {
      const clickedInside =
        genreSubmenu.contains(e.target) || genreToggle.contains(e.target);
      if (!clickedInside) genreSubmenu.style.display = "none";
    });
  }

  // Pagination helpers
  function computeTotalPages(length) {
    return Math.max(1, Math.ceil((length || 0) / PAGE_SIZE));
  }
  function renderPagination(filteredLength) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = "";
    const total = computeTotalPages(filteredLength);
    if (total <= 1) return;
    const createBubble = (label, page, isActive = false) => {
      if (page === "dots") {
        const span = document.createElement("span");
        span.className = "page-bubble dots";
        span.textContent = "...";
        return span;
      }

      const a = document.createElement("a");
      a.className = "page-bubble" + (isActive ? " active" : "");
      a.textContent = label;
      a.href = `?page=${page}`;

      a.addEventListener("click", (e) => {
        // اجازه بده تب جدید / میان‌کلیک رفتار خودش رو داشته باشه
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
          return;
        }

        e.preventDefault();

        const targetPage = Number(page);
        if (!Number.isFinite(targetPage)) return;

        // 🔹 ساختن یک history state جدید برای این صفحه
        try {
          const url = new URL(window.location.href);
          if (targetPage <= 1) {
            // صفحه ۱ → پارامتر page پاک شود تا URL تمیز بماند
            url.searchParams.delete("page");
          } else {
            url.searchParams.set("page", String(targetPage));
          }
          window.history.pushState({}, "", url);
        } catch (err) {
          console.warn("pagination pushState error:", err);
        }

        // ست کردن صفحه فعلی و رندر
        currentPage = targetPage;
        renderPagedMovies(true);

        // اسکرول نرم به بالای لیست
        const cont = document.querySelector(".container");
        window.scrollTo({
          top: (cont?.offsetTop || 0) - 8,
          behavior: "smooth",
        });
      });

      return a;
    };

    if (total <= 9) {
      for (let i = 1; i <= total; i++)
        paginationContainer.appendChild(createBubble(i, i, i === currentPage));
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 9; i++)
          paginationContainer.appendChild(
            createBubble(i, i, i === currentPage)
          );
        paginationContainer.appendChild(createBubble("...", "dots"));
      } else if (currentPage >= total - 4) {
        paginationContainer.appendChild(createBubble("...", "dots"));
        for (let i = total - 8; i <= total; i++)
          paginationContainer.appendChild(
            createBubble(i, i, i === currentPage)
          );
      } else {
        paginationContainer.appendChild(createBubble("...", "dots"));
        for (let i = currentPage - 3; i <= currentPage + 4; i++)
          paginationContainer.appendChild(
            createBubble(i, i, i === currentPage)
          );
        paginationContainer.appendChild(createBubble("...", "dots"));
      }
    }
  }

  // Search live
  if (searchInput) {
    // وقتی کاربر تایپ می‌کنه → لیست فیلم‌ها فیلتر بشه
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderPagedMovies();
    });
    // قرار بده نزدیک ابتدای اسکریپت
    const imdbSlider =
      document.getElementById("ratingTrack") ||
      document.getElementById("ratingKnob");
    // === IMDb Slider Logic ===
    if (imdbSlider) {
      imdbSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        imdbValueBubble.textContent = `Rating > ${val}`;
        imdbMinRating = parseFloat(val);
lastFilterPriority = "imdb";
updateImdbFilterBadge();

currentPage = 1;
renderPagedMovies(true);

        // این فیلتر آخرین فیلتر فعال شده است
        lastFilterPriority = "imdb";

        // با هر تغییر ریتینگ از صفحه اول رندر شود
        currentPage = 1;
        renderPagedMovies(true);
      });
    }
    

    // وقتی کاربر سرچ رو نهایی کرد (خروج از فیلد)
    searchInput.addEventListener("change", async (e) => {
      const q = e.target.value.trim();
      if (!q) return;
      try {
        await supabase.from("search_logs").insert([{ query: q }]);
      } catch (err) {
        console.error("search log error:", err);
      }
    });

    // وقتی کاربر Enter زد
    searchInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const q = searchInput.value.trim();
        if (!q) return;
        try {
          await supabase.from("search_logs").insert([{ query: q }]);
        } catch (err) {
          console.error("search log error:", err);
        }
      }
    });
  }

  const searchCloseBtn = document.getElementById("searchCloseBtn");

  if (searchInput && profileBtn && searchCloseBtn) {
    const toggleSearchDecor = () => {
      const hasText = searchInput.value.trim() !== "";
      profileBtn.style.display = hasText ? "none" : "flex";
      searchCloseBtn.style.display = hasText ? "flex" : "none";
    };

    toggleSearchDecor();
    searchInput.addEventListener("input", toggleSearchDecor);

    searchCloseBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  // --------------------
  // Type filter tabs (FINAL — FIXED VERSION)
  // --------------------

  let currentTypeFilter = "all";

  /* =============== GET TAB FROM URL =============== */
  function getTabFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    const valid = ["all", "collection", "series", "single"];
    return valid.includes(tab) ? tab : "all";
  }

  /* =============== GET PAGE FROM URL =============== */
  function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }

  /* =============== SET TAB IN URL =============== */
  function setTabInUrl(type) {
    const url = new URL(location.href);

    if (type === "all") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", type);
    }

    history.pushState({}, "", url);
  }

  /* =============== UPDATE COUNTS =============== */
  function updateTypeCounts() {
    if (!Array.isArray(movies)) return;

    const all = movies.length;
    const collections = movies.filter(
      (m) => (m.type || "").toLowerCase() === "collection"
    ).length;
    const serials = movies.filter(
      (m) => (m.type || "").toLowerCase() === "serial"
    ).length;
    const singles = movies.filter(
      (m) => (m.type || "").toLowerCase() === "single"
    ).length;

    const allEl = document.querySelector('[data-type="all"] .count');
    const collectionEl = document.querySelector(
      '[data-type="collection"] .count'
    );
    const seriesEl = document.querySelector('[data-type="series"] .count');
    const singleEl = document.querySelector('[data-type="single"] .count');

    if (allEl) allEl.textContent = all;
    if (collectionEl) collectionEl.textContent = collections;
    if (seriesEl) seriesEl.textContent = serials;
    if (singleEl) singleEl.textContent = singles;

    setTimeout(moveTabIndicator, 50);
  }

  /* =============== FILTER MOVIES BY TYPE =============== */
  function filterByType(type) {
    currentTypeFilter = type;
    currentPage = 1;
    renderPagedMovies();
    setTimeout(moveTabIndicator, 60);
  }

  /* =============== ACTIVATE TAB IN UI =============== */
  function applyActiveTab(type) {
    document
      .querySelectorAll(".tab-link")
      .forEach((link) => link.classList.remove("active"));

    const activeLink = document.querySelector(`.tab-link[data-type="${type}"]`);
    if (activeLink) activeLink.classList.add("active");

    moveTabIndicator();
  }

  /* =============== INDICATOR SLIDE FIXED VERSION =============== */
  function moveTabIndicator() {
    const active = document.querySelector(".tab-link.active");
    const indicator = document.querySelector(".tab-indicator");
    const wrapper = document.querySelector(".tabs-container");

    if (!active || !indicator || !wrapper) return;

    const FIX = 4;

    const width = active.offsetWidth - FIX;
    const left = active.offsetLeft + FIX / 2;

    indicator.style.width = width + "px";
    indicator.style.left = left + "px";
    indicator.style.transform = "translateX(0)";
  }

  /* =============== CLICK HANDLER =============== */
  document.querySelectorAll(".tab-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const type = link.dataset.type;

      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
        return;
      }

      e.preventDefault();

      if (typeof searchInput !== "undefined" && searchInput) {
        searchInput.value = "";
      }

      currentTabGenre = null;
      document
        .querySelectorAll(".tab-genres-list .genre-chip.active")
        .forEach((ch) => ch.classList.remove("active"));

      applyActiveTab(type);
      updateDynamicTitle();
      setTabInUrl(type);

      filterByType(type);
    });
  });

  /* =============== INITIAL LOAD =============== */
  (function initTabs() {
    const type = getTabFromUrl();
    currentTypeFilter = type;
    applyActiveTab(type);
  })();

  window.addEventListener("load", () => {
    setTimeout(moveTabIndicator, 80);
  });

  /* =============== BACK/FORWARD SUPPORT =============== */
  window.addEventListener("popstate", () => {
    const typeFromUrl = getTabFromUrl();
    currentTypeFilter = typeFromUrl;
    applyActiveTab(typeFromUrl);

    currentPage = getPageFromUrl();

    renderPagedMovies(true);
  });

  // -------------------- تشخیص جهت اسکرول --------------------

  let lastScrollY = window.scrollY;
  let scrollDirection = "down";

  window.addEventListener("scroll", () => {
    scrollDirection = window.scrollY > lastScrollY ? "down" : "up";
    lastScrollY = window.scrollY;
  });

  const observerOptions = {
    threshold: [0, 0.01, 0.1, 0.5],
    rootMargin: "0px 0px 0px 0px",
  };

  function animCallback(entries) {
    entries.forEach((entry) => {
      const el = entry.target;
      const r = entry.intersectionRatio;
      // initialize previousY if missing
      if (!el.dataset.prevY) el.dataset.prevY = entry.boundingClientRect.top;
      const prevY = parseFloat(el.dataset.prevY);
      const curY = entry.boundingClientRect.top;
      const direction = curY < prevY ? "down" : "up";
      el.dataset.prevY = curY;

      // current state: hidden / visible
      const state = el.dataset.animState || "hidden";

      // Hysteresis: only add visible state when ratio is comfortably above threshold
      if (r > 0 && state !== "visible") {
        // choose class based on direction when the element became visible
        if (direction === "down") {
          el.classList.add("active-down");
          el.classList.remove("active-up");
        } else {
          el.classList.add("active-up");
          el.classList.remove("active-down");
        }
        el.dataset.animState = "visible";
      }

      // Only remove visible state when ratio falls well below threshold
      if (r <= 0.08 && state === "visible") {
        el.classList.remove("active-down", "active-up");
        el.dataset.animState = "hidden";
      }
    });
  }

  function cardCallback(entries) {
    entries.forEach((entry) => {
      const el = entry.target;
      const r = entry.intersectionRatio;
      if (!el.dataset.prevY) el.dataset.prevY = entry.boundingClientRect.top;
      const prevY = parseFloat(el.dataset.prevY);
      const curY = entry.boundingClientRect.top;
      const direction = curY < prevY ? "down" : "up";
      el.dataset.prevY = curY;

      const state = el.dataset.cardState || "hidden";

      if (r > 0 && state !== "visible") {
        if (direction === "down") {
          el.classList.add("active-down");
          el.classList.remove("active-up");
        } else {
          el.classList.add("active-up");
          el.classList.remove("active-down");
        }
        el.dataset.cardState = "visible";
      }

      if (r <= 0.05 && state === "visible") {
        el.classList.remove("active-down", "active-up");
        el.dataset.cardState = "hidden";
      }
    });
  }

  const animObserver = new IntersectionObserver(animCallback, observerOptions);
  const cardObserver = new IntersectionObserver(cardCallback, observerOptions);

  // -------------------- Render movies (paged) --------------------
  // متغیر سراسری برای ژانر انتخاب‌شده
  let currentTabGenre = null;

  function buildTabGenres(filteredMovies = null) {
    const container = document.querySelector(".tab-genres-list");
    if (!container) return;

    let baseMovies;
    if (
      searchInput &&
      searchInput.value.trim() !== "" &&
      Array.isArray(filteredMovies)
    ) {
      baseMovies = filteredMovies;
    } else {
      // در غیر این صورت → از کل movies بر اساس تب فعال
      baseMovies = movies;
      if (currentTypeFilter === "collection") {
        baseMovies = movies.filter(
          (m) => (m.type || "").toLowerCase() === "collection"
        );
      } else if (currentTypeFilter === "series") {
        baseMovies = movies.filter(
          (m) => (m.type || "").toLowerCase() === "serial"
        );
      } else if (currentTypeFilter === "single") {
        baseMovies = movies.filter(
          (m) => (m.type || "").toLowerCase() === "single"
        );
      }
    }

    // 🔹 شرط IMDb اضافه شد
    if (imdbMinRating !== null) {
      baseMovies = baseMovies.filter((m) => {
        const val = parseFloat(m.imdb || "0");
        return val >= imdbMinRating;
      });
    }

    // شمارش ژانرها
    const genreCounts = {};
    baseMovies.forEach((m) => {
      if (m.genre) {
        m.genre.split(" ").forEach((g) => {
          const genre = g.trim();
          if (genre !== "") {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          }
        });
      }
    });

    // تبدیل به آرایه
    const genres = Object.entries(genreCounts);

    const englishGenres = genres.filter(([g]) => {
      const clean = g.startsWith("#") ? g.slice(1) : g;
      return /^[A-Za-z]/.test(clean);
    });
    const persianGenres = genres.filter(([g]) => {
      const clean = g.startsWith("#") ? g.slice(1) : g;
      return !/^[A-Za-z]/.test(clean);
    });

    englishGenres.sort((a, b) => b[1] - a[1]);
    persianGenres.sort((a, b) => b[1] - a[1]);

    const finalGenres = [...englishGenres, ...persianGenres];

    // ساخت ژانرها
    container.innerHTML = "";
    finalGenres.forEach(([g, count]) => {
      const chip = document.createElement("div");
      chip.className = "genre-chip";
      chip.textContent = g;

      chip.setAttribute("dir", "auto");

      if (currentTabGenre === g) {
        chip.classList.add("active");
      }

      const countSpan = document.createElement("span");
      countSpan.className = "count";
      countSpan.textContent = count;
      chip.appendChild(countSpan);

      chip.onclick = () => {
        if (currentTabGenre === g) {
          chip.classList.remove("active");
          currentTabGenre = null;
        } else {
          container
            .querySelectorAll(".genre-chip")
            .forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          currentTabGenre = g;
        }
        currentPage = 1;
        renderPagedMovies();
      };

      container.appendChild(chip);
    });
  }

  const episodeMatches = new Map();
  function renderChips(str) {
    if (!str || str === "-") return "-";
    return str
      .split(" ")
      .filter((g) => g.trim())
      .map((g) => {
        if (g.startsWith("#")) {
          const clean = escapeHtml(g);
          return `<span class="genre-chip-mini" dir="auto" onclick="(function(){
          const searchEl=document.getElementById('search');
          searchEl.value='${clean}';
          searchEl.dispatchEvent(new Event('input'));
        })();">${clean}</span>`;
        } else {
          const clean = escapeHtml(g);
          return `<a href="#" dir="auto" onclick="(function(){
          const searchEl=document.getElementById('search');
          searchEl.value='${clean}';
          searchEl.dispatchEvent(new Event('input'));
        })();">${clean}</a>`;
        }
      })
      .join(" ");
  }
  async function renderPagedMovies(skipScroll) {
  if (!moviesGrid || !movieCount) return;

  // مقدار خام برای جست‌وجو (برای هایلایت)
  const searchTerm = (searchInput?.value || "").trim();
  // مقدار lowercase برای فیلتر کردن
  const q = searchTerm.toLowerCase();

  // هر بار سرچ جدید انجام میشه، مقادیر قبلی پاک بشن
  episodeMatches.clear();

  // 1. فیلتر سرچ
  let filtered = movies.filter((m) => {
    const movieMatch = Object.values(m).some(
      (val) => typeof val === "string" && val.toLowerCase().includes(q)
    );

    let episodeMatch = false;
    if (!movieMatch && (m.type === "collection" || m.type === "serial")) {
      const eps = episodesByMovie.get(m.id) || [];
      for (let idx = 0; idx < eps.length; idx++) {
        const ep = eps[idx];
        if (
          Object.values(ep).some(
            (val) => typeof val === "string" && val.toLowerCase().includes(q)
          )
        ) {
          episodeMatches.set(m.id, idx + 1);
          episodeMatch = true;
          break;
        }
      }
    } else if (movieMatch) {
      episodeMatches.delete(m.id);
    }

    return movieMatch || episodeMatch;
  });

  // 2. فیلتر نوع
  if (currentTypeFilter !== "all") {
    filtered = filtered.filter((m) => {
      const t = (m.type || "").toLowerCase();
      if (currentTypeFilter === "series") {
        return t === "serial";
      }
      return t === currentTypeFilter;
    });
  }
// 3. فیلتر ژانر
  if (currentTabGenre) {
    filtered = filtered.filter((m) => {
      return (m.genre || "").split(" ").includes(currentTabGenre);
    });
  }

  // 4. فیلتر IMDb
  if (imdbMinRating !== null) {
    filtered = filtered.filter((m) => {
      const val = parseFloat(m.imdb || "0");
      return val >= imdbMinRating;
    });
  }

  // 5. فیلتر سال انتشار (Year >= yearMinFilter)
  if (typeof yearMinFilter === "number") {
    filtered = filtered.filter((m) => {
      const info = parseReleaseFromString(m.release_info || m.release || "");
      if (!info) return false;
      return info.year >= yearMinFilter;
    });
  }

  // 6. سورت نهایی بر اساس اولویت آخرین فیلتر
  if (imdbMinRating !== null || typeof yearMinFilter === "number") {
    filtered = filtered.slice(); // کپی برای سورت امن

    filtered.sort((a, b) => {
      const aRelease = parseReleaseFromString(a.release_info || a.release || "");
      const bRelease = parseReleaseFromString(b.release_info || b.release || "");

      const aYear = aRelease?.year ?? 0;
      const bYear = bRelease?.year ?? 0;
      const aTs = aRelease?.ts ?? 0;
      const bTs = bRelease?.ts ?? 0;

      const aImdb = parseFloat(a.imdb || "0") || 0;
      const bImdb = parseFloat(b.imdb || "0") || 0;

      // اگر هر دو فیلتر فعال‌اند و اولویت مشخص است
      if (lastFilterPriority === "year" && typeof yearMinFilter === "number" && imdbMinRating !== null) {
        // اول سال/تاریخ صعودی, بعد IMDb نزولی
        if (aYear !== bYear) return aYear - bYear;
        if (aTs !== bTs) return aTs - bTs;
        return bImdb - aImdb;
      }

      if (lastFilterPriority === "imdb" && imdbMinRating !== null && typeof yearMinFilter === "number") {
        // اول IMDb نزولی, بعد سال/تاریخ صعودی
        if (aImdb !== bImdb) return bImdb - aImdb;
        if (aYear !== bYear) return aYear - bYear;
        return aTs - bTs;
      }

      // فقط سال فعال است
      if (typeof yearMinFilter === "number" && imdbMinRating === null) {
        if (aYear !== bYear) return aYear - bYear;
        return aTs - bTs;
      }

      // فقط IMDb فعال است
      if (imdbMinRating !== null && typeof yearMinFilter !== "number") {
        if (aImdb !== bImdb) return bImdb - aImdb;
        return 0;
      }

      return 0;
    });
  }

  if (typeof updateTypeCounts === "function") updateTypeCounts();
  

  const totalPages = computeTotalPages(filtered.length);

  // صفحه در محدوده معتبر
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // آدرس صفحه در URL
  setPageInUrl(currentPage);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  moviesGrid.innerHTML = "";
  movieCount.innerText = `Number of movies: ${filtered.length}`;

  for (const m of pageItems) {
    const cover = escapeHtml(
      m.cover || "https://via.placeholder.com/300x200?text=No+Image"
    );
    const title = escapeHtml(m.title || "-");
    const synopsis = escapeHtml((m.synopsis || "-").trim());
    const director = escapeHtml(m.director || "-");
    const stars = escapeHtml(m.stars || "-");
    const imdb = escapeHtml(m.imdb || "-");
    const release_info = escapeHtml(m.release_info || "-");

    const card = document.createElement("div");
    card.classList.add("movie-card", "reveal");
    card.dataset.movieId = m.id;

    const badgeHtml =
      m.type && m.type !== "single"
        ? `<span class="collection-badge ${
            m.type === "collection" ? "badge-collection" : "badge-serial"
          }">
         ${m.type === "collection" ? "Collection" : "Series"}
         <span class="badge-count anim-left-right">0</span>
       </span>`
        : "";

    card.innerHTML = `
<div class="cover-container anim-vertical">
  <div class="cover-blur anim-vertical" style="background-image: url('${cover}');"></div>
  <img class="cover-image anim-vertical" src="${cover}" alt="${title}">
</div>

<div class="movie-info anim-vertical">
  <div class="movie-title anim-left-right">
    <span class="movie-name anim-horizontal">${title}</span>
    ${badgeHtml}
  </div>

  <span class="field-label anim-vertical"><img src="/images/icons8-note.apng" style="width:20px;height:20px;"> Synopsis:</span>
  <div class="field-quote anim-left-right synopsis-quote">
    <div class="quote-text anim-horizontal">${synopsis}</div>
    <div class="button-wrap">
          <button class="quote-toggle-btn"><span>More</span></button>
          <div class="button-shadow"></div>
          </div>
  </div>

  <span class="field-label anim-vertical"><img src="/images/icons8-movie.apng" style="width:20px;height:20px;"> Director:</span>
  <div class="field-quote anim-left-right">${director}</div>

  <span class="field-label anim-vertical"><img src="/images/icons8-location.apng" style="width:20px;height:20px;"> Product:</span>
  <div class="field-quote anim-horizontal">
    ${renderChips(m.product || "-")}
  </div>

  <span class="field-label anim-vertical"><img src="/images/icons8-star.apng" style="width:20px;height:20px;"> Stars:</span>
  <div class="field-quote anim-left-right">${stars}</div>

  <span class="field-label anim-vertical">
    <img src="/images/icons8-imdb-48.png" class="imdb-bell" style="width:20px;height:20px;">
    IMDB:
  </span>
  <div class="field-quote anim-left-right">
    <span class="chip imdb-chip anim-horizontal">${imdb}</span>
  </div>

  <span class="field-label anim-vertical"><img src="/images/icons8-calendar.apng" style="width:20px;height:20px;"> Release:</span>
  <div class="field-quote anim-left-right">${release_info}</div>

  <span class="field-label anim-vertical"><img src="/images/icons8-comedy-96.png" class="genre-bell" style="width:20px;height:20px;"> Genre:</span>
  <div class="field-quote genre-grid anim-horizontal">${renderChips(
    m.genre || "-"
  )}</div>

  <div class="episodes-container anim-vertical" data-movie-id="${m.id}">
    <div class="episodes-list anim-left-right"></div>
  </div>

   <div class="button-wrap">
       <button class="go-btn anim-vertical" data-link="${escapeHtml(
         m.link || "#"
       )}"><span>Go to file</span></button>
       <div class="button-shadow"></div>
   </div>

  <div class="comment-summary anim-horizontal">
    <div class="avatars"></div>
    <div class="comments-count">0 comments</div>
    <div class="enter-comments"><img src="/images/icons8-comment.apng" style="width:22px;height:22px;"></div>
  </div>

  <div class="comments-panel" aria-hidden="true">
    <div class="comments-panel-inner">
      <div class="comments-panel-header"><div class="comments-title">Comments</div></div>
      <div class="comments-list"></div>
      <div class="comment-input-row">
        <div class="name-comments-close">
          <input class="comment-name" placeholder="Your name" maxlength="60" />
          <div class="button-wrap">
          <button class="comments-close"><span>close</span></button>
          <div class="button-shadow"></div>
          </div>
        </div>
        <textarea class="comment-text" placeholder="Write a comment..." rows="2"></textarea>
        <div class="button-wrap">
        <button class="comment-send"><span>Send</span></button>
        <div class="button-shaddow"></div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

    moviesGrid.appendChild(card);

    // احترام به تنظیم Animations
    if (window.filmchiReduceAnimations) {
      card.classList.add("no-reveal");
    } else {
      cardObserver.observe(card);
      card
        .querySelectorAll(
          ".anim-horizontal, .anim-vertical, .anim-left-right"
        )
        .forEach((el) => {
          animObserver.observe(el);
        });
    }

    // ===================== CLICK HANDLER — جلوگیری از باز شدن اشتباه منو =====================
    card.addEventListener("click", (e) => {
      const target = e.target;

      // بخش کامنت‌ها
      if (
        target.closest(".enter-comments") ||
        target.closest(".comments-panel") ||
        target.closest(".comment-send") ||
        target.closest(".comments-close") ||
        target.closest(".comment-name") ||
        target.closest(".comment-text") ||
        target.closest(".comment-summary")
      ) {
        return;
      }

      // دکمه Go to file
      if (target.closest(".go-btn")) {
        return;
      }

      // دکمه toggle synopsis
      if (target.closest(".quote-toggle-btn")) return;

      // متن سینوپسیس
      if (target.closest(".quote-text")) return;

      // اپیزودها
      if (target.closest(".episode-card")) return;

      // ژانر (mini chip)
      if (target.closest(".genre-chip-mini")) return;

      // Product → کشور سازنده
      if (target.closest(".country-chip")) return;

      // فقط در صورتی که هیچ مورد بالا نبود:
      openPostOptions(m);
    });

// ===================== رفتار دکمه Go to file (اتصال به بات تلگرام) =====================
      const goBtn = card.querySelector(".go-btn");
      goBtn?.addEventListener("click", async () => {
        const rawLink = goBtn.dataset.link || "#";

        // تبدیل لینک کانال خصوصی به لینک بات Filmchinbot
        const finalLink = buildTelegramBotUrlFromChannelLink(rawLink);

        try {
          const movieId = m.id;
          const epActiveEl = card.querySelector(
            ".episodes-list .episode-card.active"
          );
          const epIndex = epActiveEl
            ? Array.from(epActiveEl.parentElement.children).indexOf(epActiveEl)
            : null;

          const activeTitle = (() => {
            if (epActiveEl) {
              const titleEl = epActiveEl.querySelector(".episode-title span");
              return titleEl ? titleEl.textContent : m.title;
            }
            return m.title;
          })();

          // در لاگ می‌توانی finalLink یا rawLink را ذخیره کنی؛ من finalLink را ذخیره کردم که دقیقاً همان لینکی است که کاربر باز می‌کند
          await supabase.from("click_logs").insert([
            {
              movie_id: movieId,
              episode_index: epIndex,
              link: finalLink,
              title: activeTitle,
            },
          ]);
        } catch (err) {
          console.error("click log error:", err);
        }

        if (finalLink && finalLink !== "#") {
          window.open(finalLink, "_blank");
        }
      });
      
    // ===================== اتصال کامنت‌ها =====================
    attachCommentsHandlers(card, m.id);

    // ===================== نسخه سالم و کامل اپیزودها — بازگردانی =====================
    if (m.type === "collection" || m.type === "serial") {
      (async () => {
        const { data: eps, error: epsErr } = await supabase
          .from("movie_items")
          .select("*")
          .eq("movie_id", m.id)
          .order("order_index", { ascending: true });

        if (epsErr) {
          console.error("Error loading episodes:", epsErr);
          return;
        }

        const allEpisodes = [
          {
            id: m.id,
            title: m.title,
            cover: m.cover,
            synopsis: m.synopsis,
            director: m.director,
            product: m.product,
            stars: m.stars,
            imdb: m.imdb,
            release_info: m.release_info,
            genre: m.genre,
            link: m.link,
          },
          ...(eps || []),
        ];

        const listEl = card.querySelector(".episodes-list");
        const activeIndex = episodeMatches.get(m.id) ?? 0;

        listEl.innerHTML = allEpisodes
          .map((ep, idx) => {
            const titleText = escapeHtml(ep.title || "");
            const scrollable = titleText.length > 16 ? "scrollable" : "";
            return `
          <div class="episode-card ${
            idx === activeIndex ? "active" : ""
          }" data-link="${ep.link}">
            <img src="${escapeHtml(
              ep.cover || "https://via.placeholder.com/120x80?text=No+Cover"
            )}" alt="${titleText}" class="episode-cover">
            <div class="episode-title ${scrollable}"><span>${titleText}</span></div>
          </div>
        `;
          })
          .join("");

        goBtn.dataset.link = allEpisodes[activeIndex].link;

        const imdbChip = card.querySelector(".imdb-chip");
        if (imdbChip)
          imdbChip.textContent = allEpisodes[activeIndex].imdb || m.imdb;

        const badgeCount = card.querySelector(
          ".collection-badge .badge-count"
        );
        if (badgeCount) {
          const totalEpisodes = (eps || []).length + 1;
          badgeCount.textContent =
            totalEpisodes + (totalEpisodes > 1 ? " episodes" : " episode");
        }

        if (activeIndex > 0) {
          const ep = allEpisodes[activeIndex];

          if (m.type === "collection") {
            const nameEl = card.querySelector(".movie-name");
            if (nameEl) nameEl.textContent = ep.title || m.title;
            const coverImg = card.querySelector(".cover-image");
            if (coverImg) coverImg.src = ep.cover || m.cover;
            const coverBlur = card.querySelector(".cover-blur");
            if (coverBlur)
              coverBlur.style.backgroundImage = `url('${
                ep.cover || m.cover
              }')`;
            card.querySelector(".quote-text").textContent =
              ep.synopsis || m.synopsis;
            card.querySelectorAll(".field-quote")[1].textContent =
              ep.director || m.director;
            card.querySelectorAll(".field-quote")[2].innerHTML = renderChips(
              ep.product || m.product || "-"
            );
            card.querySelectorAll(".field-quote")[3].textContent =
              ep.stars || m.stars;
            if (imdbChip) imdbChip.textContent = ep.imdb || m.imdb;
            card.querySelectorAll(".field-quote")[5].textContent =
              ep.release_info || m.release_info;
            card.querySelectorAll(".field-quote")[6].innerHTML = renderChips(
              ep.genre || m.genre || "-"
            );
          }

          if (m.type === "serial") {
            const nameEl = card.querySelector(".movie-name");
            if (nameEl) nameEl.textContent = ep.title || m.title;
            const coverImg = card.querySelector(".cover-image");
            if (coverImg) coverImg.src = ep.cover || m.cover;
            const coverBlur = card.querySelector(".cover-blur");
            if (coverBlur)
              coverBlur.style.backgroundImage = `url('${
                ep.cover || m.cover
              }')`;
            goBtn.dataset.link = ep.link;
          }
        }

        setTimeout(() => {
          const activeEpEl = listEl.querySelector(".episode-card.active");
          if (
            activeEpEl &&
            allEpisodes.length > 3 &&
            episodeMatches.has(m.id)
          ) {
            const prevScrollY = window.scrollY;
            activeEpEl.scrollIntoView({
              behavior: "smooth",
              inline: "end",
              block: "nearest",
            });
            setTimeout(() => {
              window.scrollTo({ top: prevScrollY });
            }, 0);
          }
        }, 100);

        listEl.querySelectorAll(".episode-card").forEach((cardEl, idx) => {
          cardEl.addEventListener("click", () => {
            listEl
              .querySelectorAll(".episode-card")
              .forEach((c) => c.classList.remove("active"));
            cardEl.classList.add("active");

            const ep = allEpisodes[idx];

            if (imdbChip) imdbChip.textContent = ep.imdb || m.imdb;

            if (m.type === "serial") {
              const nameEl = card.querySelector(".movie-name");
              if (nameEl) nameEl.textContent = ep.title || m.title;
              const coverImg = card.querySelector(".cover-image");
              if (coverImg) coverImg.src = ep.cover || m.cover;
              const coverBlur = card.querySelector(".cover-blur");
              if (coverBlur)
                coverBlur.style.backgroundImage = `url('${
                  ep.cover || m.cover
                }')`;
              goBtn.dataset.link = ep.link;
            } else if (m.type === "collection") {
              const nameEl = card.querySelector(".movie-name");
              if (nameEl) nameEl.textContent = ep.title || m.title;
              const coverImg = card.querySelector(".cover-image");
              if (coverImg) coverImg.src = ep.cover || m.cover;
              const coverBlur = card.querySelector(".cover-blur");
              if (coverBlur)
                coverBlur.style.backgroundImage = `url('${
                  ep.cover || m.cover
                }')`;
              card.querySelector(".quote-text").textContent =
                ep.synopsis || m.synopsis;
              card.querySelectorAll(".field-quote")[1].textContent =
                ep.director || m.director;
              card.querySelectorAll(".field-quote")[2].innerHTML =
                renderChips(ep.product || m.product || "-");
              card.querySelectorAll(".field-quote")[3].textContent =
                ep.stars || m.stars;
              if (imdbChip) imdbChip.textContent = ep.imdb || m.imdb;
              card.querySelectorAll(".field-quote")[5].textContent =
                ep.release_info || m.release_info;
              card.querySelectorAll(".field-quote")[6].innerHTML =
                renderChips(ep.genre || m.genre || "-");
              goBtn.dataset.link = ep.link;
            }

            if (allEpisodes.length > 3) {
              const prevScrollY = window.scrollY;
              cardEl.scrollIntoView({
                behavior: "smooth",
                inline: "end",
                block: "nearest",
              });
              setTimeout(() => {
                window.scrollTo({ top: prevScrollY });
              }, 0);
            }
          });
        });
      })();
    }
  }

  // -------------------- toggle برای synopsis --------------------
  document.querySelectorAll(".synopsis-quote").forEach((quote) => {
    const textEl = quote.querySelector(".quote-text");
    const btn = quote.querySelector(".quote-toggle-btn");
    if (!textEl || !btn) return;

    const fullText = textEl.textContent.trim();
    if (fullText.length > 200) {
      const shortText = fullText.substring(0, 200) + "…";
      let collapsed = true;

      function applyState() {
        if (collapsed) {
          textEl.textContent = shortText;
          quote.style.overflow = "hidden";
          quote.style.maxHeight = "120px";
          quote.classList.add("collapsed");
          btn.textContent = "More";
        } else {
          textEl.textContent = fullText;
          quote.style.maxHeight = "1000px";
          quote.classList.remove("collapsed");
          btn.textContent = "Less";
        }
      }

      function toggleQuote() {
        collapsed = !collapsed;
        applyState();
      }

      applyState();

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleQuote();
      });

      quote.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        if (e.target === btn) return;
        toggleQuote();
      });
    } else {
      if (btn) btn.remove();
    }
  });

// -------------------- هایلایت نتایج جست‌وجو --------------------
    applySearchHighlightsInGrid(searchTerm);

    // صفحه‌بندی
    renderPagination(filtered.length);

    // ژانرهای بالای صفحه
    buildTabGenres(filtered);

    // اسکرول به بالا
    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // آپدیت استوری‌ها
    renderStoriesForPage(pageItems);

    // اسکیما برای فیلم‌ها (Structured Data برای سئو)
    // از کل لیست فیلترشده استفاده می‌کنیم تا گوگل تصویر بهتری از آرشیو بگیرد
    updateMoviesSchemaStructuredData(filtered);
  }
  
// =====================
//  Helper: parse release_info string -> { year, ts }
// پشتیبانی از سه مدل: "10 / 10 / 2025", "10/10/2025", "July 10, 2020"
// =====================
function parseReleaseFromString(text) {
  if (!text) return null;
  const raw = String(text).trim();
  if (!raw) return null;

  // گرفتن سال (اولین سال 19xx یا 20xx)
  const yearMatch = raw.match(/(19|20)\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
  if (!year) return null;

  // نرمال‌سازی برای تشخیص فرمت 10/10/2025 و 10 / 10 / 2025
  const normalized = raw.replace(/\s+/g, "");
  let day = 1;
  let monthIndex = 0; // 0-based برای Date

  // فرمت عددی: 10/10/2025 یا 10.10.2025
  const numeric = normalized.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (numeric) {
    const d = parseInt(numeric[1], 10);
    const m = parseInt(numeric[2], 10);
    if (!isNaN(d) && d >= 1 && d <= 31) day = d;
    if (!isNaN(m) && m >= 1 && m <= 12) monthIndex = m - 1;
  } else {
    // فرمت متنی: July 10, 2020
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const lower = raw.toLowerCase();
    let foundMonth = -1;
    for (let i = 0; i < months.length; i++) {
      if (lower.includes(months[i])) {
        foundMonth = i;
        break;
      }
    }
    if (foundMonth >= 0) {
      monthIndex = foundMonth;
      const dayMatch = lower.match(/(\d{1,2})\s*,/);
      if (dayMatch) {
        const d = parseInt(dayMatch[1], 10);
        if (!isNaN(d) && d >= 1 && d <= 31) day = d;
      }
    }
  }

  const ts = new Date(year, monthIndex, day).getTime();
  return { year, ts };
}
// ======================= Close keyboard on Enter (Go) =======================
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    // بسته شدن کیبورد
    searchInput.blur();

    // اجرای جستجو با مقدار فعلی سرچ
    currentPage = 1;
    renderPagedMovies(true);

    // نمایش نتایج
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

  // بعد از لود شدن movies، اگر روی /movie/slug هستیم مودال همان فیلم باز شود
  function handleDeepLinkMovieOpen() {
    if (!deepLinkSlug || !Array.isArray(movies) || !movies.length) return;

    const slug = deepLinkSlug;
    deepLinkSlug = null; // فقط یکبار استفاده شود

    // پیدا کردن فیلم بر اساس عنوان
    const targetMovie = movies.find((m) => {
      const t = (m.title || m.name || "").trim();
      if (!t) return false;
      return makeMovieSlug(t) === slug;
    });

    if (!targetMovie) {
      console.warn("Deep link movie not found for slug:", slug);
      return;
    }

    // اگر نوع فیلم مشخص است، می‌توانیم تب درست را هم فعال کنیم (اختیاری)
    try {
      if (targetMovie.type && typeof applyActiveTab === "function") {
        const type = (targetMovie.type || "").toLowerCase();
        const valid = ["all", "collection", "series", "single"];
        if (valid.includes(type)) {
          applyActiveTab(type);
          // اگر filterByType داری، آن را هم صدا بزن
          if (typeof filterByType === "function") {
            filterByType(type);
          }
        }
      }
    } catch (e) {
      console.warn("applyActiveTab error:", e);
    }

    // کمی صبر می‌کنیم تا گرید رندر شود، بعد مودال را باز می‌کنیم
    setTimeout(() => {
      try {
        openMovieModal(targetMovie);
      } catch (e) {
        console.error("openMovieModal error:", e);
      }
    }, 300);
  }

  // -------------------- Admin guard --------------------
  async function enforceAdminGuard() {
    try {
      if (!currentUser) {
        await loadAuthState();
      }

      const isAdmin = Boolean(
        currentUser && ["owner", "admin"].includes(currentUser.role)
      );

      if (!isAdmin && window.location.pathname.endsWith("admin.html")) {
        window.location.href = "index.html";
        return false;
      }

      return isAdmin;
    } catch (err) {
      console.error("enforceAdminGuard error", err);
      if (window.location.pathname.endsWith("admin.html")) {
        window.location.href = "index.html";
      }
      return false;
    }
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      try {
        await supabase.auth.signOut();
        currentUser = null;
        setUserProfile(null);
        window.location.href = "index.html";
      } catch (err) {
        console.error("logout exception", err);
        logoutBtn.disabled = false;
      }
    });
  }

  // -------------------- Admin list (minimal) --------------------
  let adminCurrentPage = 1;
  let adminTotalPages = 1;
  const adminPageSize = 10;

  async function loadAdminMovies(page = 1) {
    adminCurrentPage = page;
    const { count } = await supabase
      .from("movies")
      .select("*", { count: "exact", head: true });
    adminTotalPages = Math.ceil((count || 0) / adminPageSize);
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * adminPageSize, page * adminPageSize - 1);
    if (error) {
      console.error("Error loading movies:", error);
      return;
    }
    renderAdminMovieList(data);
    renderAdminPagination();
  }
  // لیست فیلم‌ها در پنل ادمین
  function renderAdminMovieList(list = []) {
    if (!window.movieList) return;
    movieList.innerHTML = "";

    list.forEach((m) => {
      const row = document.createElement("div");
      row.className = "movie-item";
      row.innerHTML = `
      <div class="movie-top">
        <!-- دکمه قلب -->
        <button class="popular-toggle" data-id="${
          m.id
        }" aria-label="toggle popular">
          <img src="/images/${
            m.is_popular ? "icons8-heart-50-fill.png" : "icons8-heart-50.png"
          }" 
               alt="heart" class="heart-icon"/>
        </button>

        <img class="movie-cover" src="${escapeHtml(
          m.cover || ""
        )}" alt="${escapeHtml(m.title || "")}">
        <div class="movie-info-admin">
          <div class="movie-title-row">
            <span class="movie-name">${escapeHtml(m.title || "")}</span>
            ${
              m.type && m.type !== "single"
                ? `<span class="badge-type ${
                    m.type === "collection"
                      ? "badge-collection"
                      : "badge-serial"
                  }">
                   ${m.type === "collection" ? "Collection" : "Series"}
                 </span>`
                : ""
            }
          </div>
          <div class="toggle-comments" data-id="${
            m.id
          }">Comments <i class="bi bi-chevron-down"></i></div>
        </div>
        <div class="movie-actions">
        <div class="button-wrap">
          <button class="btn-edit"><span><i class="bi bi-pencil"></i> Edit</span></button><div class="button-shadow"></div></div>
          <div class="button-wrap">
          <button class="btn-delete"><span><i class="bi bi-trash"></i> Delete</span></button><div class="button-shadow"></div></div>
        </div>
      </div>
      <div class="admin-comments-panel" id="comments-${
        m.id
      }" style="display:none;"></div>
    `;

      // -------------------- Popular toggle (قلب) --------------------
      const heartBtn = row.querySelector(".popular-toggle");
      heartBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = e.currentTarget.dataset.id;
        const isNowPopular = !m.is_popular;

        try {
          const { error } = await supabase
            .from("movies")
            .update({ is_popular: isNowPopular })
            .eq("id", id)
            .returns("minimal");

          if (error) {
            console.error("popular toggle error:", error);
            showToast("خطا در تغییر وضعیت محبوب ❌");
            return;
          }

          showToast(
            isNowPopular
              ? "به پرطرفدارها اضافه شد ✅"
              : "از پرطرفدارها حذف شد ✅"
          );

          // رفرش لیست از دیتابیس
          await fetchMovies();
          await fetchPopularMovies();
        } catch (err) {
          console.error("popular toggle error:", err);
          showToast("خطای غیرمنتظره ❌");
        }
      });

      // -------------------- Edit --------------------
      row.querySelector(".btn-edit")?.addEventListener("click", async () => {
        editingMovie = m;
        window.editingMovie = m;

        const fill = (id) => document.getElementById(id);
        [
          "title",
          "link",
          "synopsis",
          "director",
          "product",
          "stars",
          "imdb",
          "release_info",
          "genre",
        ].forEach((f) => {
          const el = fill(f);
          if (el) el.value = m[f] || "";
        });

        const coverPreview = document.getElementById("cover-preview");
        if (coverPreview) {
          coverPreview.src = m.cover || "";
          coverPreview.style.display = m.cover ? "block" : "none";
        }

        const formsWrap = document.getElementById("bundle-forms");
        if (formsWrap) formsWrap.innerHTML = "";
        const actionsBar = document.getElementById("bundle-actions");
        if (actionsBar) actionsBar.classList.remove("show");

        const modeInput = document.getElementById("mode");
        if (modeInput) modeInput.value = m.type || "single";

        if (m.type === "collection" || m.type === "serial") {
          if (actionsBar) actionsBar.classList.add("show");

          const { data: eps, error } = await supabase
            .from("movie_items")
            .select("*")
            .eq("movie_id", m.id)
            .order("order_index", { ascending: true });

          if (error) {
            console.error("load items err", error);
            showToast("خطا در دریافت اپیزودها");
          } else {
            fillBundleFormsFromItems(
              eps || [],
              formsWrap,
              "edit",
              m.type || "collection"
            );
          }
        } else {
          if (typeof resetMode === "function") resetMode();
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // -------------------- Delete --------------------
      row.querySelector(".btn-delete")?.addEventListener("click", async () => {
        const ok = await showDialog({
          message: "Delete this movie?",
          type: "confirm",
        });
        if (!ok) return;
        const { error } = await supabase.from("movies").delete().eq("id", m.id);
        if (error) {
          console.error("delete movie err", error);
          showToast("Delete failed");
        } else {
          showToast("Movie deleted");
          await fetchMovies();
          await fetchPopularMovies();
        }
      });

      // -------------------- Comments toggle --------------------
      const toggleBtn = row.querySelector(".toggle-comments");
      toggleBtn?.addEventListener("click", async () => {
        const panel = row.querySelector(".admin-comments-panel");
        if (panel.style.display === "none") {
          const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("movie_id", m.id)
            .order("created_at", { ascending: true });
          if (error) {
            console.error("Error loading comments:", error);
            panel.innerHTML = "<p>Error loading comments</p>";
          } else if (!data || data.length === 0) {
            panel.innerHTML = "<p>No comments found.</p>";
          } else {
            panel.innerHTML = data
              .map(
                (c) => `
            <div class="admin-comment-row">
              <div class="comment-avatar">${escapeHtml(initials(c.name))}</div>
              <div class="admin-comment-body">
                <div class="admin-comment-meta"><strong>${escapeHtml(
                  c.name
                )}</strong> · ${new Date(c.created_at).toLocaleString()}</div>
                <div class="admin-comment-text">${escapeHtml(c.text)}</div>
              </div>
              <div class="button-wrap">
              <button class="admin-comment-delete" data-id="${
                c.id
              }"><span>Delete</span></button><div class="button-shadow"></div></div>
            </div>
          `
              )
              .join("");
            panel.querySelectorAll(".admin-comment-delete").forEach((btn) => {
              btn.addEventListener("click", async () => {
                const ok2 = await showDialog({
                  message: "Should this comment be deleted?",
                  type: "confirm",
                });
                if (!ok2) return;
                const id = btn.dataset.id;
                const { error: delErr } = await supabase
                  .from("comments")
                  .delete()
                  .eq("id", id);
                if (delErr) showToast("Error deleting comment");
                else btn.closest(".admin-comment-row")?.remove();
              });
            });
          }
          panel.style.display = "flex";
          toggleBtn.innerHTML = 'Close <i class="bi bi-chevron-up"></i>';
        } else {
          panel.style.display = "none";
          toggleBtn.innerHTML = 'Comments <i class="bi bi-chevron-down"></i>';
        }
      });

      movieList.appendChild(row);
    });
  }

  function renderPopularMovies(list = []) {
    const container = document.getElementById("popularMoviesList");
    if (!container) return;
    container.innerHTML = "";

    list.forEach((m) => {
      const row = document.createElement("div");
      row.className = "movie-item";
      row.innerHTML = `
      <div class="movie-top">
        <button class="popular-toggle" data-id="${
          m.id
        }" aria-label="toggle popular">
          <img src="/images/${
            m.is_popular ? "icons8-heart-50-fill.png" : "icons8-heart-50.png"
          }" 
               alt="heart" class="heart-icon"/>
        </button>
        <img class="movie-cover" src="${escapeHtml(
          m.cover || ""
        )}" alt="${escapeHtml(m.title || "")}">
        <div class="movie-info-admin">
          <div class="movie-title-row">
            <span class="movie-name">${escapeHtml(m.title || "")}</span>
          </div>
        </div>
      </div>
    `;

      // هندلر قلب
      const heartBtn = row.querySelector(".popular-toggle");
      heartBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const id = e.currentTarget.dataset.id;
        const isNowPopular = !m.is_popular;

        try {
          const { error } = await supabase
            .from("movies")
            .update({ is_popular: isNowPopular })
            .eq("id", id)
            .returns("minimal");

          if (error) {
            console.error("popular toggle error:", error);
            showToast("خطا در تغییر وضعیت محبوب ❌");
            return;
          }

          showToast(
            isNowPopular
              ? "به پرطرفدارها اضافه شد ✅"
              : "از پرطرفدارها حذف شد ✅"
          );

          // رفرش هر دو لیست
          await fetchMovies();
          await fetchPopularMovies();
        } catch (err) {
          console.error("popular toggle error:", err);
          showToast("خطای غیرمنتظره ❌");
        }
      });

      container.appendChild(row);
    });
  }
  async function fetchPopularMovies() {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("is_popular", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("fetchPopularMovies error:", error);
        return;
      }

      renderPopularMovies(data || []);
    } catch (err) {
      console.error("fetchPopularMovies unexpected error:", err);
    }
  }
  let currentIndex = 0;
  let autoSlide;

  async function fetchPopularForIndex() {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("is_popular", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchPopularForIndex error:", error);
      return;
    }
    renderPopularCarousel(data || []);
  }

  function renderPopularCarousel(list = []) {
    const track = document.querySelector("#popular-carousel .carousel-track");
    const bg = document.querySelector("#popular-carousel .carousel-bg");
    if (!track) return;
    track.innerHTML = "";

    // 🔹 برای loop بی‌نهایت: دو کپی از اول و آخر
    const extended = [
      list[list.length - 2],
      list[list.length - 1],
      ...list,
      list[0],
      list[1],
    ];

    extended.forEach((m) => {
      const item = document.createElement("div");
      item.className = "carousel-item";
      item.innerHTML = `
      <img src="${escapeHtml(m.cover || "")}" alt="${escapeHtml(
        m.title || ""
      )}">
      <h3>${escapeHtml(m.title || "")}</h3>
      <div class="button-wrap">
  <button class="more-info">
    <span>More Info</span>
    </button><div class="button-shadow"></div>
</div>`;
      item.querySelector(".more-info").addEventListener("click", (e) => {
        e.stopPropagation();
        openMovieModal(m);
      });
      track.appendChild(item);
    });

    const items = track.querySelectorAll(".carousel-item");
    const windowEl = document.querySelector(".carousel-window");
    const itemWidth = windowEl.offsetWidth / 3;

    let currentIndex = 2;
    track.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
    updateActive();

    function updateActive() {
      items.forEach((el) => el.classList.remove("active"));
      const middle = currentIndex + 1;
      if (items[middle]) {
        items[middle].classList.add("active");
        bg.style.backgroundImage = `url(${extended[middle].cover})`;
      }
    }

    function slideTo(index) {
      track.style.transition = "transform 0.5s ease";
      track.style.transform = `translateX(-${itemWidth * index}px)`;
      currentIndex = index;
      resetAutoSlide();
    }

    track.addEventListener("transitionend", () => {
      if (currentIndex <= 1) {
        track.style.transition = "none";
        currentIndex = list.length;
        track.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
      }
      if (currentIndex >= list.length + 2) {
        track.style.transition = "none";
        currentIndex = 2;
        track.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
      }
      updateActive();
    });

    function next() {
      slideTo(currentIndex + 1);
    }
    function prev() {
      slideTo(currentIndex - 1);
    }

    document.querySelector("#popular-carousel .next").onclick = () => {
      next();
    };
    document.querySelector("#popular-carousel .prev").onclick = () => {
      prev();
    };

    // 🔹 تایمر خودکار
    let autoSlide;
    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(next, 4000);
    }
    resetAutoSlide();
  }
  // مودال

  function openMovieModal(m) {
    const modal = document.getElementById("movie-modal");
    const content = modal.querySelector(".movie-modal-content");

    // اگر مودال قبلاً باز نیست → state اضافه کن (برای پشتیبانی دکمه Back)
    if (modal.style.display !== "flex") {
      history.pushState({ overlay: "modal", movieId: m.id }, "");
    }

    // 🔹 رندر اولیه کارت
    function renderCard(data, allEpisodes = []) {
      const cover = escapeHtml(
        data.cover || "https://via.placeholder.com/300x200?text=No+Image"
      );
      const title = escapeHtml(data.title || "-");
      const synopsis = escapeHtml((data.synopsis || "-").trim());
      const director = escapeHtml(data.director || "-");
      const stars = escapeHtml(data.stars || "-");
      const imdb = escapeHtml(data.imdb || "-");
      const release_info = escapeHtml(data.release_info || "-");

      const badgeHtml =
        data.type && data.type !== "single"
          ? `<span class="collection-badge ${
              data.type === "collection" ? "badge-collection" : "badge-serial"
            }">
           ${data.type === "collection" ? "Collection" : "Series"}
           <span class="badge-count">${allEpisodes.length}</span>
         </span>`
          : "";

      return `
      <div class="movie-card expanded no-reveal">
        <div class="cover-container">
          <div class="cover-blur" style="background-image: url('${cover}');"></div>
          <img class="cover-image" src="${cover}" alt="${title}">
        </div>

        <div class="movie-info">
          <div class="movie-title">
            <span class="movie-name">${title}</span>
            ${badgeHtml}
          </div>

          <span class="field-label">Synopsis:</span>
          <div class="field-quote synopsis-quote">
            <div class="quote-text">${synopsis}</div>
            <div class="button-wrap">
              <button class="quote-toggle-btn"><span>More</span></button>
            </div>
          </div>

          <span class="field-label">Director:</span>
          <div class="field-quote director-field">${director}</div>

          <span class="field-label">Product:</span>
          <div class="field-quote product-field">${renderChips(
            data.product || "-"
          )}</div>

          <span class="field-label">Stars:</span>
          <div class="field-quote stars-field">${stars}</div>

          <span class="field-label">IMDB:</span>
          <div class="field-quote"><span class="chip imdb-chip">${imdb}</span></div>

          <span class="field-label">Release:</span>
          <div class="field-quote release-field">${release_info}</div>

          <span class="field-label">Genre:</span>
          <div class="field-quote genre-grid">${renderChips(
            data.genre || "-"
          )}</div>

          <div class="episodes-container" data-movie-id="${data.id}">
            <div class="episodes-list"></div>
          </div>

          <div class="button-wrap">
            <button class="go-btn" data-link="${escapeHtml(
              data.link || "#"
            )}"><span>Go to file</span></button>
            <div class="button-shadow"></div>
          </div>
          
          <div class="button-wrap">
            <button class="close-btn"><span>Close</span></button>
            <div class="button-shadow"></div>
          </div>
        </div>
      </div>
    `;
    }

    // 🔹 تابع آپدیت فقط اطلاعات (نه لیست اپیزودها)
    function updateInfo(ep) {
      content.querySelector(".movie-name").textContent = ep.title || "-";
      content.querySelector(".cover-image").src = ep.cover || m.cover;
      content.querySelector(".cover-blur").style.backgroundImage = `url('${
        ep.cover || m.cover
      }')`;
      content.querySelector(".quote-text").textContent = ep.synopsis || "-";
      content.querySelector(".director-field").textContent = ep.director || "-";
      content.querySelector(".product-field").innerHTML = renderChips(
        ep.product || "-"
      );
      content.querySelector(".stars-field").textContent = ep.stars || "-";
      content.querySelector(".imdb-chip").textContent = ep.imdb || "-";
      content.querySelector(".release-field").textContent =
        ep.release_info || "-";
      content.querySelector(".genre-grid").innerHTML = renderChips(
        ep.genre || "-"
      );

      content.querySelector(".go-btn").dataset.link = ep.link || "#";

      initModalSynopsisToggle(content);
    }

    // رندر اولیه
    content.innerHTML = renderCard(m);
    modal.style.display = "flex";

    content.addEventListener("click", (e) => e.stopPropagation());

    // دکمه Close (بدون pushState اضافی)
    content.querySelector(".close-btn").onclick = () => {
      modal.style.display = "none";
    };

    // کلیک روی بک‌گراند → بستن
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };

    // هندل Go to file
    function bindGoBtn(data) {
      const goBtn = content.querySelector(".go-btn");
      if (goBtn) {
        goBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const link = goBtn.dataset.link || "#";
          if (link && link !== "#") window.open(link, "_blank");
        };
      }
    }
    bindGoBtn(m);
    initModalSynopsisToggle(content);

    if (m.type === "collection" || m.type === "serial") {
      (async () => {
        const { data: eps } = await supabase
          .from("movie_items")
          .select("*")
          .eq("movie_id", m.id)
          .order("order_index", { ascending: true });

        const allEpisodes = [{ ...m }, ...(eps || [])];
        const listEl = content.querySelector(".episodes-list");

        listEl.innerHTML = allEpisodes
          .map(
            (ep, idx) => `
        <div class="episode-card ${
          idx === 0 ? "active" : ""
        }" data-idx="${idx}">
          <img src="${escapeHtml(ep.cover || m.cover)}" alt="${escapeHtml(
              ep.title
            )}">
          <div class="episode-title">${escapeHtml(ep.title)}</div>
        </div>
      `
          )
          .join("");

        // آپدیت badge-count
        const badgeCount = content.querySelector(
          ".collection-badge .badge-count"
        );
        if (badgeCount) {
          badgeCount.textContent =
            allEpisodes.length +
            (allEpisodes.length > 1 ? " episodes" : " episode");
        }

        // کلیک روی اپیزودها
        listEl.querySelectorAll(".episode-card").forEach((cardEl, idx) => {
          cardEl.addEventListener("click", () => {
            listEl
              .querySelectorAll(".episode-card")
              .forEach((c) => c.classList.remove("active"));
            cardEl.classList.add("active");
            updateInfo(allEpisodes[idx]);
            bindGoBtn(allEpisodes[idx]);
          });
        });
      })();
    }
  }

  function initModalSynopsisToggle(rootEl) {
    const quote = rootEl.querySelector(".synopsis-quote");
    if (!quote) return;
    const textEl = quote.querySelector(".quote-text");
    const btn = quote.querySelector(".quote-toggle-btn");
    if (!textEl || !btn) return;

    const fullText = textEl.textContent.trim();

    if (fullText.length > 200) {
      const shortText = fullText.substring(0, 200) + "…";
      let collapsed = true;

      function applyState() {
        if (collapsed) {
          textEl.textContent = shortText;
          quote.style.overflow = "hidden";
          quote.style.maxHeight = "120px";
          quote.classList.add("collapsed");
          btn.textContent = "More";
        } else {
          textEl.textContent = fullText;
          quote.style.maxHeight = "1000px";
          quote.classList.remove("collapsed");
          btn.textContent = "Less";
        }
      }

      function toggleQuote() {
        collapsed = !collapsed;
        applyState();
      }

      applyState();

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleQuote();
      });

      quote.addEventListener("click", (e) => {
        if (
          e.target.closest("a") ||
          e.target.closest("button") ||
          e.target.closest(".chip") ||
          e.target.closest(".genre-grid") ||
          e.target.closest(".field-quote")
        ) {
          return;
        }
        toggleQuote();
      });
    } else {
      if (btn) btn.remove();
    }
  }

  // پاک کردن فرم‌های اپیزود (وقتی فیلم تکی باشه)
  function clearEpisodeForms() {
    const container = document.getElementById("episodes-container");
    if (container) container.innerHTML = "";
    const addBtn = document.getElementById("add-episode-btn");
    if (addBtn) addBtn.style.display = "none";
  }

  function fillBundleFormsFromItems(
    items,
    formsWrap,
    mode = "add",
    type = "collection"
  ) {
    formsWrap.innerHTML = "";
    if (!items || !items.length) return;

    let startIdx = 0;
    if (mode === "edit") {
      try {
        const mainTitle = (
          document.getElementById("title")?.value || ""
        ).trim();
        const firstItemTitle =
          items[0] && items[0].title ? String(items[0].title).trim() : "";
        if (mainTitle && firstItemTitle && mainTitle === firstItemTitle) {
          startIdx = 1;
        }
      } catch (err) {
        // در صورت خطا، ادامه می‌دهیم و از 0 شروع می‌کنیم
      }
    }

    // اکنون آیتم‌های باندل (اپیزود 2 به بعد) را از startIdx به جلو بساز
    for (let idx = startIdx; idx < items.length; idx++) {
      const ep = items[idx];
      const relativeIdx = idx - startIdx; // 0 برای اپیزود دوم در صفحه

      if (relativeIdx === 0) {
        // اپیزود دوم → دکمه کالکشن یا سریال (همان دکمه‌ای که ابتدا اجرا می‌شود)
        if (type === "collection") {
          if (typeof handleAddCollection === "function") handleAddCollection();
          else if (typeof addCollectionForm === "function") addCollectionForm();
        } else if (type === "serial") {
          if (typeof handleAddSerial === "function") handleAddSerial();
          else if (typeof addSerialForm === "function") addSerialForm();
        }
      } else {
        // اپیزود سوم به بعد → دکمه افزودن
        if (typeof handleAddBundleItem === "function") {
          handleAddBundleItem();
        } else if (document.getElementById("btn-add-item")) {
          document.getElementById("btn-add-item").click();
        } else {
          // fallback: بر اساس نوع
          if (type === "collection" && typeof addCollectionForm === "function")
            addCollectionForm();
          if (type === "serial" && typeof addSerialForm === "function")
            addSerialForm();
        }
      }

      // آخرین فرمی که ساخته شد رو پر کن
      const newForm = formsWrap.lastElementChild;
      if (newForm) fillFormWithEpisode(newForm, ep, type);
    }
  }
  function fillFormWithEpisode(formEl, ep, type) {
    if (!formEl || !ep) return;

    if (type === "collection") {
      const inpTitle = formEl.querySelector('input[placeholder="Title"]');
      if (inpTitle) inpTitle.value = ep.title || "";

      const inpFileLink = formEl.querySelector(
        'input[placeholder="File Link"]'
      );
      if (inpFileLink) inpFileLink.value = ep.link || "";

      const ta = formEl.querySelector("textarea");
      if (ta) ta.value = ep.synopsis || "";

      const inpDirector = formEl.querySelector('input[placeholder="Director"]');
      if (inpDirector) inpDirector.value = ep.director || "";

      const inpProduct = formEl.querySelector('input[placeholder="Product"]');
      if (inpProduct) inpProduct.value = ep.product || "";

      const inpStars = formEl.querySelector('input[placeholder="Stars"]');
      if (inpStars) inpStars.value = ep.stars || "";

      const inpImdb = formEl.querySelector('input[placeholder="IMDB"]');
      if (inpImdb) inpImdb.value = ep.imdb || "";

      const inpRelease = formEl.querySelector(
        'input[placeholder="Release Info"]'
      );
      if (inpRelease) inpRelease.value = ep.release_info || "";

      const inpGenre = formEl.querySelector(
        'input[placeholder="Genre (space-separated)"]'
      );
      if (inpGenre) inpGenre.value = ep.genre || "";
    } else if (type === "serial") {
      const inpTitle = formEl.querySelector('input[placeholder="Title"]');
      if (inpTitle) inpTitle.value = ep.title || "";

      const inpLink = formEl.querySelector('input[placeholder="Link"]');
      if (inpLink) inpLink.value = ep.link || "";
    } else {
      // fallback عمومی: تلاش کن هر placeholder شبیه title/link رو پر کنی
      const inpTitle = formEl.querySelector('input[placeholder="Title"]');
      if (inpTitle) inpTitle.value = ep.title || "";
      const inpFileLink = formEl.querySelector(
        'input[placeholder="File Link"]'
      );
      if (inpFileLink) inpFileLink.value = ep.link || "";
      const inpLink = formEl.querySelector('input[placeholder="Link"]');
      if (inpLink && !inpFileLink) inpLink.value = ep.link || "";
    }

    // هندل کاور (بدون optional chaining در سمت چپ)
    if (ep.cover) {
      formEl.dataset.existingCover = ep.cover;

      const existingPreview = formEl.querySelector(".bundle-cover-preview");
      if (existingPreview) existingPreview.remove();

      const preview = document.createElement("img");
      preview.src = ep.cover;
      preview.className = "bundle-cover-preview";
      preview.style.cssText =
        "width:80px;height:auto;margin-top:6px;border-radius:4px;";
      const fileInputEl = formEl.querySelector('input[type="file"]');
      if (fileInputEl) fileInputEl.insertAdjacentElement("afterend", preview);
    }
  }
  // ساخت و پر کردن فرم‌های اپیزود (برای کالکشن/سریال)
  function renderEpisodeForms(eps = []) {
    const container = document.getElementById("episodes-container");
    if (!container) return;
    container.innerHTML = "";

    eps.forEach((ep, idx) => {
      const form = document.createElement("div");
      form.className = "episode-form";
      form.innerHTML = `
      <h4>اپیزود ${idx + 1}</h4>
      <label>عنوان اپیزود</label>
      <input type="text" name="ep_title_${ep.id}" value="${escapeHtml(
        ep.title || ""
      )}" />


      <label>کاور اپیزود</label>
      <input type="file" name="ep_cover_${ep.id}" />
      ${
        ep.cover
          ? `<img src="${escapeHtml(
              ep.cover
            )}" style="width:80px;height:auto;margin-top:4px;">`
          : ""
      }


      <label>خلاصه</label>
      <textarea name="ep_synopsis_${ep.id}">${escapeHtml(
        ep.synopsis || ""
      )}</textarea>


      <label>کارگردان</label>
      <input type="text" name="ep_director_${ep.id}" value="${escapeHtml(
        ep.director || ""
      )}" />


      <label>محصول</label>
      <input type="text" name="ep_product_${ep.id}" value="${escapeHtml(
        ep.product || ""
      )}" />


      <label>actors</label>
      <input type="text" name="ep_stars_${ep.id}" value="${escapeHtml(
        ep.stars || ""
      )}" />


      <label>IMDB</label>
      <input type="text" name="ep_imdb_${ep.id}" value="${escapeHtml(
        ep.imdb || ""
      )}" />


      <label>تاریخ انتشار</label>
      <input type="text" name="ep_release_${ep.id}" value="${escapeHtml(
        ep.release_info || ""
      )}" />


      <label>ژانر</label>
      <input type="text" name="ep_genre_${ep.id}" value="${escapeHtml(
        ep.genre || ""
      )}" />


      <label>لینک فایل</label>
      <input type="text" name="ep_link_${ep.id}" value="${escapeHtml(
        ep.link || ""
      )}" />
    `;
      container.appendChild(form);
    });

    const addBtn = document.getElementById("add-episode-btn");
    if (addBtn) addBtn.style.display = "inline-block";
  }
  // -------------------- Admin messages management --------------------
  if (addMessageForm && messageList) {
    enforceAdminGuard().then((ok) => {
      if (!ok) return;
    });

    addMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = (document.getElementById("messageText")?.value || "").trim();
      if (!text) {
        showToast("Message cannot be empty");
        return;
      }
      const { error } = await supabase.from("messages").insert([{ text }]);
      if (error) {
        console.error("insert message err", error);
        showToast("Add message failed");
      } else {
        document.getElementById("messageText").value = "";
        await fetchMessages();
        showToast("Message added");
      }
    });

    function renderAdminMessages() {
      messageList.innerHTML = "";
      (messages || []).forEach((m) => {
        const el = document.createElement("div");
        el.className = "message-item";
        el.innerHTML = `
          <span class="message-text">${escapeHtml(m.text)}</span>
          <div class="message-actions">
          <div class="button-wrap">
            <button class="btn-edit" data-id="${
              m.id
            }"><span><i class="bi bi-pencil"></i> Edit</span></button>
            <div class="button-shadow"></div>
            </div>
            <div class="button-wrap">
            <button class="btn-delete" data-id="${
              m.id
            }"><span><i class="bi bi-trash"></i> Delete</span></button>
            <div class="button-shadow"></div>
            </div>
            
          </div>
        `;
        messageList.appendChild(el);
      });
    }

    messageList.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;

      if (btn.classList.contains("btn-edit")) {
        const msg = messages.find((x) => String(x.id) === String(id));
        if (!msg) return;
        const newText = await showDialog({
          message: "Edit message:",
          type: "prompt",
          defaultValue: msg.text,
        });
        if (newText === null) return;
        const { error } = await supabase
          .from("messages")
          .update({ text: newText })
          .eq("id", id);
        if (error) {
          console.error("message update err", error);
          showToast("Update failed");
        } else {
          await fetchMessages();
          showToast("Message updated");
        }
      }

      if (btn.classList.contains("btn-delete")) {
        const ok = await showDialog({
          message: "Delete this message?",
          type: "confirm",
        });
        if (!ok) return;
        const { error } = await supabase.from("messages").delete().eq("id", id);
        if (error) {
          console.error("msg delete err", error);
          showToast("Delete failed");
        } else {
          await fetchMessages();
          showToast("Message deleted");
        }
      }
    });

    renderAdminMessages();
  }

  function renderAdminPagination() {
    const container = document.getElementById("admin-pagination");
    if (!container) return;
    container.innerHTML = "";
    for (let i = 1; i <= adminTotalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("page-bubble");
      btn.textContent = i;
      if (i === adminCurrentPage) btn.classList.add("active");
      btn.onclick = () => loadAdminMovies(i);
      container.appendChild(btn);
    }
  }
  loadAdminMovies();

  // === Access Guards ===
  function canOwnerActions() {
    return currentUser && currentUser.role === "owner";
  }
  function denyIfNotOwner() {
    if (!canOwnerActions()) {
      showToast("شما دسترسی ندارید ❌", "error");
      return true;
    }
    return false;
  }

  async function loadAnalytics() {
    const ok = await enforceAdminGuard();
    if (!ok) return;

    // دریافت داده‌ها از ویوها
    const { data: visits, error: vErr } = await supabase
      .from("v_visits_daily")
      .select("*");
    const { data: searches, error: sErr } = await supabase
      .from("v_top_searches")
      .select("*")
      .limit(10);
    const { data: clicks, error: cErr } = await supabase
      .from("v_top_clicks")
      .select("*")
      .limit(10);

    if (vErr || sErr || cErr) {
      console.error("analytics errors:", { vErr, sErr, cErr });
      showToast("Error loading analytics data");
      return;
    }

    // داده‌های visits برای Chart.js
    const labels = (visits || []).map((row) => {
      const d = new Date(row.day);
      return d.toLocaleDateString();
    });
    const values = (visits || []).map((row) => Number(row.visits) || 0);

    // رندر چارت
    const canvas = document.getElementById("visitsChart");
    if (canvas) {
      if (canvas._chartInstance) {
        try {
          canvas._chartInstance.destroy();
        } catch (e) {}
        canvas._chartInstance = null;
      }
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Visits",
              data: values,
              borderColor: "#2185D5",
              backgroundColor: "rgba(33,133,213,0.15)",
              pointRadius: 3,
              tension: 0.25,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true },
          },
        },
      });
      canvas._chartInstance = chart;
    }

    // Top searches
    const topSearchesEl = document.getElementById("topSearches");
    if (topSearchesEl) {
      topSearchesEl.innerHTML =
        (searches || [])
          .map(
            (row) =>
              `<div class="message-item"><span>${escapeHtml(
                row.query
              )}</span><span style="font-weight:bold;">${
                row.times
              }</span></div>`
          )
          .join("") || "<p>No searches yet.</p>";
    }

    // Top clicks
    const topClicksEl = document.getElementById("topClicks");
    if (topClicksEl) {
      topClicksEl.innerHTML =
        (clicks || [])
          .map(
            (row) =>
              `<div class="message-item"><span>${escapeHtml(
                row.title || "Untitled"
              )}</span><span style="font-weight:bold;">${
                row.clicks
              }</span></div>`
          )
          .join("") || "<p>No clicks yet.</p>";
    }
  }

  async function loadUsers(search = "") {
    if (!currentUser || !["owner", "admin"].includes(currentUser.role)) {
      showToast("شما دسترسی مشاهده کاربران را ندارید ❌", "error");
      return;
    }

    let query = supabase
      .from("users")
      .select("id, username, email, avatar_url, created_at, role", {
        count: "exact",
      })
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .range(
        (usersPage - 1) * USERS_PAGE_SIZE,
        usersPage * USERS_PAGE_SIZE - 1
      );

    if (search) query = query.ilike("username", `%${search}%`);

    const { data, error, count } = await query;
    if (error) {
      console.error("loadUsers error:", error);
      showToast("خطا در دریافت لیست کاربران ❌", "error");
      return;
    }

    const container = document.getElementById("usersContainer");
    container.innerHTML = `
    <table class="users-table">
      <thead>
        <tr>
          <th>کاور</th>
          <th>نام کاربری</th>
          <th>ایمیل</th>
          <th>سمت</th>
          <th>تاریخ عضویت</th>
          <th>عملیات</th>
        </tr>
      </thead>
      <tbody id="usersTableBody"></tbody>
    </table>
  `;

    const tbody = document.getElementById("usersTableBody");

    data.forEach((u) => {
      const avatar = u.avatar_url
        ? supabase.storage.from("avatars").getPublicUrl(u.avatar_url).data
            .publicUrl
        : "/images/icons8-user-96.png";

      const row = document.createElement("tr");
      row.innerHTML = `
      <td><img src="${avatar}" alt="avatar" class="avatar-img"></td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td><span class="role-badge ${u.role}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        ${
          currentUser.role === "owner"
            ? `<div class="button-wrap"><button class="btn-danger" onclick="blockUser('${u.id}','${u.email}','${u.username}')"><span>Block</span></button><div class="button-shadow"></div></div>
               <div class="button-wrap"><button class="btn-primary" onclick="promoteToAdmin('${u.id}')"><span>Promote</span></button><div class="button-shadow"></div></div>`
            : ""
        }
      </td>
    `;
      tbody.appendChild(row);
    });

    renderUsersPagination(count || 0);
  }

  // هندلر سرچ
  document.getElementById("userSearch")?.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    usersPage = 1;
    loadUsers(value);
  });

  // هندلر دکمه ✕
  document.getElementById("clearSearch")?.addEventListener("click", () => {
    const input = document.getElementById("userSearch");
    input.value = "";
    usersPage = 1;
    loadUsers("");
  });

  async function loadAdmins() {
    if (!currentUser || !["owner", "admin"].includes(currentUser.role)) {
      showToast("شما دسترسی مشاهده ادمین‌ها را ندارید ❌", "error");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, avatar_url, role")
      .in("role", ["owner", "admin"])
      .order("role", { ascending: true });

    if (error) {
      console.error("loadAdmins error:", error);
      showToast("خطا در دریافت لیست ادمین‌ها ❌", "error");
      return;
    }

    const container = document.getElementById("adminsContainer");
    container.innerHTML = `
    <table class="users-table">
      <thead>
        <tr>
          <th>کاور</th>
          <th>نام کاربری</th>
          <th>ایمیل</th>
          <th>سمت</th>
          <th>عملیات</th>
        </tr>
      </thead>
      <tbody id="adminsTableBody"></tbody>
    </table>
  `;

    const tbody = document.getElementById("adminsTableBody");

    data.forEach((u) => {
      const avatar = u.avatar_url
        ? supabase.storage.from("avatars").getPublicUrl(u.avatar_url).data
            .publicUrl
        : "/images/icons8-user-96.png";

      const row = document.createElement("tr");
      row.innerHTML = `
      <td><img src="${avatar}" alt="avatar" class="avatar-img"></td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td><span class="role-badge ${u.role}">${u.role}</span></td>
      <td>
        ${
          currentUser.role === "owner" && u.role !== "owner"
            ? `<div class="button-wrap"><button class="btn-danger" onclick="demoteToUser('${u.id}')"><span>Demote</span></button><div class="button-shadow"></div></div>
               <div class="button-wrap"><button class="btn-danger" onclick="blockUser('${u.id}','${u.email}','${u.username}')"><span>Block</span></button><div class="button-shadow"></div></div>`
            : ""
        }
      </td>
    `;
      tbody.appendChild(row);
    });
  }

  let usersPage = 1;
  const USERS_PAGE_SIZE = 10;
  function renderUsersPagination(total) {
    const container = document.getElementById("usersPagination");
    const pages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
    container.innerHTML = "";

    for (let p = 1; p <= pages; p++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-subtle pagination-users-btn";
      btn.textContent = p;
      if (p === usersPage) btn.disabled = true;
      btn.addEventListener("click", () => {
        usersPage = p;
        const q = document.getElementById("userSearch")?.value?.trim() || "";
        loadUsers(q);
      });
      container.appendChild(btn);
    }
  }
  // === Confirm Modal ===
  async function confirmDialog(
    message,
    { title = "Confirm", confirmText = "Confirm", cancelText = "Cancel" } = {}
  ) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
      <div class="modal-card">
        <h3 class="modal-title">${title}</h3>
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <div class="button-wrap"><button class="btn btn-subtle" data-role="cancel"><span>${cancelText}</span></button><div class="button-shadow"></div></div>
          <div class="button-wrap"><button class="btn btn-danger" data-role="ok"><span>${confirmText}</span></button><div class="button-shadow"></div></div>
        </div>
      </div>`;
      document.body.appendChild(overlay);

      const cleanup = () => overlay.remove();
      overlay.addEventListener("click", (e) => {
        const role = e.target?.dataset?.role;
        if (role === "ok") {
          cleanup();
          resolve(true);
        }
        if (role === "cancel" || e.target === overlay) {
          cleanup();
          resolve(false);
        }
      });
    });
  }

  // === Owner Password Modal ===
  async function passwordDialog({
    title = "Owner confirmation",
    placeholder = "Owner password",
    confirmText = "Confirm",
    cancelText = "Cancel",
  } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
      <div class="modal-card">
        <h3 class="modal-title">${title}</h3>
        <input type="password" class="modal-input" id="ownerConfirmInput" placeholder="${placeholder}" />
        <div class="modal-actions">
          <div class="button-wrap"><button class="btn btn-subtle" data-role="cancel"><span>${cancelText}</span></button><div class="button-shadow"></div></div>
          <div class="button-wrap"><button class="btn btn-primary" data-role="ok"><span>${confirmText}</span></button><div class="button-shadow"></div></div>
        </div>
      </div>`;
      document.body.appendChild(overlay);

      const input = overlay.querySelector("#ownerConfirmInput");
      input?.focus();

      const cleanup = () => overlay.remove();
      overlay.addEventListener("click", (e) => {
        const role = e.target?.dataset?.role;
        if (role === "ok") {
          const val = input.value.trim();
          cleanup();
          resolve(val || null);
        }
        if (role === "cancel" || e.target === overlay) {
          cleanup();
          resolve(null);
        }
      });
    });
  }

  // === Block User ===
  async function blockUser(userId, email) {
    if (denyIfNotOwner()) return;

    const ok = await confirmDialog(`Block ${email}?`, {
      confirmText: "Block",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      const { data: existing, error: selErr } = await supabase
        .from("blocked_users")
        .select("email")
        .eq("email", email)
        .limit(1);

      if (selErr) {
        console.error("Error checking blocked_users:", selErr);
        showToast("Error checking blocked list");
        return;
      }

      if (!existing || existing.length === 0) {
        const { error: insErr } = await supabase
          .from("blocked_users")
          .insert([{ email, user_id: userId }]);
        if (insErr) {
          console.error("Error inserting into blocked_users:", insErr);
          showToast("Error adding to blocked list");
          return;
        }
      }

      const { error: updErr } = await supabase
        .from("users")
        .update({ is_blocked: true })
        .eq("id", userId);

      if (updErr) {
        console.error("Error updating users.is_blocked:", updErr);
        showToast("Error flagging user as blocked");
        return;
      }

      showToast(`User ${email} blocked`);
      try {
        await loadUsers?.();
      } catch {}
      try {
        await loadAdmins?.();
      } catch {}
    } catch (err) {
      console.error("blockUser exception:", err);
      showToast("Unexpected error while blocking user");
    }
  }

  // === Demote to User ===
  async function demoteToUser(userId) {
    if (denyIfNotOwner()) return;

    const ok = await confirmDialog("Remove admin privileges?", {
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      const password = await passwordDialog({
        title: "Owner confirmation",
        placeholder: "Owner password",
      });
      if (!password) return;

      const { data: ownerData, error: ownerErr } = await supabase
        .from("users")
        .select("id, password")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (ownerErr || !ownerData) {
        console.error("Owner check error:", ownerErr);
        showToast("خطا در بررسی Owner ❌", "error");
        return;
      }

      if (ownerData.password !== password) {
        showToast("رمز تأیید اشتباه است ❌", "error");
        return;
      }

      const { error: updErr } = await supabase
        .from("users")
        .update({ role: "user" })
        .eq("id", userId);

      if (updErr) {
        console.error("demoteToUser error:", updErr);
        showToast("خطا در تغییر نقش ❌", "error");
        return;
      }

      showToast("ادمین با موفقیت به User تغییر یافت ✅", "success");
      loadAdmins();
      loadUsers();
    } catch (err) {
      console.error("demoteToUser exception:", err);
      showToast("خطای غیرمنتظره ❌", "error");
    }
  }

  // === Promote to Admin ===
  async function promoteToAdmin(userId) {
    if (denyIfNotOwner()) return;

    const password = await passwordDialog({
      title: "Owner confirmation",
      placeholder: "Owner password",
    });
    if (!password) return;

    try {
      const { data: ownerData, error: ownerErr } = await supabase
        .from("users")
        .select("id, password")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (ownerErr || !ownerData) {
        console.error("Owner check error:", ownerErr);
        showToast("خطا در بررسی Owner ❌", "error");
        return;
      }

      if (ownerData.password !== password) {
        showToast("رمز تأیید اشتباه است ❌", "error");
        return;
      }

      const { error: updErr } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("id", userId);

      if (updErr) {
        console.error("promoteToAdmin error:", updErr);
        showToast("خطا در ارتقا ❌", "error");
        return;
      }

      showToast("کاربر با موفقیت به Admin ارتقا یافت ✅", "success");
      loadUsers();
      loadAdmins();
    } catch (err) {
      console.error("promoteToAdmin exception:", err);
      showToast("خطای غیرمنتظره ❌", "error");
    }
  }

  // make functions available globally
  window.promoteToAdmin = promoteToAdmin;
  window.blockUser = blockUser;
  window.demoteToUser = demoteToUser;

  // -------------------- Admin: add/edit movie --------------------
  if (addMovieForm && movieList) {
    enforceAdminGuard().then((ok) => {
      if (!ok) return;
    });

    if (!window.__addMovieSubmitBound) {
      window.__addMovieSubmitBound = true;

      addMovieForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === "function")
          e.stopImmediatePropagation();

        const ok = await enforceAdminGuard();
        if (!ok) return;

        // --------- read base fields ---------
        const modeEl = document.getElementById("mode");
        const selectedType = modeEl?.value || "single"; // 'single' | 'collection' | 'serial'

        const title = document.getElementById("title")?.value?.trim() || "";
        const link = document.getElementById("link")?.value?.trim() || "";
        const synopsis =
          document.getElementById("synopsis")?.value?.trim() || "";
        const director =
          document.getElementById("director")?.value?.trim() || "";
        const product = document.getElementById("product")?.value?.trim() || "";
        const stars = document.getElementById("stars")?.value?.trim() || "";
        const imdb = document.getElementById("imdb")?.value?.trim() || "";
        const release_info =
          document.getElementById("release_info")?.value?.trim() || "";
        const genre = document.getElementById("genre")?.value?.trim() || "";

        // --------- cover upload (main) ---------
        const coverInput = document.getElementById("coverFile");
        const coverFile = coverInput?.files?.[0];
        let coverUrl = "";

        const isEditing = Boolean(editingMovie && editingMovie.id);

        // --------- helpers for bundle forms ---------
        const formsWrapEl = document.getElementById("bundle-forms");
        const bundleChildren = formsWrapEl ? [...formsWrapEl.children] : [];
        const hasBundleForms = bundleChildren.length > 0;

        const buildItemsFromForms = (movieId, type) => {
          const out = [];
          bundleChildren.forEach((formEl, idx) => {
            const titleVal =
              formEl
                .querySelector('input[placeholder="Title"]')
                ?.value?.trim() || "";
            const linkValCollection =
              formEl
                .querySelector('input[placeholder="File Link"]')
                ?.value?.trim() || "";
            const linkValSerial =
              formEl
                .querySelector('input[placeholder="Link"]')
                ?.value?.trim() || "";
            const linkVal =
              type === "collection" ? linkValCollection : linkValSerial;
            if (!titleVal && !linkVal) return;

            // کاور آیتم: یا فایل جدید یا کاور قبلی ذخیره‌شده
            let coverVal = "";
            const fileInput = formEl.querySelector('input[type="file"]');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
              coverVal = URL.createObjectURL(fileInput.files[0]); // موقت
            } else if (formEl.dataset.existingCover) {
              coverVal = formEl.dataset.existingCover;
            }

            if (type === "collection") {
              out.push({
                movie_id: movieId,
                title: titleVal,
                cover: coverVal,
                link: linkValCollection,
                synopsis: formEl.querySelector("textarea")?.value?.trim() || "",
                director:
                  formEl
                    .querySelector('input[placeholder="Director"]')
                    ?.value?.trim() || "",
                product:
                  formEl
                    .querySelector('input[placeholder="Product"]')
                    ?.value?.trim() || "",
                stars:
                  formEl
                    .querySelector('input[placeholder="Stars"]')
                    ?.value?.trim() || "",
                imdb:
                  formEl
                    .querySelector('input[placeholder="IMDB"]')
                    ?.value?.trim() || "",
                release_info:
                  formEl
                    .querySelector('input[placeholder="Release Info"]')
                    ?.value?.trim() || "",
                genre:
                  formEl
                    .querySelector(
                      'input[placeholder="Genre (space-separated)"]'
                    )
                    ?.value?.trim() || "",
                order_index: idx,
              });
            } else {
              out.push({
                movie_id: movieId,
                title: titleVal,
                cover: coverVal,
                link: linkValSerial,
                order_index: idx,
              });
            }
          });
          return out;
        };

        // --------- شمارش کل بخش‌ها برای Progress کلی پست ---------
        const uploadParts =
          (coverFile ? 1 : 0) +
          bundleChildren.reduce((acc, formEl) => {
            const f = formEl.querySelector('input[type="file"]');
            return acc + (f && f.files && f.files.length > 0 ? 1 : 0);
          }, 0);

        let dbParts = 1;
        if (isEditing) {
          dbParts = 2;
        } else if (!isEditing && selectedType !== "single" && hasBundleForms) {
          dbParts = 3;
        }

        const totalParts = uploadParts + dbParts;
        startPostProgress(totalParts, "در حال آپلود و ثبت پست...");

        // --------- آپلود کاور اصلی با Progress واقعی ---------
        if (coverFile) {
          try {
            const filename = `public/${Date.now()}_${coverFile.name}`;
            await uploadWithProgress(coverFile, filename);
            const { data: publicUrl } = supabase.storage
              .from("covers")
              .getPublicUrl(filename);
            coverUrl = publicUrl.publicUrl;
            completePart();
          } catch (err) {
            console.error("main cover upload error", err);
            finishPostProgress(false);
            showToast("Upload cover failed");
            return;
          }
        }

        // --------- آپلود کاور آیتم‌ها با Progress واقعی ---------
        const uploadItemCoversInPlace = async (items) => {
          for (let i = 0; i < bundleChildren.length; i++) {
            const formEl = bundleChildren[i];
            const fileInput = formEl.querySelector('input[type="file"]');
            const file = fileInput?.files?.[0];

            if (file) {
              try {
                const filename = `public/items/${Date.now()}_${i}_${file.name}`;
                await uploadWithProgress(file, filename);
                const { data: publicUrl } = supabase.storage
                  .from("covers")
                  .getPublicUrl(filename);
                if (items[i]) items[i].cover = publicUrl.publicUrl;
                completePart();
              } catch (err) {
                console.error("item cover upload error", err);
                finishPostProgress(false);
                showToast("Error uploading an item cover");
                return false;
              }
            } else {
              const existing = formEl.dataset.existingCover;
              if (existing && items[i]) {
                items[i].cover = existing;
              }
            }
          }
          return true;
        };
        // ==================== EDIT ====================
        if (isEditing) {
          const movieId = editingMovie.id;

          let intendedType = selectedType;

          let items = [];
          if (intendedType !== "single") {
            items = buildItemsFromForms(movieId, intendedType);
            const okUpload = await uploadItemCoversInPlace(items);
            if (!okUpload) return;

            await supabase.from("movie_items").delete().eq("movie_id", movieId);
            if (items.length > 0) {
              await supabase.from("movie_items").insert(items);
            }
          } else {
            await supabase.from("movie_items").delete().eq("movie_id", movieId);
          }

          let finalType = "single";
          if (intendedType === "collection" && items.length >= 0) {
            finalType = "collection";
          } else if (intendedType === "serial" && items.length >= 0) {
            finalType = "serial";
          }

          const updateData = {
            title,
            link,
            synopsis,
            director,
            product,
            stars,
            imdb,
            release_info,
            genre,
            type: finalType,
          };
          if (coverUrl) updateData.cover = coverUrl;

          const { error: updErr } = await supabase
            .from("movies")
            .update(updateData)
            .eq("id", movieId);
          completePart(); // بخش دیتابیس

          if (updErr) {
            console.error("update movie error", updErr);
            finishPostProgress(false);
            showToast("Update movie failed");
            return;
          }

          finishPostProgress(true);
          showToast("Movie updated");
          editingMovie = null;
          addMovieForm.reset();
          if (typeof window.resetMode === "function") window.resetMode();
          await fetchMovies();
          await fetchPopularMovies();
          return;
        }

        // ==================== ADD ====================
        if (!coverUrl) {
          finishPostProgress(false);
          showToast("Please select cover");
          return;
        }

        let provisionalType = "single";
        if (selectedType !== "single" && hasBundleForms) {
          provisionalType = selectedType;
        }

        const newMovie = {
          title,
          cover: coverUrl,
          link,
          synopsis,
          director,
          product,
          stars,
          imdb,
          release_info,
          genre,
          type: provisionalType,
        };

        const { data: inserted, error: addErr } = await supabase
          .from("movies")
          .insert([newMovie])
          .select()
          .single();
        completePart(); // درج فیلم

        if (addErr || !inserted) {
          console.error("movie insert err", addErr);
          finishPostProgress(false);
          showToast("Add movie failed");
          return;
        }

        let items = [];
        if (provisionalType !== "single") {
          items = buildItemsFromForms(inserted.id, provisionalType);

          if (provisionalType === "collection" && items.length < 1) {
            finishPostProgress(false);
            showToast("Collection requires at least 1 item");
            await supabase.from("movies").delete().eq("id", inserted.id);
            return;
          }

          const okUpload = await uploadItemCoversInPlace(items);
          if (!okUpload) return;

          if (items.length > 0) {
            const { error: itemsError } = await supabase
              .from("movie_items")
              .insert(items);
            completePart(); // درج آیتم‌ها
            if (itemsError) {
              console.error("movie_items insert err", itemsError);
              finishPostProgress(false);
              showToast("Add items failed");
              await supabase.from("movies").delete().eq("id", inserted.id);
              return;
            }
          }
        }

        let finalType = "single";
        if (provisionalType === "collection" && items.length >= 1) {
          finalType = "collection";
        } else if (provisionalType === "serial" && items.length >= 1) {
          finalType = "serial";
        }

        await supabase
          .from("movies")
          .update({ type: finalType })
          .eq("id", inserted.id);
        completePart(); // آپدیت نوع نهایی

        finishPostProgress(true);
        showToast("Movie added");
        addMovieForm.reset();
        if (typeof window.resetMode === "function") window.resetMode();
        await fetchMovies();
        await fetchPopularMovies();
        return;
      });
    }
  }

  // -------------------- Unapproved comments badge --------------------
  async function checkUnapprovedComments() {
    try {
      const badge = document.getElementById("commentBadge");

      if (!currentUser || !["owner", "admin"].includes(currentUser.role)) {
        if (badge) badge.style.display = "none";
        return;
      }

      const { data, error } = await supabase
        .from("comments")
        .select("id")
        .eq("approved", false)
        .limit(1);

      if (error) {
        console.error("Error checking unapproved comments:", error);
        if (badge) badge.style.display = "none";
        return;
      }

      if (data && data.length > 0) {
        if (badge) badge.style.display = "grid";
      } else {
        if (badge) badge.style.display = "none";
      }
    } catch (err) {
      console.error("Exception in checkUnapprovedComments:", err);
      const badge = document.getElementById("commentBadge");
      if (badge) badge.style.display = "none";
    }
  }

  // -------------------- Social links --------------------
  async function fetchSocialLinks() {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("fetch social links error", error);
        return;
      }
      const grid = document.getElementById("socialGrid");
      if (!grid) return;
      grid.innerHTML = (data || [])
        .map(
          (s) => `
      <a href="${escapeHtml(
        s.url
      )}" target="_blank" rel="noopener" class="social-item">
        <img src="${escapeHtml(s.icon)}" alt="${escapeHtml(s.title)}">
        <span>${escapeHtml(s.title)}</span>
      </a>
    `
        )
        .join("");
    } catch (err) {
      console.error("fetchSocialLinks exception", err);
    }
  }

  const linksHeader = document.getElementById("linksHeader");
  if (linksHeader) {
    linksHeader.addEventListener("click", () => {
      const grid = document.getElementById("socialGrid");
      grid.classList.toggle("hidden");
      const icon = linksHeader.querySelector(".toggle-icon");
      if (grid.classList.contains("hidden")) {
        icon.classList.remove("bi-chevron-up");
        icon.classList.add("bi-chevron-down");
      } else {
        icon.classList.remove("bi-chevron-down");
        icon.classList.add("bi-chevron-up");
      }
    });
  }

  const addSocialForm = document.getElementById("addSocialForm");
  const socialList = document.getElementById("socialList");
  let editingSocialId = null;

  async function fetchAdminSocialLinks() {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    socialList.innerHTML = (data || [])
      .map(
        (s) => `
    <div class="message-item">
      <span class="message-text">${escapeHtml(s.title)}</span>
      <div class="message-actions">
        <div class="button-wrap"><button class="btn-edit" data-id="${
          s.id
        }"><span><i class="bi bi-pencil"></i> Edit</span></button><div class="button-shadow"></div></div>
        <div class="button-wrap"><button class="btn-delete" data-id="${
          s.id
        }"><span><i class="bi bi-trash"></i> Delete</span></button><div class="button-shadow"></div></div>
      </div>
    </div>
  `
      )
      .join("");
  }

  if (addSocialForm) {
    addSocialForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titleEl = document.getElementById("socialTitle");
      const urlEl = document.getElementById("socialUrl");
      const iconEl = document.getElementById("socialIcon");
      const title = titleEl.value.trim();
      const url = urlEl.value.trim();

      if (!title || !url) {
        showToast("Title and link are required.");
        return;
      }

      let iconUrl = null;
      if (iconEl.files && iconEl.files[0]) {
        const file = iconEl.files[0];
        const filename = `social/${Date.now()}_${file.name}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from("covers")
          .upload(filename, file, { upsert: true });
        if (upErr) {
          showToast("Error uploading icon");
          return;
        }
        const { data: publicUrl } = supabase.storage
          .from("covers")
          .getPublicUrl(upData.path);
        iconUrl = publicUrl.publicUrl;
      }

      try {
        if (editingSocialId) {
          // update
          const payload = { title, url };
          if (iconUrl) payload.icon = iconUrl;
          const { error } = await supabase
            .from("social_links")
            .update(payload)
            .eq("id", editingSocialId);
          if (error) throw error;
          showToast("Link updated.");
          editingSocialId = null;
          addSocialForm.querySelector(".admin-submit").textContent = "Add link";
        } else {
          // insert
          const { error } = await supabase
            .from("social_links")
            .insert([{ title, url, icon: iconUrl }]);
          if (error) throw error;
          showToast("Link added.");
        }

        addSocialForm.reset();
        await fetchAdminSocialLinks();
        await fetchSocialLinks();
      } catch (err) {
        console.error(err);
        showToast("An error occurred.");
      }
    });

    socialList.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;

      if (btn.classList.contains("btn-delete")) {
        const ok = await showDialog({
          message: "Delete this link?",
          type: "confirm",
        });
        if (!ok) return;
        const { error } = await supabase
          .from("social_links")
          .delete()
          .eq("id", id);
        if (error) showToast("Error deleting");
        else {
          await fetchAdminSocialLinks();
          await fetchSocialLinks();
        }
        return;
      }

      if (btn.classList.contains("btn-edit")) {
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error || !data) {
          showToast("Unable to load link.");
          return;
        }

        // پر کردن فرم
        document.getElementById("socialTitle").value = data.title || "";
        document.getElementById("socialUrl").value = data.url || "";
        const preview = document.getElementById("socialIconPreview");
        if (preview) {
          preview.src = data.icon || "";
          preview.style.display = data.icon ? "" : "none";
        }

        editingSocialId = id;
        addSocialForm.querySelector(".admin-submit").textContent =
          "Update link";
        addSocialForm.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    fetchAdminSocialLinks();
  }
  // -------------------- Bundle (Collection / Serial) forms UI --------------------
  const btnCollection = document.getElementById("btn-collection");
  const btnSerial = document.getElementById("btn-serial");
  const formsWrap = document.getElementById("bundle-forms");
  const actionsBar = document.getElementById("bundle-actions");
  const btnAdd = document.getElementById("btn-add-item");
  const btnRemove = document.getElementById("btn-remove-last");
  const modeInput = document.getElementById("mode");

  if (
    btnCollection &&
    btnSerial &&
    formsWrap &&
    actionsBar &&
    btnAdd &&
    btnRemove &&
    modeInput
  ) {
    function resetMode() {
      modeInput.value = "single";
      btnCollection.classList.remove("active");
      btnSerial.classList.remove("active");
      btnCollection.style.display = "";
      btnSerial.style.display = "";
      btnCollection.style.flex = "1";
      btnSerial.style.flex = "1";
      formsWrap.innerHTML = "";
      actionsBar.classList.remove("show");
    }
    function setMode(newMode) {
      if (modeInput.value === newMode) return;
      modeInput.value = newMode;
      formsWrap.innerHTML = "";
      if (newMode === "collection") {
        btnCollection.classList.add("active");
        btnSerial.classList.remove("active");
        btnSerial.style.display = "none";
        btnCollection.style.flex = "1 1 100%";
        btnAdd.textContent = "➕ افزودن اپیزود";
        btnRemove.textContent = "❌ حذف آخرین";
        addCollectionForm();
        actionsBar.classList.add("show");
      } else if (newMode === "serial") {
        btnSerial.classList.add("active");
        btnCollection.classList.remove("active");
        btnCollection.style.display = "none";
        btnSerial.style.flex = "1 1 100%";
        btnAdd.textContent = "➕ افزودن قسمت";
        btnRemove.textContent = "❌ حذف آخرین";
        addSerialForm();
        actionsBar.classList.add("show");
      } else {
        resetMode();
      }
    }
    function addCollectionForm() {
      const div = document.createElement("div");
      div.className = "admin-form bundle-item";
      div.innerHTML = `
        <input type="text" placeholder="Title" />
        <input type="file" accept="image/*" />
        <input type="text" placeholder="File Link" />
        <textarea placeholder="Synopsis"></textarea>
        <input type="text" placeholder="Director" />
        <input type="text" placeholder="Product" />
        <input type="text" placeholder="Stars" />
        <input type="text" placeholder="IMDB" />
        <input type="text" placeholder="Release Info" />
        <input type="text" placeholder="Genre (space-separated)" />
      `;
      formsWrap.appendChild(div);
    }
    function addSerialForm() {
      const div = document.createElement("div");
      div.className = "admin-form bundle-item";
      div.innerHTML = `
        <input type="text" placeholder="Title" />
        <input type="file" accept="image/*" />
        <input type="text" placeholder="Link" />
      `;
      formsWrap.appendChild(div);
    }
    btnCollection.addEventListener("click", () => setMode("collection"));
    btnSerial.addEventListener("click", () => setMode("serial"));
    btnAdd.addEventListener("click", () => {
      if (modeInput.value === "collection") addCollectionForm();
      else if (modeInput.value === "serial") addSerialForm();
    });
    btnRemove.addEventListener("click", () => {
      if (formsWrap.lastElementChild)
        formsWrap.removeChild(formsWrap.lastElementChild);
      if (formsWrap.children.length === 0) resetMode();
    });
  }

  const adminSearchInput = document.getElementById("adminSearch");

  if (adminSearchInput) {
    adminSearchInput.addEventListener("input", async () => {
      const q = adminSearchInput.value.trim().toLowerCase();

      if (!q) {
        loadAdminMovies(1);
        return;
      }

      // سرچ در دیتابیس
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .or(`title.ilike.%${q}%,director.ilike.%${q}%,genre.ilike.%${q}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin search error:", error);
        return;
      }

      renderAdminMovieList(data);
      // صفحه‌بندی رو خالی کن چون سرچ معمولاً همه نتایج رو نشون میده
      const adminPagination = document.getElementById("admin-pagination");
      if (adminPagination) adminPagination.innerHTML = "";
    });
  }

  // -------------show upload toast
  function showUploadToast(message) {
    const container = document.getElementById("toast-container");
    container.innerHTML = ""; // فقط یکی نشون بده

    const toast = document.createElement("div");
    toast.className = "toast";

    const msg = document.createElement("div");
    msg.className = "message";
    msg.textContent = message;

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressFill = document.createElement("div");
    progressFill.className = "progress-fill";

    progressBar.appendChild(progressFill);
    toast.appendChild(msg);
    toast.appendChild(progressBar);
    container.appendChild(toast);

    // ذخیره وضعیت در localStorage
    localStorage.setItem(
      "uploadToast",
      JSON.stringify({ message, progress: 0 })
    );
  }

  function updateUploadProgress(percent) {
    const fill = document.querySelector(".progress-fill");
    if (fill) {
      fill.style.width = percent + "%";
    }

    // ذخیره درصد در localStorage
    const saved = localStorage.getItem("uploadToast");
    if (saved) {
      const data = JSON.parse(saved);
      data.progress = percent;
      localStorage.setItem("uploadToast", JSON.stringify(data));
    }
  }

  function clearUploadToast() {
    const container = document.getElementById("toast-container");
    container.innerHTML = "";
    localStorage.removeItem("uploadToast");
  }

  // وقتی صفحه لود شد، وضعیت رو از localStorage بخون
  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("uploadToast");
    if (saved) {
      const { message, progress } = JSON.parse(saved);
      showUploadToast(message);
      updateUploadProgress(progress);
    }
  });

  // هر 10 دقیقه یکبار یک درخواست ساده به سوپابیس
  setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from("movie_items")
        .select("id")
        .limit(1);

      if (error) {
        console.error("Keep-alive error:", error.message);
      } else {
        console.log("Keep-alive ping OK");
      }
    } catch (err) {
      console.error("Keep-alive failed:", err);
    }
  }, 10 * 60 * 1000); // هر 10 دقیقه

  // -------------------- Admin Tabs --------------------
  function initAdminTabs() {
    const tabButtons = document.querySelectorAll(".admin-tabs .tab-btn");

    const sections = {
      posts: [".send_post", ".released_movies", "#popular-movies-section"],
      messages: [".admin_messages", "#usersMessages"],
      comments: ["#unapproved-comments-section"],
      links: ["#social-links-section"],
      analytics: ["#analytics"],
      users: ["#users"],
    };

    function showSection(key) {
      // همه سکشن‌ها رو مخفی کن
      Object.values(sections)
        .flat()
        .forEach((sel) => {
          document.querySelectorAll(sel).forEach((el) => {
            el.style.display = "none";
          });
        });

      // سکشن‌های مربوط به تب انتخاب‌شده رو نشون بده
      (sections[key] || []).forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.style.display = "";
        });
      });
    }

    // پیش‌فرض: تب اول
    showSection("posts");

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        showSection(btn.dataset.target);

        // وقتی تب Analytics فعال شد
        if (btn.dataset.target === "analytics") {
          loadAnalytics();
        }

        // وقتی تب Users فعال شد
        if (btn.dataset.target === "users") {
          loadAdmins();
          loadUsers();
        }

        // ✅ وقتی تب Messages فعال شد
        if (btn.dataset.target === "messages") {
          // اول: اطمینان از بسته بودن پنل چت
          try {
            const adminThreadOverlay =
              document.getElementById("adminThreadOverlay");
            const adminThreadMessages = document.getElementById(
              "adminThreadMessages"
            );
            if (adminThreadOverlay) {
              adminThreadOverlay.setAttribute("aria-hidden", "true");
              adminThreadOverlay.style.display = "none";
            }
            if (adminThreadMessages) {
              adminThreadMessages.innerHTML = ""; // خالی کردن محتوای چت تا ظاهر نشه
            }
            if (typeof currentAdminThreadId !== "undefined") {
              currentAdminThreadId = null;
            }
          } catch (err) {
            console.warn("Error hiding adminThreadOverlay:", err);
          }

          // بعد: لود لیست کاربران
          loadUserThreads(1);
        }
      });
    });
  }

  async function loadAppVersion() {
    try {
      const { data, error } = await supabase
        .from("app_meta")
        .select("value")
        .eq("key", "version")
        .single();

      if (!error && data) {
        const el = document.getElementById("appVersion");
        if (el) el.textContent = "v" + data.value;
      }
    } catch (err) {
      console.error("loadAppVersion error:", err);
    }
  }
  loadAppVersion();

  document
    .getElementById("saveVersionBtn")
    ?.addEventListener("click", async () => {
      const version = document.getElementById("versionInput").value.trim();
      if (!version) return;

      const { error } = await supabase
        .from("app_meta")
        .upsert({ key: "version", value: version });

      if (!error) {
        showToast("Version updated to " + version);
        loadAppVersion(); // برای آپدیت فوری در سایدمنو
      } else {
        showToast("Error updating version");
      }
    });
  
  // === IMDb Rating Filter (with persistent toast badge) ===
const ratingTrack = document.getElementById("ratingTrack");
const ratingFill = document.getElementById("ratingFill");
const ratingKnob = document.getElementById("ratingKnob");
const ratingBubbleValue = document.getElementById("ratingBubbleValue");
const applyRatingFilterBtn = document.getElementById("applyRatingFilter");
const activeFiltersContainer = document.getElementById("activeFilters");
// نکته: imdbMinRating در بالای فایل به صورت global تعریف شده
// let imdbMinRating = null;  // اینجا دیگر تعریفش نکن

function setSliderPercent(pct) {
  if (!ratingFill || !ratingKnob) return;
  const clamped = Math.max(0, Math.min(100, pct));
  ratingFill.style.width = clamped + "%";
  ratingKnob.style.left = clamped + "%";
  const value = (clamped / 10).toFixed(1); // 0..100 => 0.0..10.0
  ratingKnob.setAttribute("aria-valuenow", value);
  if (ratingBubbleValue) ratingBubbleValue.textContent = value;
  return parseFloat(value);
}

// منطق drag روی knob
if (ratingTrack && ratingKnob && ratingFill && ratingBubbleValue) {
  const trackRect = () => ratingTrack.getBoundingClientRect();

  const onMove = (clientX) => {
    const rect = trackRect();
    const x = Math.max(rect.left, Math.min(clientX, rect.right));
    const pct = ((x - rect.left) / rect.width) * 100;
    setSliderPercent(pct);
  };

  let dragging = false;

  ratingKnob.addEventListener("mousedown", (e) => {
    e.preventDefault();
    dragging = true;
    ratingKnob.classList.add("dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (dragging) onMove(e.clientX);
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      ratingKnob.classList.remove("dragging");
    }
  });

  ratingKnob.addEventListener(
    "touchstart",
    (e) => {
      dragging = true;
      ratingKnob.classList.add("dragging");
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      if (touch) onMove(touch.clientX);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    () => {
      if (dragging) {
        dragging = false;
        ratingKnob.classList.remove("dragging");
      }
    },
    { passive: true }
  );

  // حالت اولیه
  setSliderPercent(0);
}

/**
 * فقط badge مربوط به IMDb را آپدیت می‌کند
 * - اگر imdbMinRating == null باشد، فقط همان badge را حذف می‌کند.
 * - دیگر badgeها (مثل Year) دست‌نخورده می‌مانند.
 */
function updateImdbBadge() {
  if (!activeFiltersContainer) return;

  // badge فعلی IMDb (اگر وجود داشته باشد)
  let badge = activeFiltersContainer.querySelector('[data-filter="imdb"]');

  // اگر فیلتر غیرفعال است، فقط badge خودش را حذف کن و برگرد
  if (imdbMinRating == null) {
    if (badge) badge.remove();
    return;
  }

  // اگر badge وجود ندارد، بساز
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "filter-badge";
    badge.dataset.filter = "imdb";

    const label = document.createElement("span");
    label.className = "filter-label";
    badge.appendChild(label);

    const btnWrap = document.createElement("div");
    btnWrap.className = "button-wrap";

    const btn = document.createElement("button");
    btn.id = "btnClearRatingFilter";
    btn.type = "button";
    btn.innerHTML = "<span>×</span>";
    btn.addEventListener("click", clearRatingFilter);

    const shadow = document.createElement("div");
    shadow.className = "button-shadow";

    btnWrap.appendChild(btn);
    btnWrap.appendChild(shadow);
    badge.appendChild(btnWrap);
  } else if (badge.parentNode === activeFiltersContainer) {
    // قبل از insert دوباره، حذفش کن تا به بالای لیست منتقل شود
    activeFiltersContainer.removeChild(badge);
  }

  // متن label را آپدیت کن
  const labelEl = badge.querySelector(".filter-label");
  if (labelEl) {
    labelEl.textContent = `IMDb ≥ ${imdbMinRating.toFixed(1)}`;
  }

  // همیشه badge جدید یا آپدیت‌شده را بالاتر از بقیه قرار بده
  if (activeFiltersContainer.firstChild) {
    activeFiltersContainer.insertBefore(badge, activeFiltersContainer.firstChild);
  } else {
    activeFiltersContainer.appendChild(badge);
  }
}

// کلیک روی دکمه Apply برای فیلتر IMDb
if (applyRatingFilterBtn) {
  applyRatingFilterBtn.addEventListener("click", () => {
    const val = parseFloat(ratingBubbleValue?.textContent || "0");
    imdbMinRating = val > 0 ? val : null;

    // وقتی فیلتر عوض می‌شود، از صفحه ۱ رندر کن
    currentPage = 1;
    renderPagedMovies(true);

    // فقط badge IMDb را بساز/آپدیت کن
    updateImdbBadge();
  });
}

// پاک‌کردن فقط فیلتر IMDb (بدون دست زدن به Year)
function clearRatingFilter() {
  imdbMinRating = null;
  setSliderPercent(0);

  currentPage = 1;
  renderPagedMovies(true);

  // فقط badge خودش را حذف کند
  updateImdbBadge();
}


  // ===== Chat to Admin =====

  // State
  let chatThreadId = null;
  let chatUnreadForUser = false;

  // Elements
  const chatBubble = document.getElementById("chatBubble");
  const chatBubbleBadge = document.getElementById("chatBubbleBadge");

  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const chatAttachBtn = document.getElementById("chatAttachBtn");
  const chatAttachFile = document.getElementById("chatAttachFile");

  const chatOverlay = document.getElementById("chatOverlay");
  const chatBackBtn = document.getElementById("chatBackBtn");
  const chatMessagesList = document.getElementById("chatMessagesList");

  const overlayInput = document.getElementById("overlayInput");
  const overlaySendBtn = document.getElementById("overlaySendBtn");
  const overlayAttachBtn = document.getElementById("overlayAttachBtn");
  const overlayAttachFile = document.getElementById("overlayAttachFile");

  // Badge روی دکمه منو
  let chatMenuBadgeEl;

  // فعال/غیرفعال شدن ارسال با متن
  function updateSendEnabled() {
    const hasTextCollapsed = (chatInput?.value || "").trim().length > 0;
    const hasTextExpanded = (overlayInput?.value || "").trim().length > 0;

    if (chatSendBtn)
      chatSendBtn.classList.toggle("disabled", !hasTextCollapsed);
    if (overlaySendBtn)
      overlaySendBtn.classList.toggle("disabled", !hasTextExpanded);
  }
  chatInput?.addEventListener("input", updateSendEnabled);
  overlayInput?.addEventListener("input", updateSendEnabled);

  // باز کردن اوورلی با فوکوس یا کلیک روی حباب

  const userChatBackBtn = document.getElementById("userChatBackBtn");

  function openChatOverlay() {
    if (!currentUser) {
      showToast("برای ارسال پیام ابتدا لاگین کنید");
      return;
    }

    // پاک کردن بدج‌ها
    chatBubbleBadge?.style && (chatBubbleBadge.style.display = "none");
    if (typeof chatMenuBadgeEl !== "undefined" && chatMenuBadgeEl) {
      chatMenuBadgeEl.remove();
    }

    // اگر بسته بود → یک استیت برای بک‌باتن بساز
    if (chatOverlay && chatOverlay.getAttribute("aria-hidden") !== "false") {
      history.pushState({ overlay: "chat" }, "");
    }

    // اوورلی باز شود
    chatOverlay?.setAttribute("aria-hidden", "false");

    // کلاس وضعیت روی والد برای مخفی کردن ردیف ورودی
    chatBubble?.classList.add("chat-open");

    loadOrCreateThreadAndMessages();
  }

  function closeChatOverlay() {
    // اوورلی بسته شود
    chatOverlay?.setAttribute("aria-hidden", "true");

    // حذف کلاس وضعیت از والد برای نمایش دوباره ردیف ورودی
    chatBubble?.classList.remove("chat-open");
  }

  // اتصال‌ها
  chatInput?.addEventListener("focus", (e) => {
    e.stopPropagation();
    openChatOverlay();
  });

  chatBubble?.addEventListener("click", (e) => {
    e.stopPropagation();
    openChatOverlay();
  });

  // دکمه Back داخل اوورلی
  userChatBackBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    // بستن با دکمه داخلی → مستقیم ببند، history را دست نمی‌زنیم
    closeChatOverlay();
  });

  // اتصال‌ها
  chatInput?.addEventListener("focus", (e) => {
    e.stopPropagation();
    openChatOverlay();
  });

  chatBubble?.addEventListener("click", (e) => {
    e.stopPropagation();
    openChatOverlay();
  });

  userChatBackBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeChatOverlay();
  });

  chatInput?.addEventListener("focus", openChatOverlay);
  chatBubble?.addEventListener("click", openChatOverlay);

  // سنجاق
  chatAttachBtn?.addEventListener("click", () => chatAttachFile?.click());
  overlayAttachBtn?.addEventListener("click", () => overlayAttachFile?.click());

  // آپلود عکس
  async function uploadChatImage(file) {
    if (!file || !currentUser) return null;
    const path = `${currentUser.id}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("chat")
      .upload(path, file);
    if (error) {
      console.error("chat image upload error", error);
      showToast("خطا در آپلود تصویر ❌");
      return null;
    }
    const { data: pub } = supabase.storage.from("chat").getPublicUrl(data.path);
    return pub?.publicUrl || null;
  }
  async function ensureThread() {
    if (!currentUser) return null;
    if (chatThreadId) return chatThreadId;

    const { data: existing, error } = await supabase
      .from("user_admin_threads")
      .select("id")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) {
      console.error("thread fetch error", error);
      return null;
    }
    if (existing?.id) {
      chatThreadId = existing.id;
      return chatThreadId;
    }

    const { data: created, error: insErr } = await supabase
      .from("user_admin_threads")
      .insert([{ user_id: currentUser.id }])
      .select()
      .single();
    if (insErr) {
      console.error("thread create error", insErr);
      return null;
    }
    chatThreadId = created.id;
    return chatThreadId;
  }

  // لود پیام‌ها
  async function loadMessages() {
    if (!chatThreadId) return;
    const { data, error } = await supabase
      .from("user_admin_messages")
      .select("*")
      .eq("thread_id", chatThreadId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) {
      console.error("load chat messages error", error);
      return;
    }
    renderChatMessages(data || []);

    // پیام‌های ادمین → seen_by_user
    await supabase
      .from("user_admin_messages")
      .update({ seen_by_user: true })
      .eq("thread_id", chatThreadId)
      .eq("role", "admin")
      .eq("seen_by_user", false);

    // نخ → unread_for_user false
    await supabase
      .from("user_admin_threads")
      .update({ unread_for_user: false })
      .eq("id", chatThreadId);
  }

  function renderChatMessages(arr) {
    chatMessagesList.innerHTML = (arr || [])
      .map((m) => {
        const sideClass = m.role === "user" ? "user" : "admin";
        const imageHtml = m.image_url
          ? `<img class="msg-image" src="${escapeHtml(
              m.image_url
            )}" alt="image">`
          : "";
        const textHtml = m.text
          ? `<div class="msg-text">${escapeHtml(m.text)}</div>`
          : "";
        const time = new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // فقط برای پیام‌های ارسالی کاربر تیک داشته باشیم
        let tickIcon = "";
        if (m.role === "user") {
          tickIcon = m.seen_by_admin
            ? `<img src="/images/icons8-double-tick-50.png" alt="seen">`
            : `<img src="/images/icons8-tick-96.png" alt="sent">`;
        } else {
          tickIcon = ""; // پیام‌های ورودی (ادمین) بدون تیک
        }

        return `
      <div class="msg-row ${sideClass}">
        <div class="msg-bubble ${sideClass}">
          ${imageHtml}
          ${textHtml}
          <div class="msg-meta">
            <span>${escapeHtml(time)}</span>
            ${tickIcon}
          </div>
        </div>
      </div>
    `;
      })
      .join("");
    setTimeout(() => {
      chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
    }, 60);
  }

  async function loadOrCreateThreadAndMessages() {
    const tid = await ensureThread();
    if (!tid) return;
    await loadMessages();
  }

  // ارسال از حالت جمع‌شده
  chatSendBtn?.addEventListener("click", async () => {
    if (chatSendBtn.classList.contains("disabled")) return;
    const text = (chatInput?.value || "").trim();
    if (!text) return;
    await sendChat({ text });
    chatInput.value = "";
    updateSendEnabled();
  });

  // ارسال از اوورلی
  overlaySendBtn?.addEventListener("click", async () => {
    if (overlaySendBtn.classList.contains("disabled")) return;
    const text = (overlayInput?.value || "").trim();
    if (!text) return;
    await sendChat({ text, overlay: true });
    overlayInput.value = "";
    updateSendEnabled();
  });

  // سنجاق حالت جمع‌شده
  chatAttachFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadChatImage(file);
    if (!url) return;
    await sendChat({ image_url: url });
    e.target.value = "";
  });

  // سنجاق در اوورلی
  overlayAttachFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadChatImage(file);
    if (!url) return;
    await sendChat({ image_url: url, overlay: true });
    e.target.value = "";
  });

  async function sendChat({
    text = null,
    image_url = null,
    overlay = false,
  } = {}) {
    if (!currentUser) {
      showToast("ابتدا لاگین کنید");
      return;
    }
    const tid = await ensureThread();
    if (!tid) return;

    const payload = {
      thread_id: tid,
      user_id: currentUser.id,
      role: "user",
      text: text || null,
      image_url: image_url || null,
      sent: true,
    };
    const { error } = await supabase
      .from("user_admin_messages")
      .insert([payload]);
    if (error) {
      console.error("send chat error", error);
      showToast("ارسال ناموفق ❌");
      return;
    }

    // نخ → unread_for_admin true
    await supabase
      .from("user_admin_threads")
      .update({
        unread_for_admin: true,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", tid);

    if (chatOverlay && chatOverlay.style.display === "grid") {
      await loadMessages();
    } else {
      // بدج روی حباب و منو
      chatBubbleBadge?.style && (chatBubbleBadge.style.display = "grid");
      if (menuBtn && !chatMenuBadgeEl) {
        chatMenuBadgeEl = document.createElement("span");
        chatMenuBadgeEl.className = "chat-menu-badge";
        chatMenuBadgeEl.textContent = "!";
        menuBtn.style.position = "relative";
        menuBtn.appendChild(chatMenuBadgeEl);
      }
    }
  }

  // پول وضعیت نخ برای بدج‌ها
  async function pollChatFlags() {
    if (!currentUser) return;
    const { data } = await supabase
      .from("user_admin_threads")
      .select("id, unread_for_user")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    chatThreadId = data?.id || chatThreadId;
    const unread = !!data?.unread_for_user;

    const chatBubbleBadge = document.getElementById("chatBubbleBadge");
    const menuBtn = document.getElementById("menuBtn");
    let chatMenuBadgeEl = menuBtn?.querySelector(".chat-menu-badge");

    if (unread) {
      if (chatBubbleBadge) chatBubbleBadge.style.display = "grid";
      if (menuBtn && !chatMenuBadgeEl) {
        chatMenuBadgeEl = document.createElement("span");
        chatMenuBadgeEl.className = "chat-menu-badge";
        chatMenuBadgeEl.textContent = "!";
        menuBtn.style.position = "relative";
        menuBtn.appendChild(chatMenuBadgeEl);
      }
    } else {
      if (chatBubbleBadge) chatBubbleBadge.style.display = "none";
      if (chatMenuBadgeEl) chatMenuBadgeEl.remove();
    }
  }

  pollChatFlags();
  const CHAT_POLL_MS = 8000; // 8s
  setInterval(pollChatFlags, CHAT_POLL_MS);

  // ===== پیام‌های کاربران در پنل ادمین =====
  let threadsPage = 1;
  const THREADS_PAGE_SIZE = 9;

  async function loadUserThreads(page = 1) {
    threadsPage = page;
    const from = (page - 1) * THREADS_PAGE_SIZE;
    const to = page * THREADS_PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("user_admin_threads")
      .select("id, user_id, last_message_at, unread_for_admin", {
        count: "exact",
      })
      .order("last_message_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("load threads error", error);
      return;
    }

    const grid = document.getElementById("userThreadsGrid");
    grid.innerHTML = "";

    for (const t of data || []) {
      const { data: user } = await supabase
        .from("users")
        .select("username, avatar_url")
        .eq("id", t.user_id)
        .maybeSingle();

      const avatar = user?.avatar_url
        ? supabase.storage.from("avatars").getPublicUrl(user.avatar_url).data
            .publicUrl
        : "/images/icons8-user-96.png";

      const { data: lastMsg } = await supabase
        .from("user_admin_messages")
        .select("text, image_url")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const snippet = lastMsg?.[0]?.text
        ? lastMsg[0].text
        : lastMsg?.[0]?.image_url
        ? "[تصویر]"
        : "";

      const card = document.createElement("div");
      card.className = "user-thread-card";
      card.innerHTML = `
      <img src="${avatar}" alt="avatar">
      <div class="user-thread-name">${user?.username || "کاربر"}</div>
      <div class="user-thread-snippet">${snippet || ""}</div>
      ${t.unread_for_admin ? '<span class="thread-badge">!</span>' : ""}
    `;
      card.addEventListener("click", () => openAdminThread(t.id, user, avatar));
      grid.appendChild(card);
    }

    renderThreadsPagination(count || 0);
  }

  function renderThreadsPagination(total) {
    const cont = document.getElementById("userThreadsPagination");
    const pages = Math.max(1, Math.ceil(total / THREADS_PAGE_SIZE));
    cont.innerHTML = "";
    for (let p = 1; p <= pages; p++) {
      const btn = document.createElement("button");
      btn.className = "btn btn-subtle pagination-users-btn";
      btn.textContent = p;
      if (p === threadsPage) btn.disabled = true;
      btn.addEventListener("click", () => loadUserThreads(p));
      cont.appendChild(btn);
    }
  }

  const adminThreadOverlay = document.getElementById("adminThreadOverlay");
  const adminThreadBackBtn = document.getElementById("adminThreadBackBtn");
  const adminThreadMessages = document.getElementById("adminThreadMessages");
  const adminThreadInput = document.getElementById("adminThreadInput");
  const adminThreadSendBtn = document.getElementById("adminThreadSendBtn");
  const adminThreadAttachBtn = document.getElementById("adminThreadAttachBtn");
  const adminThreadAttachFile = document.getElementById(
    "adminThreadAttachFile"
  );

  let currentAdminThreadId = null;

  // فعال/غیرفعال شدن دکمه ارسال
  function updateAdminSendEnabled() {
    const hasText = (adminThreadInput?.value || "").trim().length > 0;
    adminThreadSendBtn?.classList.toggle("disabled", !hasText);
  }
  adminThreadInput?.addEventListener("input", updateAdminSendEnabled);

  // باز کردن اوورلی
  async function openAdminThread(threadId, user, avatar) {
    document.getElementById("adminThreadTitle").textContent =
      user?.username || "کاربر";
    document.getElementById("adminThreadAvatar").src = avatar;

    currentAdminThreadId = threadId;
    adminThreadOverlay.setAttribute("aria-hidden", "false");
    adminThreadOverlay.style.display = "grid";

    await loadAdminThreadMessages();

    // پیام‌های کاربر → seen_by_admin
    await supabase
      .from("user_admin_messages")
      .update({ seen_by_admin: true })
      .eq("thread_id", threadId)
      .eq("role", "user")
      .eq("seen_by_admin", false);

    // نخ → unread_for_admin false
    await supabase
      .from("user_admin_threads")
      .update({ unread_for_admin: false })
      .eq("id", threadId);
  }

  // بستن اوورلی
  adminThreadBackBtn?.addEventListener("click", () => {
    adminThreadOverlay.setAttribute("aria-hidden", "true");
    adminThreadOverlay.style.display = "none";
    adminThreadInput.value = "";
    updateAdminSendEnabled();
  });

  // لود پیام‌های یک نخ
  async function loadAdminThreadMessages() {
    const { data, error } = await supabase
      .from("user_admin_messages")
      .select("*")
      .eq("thread_id", currentAdminThreadId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) {
      console.error("load admin thread error", error);
      return;
    }

    adminThreadMessages.innerHTML = (data || [])
      .map((m) => {
        const sideClass = m.role === "admin" ? "user" : "admin"; // ادمین سمت راست (سبز)، کاربر سمت چپ (سفید)
        const imageHtml = m.image_url
          ? `<img class="msg-image" src="${m.image_url}" alt="image">`
          : "";
        const textHtml = m.text ? `<div class="msg-text">${m.text}</div>` : "";
        const time = new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // فقط پیام‌های ارسالی ادمین تیک داشته باشن
        let tickIcon = "";
        if (m.role === "admin") {
          tickIcon = m.seen_by_user
            ? `<img src="/images/icons8-double-tick-50.png" alt="seen">`
            : `<img src="/images/icons8-tick-96.png" alt="sent">`;
        } else {
          tickIcon = ""; // پیام‌های ورودی از کاربر بدون تیک
        }

        return `
      <div class="msg-row ${sideClass}">
        <div class="msg-bubble ${sideClass}">
          ${imageHtml}
          ${textHtml}
          <div class="msg-meta">
            <span>${time}</span>
            ${tickIcon}
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    setTimeout(() => {
      adminThreadMessages.scrollTop = adminThreadMessages.scrollHeight;
    }, 60);
  }
  // ارسال پیام
  adminThreadSendBtn?.addEventListener("click", async () => {
    if (adminThreadSendBtn.classList.contains("disabled")) return;
    const text = (adminThreadInput?.value || "").trim();
    if (!text || !currentAdminThreadId) return;
    await adminSendMessage({ text });
    adminThreadInput.value = "";
    updateAdminSendEnabled();
  });

  // ارسال عکس
  adminThreadAttachBtn?.addEventListener("click", () =>
    adminThreadAttachFile?.click()
  );
  adminThreadAttachFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentAdminThreadId) return;
    const url = await uploadChatImage(file);
    if (!url) return;
    await adminSendMessage({ image_url: url });
    e.target.value = "";
  });

  async function adminSendMessage({ text = null, image_url = null } = {}) {
    const { error } = await supabase.from("user_admin_messages").insert([
      {
        thread_id: currentAdminThreadId,
        user_id: currentUser.id, // ادمین
        role: "admin",
        text: text || null,
        image_url: image_url || null,
        sent: true,
      },
    ]);
    if (error) {
      console.error("admin send error", error);
      showToast("ارسال ناموفق ❌");
      return;
    }

    // نخ → unread_for_user true
    await supabase
      .from("user_admin_threads")
      .update({
        unread_for_user: true,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", currentAdminThreadId);

    await loadAdminThreadMessages();
  }

  // ===== بدج پیام‌های کاربران برای ادمین =====
  const adminMessagesBadge = document.getElementById("adminMessagesBadge");

  async function pollAdminUnread() {
    if (!adminMessagesBadge) return;
    const { data, error } = await supabase
      .from("user_admin_threads")
      .select("id")
      .eq("unread_for_admin", true);

    if (error) {
      console.error("pollAdminUnread error", error);
      return;
    }

    if (data && data.length > 0) {
      adminMessagesBadge.style.display = "grid";
    } else {
      adminMessagesBadge.style.display = "none";
    }
  }

  // هر ۳۰ ثانیه یکبار چک کن
  setInterval(pollAdminUnread, 30000);
  pollAdminUnread();

  let lastScrollTop = 0;
  const header = document.querySelector(".main-header");
  const tabs = document.querySelector(".movie-type-tabs");

  window.addEventListener(
    "scroll",
    () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      if (st > lastScrollTop && st > 100) {
        // اسکرول به پایین → مخفی کن
        header?.classList.add("hide");
        tabs?.classList.add("hide");
      } else if (st < lastScrollTop) {
        // اسکرول به بالا → نمایش بده
        header?.classList.remove("hide");
        tabs?.classList.remove("hide");
      }

      lastScrollTop = st <= 0 ? 0 : st;
    },
    { passive: true }
  );

  const goTopBtn = document.getElementById("goTopBtn");

  if (goTopBtn) {
    goTopBtn.addEventListener("click", () => {
      // اسکرول نرم به بالای صفحه
      window.scrollTo({ top: 0, behavior: "smooth" });

      // اضافه کردن کلاس active برای انیمیشن
      goTopBtn.classList.add("active");

      // بعد از 1 ثانیه حذف کلاس active
      setTimeout(() => {
        goTopBtn.classList.remove("active");
      }, 1000);
    });
  }

  // =====================
  // HOMEPAGE MANAGER LOGIC
  // =====================
  (function () {
    const homepageManagerToggle = document.getElementById(
      "homepageManagerToggle"
    );
    const homepageManagerSubmenu = document.getElementById(
      "homepageManagerSubmenu"
    );

    if (!homepageManagerToggle || !homepageManagerSubmenu) return;

    // open/close manager section
    homepageManagerToggle.addEventListener("click", () => {
      homepageManagerSubmenu.style.display =
        homepageManagerSubmenu.style.display === "none" ? "block" : "none";
    });

    // Toggles
    const toggleTabs = document.getElementById("toggleTabs");
    const toggleSubTabGenres = document.getElementById("toggleSubTabGenres");
    const togglePopularMovies = document.getElementById("togglePopularMovies");
    const toggleBackToTop = document.getElementById("toggleBackToTop");
    const toggleFloatingPanel = document.getElementById("toggleFloatingPanel");
    const toggleReduceAnimations = document.getElementById(
      "toggleReduceAnimations"
    );

    // DOM elements
    const elTabs = document.querySelector(".movie-type-tabs");
    const elSubTabGenresWrapper = document.querySelector(".tab-genres-wrapper");
    const elPopularMovies = document.querySelector("#popular-carousel");
    const elBackToTopContainer = document.querySelector(".go-top-container");
    const elFloatingWrapper = document.querySelector(".floating-wrapper");
    const elFloatingBtnContainer = document.querySelector(
      ".floating-btn-container"
    );

    function hideOrShow(el, show) {
      if (!el) return;
      el.style.display = show ? "" : "none";
    }

    // LocalStorage keys
    const PREF = {
      tabs: "homepage_tabs",
      subGenres: "homepage_subtab_genres",
      popular: "homepage_popular_movies",
      backToTop: "homepage_back_to_top",
      floating: "homepage_floating_panel",
      animations: "homepage_reduce_animations", // 1 = ON , 0 = OFF
    };

    // Global flag (used also by render functions)
    window.filmchiReduceAnimations =
      localStorage.getItem(PREF.animations) === "0";

    // ==================================================
    // ANIMATIONS — ENABLE / DISABLE  (FINAL FIXED VERSION)
    // ==================================================
    function applyAnimationSetting() {
      const animationsEnabled = !!toggleReduceAnimations.checked;
      window.filmchiReduceAnimations = !animationsEnabled;

      // فقط کارت‌ها و اجزای داخل کارت
      const cards = document.querySelectorAll(".movie-card");
      const animatedEls = document.querySelectorAll(
        ".movie-card .anim-horizontal, .movie-card .anim-vertical, .movie-card .anim-left-right"
      );

      // -----------------------------------
      //   ENABLE ANIMATIONS
      // -----------------------------------
      if (animationsEnabled) {
        document.body.classList.remove("reduce-animations");

        // کلاس‌های فعال قبلی حذف می‌شوند تا دوباره با اسکرول فعال شوند
        cards.forEach((card) => {
          card.classList.remove("active-down", "active-up", "no-reveal");
        });
        animatedEls.forEach((el) => {
          el.classList.remove("active-down", "active-up", "no-reveal");
        });

        // بازنشانی Observerها
        try {
          if (typeof cardObserver !== "undefined") cardObserver.disconnect();
        } catch {}
        try {
          if (typeof animObserver !== "undefined") animObserver.disconnect();
        } catch {}

        // فعال کردن دوباره مشاهده برای کارت‌ها
        cards.forEach((card) => {
          try {
            cardObserver.observe(card);
          } catch {}
        });

        animatedEls.forEach((el) => {
          try {
            animObserver.observe(el);
          } catch {}
        });

        // -----------------------------------
        //   DISABLE ANIMATIONS
        // -----------------------------------
      } else {
        document.body.classList.add("reduce-animations");

        // توقف کامل observer ها
        try {
          if (typeof cardObserver !== "undefined") cardObserver.disconnect();
        } catch {}
        try {
          if (typeof animObserver !== "undefined") animObserver.disconnect();
        } catch {}

        // کارت‌ها از همان اول ظاهر شوند؛ و دکمه More Info هم کار کند
        cards.forEach((card) => {
          card.classList.add("active-down", "active-up", "no-reveal");
        });

        animatedEls.forEach((el) => {
          el.classList.add("active-down", "active-up", "no-reveal");
        });
      }

      // ذخیره انتخاب
      localStorage.setItem(PREF.animations, animationsEnabled ? "1" : "0");
    }

    // ==================================================
    // APPLY FUNCTIONS
    // ==================================================
    function applyTabsSetting() {
      const enabled = !!toggleTabs.checked;

      if (!enabled) {
        const activeBtn = document.querySelector(
          ".movie-type-tabs button.active"
        );
        const allBtn = document.querySelector(
          '.movie-type-tabs button[data-type="all"]'
        );

        if (activeBtn && allBtn && activeBtn !== allBtn) allBtn.click();
      }

      hideOrShow(elTabs, enabled);
      if (!enabled) hideOrShow(elSubTabGenresWrapper, false);

      localStorage.setItem(PREF.tabs, enabled ? "1" : "0");
    }

    function applySubTabGenresSetting() {
      const enabled = !!toggleSubTabGenres.checked;
      const show = enabled && !!toggleTabs && toggleTabs.checked;

      hideOrShow(elSubTabGenresWrapper, show);
      localStorage.setItem(PREF.subGenres, enabled ? "1" : "0");
    }

    function applyPopularMoviesSetting() {
      const enabled = !!togglePopularMovies.checked;
      hideOrShow(elPopularMovies, enabled);
      localStorage.setItem(PREF.popular, enabled ? "1" : "0");
    }

    function applyBackToTopSetting() {
      const enabled = !!toggleBackToTop.checked;
      hideOrShow(elBackToTopContainer, enabled);
      localStorage.setItem(PREF.backToTop, enabled ? "1" : "0");
    }

    function applyFloatingSetting() {
      const enabled = !!toggleFloatingPanel.checked;

      hideOrShow(elFloatingWrapper, enabled);
      hideOrShow(elFloatingBtnContainer, enabled);

      localStorage.setItem(PREF.floating, enabled ? "1" : "0");
    }

    // ==================================================
    // RESTORE ON PAGE LOAD
    // ==================================================
    function restoreSettings() {
      if (localStorage.getItem(PREF.tabs) === "0") toggleTabs.checked = false;
      if (localStorage.getItem(PREF.subGenres) === "0")
        toggleSubTabGenres.checked = false;
      if (localStorage.getItem(PREF.popular) === "0")
        togglePopularMovies.checked = false;
      if (localStorage.getItem(PREF.backToTop) === "0")
        toggleBackToTop.checked = false;
      if (localStorage.getItem(PREF.floating) === "0")
        toggleFloatingPanel.checked = false;
      // ==================================================
      // ANIMATIONS —  / DISABLE (FINAL FIXED VERSION)
      // ==================================================
      function applyAnimationSetting() {
        const animationsEnabled = !!toggleReduceAnimations.checked;
        window.filmchiReduceAnimations = !animationsEnabled;

        // ❗ فقط کارت‌های اصلی صفحه
        const mainCards = document.querySelectorAll(
          ".movie-card:not(.expanded)" // کارت‌های صفحه index، نه داخل مودال و نه carousel
        );

        // فقط المنت‌های انیمیشنی داخل کارت‌های اصلی
        const animatedEls = document.querySelectorAll(
          ".movie-card .anim-horizontal, .movie-card .anim-vertical, .movie-card .anim-left-right"
        );

        if (animationsEnabled) {
          // ---------------- ENABLE ANIMATIONS ----------------
          document.body.classList.remove("reduce-animations");

          mainCards.forEach((card) =>
            card.classList.remove("active-down", "active-up", "no-reveal")
          );

          animatedEls.forEach((el) =>
            el.classList.remove("active-down", "active-up")
          );

          // فعال کردن دوباره آبزرورها
          try {
            if (typeof cardObserver !== "undefined") {
              cardObserver.disconnect();
              mainCards.forEach((card) => cardObserver.observe(card));
            }

            if (typeof animObserver !== "undefined") {
              animObserver.disconnect();
              animatedEls.forEach((el) => animObserver.observe(el));
            }
          } catch {}
        } else {
          // ---------------- DISABLE ANIMATIONS ----------------
          document.body.classList.add("reduce-animations");

          // قطع آبزرورها
          try {
            if (typeof cardObserver !== "undefined") cardObserver.disconnect();
            if (typeof animObserver !== "undefined") animObserver.disconnect();
          } catch {}

          // کارت‌های اصلی → کاملاً نمایش داده شوند
          mainCards.forEach((card) => {
            card.classList.add("active-down", "active-up", "no-reveal");
          });

          animatedEls.forEach((el) => {
            el.classList.add("active-down", "active-up");
          });
        }

        localStorage.setItem(PREF.animations, animationsEnabled ? "1" : "0");
      }
      if (localStorage.getItem(PREF.animations) === "0") {
        toggleReduceAnimations.checked = false;
        window.filmchiReduceAnimations = true;
      }

      applyTabsSetting();
      applySubTabGenresSetting();
      applyPopularMoviesSetting();
      applyBackToTopSetting();
      applyFloatingSetting();
      applyAnimationSetting();
    }

    // ==================================================
    // EVENT LISTENERS
    // ==================================================
    toggleTabs.addEventListener("change", () => {
      applyTabsSetting();
      applySubTabGenresSetting();
    });

    toggleSubTabGenres.addEventListener("change", applySubTabGenresSetting);
    togglePopularMovies.addEventListener("change", applyPopularMoviesSetting);
    toggleBackToTop.addEventListener("change", applyBackToTopSetting);
    toggleFloatingPanel.addEventListener("change", applyFloatingSetting);
    toggleReduceAnimations.addEventListener("change", applyAnimationSetting);

    restoreSettings();
  })();

  // Service Worker registration (caching)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });
    });
  }

  /* ============================================================
     BACK BUTTON HANDLER – FINAL VERSION (NO SHORTENING)
   ============================================================ */
  window.addEventListener("popstate", () => {
    // 1) Comments panel on a movie card
    const openCommentsPanel = document.querySelector(".comments-panel.open");
    if (openCommentsPanel) {
      openCommentsPanel.classList.remove("open");
      openCommentsPanel.setAttribute("aria-hidden", "true");
      return;
    }

    // 2) Chat overlay
    if (typeof closeChatOverlay === "function" && window.chatOverlay) {
      if (chatOverlay.getAttribute("aria-hidden") === "false") {
        closeChatOverlay();
        return;
      }
    }

    // 3) Movie modal (Popular + card modal)
    const modal = document.getElementById("movie-modal");
    if (modal && modal.style.display === "flex") {
      modal.style.display = "none";
      return;
    }

    // 4) Post options overlay
    const postOptionsOverlay = document.getElementById("postOptionsOverlay");
    if (postOptionsOverlay && postOptionsOverlay.classList.contains("open")) {
      postOptionsOverlay.classList.remove("open");
      postOptionsOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll", "post-options-open");
      return;
    }

    // 5) Favorites overlay
    const favoritesOverlay = document.getElementById("favoritesOverlay");
    if (
      favoritesOverlay &&
      favoritesOverlay.getAttribute("aria-hidden") === "false"
    ) {
      favoritesOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      return;
    }

    // 6) Side menu
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");
    if (sideMenu && sideMenu.classList.contains("active")) {
      sideMenu.classList.remove("active");
      menuOverlay && menuOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll", "menu-open");
      return;
    }
  });

  function updateDynamicTitle() {
    let title = "FilmChiin";

    if (currentTypeFilter === "all") title = "All Movies | FilmChiin";
    if (currentTypeFilter === "collection") title = "Collections | FilmChiin";
    if (currentTypeFilter === "series") title = "Series | FilmChiin";
    if (currentTypeFilter === "single") title = "Single Movies | FilmChiin";

    document.title = title;
  }

  document.querySelectorAll("img").forEach((img) => {
    if (!img.loading) img.loading = "lazy";
  });


// ==============================
//  YEAR FILTER (Release Date)
// ==============================
(function () {
  const maxYear = new Date().getFullYear();
  let currentYear = maxYear - 10;
  let isDragging = false;
  let dragStartY = 0;
  let accumulatedDelta = 0;
  const STEP_PX = 26;

  const spinner = document.getElementById("yearSpinner");
  const topEl = document.getElementById("yearSpinnerTop");
  const centerEl = document.getElementById("yearSpinnerCenter");
  const bottomEl = document.getElementById("yearSpinnerBottom");
  const applyBtn = document.getElementById("applyYearFilter");

  if (!spinner || !topEl || !centerEl || !bottomEl || !applyBtn) return;

  let originalCardsOrder = null;

  function clampYear(y) {
    return y > maxYear ? maxYear : y;
  }

  function updateSpinnerUI() {
    currentYear = clampYear(currentYear);

    const next = currentYear - 1;
    const prev = currentYear < maxYear ? currentYear + 1 : "";

    topEl.innerText = prev;
    centerEl.innerText = currentYear;
    bottomEl.innerText = next;
  }

  function changeYear(dir) {
    if (dir === "up" && currentYear < maxYear) currentYear++;
    else if (dir === "down") currentYear--;
    updateSpinnerUI();
  }

  function handleDelta(dy) {
    accumulatedDelta += dy;
    while (accumulatedDelta <= -STEP_PX) {
      changeYear("up");
      accumulatedDelta += STEP_PX;
    }
    while (accumulatedDelta >= STEP_PX) {
      changeYear("down");
      accumulatedDelta -= STEP_PX;
    }
  }

  spinner.addEventListener("wheel", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelta(e.deltaY);
  }, { passive: false });

  spinner.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    dragStartY = e.clientY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dy = e.clientY - dragStartY;
    dragStartY = e.clientY;
    handleDelta(dy);
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    accumulatedDelta = 0;
  });

  spinner.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    isDragging = true;
    dragStartY = e.touches[0].clientY;
  }, { passive: false });

  spinner.addEventListener("touchmove", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.touches.length) return;
    const dy = e.touches[0].clientY - dragStartY;
    dragStartY = e.touches[0].clientY;
    handleDelta(dy);
  }, { passive: false });

  spinner.addEventListener("touchend", () => {
    isDragging = false;
    accumulatedDelta = 0;
  });

  // ===== BADGE SYSTEM =====
  function ensureActiveFiltersContainer() {
    let container = document.getElementById("activeFilters");
    if (!container) {
      container = document.createElement("div");
      container.id = "activeFilters";
      container.className = "active-filters-toast";
      document.body.appendChild(container);
    }
    return container;
  }

  function updateYearFilterBadge() {
    const container = ensureActiveFiltersContainer();
    let badge = container.querySelector('[data-filter="year"]');

    if (!badge) {
      badge = document.createElement("div");
      badge.className = "filter-badge";
      badge.dataset.filter = "year";

      const label = document.createElement("span");
      label.className = "filter-label";
      badge.appendChild(label);

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.innerText = "×";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        yearMinFilter = null;
        removeYearFilterBadge();
        currentPage = 1;
        renderPagedMovies(true);
      });
      badge.appendChild(closeBtn);
    } else {
      container.removeChild(badge);
    }

    container.insertBefore(badge, container.firstChild);

    const label = badge.querySelector(".filter-label");
    label.innerText = `Year ≥ ${yearMinFilter}`;
  }

  function updateImdbFilterBadge() {
  const container = ensureActiveFiltersContainer();
  let badge = container.querySelector('[data-filter="imdb"]');

  if (!badge) {
    badge = document.createElement("div");
    badge.className = "filter-badge";
    badge.dataset.filter = "imdb";

    const label = document.createElement("span");
    label.className = "filter-label";
    badge.appendChild(label);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.innerText = "×";

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      imdbMinRating = null;
      removeImdbFilterBadge(container);
      currentPage = 1;
      renderPagedMovies(true);
    });

    badge.appendChild(closeBtn);
  } else {
    // remove قبل از insert تا بالا جابه‌جا شود
    container.removeChild(badge);
  }

  // IMDb همیشه بالای لیست قرار می‌گیرد
  container.insertBefore(badge, container.firstChild);

  const label = badge.querySelector(".filter-label");
  label.innerText = `IMDb ≥ ${imdbMinRating}`;
}

function removeImdbFilterBadge(container = null) {
  container = container || ensureActiveFiltersContainer();
  const badge = container.querySelector('[data-filter="imdb"]');
  if (badge) badge.remove();
}

  function removeYearFilterBadge() {
    const el = document.querySelector('[data-filter="year"]');
    if (el) el.remove();
  }

  

  // ===== APPLY YEAR FILTER =====
  function applyYearFilter() {
    const y = parseInt(centerEl.innerText, 10);
    if (!y || isNaN(y)) return;

    yearMinFilter = y;

    updateYearFilterBadge();

    currentPage = 1;
    renderPagedMovies(true);
  }

  function resetYearFilter() {
    yearMinFilter = null;
    removeYearFilterBadge();
    currentPage = 1;
    renderPagedMovies(true);
  }

  applyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    applyYearFilter();
  });

  updateSpinnerUI();
})();


  // -------------------- Initial load --------------------
  if (document.querySelector(".admin-tabs .tab-btn")) {
    initAdminTabs();
  }
  initFeatureAccordions();
  fetchMovies();
  fetchPopularMovies();
  fetchPopularForIndex();
  fetchMessages();
  checkUnapprovedComments();
  setInterval(checkUnapprovedComments, 30000);

  if (document.getElementById("unapprovedComments")) {
    // Load panel on admin if exists
    (async function loadUnapprovedComments() {
      const container = document.getElementById("unapprovedComments");
      if (!container) return;
      const ok = await enforceAdminGuard();
      if (!ok) return;
      container.innerHTML = '<div class="loading">Loading Comments…</div>';
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("error in loading comments:", error);
        container.innerHTML = "<p>error in loading comments</p>";
        return;
      }
      if (!data || data.length === 0) {
        container.innerHTML = "<p>there is no unpublished comments</p>";
        return;
      }
      container.innerHTML = data
        .map((c) => {
          const movie = movies.find((m) => m.id === c.movie_id);
          const cover =
            movie?.cover || "https://via.placeholder.com/80x100?text=No+Image";
          const title = movie?.title || "";
          return `
        <div class="unapproved-bubble">
          <div class="bubble-left"><img src="${escapeHtml(
            cover
          )}" alt="${escapeHtml(title)}" class="bubble-cover"></div>
          <div class="bubble-center">
            <div class="bubble-author">${escapeHtml(c.name)}</div>
            <div class="bubble-text">${escapeHtml(c.text)}</div>
            <div class="bubble-time">${
              c.created_at ? new Date(c.created_at).toLocaleString() : ""
            }</div>
          </div>
          <div class="bubble-right">
          <div class="button-wrap">
            <button class="btn-approve" data-id="${
              c.id
            }"><span><i class="bi bi-check2-circle"></i> Approve</span></button>
            <div class="button-shadow"></div></div>
            <div class="button-wrap">
            <button class="btn-delete" data-id="${
              c.id
            }"><span><i class="bi bi-trash"></i> Delete</span></button>
            <div class="button-shadow"></div></div>
          </div>
        </div>
      `;
        })
        .join("");
      container.addEventListener(
        "click",
        async (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const id = btn.dataset.id;
          if (!id) return;
          if (btn.classList.contains("btn-approve")) {
            btn.disabled = true;
            const { error: upErr } = await supabase
              .from("comments")
              .update({ approved: true, published: true })
              .eq("id", id);
            btn.disabled = false;
            if (upErr) {
              console.error(upErr);
              showToast("An error occurred while approving the comment.");
            } else {
              await loadUnapprovedComments();
              showToast("Comment approved.");
            }
          }
          if (btn.classList.contains("btn-delete")) {
            const ok = await showDialog({
              message: "Should this comment be deleted?",
              type: "confirm",
            });
            if (!ok) return;
            btn.disabled = true;
            const { error: delErr } = await supabase
              .from("comments")
              .delete()
              .eq("id", id);
            btn.disabled = false;
            if (delErr) {
              console.error(delErr);
              showToast("Error deleting comment");
            } else {
              await loadUnapprovedComments();
              showToast("Comment deleted.");
            }
          }
        },
        { once: true }
      );
    })();
  }

  fetchSocialLinks();
});
