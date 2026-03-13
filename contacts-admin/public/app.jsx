const { useEffect, useMemo, useRef, useState } = React;

const I18N = {
  en: {
    appTitle: "Lebanese Red Cross - Youth Sector",
    appSubtitle: "Crisis Coordination Directory and Shelter Operations",
    contactsView: "Contacts Directory",
    scheduleView: "Shelters Schedule",
    adminContacts: "Contacts",
    adminShelter: "Shelter Commands",
    operational: "Operational Contacts",
    beirutTime: "Beirut Time",
    search: "Search by name, role, district, phone...",
    allCategories: "All Categories",
    allDivisions: "All Divisions",
    clear: "Clear",
    adminLogin: "Admin Login",
    username: "Username",
    password: "Password",
    login: "Login",
    close: "Close",
    role: "Role",
    district: "District",
    division: "Division",
    phone: "Phone",
    email: "Email",
    noResults: "No matching contacts.",
    adminWorkspace: "Admin Workspace",
    backToDirectory: "Back to Directory",
    refresh: "Refresh",
    saveAll: "Save All",
    logout: "Logout",
    quickEditor: "Quick Contact Editor",
    searchPersonToEdit: "Search contact cards to edit...",
    noEditorResults: "No matching editor cards.",
    editorResults: "results",
    clearSearch: "Clear search",
    addPerson: "Add Person",
    addCategory: "Add Category",
    addDivision: "Add Division",
    addShift: "Add Shift",
    addBlock: "Add Block",
    addPosition: "Add Position",
    statusSaved: "Saved successfully.",
    statusLoadFail: "Failed to load data.",
    statusLoginFail: "Invalid username or password",
    statusNeedAuth: "Login required",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    districtJump: "Go to district contacts",
    shiftDate: "Shift Date",
    shiftLabelEn: "Shift Label EN",
    shiftLabelAr: "Shift Label AR",
    startTime: "Start Time",
    endTime: "End Time",
    shelterBlocks: "Shelter Blocks",
    noShifts: "No active shifts.",
    noBlocks: "No blocks in this shift.",
    noPositions: "No positions in this block.",
    commandCell: "Command Cell",
    teamsBlock: "Teams Block",
    generalBlock: "General Block",
    blockType: "Block Type",
    blockTitleEn: "Block Title EN",
    blockTitleAr: "Block Title AR",
    guidanceEn: "Guidance EN",
    guidanceAr: "Guidance AR",
    personNameEn: "Person Name EN",
    personNameAr: "Person Name AR",
    roleEn: "Role EN",
    roleAr: "Role AR",
    positions: "Positions"
  },
  ar: {
    appTitle: "الصليب الأحمر اللبناني - قطاع الناشئين والشباب",
    appSubtitle: "دليل تنسيق الأزمة وعمليات الملاجئ",
    contactsView: "دليل جهات الاتصال",
    scheduleView: "جدول الملاجئ",
    adminContacts: "جهات الاتصال",
    adminShelter: "قيادة الملاجئ",
    operational: "جهات اتصال تشغيلية",
    beirutTime: "توقيت بيروت",
    search: "ابحث بالاسم أو الدور أو المنطقة أو الهاتف...",
    allCategories: "كل الفئات",
    allDivisions: "كل الأقسام",
    clear: "مسح",
    adminLogin: "دخول المشرف",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    close: "إغلاق",
    role: "الدور",
    district: "المنطقة",
    division: "القسم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    noResults: "لا توجد نتائج مطابقة.",
    adminWorkspace: "مساحة الإدارة",
    backToDirectory: "العودة إلى الدليل",
    refresh: "تحديث",
    saveAll: "حفظ الكل",
    logout: "تسجيل الخروج",
    quickEditor: "محرر بطاقات جهات الاتصال",
    searchPersonToEdit: "ابحث في بطاقات جهات الاتصال للتعديل...",
    noEditorResults: "لا توجد بطاقات مطابقة.",
    editorResults: "نتيجة",
    clearSearch: "مسح البحث",
    addPerson: "إضافة شخص",
    addCategory: "إضافة فئة",
    addDivision: "إضافة قسم",
    addShift: "إضافة مناوبة",
    addBlock: "إضافة كتلة",
    addPosition: "إضافة موقع",
    statusSaved: "تم الحفظ بنجاح.",
    statusLoadFail: "فشل تحميل البيانات.",
    statusLoginFail: "اسم المستخدم أو كلمة المرور غير صحيحة",
    statusNeedAuth: "الرجاء تسجيل الدخول",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    districtJump: "الانتقال إلى جهات اتصال المنطقة",
    shiftDate: "تاريخ المناوبة",
    shiftLabelEn: "اسم المناوبة بالإنجليزية",
    shiftLabelAr: "اسم المناوبة بالعربية",
    startTime: "وقت البداية",
    endTime: "وقت النهاية",
    shelterBlocks: "كتل الملاجئ",
    noShifts: "لا توجد مناوبات نشطة.",
    noBlocks: "لا توجد كتل داخل هذه المناوبة.",
    noPositions: "لا توجد مواقع داخل هذه الكتلة.",
    commandCell: "خلية القيادة",
    teamsBlock: "قسم الفرق",
    generalBlock: "كتلة عامة",
    blockType: "نوع الكتلة",
    blockTitleEn: "عنوان الكتلة بالإنجليزية",
    blockTitleAr: "عنوان الكتلة بالعربية",
    guidanceEn: "إرشادات بالإنجليزية",
    guidanceAr: "إرشادات بالعربية",
    personNameEn: "اسم الشخص بالإنجليزية",
    personNameAr: "اسم الشخص بالعربية",
    roleEn: "الدور بالإنجليزية",
    roleAr: "الدور بالعربية",
    positions: "المواقع"
  }
};

const DEFAULT_FLY_API_BASE = "https://contacts-admin-crisis-2026.fly.dev";

function apiBase() {
  const globalBase = window.__API_BASE_URL__;
  if (typeof globalBase === "string" && globalBase.trim()) return globalBase.trim().replace(/\/+$/, "");
  const meta = document.querySelector('meta[name="api-base-url"]')?.getAttribute("content") || "";
  if (meta.trim()) return meta.trim().replace(/\/+$/, "");
  if (window.location.hostname.endsWith("github.io")) return DEFAULT_FLY_API_BASE;
  return "";
}

function apiUrl(path) {
  const base = apiBase();
  return base ? `${base}${path}` : path;
}

