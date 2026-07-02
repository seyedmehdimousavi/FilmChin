// ===================================================
// مدیریت دکمه برگشت تلگرام (Telegram Mini App)
// وقتی سایت به‌صورت وب‌اپ داخل تلگرام باز می‌شه، دکمه برگشت گوشی
// به‌صورت پیش‌فرض باعث بسته‌شدن کامل وب‌اپ می‌شه. با نمایش دادن
// BackButton تلگرام و وصل کردنش به history.back()، هم دکمه بالای
// تلگرام و هم دکمه سخت‌افزاری گوشی (اندروید) به‌جای بستن، یک صفحه
// برمی‌گردن عقب داخل خود سایت.
// ===================================================
(function () {
  "use strict";

  function init() {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      /* ignore */
    }

    function syncBackButton() {
      try {
        if (window.history.length > 1) {
          tg.BackButton.show();
        } else {
          tg.BackButton.hide();
        }
      } catch (e) {
        /* ignore */
      }
    }

    try {
      tg.BackButton.onClick(function () {
        // اگه صفحه قبلی داخل همین سایت باشه، برگرد عقب؛
        // در غیر این صورت (اولین صفحه) وب‌اپ بسته بشه.
        if (window.history.length > 1) {
          window.history.back();
        } else if (typeof tg.close === "function") {
          tg.close();
        }
      });
    } catch (e) {
      /* ignore */
    }

    syncBackButton();
    window.addEventListener("popstate", syncBackButton);
    window.addEventListener("pageshow", syncBackButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
