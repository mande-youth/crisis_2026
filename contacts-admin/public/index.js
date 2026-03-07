(function () {
  const state = {
    lang: "en",
    authToken: "",
    adminDb: null,
    search: { categoryKey: "", divisionKey: "" }
  };
  let focusedCardTimer = null;
  const DEFAULT_FLY_API_BASE = "https://contacts-admin-crisis-2026.fly.dev";

  function readApiBase() {
    const globalBase = window.__API_BASE_URL__;
    if (typeof globalBase === "string" && globalBase.trim()) return globalBase.trim().replace(/\/+$/, "");

    const meta = document.querySelector('meta[name="api-base-url"]');
    const metaBase = meta?.getAttribute("content") || "";
    if (metaBase.trim()) return metaBase.trim().replace(/\/+$/, "");

    if (window.location.hostname.endsWith("github.io")) return DEFAULT_FLY_API_BASE;
    return "";
  }

  const API_BASE = readApiBase();

  function apiUrl(path) {
    if (!API_BASE) return path;
    return `${API_BASE}${path}`;
  }

  /* --------------------------
     Small DOM helpers
  -------------------------- */
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function getActivePage() {
    return document.getElementById(state.lang === "ar" ? "page-ar" : "page-en");
  }

  function isAdminLoggedIn() {
    return Boolean(state.authToken && state.adminDb);
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  }

  /* --------------------------
     i18n labels for cards + actions
  -------------------------- */
  const I18N = {
    en: {
      role: "Role",
      district: "District",
      division: "Division",
      category: "Category",
      phone: "Phone Number",
      email: "Email",
      notes: "Notes",
      call: "Call",
      whatsapp: "WhatsApp",
      emailBtn: "Email",
      noResults: "No results found.",
      loadFailedTitle: "Data load failed.",
      allCategories: "All Categories",
      allDivisions: "All Divisions",
      clearFilters: "Clear",
      searchPlaceholder: "Search by name, role, district, phone..."
    },
    ar: {
      role: "الدور",
      district: "المنطقة",
      division: "القسم",
      category: "الفئة",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      notes: "ملاحظات",
      call: "اتصال",
      whatsapp: "واتساب",
      emailBtn: "البريد الإلكتروني",
      noResults: "لا توجد نتائج.",
      loadFailedTitle: "فشل تحميل البيانات.",
      allCategories: "كل الفئات",
      allDivisions: "كل الأقسام",
      clearFilters: "مسح",
      searchPlaceholder: "ابحث بالاسم أو الدور أو المنطقة أو الهاتف..."
    }
  };

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || key;
  }

  const HASH_EQUIVALENTS = {
    contacts: "contacts-ar",
    "cat-crisis": "cat-crisis-ar",
    "cat-functions": "cat-functions-ar",
    "cat-districts": "cat-districts-ar"
  };

  function mapHashToLanguage(hash, lang) {
    if (!hash) return hash;
    const id = String(hash).replace(/^#/, "");
    if (!id) return hash;

    if (lang === "ar") {
      const mapped = HASH_EQUIVALENTS[id];
      if (mapped && document.getElementById(mapped)) return "#" + mapped;
      if (!id.endsWith("-ar") && document.getElementById(id + "-ar")) return "#" + id + "-ar";
      return "#" + id;
    }

    const reversed = Object.entries(HASH_EQUIVALENTS).find(([, ar]) => ar === id);
    if (reversed && document.getElementById(reversed[0])) return "#" + reversed[0];
    if (id.endsWith("-ar")) {
      const base = id.slice(0, -3);
      if (document.getElementById(base)) return "#" + base;
    }
    return "#" + id;
  }

  const AR_VALUE_MAP = {
    "Head of Youth Sector": "رئيس قطاع الناشئين والشباب",
    "Head of Youth Crisis": "منسق أزمة قطاع الناشئين والشباب",
    "Head of PMER": "رئيس قسم PMER",
    "Head of Reporting": "رئيس قسم التقارير",
    "Head of M&E / Tech": "رئيس المتابعة والتقييم / التكنولوجيا",
    "Distribution Oversight": "إشراف التوزيع",
    "Distribution Focal": "نقطة اتصال التوزيع",
    "MHPSS / PGI Focal": "نقطة اتصال الدعم النفسي / الحماية",
    "Fleet Focal": "نقطة اتصال الأسطول",
    "PMER Focal": "نقطة اتصال PMER",
    "Safety Focal": "نقطة اتصال السلامة",
    "Head of MHPSS - PGI Services": "رئيس خدمات الدعم النفسي - الحماية",
    "Head of Fleet": "رئيس قسم الأسطول",
    "Head of Logistics": "رئيس قسم اللوجستيات",
    "Head of Safety": "رئيس قسم السلامة",
    "Head of LRC Shelter": "رئيس قسم المأوى في الصليب الأحمر اللبناني",
    "Shelter Focal": "نقطة اتصال المأوى",
    "External Communication": "التواصل الخارجي",
    "Head of Public Relations": "رئيس العلاقات العامة",
    "Spears Focal Person": "نقطة اتصال SPEARS",
    "Distribution - Center Crisis Focal": "التوزيع - نقطة اتصال مركز الأزمة",
    "Center Crisis Focal (placeholder)": "نقطة اتصال مركز الأزمة (مؤقت)",
    Bekaa: "البقاع",
    North: "الشمال",
    NML: "NML",
    SML1: "SML1",
    SML2: "SML2",
    Beirut: "بيروت",
    South: "الجنوب",
    "Final operational decision-maker during crisis": "صاحب القرار التشغيلي النهائي خلال الأزمة",
    "Runs day-to-day crisis operations": "يدير العمليات اليومية للأزمة",
    "Supervises PMER, reporting, governance, and information management": "يشرف على PMER والتقارير والحوكمة وإدارة المعلومات",
    "Sector-wide reporting focal": "نقطة اتصال التقارير على مستوى القطاع",
    "Supports infrastructure, analytics, data quality, access, and support under PMER": "يدعم البنية التحتية والتحليلات وجودة البيانات وإدارة الوصول والدعم ضمن PMER",
    "Leads MHPSS/PGI crisis function": "يقود وظيفة الدعم النفسي/الحماية خلال الأزمة",
    "Leads fleet function": "يقود وظيفة الأسطول",
    "Leads logistics, stocks, warehousing, equipment": "يقود اللوجستيات والمخزون والتخزين والمعدات",
    "Handles shelter and volunteer safety": "يتابع سلامة المأوى والمتطوعين",
    "Responsible for shelter managed by Youth Sector": "مسؤول عن المأوى المُدار من قطاع الناشئين والشباب",
    "Coordinates partners and donors": "ينسق مع الشركاء والجهات المانحة",
    "Handles external image and official announcements": "يتابع الصورة الخارجية والإعلانات الرسمية",
    "HQ counterpart": "جهة الاتصال المقابلة في المقر",
    "District Distribution Focals report directly under the day-to-day crisis coordination layer.": "نقاط اتصال التوزيع في المناطق ترفع مباشرة إلى طبقة تنسيق الأزمة اليومية."
  };

  function localizeFetchedValue(value, key, lang) {
    const raw = String(value || "").trim();
    if (!raw || lang !== "ar") return raw;
    if (key === "name" || key === "email" || key === "phone") return raw;
    if (AR_VALUE_MAP[raw]) return AR_VALUE_MAP[raw];

    // Keep unknown values readable in AR mode while translating common tokens.
    return raw
      .replace(/\bHead of\b/g, "رئيس")
      .replace(/\bFocal\b/g, "نقطة اتصال")
      .replace(/\bDistribution\b/g, "التوزيع")
      .replace(/\bFleet\b/g, "الأسطول")
      .replace(/\bSafety\b/g, "السلامة")
      .replace(/\bShelter\b/g, "المأوى")
      .replace(/\bLogistics\b/g, "اللوجستيات")
      .replace(/\bCommunications?\b/g, "التواصل")
      .replace(/\bPublic Relations\b/g, "العلاقات العامة")
      .replace(/\bDistrict\b/g, "المنطقة")
      .replace(/\bCenter\b/g, "المركز")
      .replace(/\bplaceholder\b/gi, "مؤقت");
  }

  function isArabicText(v) {
    return /[\u0600-\u06FF]/.test(String(v || ""));
  }

  function transliterateNameToArabic(name) {
    let s = String(name || "").trim();
    if (!s) return "";
    const replacements = [
      [/sh/gi, "ش"],
      [/kh/gi, "خ"],
      [/gh/gi, "غ"],
      [/th/gi, "ث"],
      [/dh/gi, "ذ"],
      [/ch/gi, "تش"],
      [/ph/gi, "ف"],
      [/aa/gi, "ا"],
      [/ee/gi, "ي"],
      [/oo/gi, "و"],
      [/ou/gi, "و"]
    ];
    replacements.forEach(([re, to]) => {
      s = s.replace(re, to);
    });
    const map = {
      a: "ا", b: "ب", c: "ك", d: "د", e: "ي", f: "ف", g: "ج", h: "ه",
      i: "ي", j: "ج", k: "ك", l: "ل", m: "م", n: "ن", o: "و", p: "ب",
      q: "ق", r: "ر", s: "س", t: "ت", u: "و", v: "ف", w: "و", x: "كس",
      y: "ي", z: "ز"
    };
    return s
      .split("")
      .map((ch) => {
        const lower = ch.toLowerCase();
        if (map[lower]) return map[lower];
        if (ch === " ") return " ";
        if (ch === "-") return "-";
        return ch;
      })
      .join("");
  }

  /* --------------------------
     Language toggling
  -------------------------- */
  function setLanguage(lang) {
    state.lang = lang;

    const pageEn = document.getElementById("page-en");
    const pageAr = document.getElementById("page-ar");

    const tocEn = document.getElementById("toc-en");
    const tocAr = document.getElementById("toc-ar");

    const tocTitleEn = document.getElementById("toc-title-en");
    const tocTitleAr = document.getElementById("toc-title-ar");

    const tocNoteEn = document.getElementById("toc-note-en");
    const tocNoteAr = document.getElementById("toc-note-ar");

    const langButtons = qsa(".lang-btn");

    if (lang === "ar") {
      if (pageEn) pageEn.classList.remove("active");
      if (pageAr) pageAr.classList.add("active");

      if (tocEn) tocEn.classList.add("hidden");
      if (tocAr) tocAr.classList.remove("hidden");

      if (tocTitleEn) tocTitleEn.classList.add("hidden");
      if (tocTitleAr) tocTitleAr.classList.remove("hidden");

      if (tocNoteEn) tocNoteEn.classList.add("hidden");
      if (tocNoteAr) tocNoteAr.classList.remove("hidden");

      document.documentElement.setAttribute("lang", "ar");
      document.body.setAttribute("dir", "rtl");
    } else {
      if (pageAr) pageAr.classList.remove("active");
      if (pageEn) pageEn.classList.add("active");

      if (tocAr) tocAr.classList.add("hidden");
      if (tocEn) tocEn.classList.remove("hidden");

      if (tocTitleAr) tocTitleAr.classList.add("hidden");
      if (tocTitleEn) tocTitleEn.classList.remove("hidden");

      if (tocNoteAr) tocNoteAr.classList.add("hidden");
      if (tocNoteEn) tocNoteEn.classList.remove("hidden");

      document.documentElement.setAttribute("lang", "en");
      document.body.removeAttribute("dir");
    }

    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    qsa("[data-ui-lang]").forEach((el) => {
      el.classList.toggle("hidden", el.dataset.uiLang !== lang);
    });

    // Update empty state message language if present
    const emptyEn = qs("#results-en .empty-note");
    const emptyAr = qs("#results-ar .empty-note");
    if (emptyEn) emptyEn.textContent = state.lang === "ar" ? I18N.ar.noResults : I18N.en.noResults;
    if (emptyAr) emptyAr.textContent = I18N.ar.noResults;
    const resultsEn = document.getElementById("results-en");
    const resultsAr = document.getElementById("results-ar");
    if (resultsEn) {
      resultsEn.classList.add("hidden");
      const listEn = qs(".result-list", resultsEn);
      if (listEn) listEn.innerHTML = "";
    }
    if (resultsAr) {
      resultsAr.classList.add("hidden");
      const listAr = qs(".result-list", resultsAr);
      if (listAr) listAr.innerHTML = "";
    }
    const searchInput = qs(".search-input");
    if (searchInput) searchInput.placeholder = t("searchPlaceholder");
    refreshSearchFilters(lang);
    searchCards(lang, searchInput?.value || "");

    const mappedHash = mapHashToLanguage(window.location.hash, lang);
    if (mappedHash && mappedHash !== window.location.hash) {
      history.replaceState(null, "", mappedHash);
    }
    handleHashNavigation(mappedHash || window.location.hash);
  }

  /* --------------------------
     Expand / collapse
  -------------------------- */
  function allDetails(root = document) {
    return qsa("details.section-details, details.sub-details", root);
  }

  function expandAll(lang) {
    const root = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    if (!root) return;
    allDetails(root).forEach((d) => (d.open = true));
  }

  function collapseAll(lang) {
    const root = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    if (!root) return;
    allDetails(root).forEach((d) => (d.open = false));
  }

  function openParents(el) {
    if (!el) return;
    let current = el.parentElement;
    while (current) {
      if (current.tagName && current.tagName.toLowerCase() === "details") {
        current.open = true;
      }
      current = current.parentElement;
    }
  }

  function clearFocusedCards() {
    qsa(".person-card.is-focused").forEach((card) => card.classList.remove("is-focused"));
    if (focusedCardTimer) {
      clearTimeout(focusedCardTimer);
      focusedCardTimer = null;
    }
  }

  function focusCard(card) {
    if (!card) return;
    clearFocusedCards();
    card.classList.add("is-focused");
    focusedCardTimer = setTimeout(() => {
      card.classList.remove("is-focused");
      focusedCardTimer = null;
    }, 3500);
  }

  /* --------------------------
     Hash navigation (EN <-> AR ids)
  -------------------------- */
  function resolveHashTarget(hash) {
    if (!hash) return null;
    const id = hash.replace(/^#/, "");
    return document.getElementById(id);
  }

  function handleHashNavigation(hash = window.location.hash) {
    const target = resolveHashTarget(hash);
    if (target) openParents(target);
  }

  /* --------------------------
     Search result rendering
  -------------------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isAllDistrictValue(value) {
    const compact = normalizeText(value).replace(/\s+/g, "");
    return (
      compact === "alldistrict" ||
      compact === "alldistricts" ||
      compact === "allregions" ||
      compact === "allregion" ||
      compact === "كلالمناطق" ||
      compact === "كافةالمناطق"
    );
  }

  function getSearchControls() {
    return {
      category: document.getElementById("search-category-filter"),
      division: document.getElementById("search-division-filter"),
      clearBtn: document.getElementById("search-clear-filters"),
      input: qs(".search-input")
    };
  }

  function collectSearchCards(lang) {
    const page = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    return page ? qsa(".searchable", page) : [];
  }

  function updateDivisionOptions(lang) {
    const { category, division } = getSearchControls();
    if (!division) return;

    const selectedCategory = category?.value || "";
    const cards = collectSearchCards(lang);
    const divisionMap = new Map();

    cards.forEach((card) => {
      const catKey = card.dataset.categoryKey || "";
      if (selectedCategory && catKey !== selectedCategory) return;
      const key = card.dataset.divisionKey || "";
      const title = card.dataset.divisionTitle || key;
      if (key && !divisionMap.has(key)) divisionMap.set(key, title);
    });

    const prev = state.search.divisionKey;
    division.innerHTML =
      `<option value="">${escapeHtml(t("allDivisions"))}</option>` +
      Array.from(divisionMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([key, title]) => `<option value="${escapeHtml(key)}">${escapeHtml(title)}</option>`)
        .join("");

    if (prev && divisionMap.has(prev)) {
      division.value = prev;
    } else {
      division.value = "";
      state.search.divisionKey = "";
    }
  }

  function refreshSearchFilters(lang) {
    const { category, division, clearBtn } = getSearchControls();
    if (!category || !division) return;

    const cards = collectSearchCards(lang);
    const categoryMap = new Map();
    cards.forEach((card) => {
      const key = card.dataset.categoryKey || "";
      const title = card.dataset.categoryTitle || key;
      if (key && !categoryMap.has(key)) categoryMap.set(key, title);
    });

    const prevCategory = state.search.categoryKey;
    category.innerHTML =
      `<option value="">${escapeHtml(t("allCategories"))}</option>` +
      Array.from(categoryMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([key, title]) => `<option value="${escapeHtml(key)}">${escapeHtml(title)}</option>`)
        .join("");

    category.value = prevCategory && categoryMap.has(prevCategory) ? prevCategory : "";
    state.search.categoryKey = category.value;

    updateDivisionOptions(lang);
    if (clearBtn) clearBtn.textContent = t("clearFilters");
  }

  function ensureCardId(card, lang) {
    if (card.id) return card.id;

    const base =
      (card.dataset.name || "item")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "") || "item";

    const page = lang === "ar" ? document.getElementById("page-ar") : document.getElementById("page-en");
    const existing = page ? qsa(`#${CSS.escape(base)}`, page).length : 0;

    const id = existing ? `${base}-${existing + 1}` : base;
    card.id = id;
    return id;
  }

  function buildResultItem(card, lang) {
    const name = card.dataset.name || "";
    const role = card.dataset.role || "";
    const district = card.dataset.district || "";
    const phone = card.dataset.phone || "";
    const department = card.dataset.department || "";

    const id = ensureCardId(card, lang);

    const category = card.dataset.categoryTitle || "";
    const metaParts = [role];
    if (category) metaParts.push(category);
    if (district) metaParts.push(district);
    if (department && department !== role) metaParts.push(department);
    if (phone) metaParts.push(phone);

    const phoneMeta = phone ? `<span class="ltr-text">${escapeHtml(phone)}</span>` : "";
    const metaText = metaParts.filter(Boolean).join(" · ");
    const metaHtml = phone ? escapeHtml(metaText.replace(phone, "__PHONE__")).replace("__PHONE__", phoneMeta) : escapeHtml(metaText);

    return `
      <a class="result-item" href="#${escapeHtml(id)}" data-target="${escapeHtml(id)}">
        <div class="result-name">${escapeHtml(name)}</div>
        <div class="result-meta">${metaHtml}</div>
      </a>
    `;
  }

  function cardMatchesFilter(card, queryTokens, selectedCategory, selectedDivision) {
    if (selectedCategory && (card.dataset.categoryKey || "") !== selectedCategory) return false;
    if (selectedDivision && (card.dataset.divisionKey || "") !== selectedDivision) return false;

    if (!queryTokens.length) return true;

    const fields = {
      name: normalizeText(card.dataset.name || ""),
      role: normalizeText(card.dataset.role || ""),
      category: normalizeText(card.dataset.categoryTitle || ""),
      division: normalizeText(card.dataset.department || ""),
      district: normalizeText(card.dataset.district || ""),
      phone: normalizeText(card.dataset.phone || "")
    };
    const haystack = Object.values(fields).join(" ").trim();
    if (!haystack) return false;

    if (!queryTokens.every((tk) => haystack.includes(tk))) return false;
    return true;
  }

  function refreshVisibleSections(page) {
    // Show/hide divisions based on visible cards and refresh badges.
    qsa(".division-details", page).forEach((block) => {
      const visibleCards = qsa(".person-card.searchable:not(.hidden)", block).length;
      block.classList.toggle("hidden", visibleCards === 0);
      const badge = qs(".summary-badge", block);
      if (badge) badge.textContent = String(visibleCards);
    });

    // Show/hide static category titles if their host has no visible cards.
    const langKey = page.id === "page-ar" ? "ar" : "en";
    qsa(`[id^="peopleHost-${langKey}-"]`, page).forEach((host) => {
      if (host.id === `peopleHost-${langKey}`) return;
      const visibleCards = qsa(".person-card.searchable:not(.hidden)", host).length;
      const catTitle = host.previousElementSibling;
      const catAnchor = catTitle?.previousElementSibling;
      const hasVisible = visibleCards > 0;
      host.classList.toggle("hidden", !hasVisible);
      if (catTitle && catTitle.classList.contains("cat-title")) {
        catTitle.classList.toggle("hidden", !hasVisible);
      }
      if (catAnchor && catAnchor.id && catAnchor.id.startsWith("cat-")) {
        catAnchor.classList.toggle("hidden", !hasVisible);
      }
    });
  }

  function revealElementPath(el, stopAt) {
    let cur = el;
    while (cur && cur !== stopAt) {
      cur.classList?.remove("hidden");
      cur = cur.parentElement;
    }
  }

  function findDistrictContactTarget(lang, districtLabel) {
    const page = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    if (!page) return null;
    const targetNorm = normalizeText(districtLabel);
    if (!targetNorm) return null;

    const districtCards = qsa('.searchable[data-category-key="districts"]', page);
    return (
      districtCards.find((card) => normalizeText(card.dataset.district || "") === targetNorm) ||
      districtCards.find((card) => normalizeText(card.dataset.name || "").includes(targetNorm)) ||
      null
    );
  }

  function searchCards(lang, query) {
    const page = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    const resultsPanel =
      document.getElementById(lang === "ar" ? "results-ar" : "results-en") ||
      document.getElementById("results-en");
    if (!page) return;

    // We now filter the whole page instead of dropdown search results.
    if (resultsPanel) {
      resultsPanel.classList.add("hidden");
      const resultList = qs(".result-list", resultsPanel);
      const emptyNote = qs(".empty-note", resultsPanel);
      if (resultList) resultList.innerHTML = "";
      if (emptyNote) emptyNote.classList.add("hidden");
    }

    const q = normalizeText(query);
    const queryTokens = q ? q.split(" ").filter(Boolean) : [];
    const selectedCategory = state.search.categoryKey || "";
    const selectedDivision = state.search.divisionKey || "";
    const cards = qsa(".searchable", page);

    cards.forEach((card) => {
      const isMatch = cardMatchesFilter(card, queryTokens, selectedCategory, selectedDivision);
      card.classList.toggle("hidden", !isMatch);
    });

    refreshVisibleSections(page);
  }

  function bindSearch() {
    const { category, division, clearBtn } = getSearchControls();
    qsa(".search-input").forEach((input) => {
      input.addEventListener("input", function () {
        searchCards(state.lang, this.value);
      });
    });

    category?.addEventListener("change", () => {
      state.search.categoryKey = category.value || "";
      updateDivisionOptions(state.lang);
      searchCards(state.lang, qs(".search-input")?.value || "");
    });

    division?.addEventListener("change", () => {
      state.search.divisionKey = division.value || "";
      searchCards(state.lang, qs(".search-input")?.value || "");
    });

    clearBtn?.addEventListener("click", () => {
      const input = qs(".search-input");
      if (input) input.value = "";
      state.search.categoryKey = "";
      state.search.divisionKey = "";
      refreshSearchFilters(state.lang);
      searchCards(state.lang, "");
    });
  }

  function bindExpandCollapse() {
    qsa("[data-expand]").forEach((btn) => {
      btn.addEventListener("click", function () {
        expandAll(state.lang);
      });
    });

    qsa("[data-collapse]").forEach((btn) => {
      btn.addEventListener("click", function () {
        collapseAll(state.lang);
      });
    });
  }

  function bindLanguageToggle() {
    qsa(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        setLanguage(this.dataset.lang);
      });
    });
  }

  function bindHashLinks() {
    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        const rawHash = this.getAttribute("href") || "";
        const mapped = mapHashToLanguage(rawHash, state.lang);
        const target = resolveHashTarget(mapped);
        if (!target) return;

        e.preventDefault();
        openParents(target);
        history.replaceState(null, "", mapped);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initFromHashLanguageHint() {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash.endsWith("-ar") || hash === "contacts-ar" || hash.includes("-ar")) {
      setLanguage("ar");
    } else {
      setLanguage("en");
    }
  }

  /* --------------------------
     Backend fetch
  -------------------------- */
  async function fetchDb() {
    const url = apiUrl("/api/data");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return await res.json();
  }

  async function loginApi(username, password) {
    const res = await fetch(apiUrl("/api/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || "Invalid username or password");
    return payload;
  }

  async function fetchAdminDb() {
    const res = await fetch(apiUrl("/api/admin/data"), {
      headers: { Authorization: `Bearer ${state.authToken}` }
    });
    if (!res.ok) throw new Error("Failed to load admin data");
    return await res.json();
  }

  async function saveAdminDb(nextDb) {
    const res = await fetch(apiUrl("/api/admin/data"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.authToken}`
      },
      body: JSON.stringify({
        meta: nextDb.meta || {},
        people: Array.isArray(nextDb.people) ? nextDb.people : [],
        categories: Array.isArray(nextDb.categories) ? nextDb.categories : []
      })
    });
    if (!res.ok) throw new Error("Failed to save");
    const payload = await res.json();
    return payload.data || nextDb;
  }

  /* --------------------------
     Categorized DB helpers + renderer
  -------------------------- */
  function normalizeDb(db) {
    const safe = db && typeof db === "object" ? db : {};
    const categories = Array.isArray(safe.categories) ? safe.categories : [];
    const meta = safe.meta && typeof safe.meta === "object" ? safe.meta : {};
    const people = Array.isArray(safe.people) ? safe.people : [];
    const peopleById = Object.create(null);
    people.forEach((p) => {
      if (p && p.id) peopleById[p.id] = p;
    });
    return { meta, categories, peopleById };
  }

  function titleByLang(obj, lang, fallback = "") {
    if (!obj) return fallback;
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") {
      return (lang === "ar" ? obj.ar : obj.en) || obj.en || obj.ar || fallback;
    }
    return fallback;
  }

  // helper for contact fields that may use separate _en/_ar suffixes or
  // simple string values.  the JSON coming from the server uses the
  // pattern `role_en`, `role_ar`, `notes_en`, `notes_ar`, etc.  older
  // versions of the script expected nested objects or flat `role` keys.
  function getContactValue(person, key, lang) {
    if (!person) return "";

    const enKey = key + "_en";
    const arKey = key + "_ar";

    if (lang === "ar" && person[arKey] != null) return person[arKey] || "";
    if (lang === "en" && person[enKey] != null) return person[enKey] || "";

    if (person[key] != null) {
      const val = person[key];
      if (typeof val === "object") {
        return titleByLang(val, lang, "");
      }
      return String(val);
    }

    return "";
  }

  function getRenderHost(lang) {
    const page = document.getElementById(lang === "ar" ? "page-ar" : "page-en");
    if (!page) return null;

    const byId = page.querySelector(lang === "ar" ? "#peopleHost-ar" : "#peopleHost-en");
    if (byId) return byId;

    const grid = page.querySelector(".person-grid");
    if (grid) return grid;

    return page;
  }

  function getDynamicHost(lang) {
    return document.getElementById(lang === "ar" ? "peopleHost-ar-dynamic" : "peopleHost-en-dynamic");
  }

  function makePhoneDigits(phone) {
    return String(phone || "").replace(/\D/g, "");
  }

  function mergeRoleWithPerson(role, peopleById) {
    const person = (role && role.personId && peopleById[role.personId]) || {};
    return {
      id: role?.id || person?.id || "",
      personId: role?.personId || person?.id || "",
      name_en: person?.name_en || person?.name || "",
      name_ar: person?.name_ar || person?.name || "",
      role_en: role?.role_en || role?.role || "",
      role_ar: role?.role_ar || role?.role || "",
      district_en: role?.district_en || role?.district || "",
      district_ar: role?.district_ar || role?.district || "",
      department_en: role?.department_en || role?.department || "",
      department_ar: role?.department_ar || role?.department || "",
      notes_en: role?.notes_en || role?.notes || "",
      notes_ar: role?.notes_ar || role?.notes || "",
      phone: person?.phone || role?.phone || "",
      email: person?.email || role?.email || ""
    };
  }

  function buildPersonCard(person, lang) {
    // the source data uses a mix of flat strings and _en/_ar suffixes. use
    // our helper to grab the appropriate localized value. the department
    // field is called "department" in the JSON but previously the script
    // referred to it as "division", so we normalise to a single variable
    // for display and searching.
    const rawNameEn = getContactValue(person, "name", "en") || person?.name_en || person?.name || "";
    const rawNameAr = getContactValue(person, "name", "ar") || person?.name_ar || "";
    let name = getContactValue(person, "name", lang) || person?.name || "";
    if (lang === "ar") {
      if (!rawNameAr || !isArabicText(rawNameAr) || rawNameAr.trim() === rawNameEn.trim()) {
        name = transliterateNameToArabic(rawNameEn || name);
      } else {
        name = rawNameAr;
      }
    } else {
      name = rawNameEn || name;
    }
    const role = localizeFetchedValue(getContactValue(person, "role", lang), "role", lang);
    const district = localizeFetchedValue(getContactValue(person, "district", lang), "district", lang);
    const division = localizeFetchedValue(getContactValue(person, "department", lang), "department", lang);
    const districtAnchor = lang === "ar" ? "cat-districts-ar" : "cat-districts";
    const districtLinkable = district && !isAllDistrictValue(district);
    const districtValueHtml = escapeHtml(district);
    const districtHtml = districtLinkable
      ? `<a class="district-link" href="#${districtAnchor}" data-district="${districtValueHtml}">${districtValueHtml}</a>`
      : districtValueHtml;

    const phoneDigits = makePhoneDigits(person?.phone);
    const phoneDisplay = person?.phone || "";
    const email = person?.email || "";

    const baseId =
      person?.id ||
      ("person-" + name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, ""));

    const id = lang === "ar" ? `${baseId}-ar` : baseId;

    const tel = phoneDigits ? `tel:+961${phoneDigits}` : "";
    const wa = phoneDigits ? `https://wa.me/961${phoneDigits}` : "";
    const mail = email ? `mailto:${email}` : "";

    const card = document.createElement("article");
    card.className = "person-card searchable";
    card.id = id;
    if (person?.id) card.dataset.roleId = person.id;
    if (person?.personId) card.dataset.personId = person.personId;

    // Search reads these
    card.dataset.name = name;
    card.dataset.role = role;
    card.dataset.district = district;
    card.dataset.department = division; // stored under "department" in JSON
    card.dataset.phone = phoneDigits;

    // Labels translated
    const L = lang === "ar" ? I18N.ar : I18N.en;

    const adminTools = isAdminLoggedIn()
      ? `
      <div class="card-admin-tools">
        <button class="btn card-edit-btn" type="button">Edit</button>
      </div>
      <div class="card-edit-panel hidden">
        <div class="card-edit-grid">
          <input class="admin-input card-field-name-en" type="text" value="${escapeHtml(person?.name_en || "")}" placeholder="Name EN" />
          <input class="admin-input card-field-name-ar" type="text" value="${escapeHtml(person?.name_ar || "")}" placeholder="Name AR" />
          <input class="admin-input card-field-phone" type="text" value="${escapeHtml(person?.phone || "")}" placeholder="Phone" />
          <input class="admin-input card-field-email" type="text" value="${escapeHtml(person?.email || "")}" placeholder="Email" />
          <input class="admin-input card-field-role-en" type="text" value="${escapeHtml(person?.role_en || "")}" placeholder="Role EN" />
          <input class="admin-input card-field-role-ar" type="text" value="${escapeHtml(person?.role_ar || "")}" placeholder="Role AR" />
          <input class="admin-input card-field-district-en" type="text" value="${escapeHtml(person?.district_en || "")}" placeholder="District EN" />
          <input class="admin-input card-field-district-ar" type="text" value="${escapeHtml(person?.district_ar || "")}" placeholder="District AR" />
          <input class="admin-input card-field-department-en" type="text" value="${escapeHtml(person?.department_en || "")}" placeholder="Department EN" />
          <input class="admin-input card-field-department-ar" type="text" value="${escapeHtml(person?.department_ar || "")}" placeholder="Department AR" />
        </div>
        <div class="admin-actions">
          <button class="btn card-save-btn" type="button">Save Card</button>
          <button class="btn card-cancel-btn" type="button">Cancel</button>
        </div>
      </div>`
      : "";

    card.innerHTML = `
      ${adminTools}
      <h4 class="person-name">${escapeHtml(name)}</h4>

      ${role ? `<p class="person-role"><span class="label">${escapeHtml(L.role)}:</span> ${escapeHtml(role)}</p>` : ""}
      ${district ? `<p class="person-line"><span class="label">${escapeHtml(L.district)}:</span> ${districtHtml}</p>` : ""}
      ${division ? `<p class="person-line"><span class="label">${escapeHtml(L.division)}:</span> ${escapeHtml(division)}</p>` : ""}
      ${phoneDisplay ? `<p class="person-line"><span class="label">${escapeHtml(L.phone)}:</span> <span class="ltr-text">${escapeHtml(phoneDisplay)}</span></p>` : ""}
      ${email ? `<p class="person-line"><span class="label">${escapeHtml(L.email)}:</span> <a href="${mail}" class="ltr-text">${escapeHtml(email)}</a></p>` : ""}
      <div class="person-actions">
        ${tel ? `<a class="action-link" href="${tel}">${escapeHtml(L.call)}</a>` : ""}
        ${wa ? `<a class="action-link" href="${wa}" target="_blank" rel="noopener">${escapeHtml(L.whatsapp)}</a>` : ""}
        ${mail ? `<a class="action-link" href="${mail}">${escapeHtml(L.emailBtn)}</a>` : ""}
      </div>
    `;

    return card;
  }

  function renderDivision(host, div, entries, lang, categoryMeta = null) {
    if (!entries.length) return;
    const block = document.createElement("details");
    block.className = "div-block division-details";
    block.open = true;

    const summary = document.createElement("summary");
    summary.className = "div-summary";
    const title = document.createElement("h4");
    title.className = "div-title";
    title.textContent = titleByLang(div?.title, lang, "");
    const badge = document.createElement("span");
    badge.className = "summary-badge";
    badge.textContent = String(entries.length);
    summary.appendChild(title);
    summary.appendChild(badge);
    block.appendChild(summary);

    const divContent = document.createElement("div");
    divContent.className = "div-content";

    const grid = document.createElement("div");
    const cols = Math.max(1, Math.min(3, entries.length));
    grid.className = `person-grid cols-${cols}`;
    const categoryKey = categoryMeta?.key || "";
    const categoryTitle = categoryMeta?.title || "";
    const divisionKey = String(div?.key || "").trim();
    const divisionTitle = titleByLang(div?.title, lang, divisionKey);

    entries.forEach((entry) => {
      const card = buildPersonCard(entry, lang);
      card.dataset.categoryKey = categoryKey;
      card.dataset.categoryTitle = categoryTitle;
      card.dataset.divisionKey = divisionKey;
      card.dataset.divisionTitle = divisionTitle;
      grid.appendChild(card);
    });
    divContent.appendChild(grid);

    block.appendChild(divContent);

    host.appendChild(block);
  }

  function renderCategorized(db, lang) {
    const { categories, peopleById } = normalizeDb(db);
    const dynamicHost = getDynamicHost(lang);
    if (dynamicHost) dynamicHost.innerHTML = "";

    // iterate through each category; the markup includes specific containers
    // with ids like `peopleHost-en-crisis` / `peopleHost-ar-districts`. use the
    // category `key` property to locate them. fall back to the generic host
    // when the expected element is missing (old pages, or if only one grid
    // exists).
    categories.forEach((cat) => {
      const hostId = `peopleHost-${lang}-${cat.key}`;
      let host = document.getElementById(hostId);
      let sectionForDynamic = null;
      if (!host && dynamicHost) {
        sectionForDynamic = document.createElement("section");
        sectionForDynamic.className = "div-block";
        const catTitle = document.createElement("h3");
        catTitle.className = "cat-title";
        catTitle.textContent = titleByLang(cat?.title, lang, cat.key || "Category");
        sectionForDynamic.appendChild(catTitle);
        dynamicHost.appendChild(sectionForDynamic);
      }
      if (!host && !sectionForDynamic) {
        host = getRenderHost(lang);
      }
      if (!host && !sectionForDynamic) return;

      // clear before populating
      if (host) host.innerHTML = "";

      const divisions = Array.isArray(cat.divisions) ? cat.divisions : [];
      divisions.forEach((div) => {
        const categoryMeta = {
          key: String(cat?.key || ""),
          title: titleByLang(cat?.title, lang, String(cat?.key || ""))
        };
        const roles = Array.isArray(div?.roles) ? div.roles : [];
        if (roles.length) {
          const entries = roles.map((r) => mergeRoleWithPerson(r, peopleById));
          renderDivision(sectionForDynamic || host, div, entries, lang, categoryMeta);
          return;
        }

        // backward compatibility with legacy shape
        const contacts = Array.isArray(div?.contacts) ? div.contacts : [];
        renderDivision(sectionForDynamic || host, div, contacts, lang, categoryMeta);
      });
    });
  }

  function renderPeopleFromDb(db) {
    renderCategorized(db, "en");
    renderCategorized(db, "ar");
    refreshSearchFilters(state.lang);
    searchCards(state.lang, qs(".search-input")?.value || "");

    // Footer version
    const meta = db?.meta || {};
    const v = meta.version || db?.version || "";
    const gen = meta.generatedAt || "";

    const fvEn = document.getElementById("footer-version-en");
    const fgEn = document.getElementById("footer-generated-en");
    const fvAr = document.getElementById("footer-version-ar");
    const fgAr = document.getElementById("footer-generated-ar");

    if (fvEn) fvEn.textContent = v || "—";
    if (fgEn) fgEn.textContent = gen || "—";
    if (fvAr) fvAr.textContent = v || "—";
    if (fgAr) fgAr.textContent = gen || "—";
  }

  function showLoadError(err) {
    console.error(err);

    const msg = document.createElement("div");
    msg.className = "note-box";
    msg.style.margin = "12px 0";
    msg.innerHTML = `
      <strong>${escapeHtml(t("loadFailedTitle"))}</strong>
      <div style="opacity:.9; margin-top:6px;">
        ${escapeHtml(err?.message || "Unknown error")}
      </div>
    `;

    const page = document.getElementById("page-en");
    if (page) page.prepend(msg);
  }

  function ensureAdminShape(db) {
    const safe = db && typeof db === "object" ? db : {};
    if (!safe.meta || typeof safe.meta !== "object") safe.meta = {};
    if (!Array.isArray(safe.people)) safe.people = [];
    if (!Array.isArray(safe.categories)) safe.categories = [];
    safe.categories.forEach((c) => {
      if (!Array.isArray(c.divisions)) c.divisions = [];
    });
    return safe;
  }

  function status(msg, isError = false) {
    ["login-status", "login-modal-status", "add-modal-status"].forEach((id) => {
      const box = document.getElementById(id);
      if (!box) return;
      box.classList.remove("hidden");
      box.textContent = msg;
      box.style.background = isError ? "#fff1f1" : "#eef6ff";
      box.style.color = isError ? "#7a1f1f" : "#123a61";
    });
  }

  function setAdminEditorVisible(visible) {
    const adminPanel = document.getElementById("admin-panel");
    const panel = document.getElementById("admin-editor");
    if (adminPanel) adminPanel.classList.toggle("hidden", !visible);
    if (!panel) return;
    panel.classList.toggle("hidden", !visible);
  }

  function getSelectedCategory() {
    const sel = document.getElementById("category-select");
    if (!sel || !state.adminDb) return null;
    return state.adminDb.categories.find((c) => c.key === sel.value) || null;
  }

  function fillPeopleSelect() {
    const sel = document.getElementById("person-select");
    if (!sel || !state.adminDb) return;
    const people = [...state.adminDb.people].sort((a, b) =>
      String(a.name_en || a.name_ar || "").localeCompare(String(b.name_en || b.name_ar || ""))
    );
    sel.innerHTML = '<option value="">Select person</option>' +
      people
        .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name_en || p.name_ar || p.id)}</option>`)
        .join("");
  }

  function fillPersonForm(personId) {
    if (!document.getElementById("person-id")) return;
    const p = (state.adminDb?.people || []).find((x) => x.id === personId) || null;
    qs("#person-id").value = p?.id || "";
    qs("#person-name-en").value = p?.name_en || "";
    qs("#person-name-ar").value = p?.name_ar || "";
    qs("#person-phone").value = p?.phone || "";
    qs("#person-email").value = p?.email || "";
  }

  function fillCategorySelects() {
    const categorySelect = document.getElementById("category-select");
    const divisionCategorySelect = document.getElementById("division-category-select");
    if (!categorySelect || !divisionCategorySelect || !state.adminDb) return;
    const options =
      '<option value="">Select category</option>' +
      state.adminDb.categories
        .map((c) => `<option value="${escapeHtml(c.key)}">${escapeHtml(c.title?.en || c.key)}</option>`)
        .join("");
    categorySelect.innerHTML = options;
    divisionCategorySelect.innerHTML = options;
  }

  function fillCategoryForm(catKey) {
    if (!document.getElementById("category-key")) return;
    const c = (state.adminDb?.categories || []).find((x) => x.key === catKey) || null;
    qs("#category-key").value = c?.key || "";
    qs("#category-title-en").value = c?.title?.en || "";
    qs("#category-title-ar").value = c?.title?.ar || "";
  }

  function fillDivisionSelect() {
    const catSel = document.getElementById("division-category-select");
    const divSel = document.getElementById("division-select");
    if (!catSel || !divSel || !state.adminDb) return;
    const cat = state.adminDb.categories.find((c) => c.key === catSel.value);
    if (!cat) {
      divSel.innerHTML = '<option value="">Select division</option>';
      return;
    }
    divSel.innerHTML =
      '<option value="">Select division</option>' +
      (cat.divisions || [])
        .map((d) => `<option value="${escapeHtml(d.key)}">${escapeHtml(d.title?.en || d.key)}</option>`)
        .join("");
  }

  function fillDivisionForm() {
    if (!document.getElementById("division-key")) return;
    const catSel = document.getElementById("division-category-select");
    const divSel = document.getElementById("division-select");
    if (!catSel || !divSel || !state.adminDb) return;
    const cat = state.adminDb.categories.find((c) => c.key === catSel.value);
    const div = cat?.divisions?.find((d) => d.key === divSel.value);
    qs("#division-key").value = div?.key || "";
    qs("#division-title-en").value = div?.title?.en || "";
    qs("#division-title-ar").value = div?.title?.ar || "";
  }

  function refreshAdminForms() {
    fillPeopleSelect();
    fillCategorySelects();
    fillDivisionSelect();
    if (document.getElementById("person-id")) fillPersonForm("");
    if (document.getElementById("category-key")) fillCategoryForm("");
    if (document.getElementById("division-key")) fillDivisionForm();
  }

  function updateCardDataFromInputs(card) {
    if (!state.adminDb || !card) return false;
    const roleId = card.dataset.roleId;
    const personId = card.dataset.personId;
    if (!roleId || !personId) return false;

    const val = (sel) => (card.querySelector(sel)?.value || "").trim();

    const person = state.adminDb.people.find((p) => p.id === personId);
    if (!person) return false;
    person.name_en = val(".card-field-name-en");
    person.name_ar = val(".card-field-name-ar") || person.name_en;
    person.phone = val(".card-field-phone");
    person.email = val(".card-field-email");

    for (const cat of state.adminDb.categories || []) {
      for (const div of cat.divisions || []) {
        const role = (div.roles || []).find((r) => r.id === roleId);
        if (role) {
          role.role_en = val(".card-field-role-en");
          role.role_ar = val(".card-field-role-ar") || role.role_en;
          role.district_en = val(".card-field-district-en");
          role.district_ar = val(".card-field-district-ar") || role.district_en;
          role.department_en = val(".card-field-department-en");
          role.department_ar = val(".card-field-department-ar") || role.department_en;
          return true;
        }
      }
    }
    return false;
  }

  async function savePersonLocal() {
    if (!state.adminDb) return;
    const idInput = qs("#person-id").value.trim();
    const nameEn = qs("#person-name-en").value.trim();
    const nameAr = qs("#person-name-ar").value.trim();
    const phone = qs("#person-phone").value.trim();
    const email = qs("#person-email").value.trim();
    const id = idInput || `person-${slugify(nameEn || nameAr || "new")}`;
    if (!nameEn && !nameAr) {
      return status("Name is required for person", true);
    }
    const idx = state.adminDb.people.findIndex((p) => p.id === id);
    const row = { id, name_en: nameEn || nameAr, name_ar: nameAr || nameEn, phone, email };
    if (idx >= 0) state.adminDb.people[idx] = row;
    else state.adminDb.people.push(row);
    try {
      state.adminDb = ensureAdminShape(await saveAdminDb(state.adminDb));
      renderPeopleFromDb(state.adminDb);
      fillPeopleSelect();
      qs("#person-select").value = id;
      status("Person saved.");
    } catch (err) {
      status(err.message || "Failed to save person", true);
    }
  }

  async function saveCategoryLocal() {
    if (!state.adminDb) return;
    const key = qs("#category-key").value.trim();
    const en = qs("#category-title-en").value.trim();
    const ar = qs("#category-title-ar").value.trim();
    if (!key) {
      return status("Category key is required", true);
    }
    let cat = state.adminDb.categories.find((c) => c.key === key);
    if (!cat) {
      cat = { key, title: { en: en || key, ar: ar || en || key }, divisions: [] };
      state.adminDb.categories.push(cat);
    } else {
      cat.title = { en: en || cat.title?.en || key, ar: ar || cat.title?.ar || en || key };
    }
    try {
      state.adminDb = ensureAdminShape(await saveAdminDb(state.adminDb));
      renderPeopleFromDb(state.adminDb);
      fillCategorySelects();
      qs("#category-select").value = key;
      qs("#division-category-select").value = key;
      fillDivisionSelect();
      status("Category saved.");
    } catch (err) {
      status(err.message || "Failed to save category", true);
    }
  }

  async function saveDivisionLocal() {
    if (!state.adminDb) return;
    const catKey = qs("#division-category-select").value.trim();
    const key = qs("#division-key").value.trim();
    const en = qs("#division-title-en").value.trim();
    const ar = qs("#division-title-ar").value.trim();
    const cat = state.adminDb.categories.find((c) => c.key === catKey);
    if (!cat) {
      return status("Select category first", true);
    }
    if (!key) {
      return status("Division key is required", true);
    }
    let div = (cat.divisions || []).find((d) => d.key === key);
    if (!div) {
      div = { key, title: { en: en || key, ar: ar || en || key }, roles: [] };
      cat.divisions = Array.isArray(cat.divisions) ? cat.divisions : [];
      cat.divisions.push(div);
    } else {
      div.title = { en: en || div.title?.en || key, ar: ar || div.title?.ar || en || key };
    }
    try {
      state.adminDb = ensureAdminShape(await saveAdminDb(state.adminDb));
      renderPeopleFromDb(state.adminDb);
      fillDivisionSelect();
      qs("#division-select").value = key;
      status("Division saved.");
    } catch (err) {
      status(err.message || "Failed to save division", true);
    }
  }

  async function loadAdminData() {
    const db = ensureAdminShape(await fetchAdminDb());
    state.adminDb = db;
    renderPeopleFromDb(state.adminDb);
    refreshAdminForms();
    status("Admin data loaded.");
  }

  function bindAdminUI() {
    const openBtn = document.getElementById("admin-open-btn");
    const closeBtn = document.getElementById("login-close-btn");
    const modal = document.getElementById("admin-login-modal");
    const addModal = document.getElementById("admin-add-modal");
    const addCloseBtn = document.getElementById("add-close-btn");
    const addForm = document.getElementById("admin-add-form");
    const addTitle = document.getElementById("admin-add-title");
    const addCategorySelect = document.getElementById("add-category-select");
    const addDivisionSelect = document.getElementById("add-division-select");
    const addKey = document.getElementById("add-key");
    const addTitleEn = document.getElementById("add-title-en");
    const addTitleAr = document.getElementById("add-title-ar");
    const addPersonNameEn = document.getElementById("add-person-name-en");
    const addPersonNameAr = document.getElementById("add-person-name-ar");
    const addPersonPhone = document.getElementById("add-person-phone");
    const addPersonEmail = document.getElementById("add-person-email");
    const addRoleEn = document.getElementById("add-role-en");
    const addRoleAr = document.getElementById("add-role-ar");
    const addDepartmentEn = document.getElementById("add-department-en");
    const addDepartmentAr = document.getElementById("add-department-ar");
    const addDistrictEn = document.getElementById("add-district-en");
    const addDistrictAr = document.getElementById("add-district-ar");
    const form = document.getElementById("login-form");
    const logout = document.getElementById("logout-btn");
    const refresh = document.getElementById("admin-refresh");
    const saveAll = document.getElementById("admin-save-all");
    const addPersonBtn = document.getElementById("add-person-btn");
    const addCategoryBtn = document.getElementById("add-category-btn");
    const addDivisionBtn = document.getElementById("add-division-btn");
    let addMode = "";
    if (!form) return;

    openBtn?.addEventListener("click", () => {
      modal?.classList.remove("hidden");
      qs("#login-username")?.focus();
    });
    closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
    addCloseBtn?.addEventListener("click", () => addModal?.classList.add("hidden"));
    addModal?.addEventListener("click", (e) => {
      if (e.target === addModal) addModal.classList.add("hidden");
    });

    function openAddModal(mode) {
      addMode = mode;
      if (!addModal) return;
      const isPerson = mode === "person";
      const isDivision = mode === "division";
      const needsCategory = isPerson || isDivision;
      if (addTitle) {
        if (mode === "person") addTitle.textContent = "Add Person";
        else if (mode === "category") addTitle.textContent = "Add Category";
        else addTitle.textContent = "Add Division";
      }

      const categories = (state.adminDb?.categories || []).map((c) => c.key);
      if (addCategorySelect) {
        addCategorySelect.classList.toggle("hidden", !needsCategory);
        addCategorySelect.innerHTML =
          '<option value="">Select category</option>' +
          categories.map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");
      }

      if (addDivisionSelect) {
        addDivisionSelect.classList.toggle("hidden", !isPerson);
        addDivisionSelect.innerHTML = '<option value="">Select division</option>';
      }
      if (addKey) {
        addKey.value = "";
        addKey.classList.toggle("hidden", isPerson);
      }
      if (addTitleEn) {
        addTitleEn.value = "";
        addTitleEn.classList.toggle("hidden", isPerson);
      }
      if (addTitleAr) {
        addTitleAr.value = "";
        addTitleAr.classList.toggle("hidden", isPerson);
      }
      if (addPersonNameEn) {
        addPersonNameEn.value = "";
        addPersonNameEn.classList.toggle("hidden", !isPerson);
      }
      if (addPersonNameAr) {
        addPersonNameAr.value = "";
        addPersonNameAr.classList.toggle("hidden", !isPerson);
      }
      if (addPersonPhone) {
        addPersonPhone.value = "";
        addPersonPhone.classList.toggle("hidden", !isPerson);
      }
      if (addPersonEmail) {
        addPersonEmail.value = "";
        addPersonEmail.classList.toggle("hidden", !isPerson);
      }
      if (addRoleEn) {
        addRoleEn.value = "";
        addRoleEn.classList.toggle("hidden", !isPerson);
      }
      if (addRoleAr) {
        addRoleAr.value = "";
        addRoleAr.classList.toggle("hidden", !isPerson);
      }
      if (addDepartmentEn) {
        addDepartmentEn.value = "";
        addDepartmentEn.classList.toggle("hidden", !isPerson);
      }
      if (addDepartmentAr) {
        addDepartmentAr.value = "";
        addDepartmentAr.classList.toggle("hidden", !isPerson);
      }
      if (addDistrictEn) {
        addDistrictEn.value = "";
        addDistrictEn.classList.toggle("hidden", !isPerson);
      }
      if (addDistrictAr) {
        addDistrictAr.value = "";
        addDistrictAr.classList.toggle("hidden", !isPerson);
      }
      const box = document.getElementById("add-modal-status");
      if (box) box.classList.add("hidden");
      addModal.classList.remove("hidden");
      (isPerson ? addPersonNameEn : addKey)?.focus();
    }

    addCategorySelect?.addEventListener("change", () => {
      if (addMode !== "person") return;
      const cat = state.adminDb?.categories?.find((c) => c.key === addCategorySelect.value);
      const divisions = cat?.divisions || [];
      if (addDivisionSelect) {
        addDivisionSelect.innerHTML =
          '<option value="">Select division</option>' +
          divisions.map((d) => `<option value="${escapeHtml(d.key)}">${escapeHtml(d.key)}</option>`).join("");
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const username = qs("#login-username").value.trim();
        const password = qs("#login-password").value.trim();
        const payload = await loginApi(username, password);
        state.authToken = payload.token || "";
        setAdminEditorVisible(true);
        await loadAdminData();
        status(`Logged in as ${payload.user?.username || username}`);
        modal?.classList.add("hidden");
      } catch (err) {
        status(err.message || "Login failed", true);
      }
    });

    if (logout) {
      logout.addEventListener("click", async () => {
        state.authToken = "";
        state.adminDb = null;
        setAdminEditorVisible(false);
        try {
          const db = await fetchDb();
          renderPeopleFromDb(db);
        } catch (_) {}
        status("Logged out");
      });
    }

    if (refresh) {
      refresh.addEventListener("click", async () => {
        if (!state.authToken) return status("Login required", true);
        try {
          await loadAdminData();
        } catch (err) {
          status(err.message || "Refresh failed", true);
        }
      });
    }

    if (saveAll) {
      saveAll.addEventListener("click", async () => {
        if (!state.authToken || !state.adminDb) return status("Login required", true);
        try {
          const saved = ensureAdminShape(await saveAdminDb(state.adminDb));
          state.adminDb = saved;
          renderPeopleFromDb(saved);
          refreshAdminForms();
          status("Saved to data.json successfully.");
        } catch (err) {
          status(err.message || "Save failed", true);
        }
      });
    }

    addPersonBtn?.addEventListener("click", () => {
      if (!state.authToken || !state.adminDb) return status("Login required", true);
      openAddModal("person");
    });

    addCategoryBtn?.addEventListener("click", () => {
      if (!state.authToken || !state.adminDb) return status("Login required", true);
      openAddModal("category");
    });

    addDivisionBtn?.addEventListener("click", () => {
      if (!state.authToken || !state.adminDb) return status("Login required", true);
      openAddModal("division");
    });

    addForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.authToken || !state.adminDb) return status("Login required", true);

      if (addMode === "person") {
        const nameEn = String(addPersonNameEn?.value || "").trim();
        const nameAr = String(addPersonNameAr?.value || "").trim() || nameEn;
        const phone = String(addPersonPhone?.value || "").trim();
        const email = String(addPersonEmail?.value || "").trim();
        const roleEn = String(addRoleEn?.value || "").trim();
        const roleAr = String(addRoleAr?.value || "").trim() || roleEn;
        const departmentEn = String(addDepartmentEn?.value || "").trim() || roleEn;
        const departmentAr = String(addDepartmentAr?.value || "").trim() || roleAr;
        const districtEn = String(addDistrictEn?.value || "").trim();
        const districtAr = String(addDistrictAr?.value || "").trim() || districtEn;
        const catKey = String(addCategorySelect?.value || "").trim();
        const divKey = String(addDivisionSelect?.value || "").trim();
        if (!nameEn && !nameAr) return status("Person name is required", true);
        if (!catKey || !divKey) return status("Select category and division", true);
        if (!roleEn && !roleAr) return status("Role is required", true);
        const id = `person-${slugify(nameEn || nameAr)}`;
        const uniqueId = (base) => {
          if (!state.adminDb.people.some((p) => p.id === base)) return base;
          let i = 2;
          while (state.adminDb.people.some((p) => p.id === `${base}-${i}`)) i += 1;
          return `${base}-${i}`;
        };
        const personId = uniqueId(id);
        state.adminDb.people.push({
          id: personId,
          name_en: nameEn || nameAr,
          name_ar: nameAr || nameEn,
          phone,
          email
        });
        const cat = state.adminDb.categories.find((c) => c.key === catKey);
        const div = cat?.divisions?.find((d) => d.key === divKey);
        if (!div) return status("Selected division not found", true);
        if (!Array.isArray(div.roles)) div.roles = [];
        const roleIdBase = `role-${slugify(personId)}-${slugify(roleEn || departmentEn || "member")}`;
        let roleId = roleIdBase;
        let i = 2;
        const existingIds = new Set(div.roles.map((r) => r.id));
        while (existingIds.has(roleId)) {
          roleId = `${roleIdBase}-${i++}`;
        }
        div.roles.push({
          id: roleId,
          personId,
          role_en: roleEn || roleAr,
          role_ar: roleAr || roleEn,
          district_en: districtEn,
          district_ar: districtAr,
          department_en: departmentEn,
          department_ar: departmentAr,
          notes_en: "",
          notes_ar: ""
        });
      } else if (addMode === "category") {
        const key = String(addKey?.value || "").trim();
        const titleEn = String(addTitleEn?.value || "").trim() || key;
        const titleAr = String(addTitleAr?.value || "").trim() || titleEn;
        if (!key) return status("Key is required", true);
        if (state.adminDb.categories.some((c) => c.key === key)) {
          return status("Category key already exists", true);
        }
        state.adminDb.categories.push({ key, title: { en: titleEn, ar: titleAr }, divisions: [] });
      } else if (addMode === "division") {
        const key = String(addKey?.value || "").trim();
        const titleEn = String(addTitleEn?.value || "").trim() || key;
        const titleAr = String(addTitleAr?.value || "").trim() || titleEn;
        if (!key) return status("Key is required", true);
        const catKey = String(addCategorySelect?.value || "").trim();
        if (!catKey) return status("Parent category key is required", true);
        const cat = state.adminDb.categories.find((c) => c.key === catKey);
        if (!cat) return status("Category not found", true);
        cat.divisions = Array.isArray(cat.divisions) ? cat.divisions : [];
        if (cat.divisions.some((d) => d.key === key)) return status("Division key already exists in this category", true);
        cat.divisions.push({ key, title: { en: titleEn, ar: titleAr }, roles: [] });
      } else {
        return status("Invalid add mode", true);
      }

      try {
        state.adminDb = ensureAdminShape(await saveAdminDb(state.adminDb));
        renderPeopleFromDb(state.adminDb);
        refreshAdminForms();
        addModal?.classList.add("hidden");
        status(
          addMode === "person"
            ? "Person added and saved."
            : addMode === "category"
              ? "Category added and saved."
              : "Division added and saved."
        );
      } catch (err) {
        status(err.message || "Failed to save", true);
      }
    });

    const personSelect = document.getElementById("person-select");
    personSelect?.addEventListener("change", () => fillPersonForm(personSelect.value));
    qs("#person-new")?.addEventListener("click", () => fillPersonForm(""));
    qs("#person-save")?.addEventListener("click", savePersonLocal);

    const categorySelect = document.getElementById("category-select");
    categorySelect?.addEventListener("change", () => fillCategoryForm(categorySelect.value));
    qs("#category-new")?.addEventListener("click", () => fillCategoryForm(""));
    qs("#category-save")?.addEventListener("click", saveCategoryLocal);

    const divisionCategorySelect = document.getElementById("division-category-select");
    const divisionSelect = document.getElementById("division-select");
    divisionCategorySelect?.addEventListener("change", () => {
      fillDivisionSelect();
      fillDivisionForm();
    });
    divisionSelect?.addEventListener("change", fillDivisionForm);
    qs("#division-new")?.addEventListener("click", () => fillDivisionForm());
    qs("#division-save")?.addEventListener("click", saveDivisionLocal);

    document.addEventListener("click", async (e) => {
      const districtLink = e.target.closest(".district-link");
      if (districtLink) {
        e.preventDefault();
        const districtLabel = String(districtLink.dataset.district || districtLink.textContent || "").trim();
        const districtAnchor = state.lang === "ar" ? "cat-districts-ar" : "cat-districts";
        const targetCard = findDistrictContactTarget(state.lang, districtLabel);

        if (targetCard) {
          const page = getActivePage();
          revealElementPath(targetCard, page);
          openParents(targetCard);
          const targetId = ensureCardId(targetCard, state.lang);
          history.replaceState(null, "", `#${targetId}`);
          targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
          focusCard(targetCard);
          return;
        }

        const anchor = document.getElementById(districtAnchor);
        if (anchor) {
          openParents(anchor);
          history.replaceState(null, "", `#${districtAnchor}`);
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      const editBtn = e.target.closest(".card-edit-btn");
      if (editBtn) {
        const card = e.target.closest(".person-card");
        if (!card) return;
        const panel = card.querySelector(".card-edit-panel");
        const isOpen = panel && !panel.classList.contains("hidden");
        qsa(".person-card.is-editing").forEach((c) => c.classList.remove("is-editing"));
        qsa(".card-edit-panel").forEach((p) => p.classList.add("hidden"));
        if (panel && !isOpen) {
          panel.classList.remove("hidden");
          card.classList.add("is-editing");
        }
        return;
      }

      const cancelBtn = e.target.closest(".card-cancel-btn");
      if (cancelBtn) {
        renderPeopleFromDb(state.adminDb || {});
        return;
      }

      const saveBtn = e.target.closest(".card-save-btn");
      if (saveBtn) {
        const card = e.target.closest(".person-card");
        if (!card) return;
        const ok = updateCardDataFromInputs(card);
        if (!ok) return status("Failed to read card data", true);
        try {
          state.adminDb = ensureAdminShape(await saveAdminDb(state.adminDb));
          renderPeopleFromDb(state.adminDb);
          refreshAdminForms();
          status("Card changes saved.");
        } catch (err) {
          status(err.message || "Failed to save card changes", true);
        }
      }
    });
  }

  /* --------------------------
     Init
  -------------------------- */
  async function init() {
    try {
      const db = await fetchDb();
      renderPeopleFromDb(db);

      bindSearch();
      bindExpandCollapse();
      bindLanguageToggle();
      bindHashLinks();
      bindAdminUI();

      initFromHashLanguageHint();
      handleHashNavigation();

      window.addEventListener("hashchange", () => {
        const mapped = mapHashToLanguage(window.location.hash, state.lang);
        if (mapped !== window.location.hash) history.replaceState(null, "", mapped);
        handleHashNavigation(mapped);
      });
    } catch (err) {
      bindSearch();
      bindExpandCollapse();
      bindLanguageToggle();
      bindHashLinks();
      bindAdminUI();
      initFromHashLanguageHint();

      showLoadError(err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