function normalizeText(v) {
  return String(v || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleByLang(obj, lang, fallback = "") {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj;
  return (lang === "ar" ? obj.ar : obj.en) || obj.en || obj.ar || fallback;
}

function valueByLang(row, key, lang) {
  const en = row?.[`${key}_en`];
  const ar = row?.[`${key}_ar`];
  if (lang === "ar" && ar != null && ar !== "") return String(ar);
  if (lang === "en" && en != null && en !== "") return String(en);
  if (row?.[key] != null) return String(row[key]);
  return String(en || ar || "");
}

function makePhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function isAllDistrict(v) {
  const x = normalizeText(v).replace(/\s+/g, "");
  return ["alldistrict", "alldistricts", "allregion", "allregions", "كلالمناطق", "كافةالمناطق"].includes(x);
}

function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultSchedule() {
  return {
    meta: {
      title_en: "Shelters Schedule and Commanders",
      title_ar: "جدول الملاجئ والقادة",
      subtitle_en: "Shift planning and on-site command structure",
      subtitle_ar: "تخطيط المناوبات وهيكلية القيادة الميدانية"
    },
    shifts: []
  };
}

function todayInBeirut() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

function App() {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("contacts");
  const [adminView, setAdminView] = useState("contacts");
  const [db, setDb] = useState({ meta: {}, people: [], categories: [], shelterSchedule: defaultSchedule() });
  const [adminDb, setAdminDb] = useState(null);
  const [token, setToken] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [editingRoleId, setEditingRoleId] = useState("");
  const [editingShiftId, setEditingShiftId] = useState("");
  const [editingBlockId, setEditingBlockId] = useState("");
  const [editingPositionId, setEditingPositionId] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [pendingScrollKey, setPendingScrollKey] = useState("");
  const [addOverlay, setAddOverlay] = useState({ open: false, mode: "person" });
  const [cardDrafts, setCardDrafts] = useState({});
  const [shiftDrafts, setShiftDrafts] = useState({});
  const [blockDrafts, setBlockDrafts] = useState({});
  const [positionDrafts, setPositionDrafts] = useState({});
  const [addForms, setAddForms] = useState({
    person: { name_en: "", name_ar: "", phone: "", email: "", category: "", division: "", role_en: "", role_ar: "", district_en: "", district_ar: "", department_en: "", department_ar: "" },
    category: { key: "", title_en: "", title_ar: "" },
    division: { category: "", key: "", title_en: "", title_ar: "" },
    shift: { shift_date: "", shift_label_en: "", shift_label_ar: "", start_time: "", end_time: "" },
    block: { shiftId: "", type: "general", title_en: "", title_ar: "", guidance_en: "", guidance_ar: "" },
    position: { shiftId: "", blockId: "", person_name_en: "", person_name_ar: "", phone: "", email: "", role_en: "", role_ar: "" }
  });

  const cardRefs = useRef({});
  const t = I18N[lang];
  const activeDb = adminDb || db;
  const scheduleData = activeDb.shelterSchedule || defaultSchedule();

  const categoryOptions = useMemo(
    () => (activeDb.categories || []).map((c) => ({ key: c.key, title: titleByLang(c.title, lang, c.key) })),
    [activeDb.categories, lang]
  );

  const divisionOptionsForFilter = useMemo(() => {
    if (!categoryFilter) {
      const all = [];
      (activeDb.categories || []).forEach((c) => (c.divisions || []).forEach((d) => all.push({ key: d.key, title: titleByLang(d.title, lang, d.key), category: c.key })));
      return all;
    }
    const cat = (activeDb.categories || []).find((c) => c.key === categoryFilter);
    return (cat?.divisions || []).map((d) => ({ key: d.key, title: titleByLang(d.title, lang, d.key), category: cat.key }));
  }, [activeDb.categories, categoryFilter, lang]);

  const filteredTree = useMemo(() => {
    const peopleById = Object.fromEntries((activeDb.people || []).map((p) => [p.id, p]));
    const qTokens = normalizeText(query).split(" ").filter(Boolean);
    const test = (entry) => {
      if (categoryFilter && entry.categoryKey !== categoryFilter) return false;
      if (divisionFilter && entry.divisionKey !== divisionFilter) return false;
      if (!qTokens.length) return true;
      const hay = normalizeText([entry.name, entry.role, entry.district, entry.division, entry.phone, entry.email].join(" "));
      return qTokens.every((tk) => hay.includes(tk));
    };
    return (activeDb.categories || []).map((cat) => ({
      key: cat.key,
      title: titleByLang(cat.title, lang, cat.key),
      divisions: (cat.divisions || []).map((div) => ({
        key: div.key,
        title: titleByLang(div.title, lang, div.key),
        entries: (div.roles || []).map((role) => {
          const person = peopleById[role.personId] || {};
          return {
            id: role.id,
            categoryKey: cat.key,
            divisionKey: div.key,
            name: valueByLang(person, "name", lang),
            role: valueByLang(role, "role", lang),
            district: valueByLang(role, "district", lang),
            division: valueByLang(role, "department", lang),
            phone: person.phone || "",
            email: person.email || ""
          };
        }).filter(test)
      })).filter((d) => d.entries.length > 0)
    })).filter((c) => c.divisions.length > 0);
  }, [activeDb, query, categoryFilter, divisionFilter, lang]);

  const editorCards = useMemo(() => {
    const qTokens = normalizeText(adminSearch).split(" ").filter(Boolean);
    const peopleById = Object.fromEntries((adminDb?.people || []).map((p) => [p.id, p]));
    const rows = [];
    (adminDb?.categories || []).forEach((c) => {
      (c.divisions || []).forEach((d) => {
        (d.roles || []).forEach((r) => {
          const person = peopleById[r.personId] || {};
          const row = {
            roleId: r.id,
            categoryKey: c.key,
            divisionKey: d.key,
            personId: r.personId,
            person,
            role: r,
            categoryTitle: titleByLang(c.title, lang, c.key),
            divisionTitle: titleByLang(d.title, lang, d.key),
            personName: valueByLang(person, "name", lang),
            roleTitle: valueByLang(r, "role", lang),
            district: valueByLang(r, "district", lang),
            division: valueByLang(r, "department", lang)
          };
          const hay = normalizeText([row.personName, row.roleTitle, row.district, row.division, person.phone || "", person.email || ""].join(" "));
          if (!qTokens.length || qTokens.every((tk) => hay.includes(tk))) rows.push(row);
        });
      });
    });
    return rows;
  }, [adminDb, adminSearch, lang]);

  const publicShifts = useMemo(() => {
    const today = todayInBeirut();
    return (scheduleData.shifts || []).filter((shift) => !shift.shift_date || shift.shift_date >= today);
  }, [scheduleData.shifts]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    loadPublic();
  }, []);

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "schedule") setView("schedule");
      if (hash === "contacts" || !hash) setView("contacts");
      if (token) setAdminOpen(hash === "admin");
    }
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [token]);

  useEffect(() => {
    if (!pendingScrollKey) return;
    const el = cardRefs.current[pendingScrollKey];
    if (!el) return;
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName && parent.tagName.toLowerCase() === "details") parent.open = true;
      parent = parent.parentElement;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("is-focused");
    setTimeout(() => el.classList.remove("is-focused"), 2200);
    setPendingScrollKey("");
  }, [pendingScrollKey, filteredTree]);

  async function loadPublic() {
    try {
      const res = await fetch(apiUrl("/api/data"), { cache: "no-store" });
      const payload = await res.json();
      setDb({
        meta: payload.meta || {},
        people: payload.people || [],
        categories: payload.categories || [],
        shelterSchedule: payload.shelterSchedule || defaultSchedule()
      });
      setStatus("");
    } catch {
      setStatus(I18N[lang].statusLoadFail);
    }
  }

  async function doLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || t.statusLoginFail);
      setToken(payload.token || "");
      setLoginOpen(false);
      await loadAdmin(payload.token);
      setAdminOpen(true);
      window.location.hash = "admin";
    } catch (err) {
      setLoginError(err.message || t.statusLoginFail);
    }
  }

  async function loadAdmin(authToken = token) {
    const res = await fetch(apiUrl("/api/admin/data"), { headers: { Authorization: `Bearer ${authToken}` } });
    if (!res.ok) throw new Error(t.statusNeedAuth);
    const payload = await res.json();
    setAdminDb({
      ...payload,
      shelterSchedule: payload.shelterSchedule || defaultSchedule()
    });
  }

  async function saveAdmin() {
    if (!token || !adminDb) return setStatus(t.statusNeedAuth);
    try {
      const res = await fetch(apiUrl("/api/admin/data"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          meta: adminDb.meta || {},
          people: adminDb.people || [],
          categories: adminDb.categories || [],
          shelterSchedule: adminDb.shelterSchedule || defaultSchedule()
        })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Save failed");
      const nextData = { ...(payload.data || adminDb), shelterSchedule: payload.data?.shelterSchedule || adminDb.shelterSchedule || defaultSchedule() };
      setAdminDb(nextData);
      setDb((prev) => ({ ...prev, ...nextData }));
      setStatus(t.statusSaved);
    } catch (err) {
      setStatus(err.message || "Save failed");
    }
  }

  function logout() {
    setToken("");
    setAdminDb(null);
    setAdminOpen(false);
    window.location.hash = view === "schedule" ? "schedule" : "contacts";
  }

  function updateAdminDb(updater) {
    setAdminDb((prev) => updater(prev));
  }

  function openContactEditor(card) {
    setEditingRoleId(card.roleId);
    setCardDrafts((prev) => ({
      ...prev,
      [card.roleId]: {
        name_en: card.person?.name_en || "",
        name_ar: card.person?.name_ar || "",
        phone: card.person?.phone || "",
        email: card.person?.email || "",
        role_en: card.role?.role_en || "",
        role_ar: card.role?.role_ar || "",
        district_en: card.role?.district_en || "",
        district_ar: card.role?.district_ar || "",
        department_en: card.role?.department_en || "",
        department_ar: card.role?.department_ar || ""
      }
    }));
  }

  function saveContactEditor(card) {
    const d = cardDrafts[card.roleId];
    if (!d) return;
    updateAdminDb((prev) => ({
      ...prev,
      people: (prev.people || []).map((p) => p.id === card.personId ? { ...p, name_en: d.name_en, name_ar: d.name_ar || d.name_en, phone: d.phone, email: d.email } : p),
      categories: (prev.categories || []).map((c) => c.key !== card.categoryKey ? c : {
        ...c,
        divisions: (c.divisions || []).map((div) => div.key !== card.divisionKey ? div : {
          ...div,
          roles: (div.roles || []).map((r) => r.id === card.roleId ? {
            ...r,
            role_en: d.role_en,
            role_ar: d.role_ar || d.role_en,
            district_en: d.district_en,
            district_ar: d.district_ar || d.district_en,
            department_en: d.department_en || d.role_en,
            department_ar: d.department_ar || d.role_ar || d.role_en
          } : r)
        })
      })
    }));
    setEditingRoleId("");
  }

  function deleteContactCard(card) {
    updateAdminDb((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((c) => c.key !== card.categoryKey ? c : {
        ...c,
        divisions: (c.divisions || []).map((div) => div.key !== card.divisionKey ? div : {
          ...div,
          roles: (div.roles || []).filter((r) => r.id !== card.roleId)
        })
      })
    }));
  }

  function openShiftEditor(shift) {
    setEditingShiftId(shift.id);
    setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...shift } }));
  }

  function openBlockEditor(shiftId, block) {
    setEditingBlockId(block.id);
    setBlockDrafts((prev) => ({ ...prev, [block.id]: { shiftId, type: block.type || "general", title_en: block.title?.en || "", title_ar: block.title?.ar || "", guidance_en: block.guidance?.en || "", guidance_ar: block.guidance?.ar || "" } }));
  }

  function openPositionEditor(shiftId, blockId, position) {
    setEditingPositionId(position.id);
    setPositionDrafts((prev) => ({ ...prev, [position.id]: { shiftId, blockId, ...position } }));
  }

  function saveShift(shiftId) {
    const draft = shiftDrafts[shiftId];
    if (!draft) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id === shiftId ? { ...shift, shift_date: draft.shift_date, shift_label_en: draft.shift_label_en, shift_label_ar: draft.shift_label_ar || draft.shift_label_en, start_time: draft.start_time, end_time: draft.end_time } : shift)
      }
    }));
    setEditingShiftId("");
  }

  function saveBlock(blockId) {
    const draft = blockDrafts[blockId];
    if (!draft) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== draft.shiftId ? shift : {
          ...shift,
          blocks: (shift.blocks || []).map((block) => block.id === blockId ? {
            ...block,
            type: draft.type,
            title: { en: draft.title_en, ar: draft.title_ar || draft.title_en },
            guidance: { en: draft.guidance_en, ar: draft.guidance_ar || draft.guidance_en }
          } : block)
        })
      }
    }));
    setEditingBlockId("");
  }

  function savePosition(positionId) {
    const draft = positionDrafts[positionId];
    if (!draft) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== draft.shiftId ? shift : {
          ...shift,
          blocks: (shift.blocks || []).map((block) => block.id !== draft.blockId ? block : {
            ...block,
            positions: (block.positions || []).map((position) => position.id === positionId ? {
              ...position,
              person_name_en: draft.person_name_en,
              person_name_ar: draft.person_name_ar || draft.person_name_en,
              phone: draft.phone,
              email: draft.email,
              role_en: draft.role_en,
              role_ar: draft.role_ar || draft.role_en
            } : position)
          })
        })
      }
    }));
    setEditingPositionId("");
  }

  function addCategory() {
    const form = addForms.category;
    if (!form.key.trim()) return;
    updateAdminDb((prev) => ({
      ...prev,
      categories: (prev.categories || []).some((c) => c.key === form.key.trim())
        ? prev.categories
        : [...(prev.categories || []), { key: form.key.trim(), title: { en: form.title_en || form.key.trim(), ar: form.title_ar || form.title_en || form.key.trim() }, divisions: [] }]
    }));
    setAddForms((f) => ({ ...f, category: { key: "", title_en: "", title_ar: "" } }));
  }

  function addDivision() {
    const form = addForms.division;
    if (!form.category || !form.key.trim()) return;
    updateAdminDb((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((c) => c.key !== form.category ? c : {
        ...c,
        divisions: (c.divisions || []).some((d) => d.key === form.key.trim())
          ? c.divisions
          : [...(c.divisions || []), { key: form.key.trim(), title: { en: form.title_en || form.key.trim(), ar: form.title_ar || form.title_en || form.key.trim() }, roles: [] }]
      })
    }));
    setAddForms((f) => ({ ...f, division: { ...f.division, key: "", title_en: "", title_ar: "" } }));
  }

  function addPerson() {
    const p = addForms.person;
    if ((!p.name_en.trim() && !p.name_ar.trim()) || !p.category || !p.division || !p.role_en.trim()) return;
    const personId = `person-${normalizeText(p.name_en || p.name_ar).replace(/\s+/g, "-") || newId("person")}`;
    const roleId = newId("role");
    updateAdminDb((prev) => {
      const uniquePersonId = (prev.people || []).some((x) => x.id === personId) ? newId("person") : personId;
      return {
        ...prev,
        people: [...(prev.people || []), { id: uniquePersonId, name_en: p.name_en || p.name_ar, name_ar: p.name_ar || p.name_en, phone: p.phone.trim(), email: p.email.trim() }],
        categories: (prev.categories || []).map((c) => c.key !== p.category ? c : {
          ...c,
          divisions: (c.divisions || []).map((d) => d.key !== p.division ? d : {
            ...d,
            roles: [...(d.roles || []), { id: roleId, personId: uniquePersonId, role_en: p.role_en.trim(), role_ar: p.role_ar.trim() || p.role_en.trim(), district_en: p.district_en.trim(), district_ar: p.district_ar.trim() || p.district_en.trim(), department_en: p.department_en.trim() || p.role_en.trim(), department_ar: p.department_ar.trim() || p.role_ar.trim() || p.role_en.trim(), notes_en: "", notes_ar: "" }]
          })
        })
      };
    });
    setAddForms((f) => ({ ...f, person: { ...f.person, name_en: "", name_ar: "", phone: "", email: "", role_en: "", role_ar: "", district_en: "", district_ar: "", department_en: "", department_ar: "" } }));
  }

  function addShift() {
    const form = addForms.shift;
    if (!form.shift_date) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: [...(prev.shelterSchedule?.shifts || []), { id: newId("shift"), shift_date: form.shift_date, shift_label_en: form.shift_label_en, shift_label_ar: form.shift_label_ar || form.shift_label_en, start_time: form.start_time, end_time: form.end_time, blocks: [] }]
      }
    }));
    setAddForms((f) => ({ ...f, shift: { shift_date: "", shift_label_en: "", shift_label_ar: "", start_time: "", end_time: "" } }));
  }

  function addBlock() {
    const form = addForms.block;
    if (!form.shiftId || (!form.title_en.trim() && !form.title_ar.trim())) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== form.shiftId ? shift : {
          ...shift,
          blocks: [...(shift.blocks || []), { id: newId("block"), type: form.type, title: { en: form.title_en.trim() || form.title_ar.trim(), ar: form.title_ar.trim() || form.title_en.trim() }, guidance: { en: form.guidance_en.trim(), ar: form.guidance_ar.trim() || form.guidance_en.trim() }, positions: [] }]
        })
      }
    }));
    setAddForms((f) => ({ ...f, block: { ...f.block, type: "general", title_en: "", title_ar: "", guidance_en: "", guidance_ar: "" } }));
  }

  function addPosition() {
    const form = addForms.position;
    if (!form.shiftId || !form.blockId || !form.role_en.trim()) return;
    updateAdminDb((prev) => ({
      ...prev,
      shelterSchedule: {
        ...(prev.shelterSchedule || defaultSchedule()),
        shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== form.shiftId ? shift : {
          ...shift,
          blocks: (shift.blocks || []).map((block) => block.id !== form.blockId ? block : {
            ...block,
            positions: [...(block.positions || []), { id: newId("position"), person_name_en: form.person_name_en.trim(), person_name_ar: form.person_name_ar.trim() || form.person_name_en.trim(), phone: form.phone.trim(), email: form.email.trim(), role_en: form.role_en.trim(), role_ar: form.role_ar.trim() || form.role_en.trim() }]
          })
        })
      }
    }));
    setAddForms((f) => ({ ...f, position: { ...f.position, person_name_en: "", person_name_ar: "", phone: "", email: "", role_en: "", role_ar: "" } }));
  }

  function deleteShift(shiftId) {
    updateAdminDb((prev) => ({ ...prev, shelterSchedule: { ...(prev.shelterSchedule || defaultSchedule()), shifts: (prev.shelterSchedule?.shifts || []).filter((shift) => shift.id !== shiftId) } }));
  }

  function deleteBlock(shiftId, blockId) {
    updateAdminDb((prev) => ({ ...prev, shelterSchedule: { ...(prev.shelterSchedule || defaultSchedule()), shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== shiftId ? shift : { ...shift, blocks: (shift.blocks || []).filter((block) => block.id !== blockId) }) } }));
  }

  function deletePosition(shiftId, blockId, positionId) {
    updateAdminDb((prev) => ({ ...prev, shelterSchedule: { ...(prev.shelterSchedule || defaultSchedule()), shifts: (prev.shelterSchedule?.shifts || []).map((shift) => shift.id !== shiftId ? shift : { ...shift, blocks: (shift.blocks || []).map((block) => block.id !== blockId ? block : { ...block, positions: (block.positions || []).filter((position) => position.id !== positionId) }) }) } }));
  }

  function submitAddOverlay(e) {
    e.preventDefault();
    if (addOverlay.mode === "person") addPerson();
    if (addOverlay.mode === "category") addCategory();
    if (addOverlay.mode === "division") addDivision();
    if (addOverlay.mode === "shift") addShift();
    if (addOverlay.mode === "block") addBlock();
    if (addOverlay.mode === "position") addPosition();
    setAddOverlay((s) => ({ ...s, open: false }));
  }

  function jumpToDistrict(label) {
    const targetNorm = normalizeText(label);
    const cat = (activeDb.categories || []).find((c) => c.key === "districts");
    if (!cat) return;
    for (const div of cat.divisions || []) {
      for (const role of div.roles || []) {
        const district = valueByLang(role, "district", lang);
        if (normalizeText(district) === targetNorm) {
          setQuery("");
          setCategoryFilter("");
          setDivisionFilter("");
          setPendingScrollKey(`districts:${div.key}:${role.id}`);
          return;
        }
      }
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-main">
          <div>
            <h1>{t.appTitle}</h1>
            <p>{t.appSubtitle}</p>
          </div>
          <nav className="view-nav" aria-label="Views">
            <button className={view === "contacts" ? "active" : ""} onClick={() => { setView("contacts"); window.location.hash = "contacts"; }}>{t.contactsView}</button>
            <button className={view === "schedule" ? "active" : ""} onClick={() => { setView("schedule"); window.location.hash = "schedule"; }}>{t.scheduleView}</button>
          </nav>
        </div>
        <div className="header-right">
          <div className="meta-row">
            <span className="chip">{t.operational}</span>
            <span className="chip">{t.beirutTime}</span>
          </div>
          <div className="header-actions">
            <div className="lang-toggle">
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
              <button className={lang === "ar" ? "active" : ""} onClick={() => setLang("ar")}>AR</button>
            </div>
            <button
              className="btn ghost"
              onClick={() => {
                if (token) {
                  setAdminOpen(true);
                  window.location.hash = "admin";
                  return;
                }
                setLoginOpen(true);
              }}
            >
              {t.adminLogin}
            </button>
          </div>
        </div>
      </header>

      {!adminOpen && view === "contacts" ? (
        <section className="toolbar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setDivisionFilter(""); }}>
            <option value="">{t.allCategories}</option>
            {categoryOptions.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
          </select>
          <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
            <option value="">{t.allDivisions}</option>
            {divisionOptionsForFilter.map((d) => <option key={`${d.category}:${d.key}`} value={d.key}>{d.title}</option>)}
          </select>
          <button className="btn" onClick={() => { setQuery(""); setCategoryFilter(""); setDivisionFilter(""); }}>{t.clear}</button>
        </section>
      ) : null}

      {status ? <div className="status">{status}</div> : null}

      {!adminOpen && view === "contacts" ? (
        <main className="content-grid">
          {filteredTree.length === 0 ? <div className="empty">{t.noResults}</div> : null}
          {filteredTree.map((cat) => (
            <section key={cat.key} className="category-block">
              <h2>{cat.title}</h2>
              {cat.divisions.map((div) => (
                <details className="division-block" key={div.key} open>
                  <summary><span>{div.title}</span><span className="count">{div.entries.length}</span></summary>
                  <div className="cards-grid">
                    {div.entries.map((entry) => {
                      const districtLink = entry.district && !isAllDistrict(entry.district);
                      const cardKey = `${entry.categoryKey}:${entry.divisionKey}:${entry.id}`;
                      const phoneDigits = makePhoneDigits(entry.phone);
                      return (
                        <article key={cardKey} ref={(el) => { cardRefs.current[cardKey] = el; }} className="person-card">
                          <h4>{entry.name}</h4>
                          {entry.role ? <p><strong>{t.role}:</strong> {entry.role}</p> : null}
                          {entry.district ? <p><strong>{t.district}:</strong> {districtLink ? <button className="district-link" type="button" onClick={() => jumpToDistrict(entry.district)}>{entry.district}</button> : entry.district}</p> : null}
                          {entry.division ? <p><strong>{t.division}:</strong> {entry.division}</p> : null}
                          {entry.phone ? <p><strong>{t.phone}:</strong> <span className="ltr">{entry.phone}</span></p> : null}
                          {entry.email ? <p><strong>{t.email}:</strong> <a href={`mailto:${entry.email}`}>{entry.email}</a></p> : null}
                          <div className="actions">
                            {phoneDigits ? <a href={`tel:+961${phoneDigits}`}>Call</a> : null}
                            {phoneDigits ? <a href={`https://wa.me/961${phoneDigits}`} target="_blank" rel="noreferrer">WhatsApp</a> : null}
                            {entry.email ? <a href={`mailto:${entry.email}`}>Email</a> : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </details>
              ))}
            </section>
          ))}
        </main>
      ) : null}

      {!adminOpen && view === "schedule" ? (
        <main className="schedule-layout">
          {publicShifts.length === 0 ? <div className="empty">{t.noShifts}</div> : null}
          {publicShifts.map((shift) => (
            <details className="schedule-section" key={shift.id} open>
              <summary className="schedule-section-head">
                <div>
                  <h3>{valueByLang(shift, "shift_label", lang) || shift.shift_date}</h3>
                  <p>{shift.shift_date} {shift.start_time || ""} {shift.end_time ? `- ${shift.end_time}` : ""}</p>
                </div>
                <span className="count">{(shift.blocks || []).reduce((sum, block) => sum + (block.positions || []).length, 0)}</span>
              </summary>
              <div className="schedule-section-body">
                {(shift.blocks || []).length === 0 ? <div className="empty-note">{t.noBlocks}</div> : null}
                {(shift.blocks || []).map((block) => (
                  <details className="schedule-section inner" key={block.id} open>
                    <summary className="schedule-section-head">
                      <div>
                        <h3>{titleByLang(block.title, lang, block.id)}</h3>
                        {titleByLang(block.guidance, lang, "") ? <p>{titleByLang(block.guidance, lang, "")}</p> : null}
                      </div>
                      <span className="count">{(block.positions || []).length}</span>
                    </summary>
                    <div className="schedule-section-body">
                      {(block.positions || []).length === 0 ? <div className="empty-note">{t.noPositions}</div> : null}
                      <div className="schedule-cards">
                        {(block.positions || []).map((position) => {
                          const phoneDigits = makePhoneDigits(position.phone);
                          return (
                            <article key={position.id} className="schedule-card">
                              <h4>{valueByLang(position, "person_name", lang) || "-"}</h4>
                              <p className="schedule-role">{valueByLang(position, "role", lang) || "-"}</p>
                              {position.phone ? <p><strong>{t.phone}:</strong> <span className="ltr">{position.phone}</span></p> : null}
                              {position.email ? <p><strong>{t.email}:</strong> <a href={`mailto:${position.email}`}>{position.email}</a></p> : null}
                              <div className="actions">
                                {phoneDigits ? <a href={`tel:+961${phoneDigits}`}>Call</a> : null}
                                {phoneDigits ? <a href={`https://wa.me/961${phoneDigits}`} target="_blank" rel="noreferrer">WhatsApp</a> : null}
                                {position.email ? <a href={`mailto:${position.email}`}>Email</a> : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </main>
      ) : null}

      {loginOpen ? (
        <div className="modal" onClick={(e) => e.target.classList.contains("modal") && setLoginOpen(false)}>
          <div className="modal-card">
            <h3>{t.adminLogin}</h3>
            <form onSubmit={doLogin} className="form-grid one">
              <input value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} placeholder={t.username} />
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} placeholder={t.password} />
              {loginError ? <div className="status">{loginError}</div> : null}
              <div className="row-end">
                <button type="button" className="btn ghost" onClick={() => setLoginOpen(false)}>{t.close}</button>
                <button type="submit" className="btn">{t.login}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {addOverlay.open ? (
        <div className="modal" onClick={(e) => e.target.classList.contains("modal") && setAddOverlay((s) => ({ ...s, open: false }))}>
          <div className="modal-card modal-wide">
            <h3>
              {addOverlay.mode === "person" ? t.addPerson : null}
              {addOverlay.mode === "category" ? t.addCategory : null}
              {addOverlay.mode === "division" ? t.addDivision : null}
              {addOverlay.mode === "shift" ? t.addShift : null}
              {addOverlay.mode === "block" ? t.addBlock : null}
              {addOverlay.mode === "position" ? t.addPosition : null}
            </h3>
            <form onSubmit={submitAddOverlay} className="form-grid">
              {addOverlay.mode === "person" ? (
                <>
                  <input placeholder="Name EN" value={addForms.person.name_en} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, name_en: e.target.value } }))} />
                  <input placeholder="Name AR" value={addForms.person.name_ar} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, name_ar: e.target.value } }))} />
                  <input placeholder="Phone" value={addForms.person.phone} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, phone: e.target.value } }))} />
                  <input placeholder="Email" value={addForms.person.email} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, email: e.target.value } }))} />
                  <select value={addForms.person.category} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, category: e.target.value, division: "" } }))}>
                    <option value="">{t.allCategories}</option>
                    {categoryOptions.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
                  </select>
                  <select value={addForms.person.division} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, division: e.target.value } }))}>
                    <option value="">{t.allDivisions}</option>
                    {(activeDb.categories || []).find((c) => c.key === addForms.person.category)?.divisions?.map((d) => <option key={d.key} value={d.key}>{titleByLang(d.title, lang, d.key)}</option>)}
                  </select>
                  <input placeholder="Role EN" value={addForms.person.role_en} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, role_en: e.target.value } }))} />
                  <input placeholder="Role AR" value={addForms.person.role_ar} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, role_ar: e.target.value } }))} />
                  <input placeholder="District EN" value={addForms.person.district_en} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, district_en: e.target.value } }))} />
                  <input placeholder="District AR" value={addForms.person.district_ar} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, district_ar: e.target.value } }))} />
                  <input placeholder="Department EN" value={addForms.person.department_en} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, department_en: e.target.value } }))} />
                  <input placeholder="Department AR" value={addForms.person.department_ar} onChange={(e) => setAddForms((f) => ({ ...f, person: { ...f.person, department_ar: e.target.value } }))} />
                </>
              ) : null}

              {addOverlay.mode === "category" ? (
                <>
                  <input placeholder="Key" value={addForms.category.key} onChange={(e) => setAddForms((f) => ({ ...f, category: { ...f.category, key: e.target.value } }))} />
                  <input placeholder="Title EN" value={addForms.category.title_en} onChange={(e) => setAddForms((f) => ({ ...f, category: { ...f.category, title_en: e.target.value } }))} />
                  <input placeholder="Title AR" value={addForms.category.title_ar} onChange={(e) => setAddForms((f) => ({ ...f, category: { ...f.category, title_ar: e.target.value } }))} />
                </>
              ) : null}

              {addOverlay.mode === "division" ? (
                <>
                  <select value={addForms.division.category} onChange={(e) => setAddForms((f) => ({ ...f, division: { ...f.division, category: e.target.value } }))}>
                    <option value="">{t.allCategories}</option>
                    {categoryOptions.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
                  </select>
                  <input placeholder="Key" value={addForms.division.key} onChange={(e) => setAddForms((f) => ({ ...f, division: { ...f.division, key: e.target.value } }))} />
                  <input placeholder="Title EN" value={addForms.division.title_en} onChange={(e) => setAddForms((f) => ({ ...f, division: { ...f.division, title_en: e.target.value } }))} />
                  <input placeholder="Title AR" value={addForms.division.title_ar} onChange={(e) => setAddForms((f) => ({ ...f, division: { ...f.division, title_ar: e.target.value } }))} />
                </>
              ) : null}

              {addOverlay.mode === "shift" ? (
                <>
                  <input type="date" value={addForms.shift.shift_date} onChange={(e) => setAddForms((f) => ({ ...f, shift: { ...f.shift, shift_date: e.target.value } }))} />
                  <input placeholder={t.shiftLabelEn} value={addForms.shift.shift_label_en} onChange={(e) => setAddForms((f) => ({ ...f, shift: { ...f.shift, shift_label_en: e.target.value } }))} />
                  <input placeholder={t.shiftLabelAr} value={addForms.shift.shift_label_ar} onChange={(e) => setAddForms((f) => ({ ...f, shift: { ...f.shift, shift_label_ar: e.target.value } }))} />
                  <input placeholder={t.startTime} value={addForms.shift.start_time} onChange={(e) => setAddForms((f) => ({ ...f, shift: { ...f.shift, start_time: e.target.value } }))} />
                  <input placeholder={t.endTime} value={addForms.shift.end_time} onChange={(e) => setAddForms((f) => ({ ...f, shift: { ...f.shift, end_time: e.target.value } }))} />
                </>
              ) : null}

              {addOverlay.mode === "block" ? (
                <>
                  <select value={addForms.block.shiftId} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, shiftId: e.target.value } }))}>
                    <option value="">{t.addShift}</option>
                    {(scheduleData.shifts || []).map((shift) => <option key={shift.id} value={shift.id}>{shift.shift_date} - {valueByLang(shift, "shift_label", lang)}</option>)}
                  </select>
                  <select value={addForms.block.type} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, type: e.target.value } }))}>
                    <option value="general">{t.generalBlock}</option>
                    <option value="command-cell">{t.commandCell}</option>
                    <option value="teams-block">{t.teamsBlock}</option>
                  </select>
                  <input placeholder={t.blockTitleEn} value={addForms.block.title_en} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, title_en: e.target.value } }))} />
                  <input placeholder={t.blockTitleAr} value={addForms.block.title_ar} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, title_ar: e.target.value } }))} />
                  <input placeholder={t.guidanceEn} value={addForms.block.guidance_en} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, guidance_en: e.target.value } }))} />
                  <input placeholder={t.guidanceAr} value={addForms.block.guidance_ar} onChange={(e) => setAddForms((f) => ({ ...f, block: { ...f.block, guidance_ar: e.target.value } }))} />
                </>
              ) : null}

              {addOverlay.mode === "position" ? (
                <>
                  <select value={addForms.position.shiftId} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, shiftId: e.target.value, blockId: "" } }))}>
                    <option value="">{t.addShift}</option>
                    {(scheduleData.shifts || []).map((shift) => <option key={shift.id} value={shift.id}>{shift.shift_date} - {valueByLang(shift, "shift_label", lang)}</option>)}
                  </select>
                  <select value={addForms.position.blockId} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, blockId: e.target.value } }))}>
                    <option value="">{t.addBlock}</option>
                    {(scheduleData.shifts || []).find((shift) => shift.id === addForms.position.shiftId)?.blocks?.map((block) => <option key={block.id} value={block.id}>{titleByLang(block.title, lang, block.id)}</option>)}
                  </select>
                  <input placeholder={t.personNameEn} value={addForms.position.person_name_en} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, person_name_en: e.target.value } }))} />
                  <input placeholder={t.personNameAr} value={addForms.position.person_name_ar} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, person_name_ar: e.target.value } }))} />
                  <input placeholder={t.phone} value={addForms.position.phone} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, phone: e.target.value } }))} />
                  <input placeholder={t.email} value={addForms.position.email} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, email: e.target.value } }))} />
                  <input placeholder={t.roleEn} value={addForms.position.role_en} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, role_en: e.target.value } }))} />
                  <input placeholder={t.roleAr} value={addForms.position.role_ar} onChange={(e) => setAddForms((f) => ({ ...f, position: { ...f.position, role_ar: e.target.value } }))} />
                </>
              ) : null}

              <div className="row-end form-span">
                <button type="button" className="btn" onClick={() => setAddOverlay((s) => ({ ...s, open: false }))}>{t.cancel}</button>
                <button type="submit" className="btn">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {token && adminDb && adminOpen ? (
        <aside className="admin-panel">
          <div className="admin-head">
            <div>
              <h3>{t.adminWorkspace}</h3>
              <div className="admin-nav">
                <button className={adminView === "contacts" ? "active" : ""} onClick={() => setAdminView("contacts")}>{t.adminContacts}</button>
                <button className={adminView === "shelter" ? "active" : ""} onClick={() => setAdminView("shelter")}>{t.adminShelter}</button>
              </div>
            </div>
            <div className="admin-actions">
              {adminView === "contacts" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "person" })}>{t.addPerson}</button> : null}
              {adminView === "contacts" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "category" })}>{t.addCategory}</button> : null}
              {adminView === "contacts" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "division" })}>{t.addDivision}</button> : null}
              {adminView === "shelter" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "shift" })}>{t.addShift}</button> : null}
              {adminView === "shelter" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "block" })}>{t.addBlock}</button> : null}
              {adminView === "shelter" ? <button className="btn" onClick={() => setAddOverlay({ open: true, mode: "position" })}>{t.addPosition}</button> : null}
              <button className="btn ghost" onClick={() => { setAdminOpen(false); window.location.hash = view === "schedule" ? "schedule" : "contacts"; }}>{t.backToDirectory}</button>
              <button className="btn ghost" onClick={() => loadAdmin()}>{t.refresh}</button>
              <button className="btn" onClick={saveAdmin}>{t.saveAll}</button>
              <button className="btn ghost" onClick={logout}>{t.logout}</button>
            </div>
          </div>

          {adminView === "contacts" ? (
            <div className="admin-sections">
              <section>
                <h4>{t.quickEditor}</h4>
                <div className="admin-search-wrap">
                  <div className="search-input-wrap">
                    <span className="search-icon" aria-hidden="true">⌕</span>
                    <input value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder={t.searchPersonToEdit} />
                    {adminSearch ? <button type="button" className="search-clear" title={t.clearSearch} onClick={() => setAdminSearch("")}>×</button> : null}
                  </div>
                  <div className="admin-search-meta">{editorCards.length} {t.editorResults}</div>
                </div>
                {editorCards.length === 0 ? <div className="empty">{t.noEditorResults}</div> : null}
                <div className="admin-card-grid">
                  {editorCards.map((card) => {
                    const isEditing = editingRoleId === card.roleId;
                    const draft = cardDrafts[card.roleId] || {};
                    return (
                      <article key={card.roleId} className={`admin-edit-card${isEditing ? " is-editing" : ""}`}>
                        <div className="admin-edit-head">
                          <div>
                            <strong>{card.personName || "-"}</strong>
                            <div className="admin-meta">{card.categoryTitle} · {card.divisionTitle}</div>
                          </div>
                          <div className="admin-actions compact">
                            {!isEditing ? <button className="btn" onClick={() => openContactEditor(card)}>{t.edit}</button> : null}
                            {isEditing ? <button className="btn" onClick={() => saveContactEditor(card)}>{t.save}</button> : null}
                            {isEditing ? <button className="btn" onClick={() => setEditingRoleId("")}>{t.cancel}</button> : null}
                            <button className="btn danger" onClick={() => deleteContactCard(card)}>{t.delete}</button>
                          </div>
                        </div>
                        {!isEditing ? (
                          <div className="admin-preview">
                            <p><strong>{t.role}:</strong> {card.roleTitle || "-"}</p>
                            <p><strong>{t.district}:</strong> {card.district || "-"}</p>
                            <p><strong>{t.division}:</strong> {card.division || "-"}</p>
                            <p><strong>{t.phone}:</strong> <span className="ltr">{card.person?.phone || "-"}</span></p>
                            <p><strong>{t.email}:</strong> {card.person?.email || "-"}</p>
                          </div>
                        ) : (
                          <div className="form-grid">
                            <input value={draft.name_en || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], name_en: e.target.value } }))} placeholder="Name EN" />
                            <input value={draft.name_ar || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], name_ar: e.target.value } }))} placeholder="Name AR" />
                            <input value={draft.phone || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], phone: e.target.value } }))} placeholder="Phone" />
                            <input value={draft.email || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], email: e.target.value } }))} placeholder="Email" />
                            <input value={draft.role_en || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], role_en: e.target.value } }))} placeholder="Role EN" />
                            <input value={draft.role_ar || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], role_ar: e.target.value } }))} placeholder="Role AR" />
                            <input value={draft.district_en || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], district_en: e.target.value } }))} placeholder="District EN" />
                            <input value={draft.district_ar || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], district_ar: e.target.value } }))} placeholder="District AR" />
                            <input value={draft.department_en || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], department_en: e.target.value } }))} placeholder="Department EN" />
                            <input value={draft.department_ar || ""} onChange={(e) => setCardDrafts((prev) => ({ ...prev, [card.roleId]: { ...prev[card.roleId], department_ar: e.target.value } }))} placeholder="Department AR" />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : null}

          {adminView === "shelter" ? (
            <div className="admin-sections">
              <section>
                <h4>{t.shelterBlocks}</h4>
                {(adminDb.shelterSchedule?.shifts || []).length === 0 ? <div className="empty">{t.noShifts}</div> : null}
                <div className="schedule-admin-list">
                  {(adminDb.shelterSchedule?.shifts || []).map((shift) => {
                    const shiftDraft = shiftDrafts[shift.id] || {};
                    const isShiftEditing = editingShiftId === shift.id;
                    return (
                      <details key={shift.id} className="schedule-admin-section" open>
                        <summary className="admin-edit-head">
                          <div>
                            <strong>{valueByLang(shift, "shift_label", lang) || shift.shift_date}</strong>
                            <div className="admin-meta">{shift.shift_date} {shift.start_time || ""} {shift.end_time ? `- ${shift.end_time}` : ""}</div>
                          </div>
                          <div className="admin-actions compact">
                            {!isShiftEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); openShiftEditor(shift); }}>{t.edit}</button> : null}
                            {isShiftEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); saveShift(shift.id); }}>{t.save}</button> : null}
                            {isShiftEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); setEditingShiftId(""); }}>{t.cancel}</button> : null}
                            <button type="button" className="btn danger" onClick={(e) => { e.preventDefault(); deleteShift(shift.id); }}>{t.delete}</button>
                          </div>
                        </summary>
                        <div className="schedule-section-body">
                          {isShiftEditing ? (
                            <div className="form-grid">
                              <input type="date" value={shiftDraft.shift_date || ""} onChange={(e) => setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...prev[shift.id], shift_date: e.target.value } }))} />
                              <input value={shiftDraft.shift_label_en || ""} onChange={(e) => setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...prev[shift.id], shift_label_en: e.target.value } }))} placeholder={t.shiftLabelEn} />
                              <input value={shiftDraft.shift_label_ar || ""} onChange={(e) => setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...prev[shift.id], shift_label_ar: e.target.value } }))} placeholder={t.shiftLabelAr} />
                              <input value={shiftDraft.start_time || ""} onChange={(e) => setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...prev[shift.id], start_time: e.target.value } }))} placeholder={t.startTime} />
                              <input value={shiftDraft.end_time || ""} onChange={(e) => setShiftDrafts((prev) => ({ ...prev, [shift.id]: { ...prev[shift.id], end_time: e.target.value } }))} placeholder={t.endTime} />
                            </div>
                          ) : null}

                          {(shift.blocks || []).length === 0 ? <div className="empty-note">{t.noBlocks}</div> : null}
                          {(shift.blocks || []).map((block) => {
                            const isBlockEditing = editingBlockId === block.id;
                            const blockDraft = blockDrafts[block.id] || {};
                            return (
                              <details key={block.id} className="schedule-admin-section" open>
                                <summary className="admin-edit-head">
                                  <div>
                                    <strong>{titleByLang(block.title, lang, block.id)}</strong>
                                    {titleByLang(block.guidance, lang, "") ? <div className="admin-meta">{titleByLang(block.guidance, lang, "")}</div> : null}
                                  </div>
                                  <div className="admin-actions compact">
                                    {!isBlockEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); openBlockEditor(shift.id, block); }}>{t.edit}</button> : null}
                                    {isBlockEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); saveBlock(block.id); }}>{t.save}</button> : null}
                                    {isBlockEditing ? <button type="button" className="btn" onClick={(e) => { e.preventDefault(); setEditingBlockId(""); }}>{t.cancel}</button> : null}
                                    <button type="button" className="btn danger" onClick={(e) => { e.preventDefault(); deleteBlock(shift.id, block.id); }}>{t.delete}</button>
                                  </div>
                                </summary>
                                <div className="schedule-section-body">
                                  {isBlockEditing ? (
                                    <div className="form-grid">
                                      <select value={blockDraft.type || "general"} onChange={(e) => setBlockDrafts((prev) => ({ ...prev, [block.id]: { ...prev[block.id], type: e.target.value } }))}>
                                        <option value="general">{t.generalBlock}</option>
                                        <option value="command-cell">{t.commandCell}</option>
                                        <option value="teams-block">{t.teamsBlock}</option>
                                      </select>
                                      <input value={blockDraft.title_en || ""} onChange={(e) => setBlockDrafts((prev) => ({ ...prev, [block.id]: { ...prev[block.id], title_en: e.target.value } }))} placeholder={t.blockTitleEn} />
                                      <input value={blockDraft.title_ar || ""} onChange={(e) => setBlockDrafts((prev) => ({ ...prev, [block.id]: { ...prev[block.id], title_ar: e.target.value } }))} placeholder={t.blockTitleAr} />
                                      <input value={blockDraft.guidance_en || ""} onChange={(e) => setBlockDrafts((prev) => ({ ...prev, [block.id]: { ...prev[block.id], guidance_en: e.target.value } }))} placeholder={t.guidanceEn} />
                                      <input value={blockDraft.guidance_ar || ""} onChange={(e) => setBlockDrafts((prev) => ({ ...prev, [block.id]: { ...prev[block.id], guidance_ar: e.target.value } }))} placeholder={t.guidanceAr} />
                                    </div>
                                  ) : null}

                                  {(block.positions || []).length === 0 ? <div className="empty-note">{t.noPositions}</div> : null}
                                  <div className="schedule-admin-cards">
                                    {(block.positions || []).map((position) => {
                                      const isPositionEditing = editingPositionId === position.id;
                                      const positionDraft = positionDrafts[position.id] || {};
                                      return (
                                        <article key={position.id} className={`admin-edit-card${isPositionEditing ? " is-editing" : ""}`}>
                                          <div className="admin-edit-head">
                                            <div>
                                              <strong>{valueByLang(position, "person_name", lang) || "-"}</strong>
                                              <div className="admin-meta">{valueByLang(position, "role", lang) || "-"}</div>
                                            </div>
                                            <div className="admin-actions compact">
                                              {!isPositionEditing ? <button className="btn" onClick={() => openPositionEditor(shift.id, block.id, position)}>{t.edit}</button> : null}
                                              {isPositionEditing ? <button className="btn" onClick={() => savePosition(position.id)}>{t.save}</button> : null}
                                              {isPositionEditing ? <button className="btn" onClick={() => setEditingPositionId("")}>{t.cancel}</button> : null}
                                              <button className="btn danger" onClick={() => deletePosition(shift.id, block.id, position.id)}>{t.delete}</button>
                                            </div>
                                          </div>
                                          {!isPositionEditing ? (
                                            <div className="admin-preview">
                                              <p><strong>{t.phone}:</strong> <span className="ltr">{position.phone || "-"}</span></p>
                                              <p><strong>{t.email}:</strong> {position.email || "-"}</p>
                                            </div>
                                          ) : (
                                            <div className="form-grid">
                                              <input value={positionDraft.person_name_en || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], person_name_en: e.target.value } }))} placeholder={t.personNameEn} />
                                              <input value={positionDraft.person_name_ar || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], person_name_ar: e.target.value } }))} placeholder={t.personNameAr} />
                                              <input value={positionDraft.phone || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], phone: e.target.value } }))} placeholder={t.phone} />
                                              <input value={positionDraft.email || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], email: e.target.value } }))} placeholder={t.email} />
                                              <input value={positionDraft.role_en || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], role_en: e.target.value } }))} placeholder={t.roleEn} />
                                              <input value={positionDraft.role_ar || ""} onChange={(e) => setPositionDrafts((prev) => ({ ...prev, [position.id]: { ...prev[position.id], role_ar: e.target.value } }))} placeholder={t.roleAr} />
                                            </div>
                                          )}
                                        </article>
                                      );
                                    })}
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
