import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const app = express();
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = allowedOrigins.length
  ? {
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }
  : undefined;

app.use(cors(corsOptions));
app.use(express.json());

// resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const defaultDataPath = path.join(__dirname, "..", "data", "data.json");
const dataPath = process.env.DATA_PATH ? path.resolve(process.env.DATA_PATH) : defaultDataPath;
const dataDir = path.dirname(dataPath);
const authTokens = new Map();

// serve frontend
app.use(express.static(publicDir));

/* --------------------------
   Helpers
-------------------------- */
function defaultData() {
  return {
    meta: {
      version: "0.0",
      generatedAt: new Date().toISOString(),
      timezone: "Asia/Beirut"
    },
    people: [],
    categories: [],
    shelterSchedule: {
      meta: {
        title_en: "Shelters Schedule and Commanders",
        title_ar: "جدول الملاجئ والقادة",
        subtitle_en: "Shift planning and on-site command structure",
        subtitle_ar: "تخطيط المناوبات وهيكلية القيادة الميدانية"
      },
      shifts: []
    },
    auth: {
      users: []
    }
  };
}

function ensureDataFile() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    if (!fs.existsSync(dataPath)) {
      if (dataPath !== defaultDataPath && fs.existsSync(defaultDataPath)) {
        fs.copyFileSync(defaultDataPath, dataPath);
      } else {
        fs.writeFileSync(dataPath, JSON.stringify(defaultData(), null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.error("Failed to ensure data.json exists:", err);
  }
}

/* --------------------------
   Helper: read JSON database
-------------------------- */
function readData() {
  try {
    ensureDataFile();

    const raw = fs.readFileSync(dataPath, "utf-8").trim();
    if (!raw) return defaultData();

    const parsed = JSON.parse(raw);

    // normalize shape (in case old formats exist)
    if (!parsed || typeof parsed !== "object") return defaultData();
    if (!Array.isArray(parsed.people)) parsed.people = [];
    if (!Array.isArray(parsed.categories)) parsed.categories = [];
    if (!parsed.meta || typeof parsed.meta !== "object") parsed.meta = defaultData().meta;
    if (!parsed.shelterSchedule || typeof parsed.shelterSchedule !== "object") {
      parsed.shelterSchedule = defaultData().shelterSchedule;
    }
    if (!parsed.shelterSchedule.meta || typeof parsed.shelterSchedule.meta !== "object") {
      parsed.shelterSchedule.meta = defaultData().shelterSchedule.meta;
    }
    if (Array.isArray(parsed.shelterSchedule.sections) && !Array.isArray(parsed.shelterSchedule.shifts)) {
      parsed.shelterSchedule.shifts = [
        {
          id: "shift-migrated",
          shift_date: parsed.shelterSchedule.meta?.shift_date || "",
          shift_label_en: parsed.shelterSchedule.meta?.shift_label_en || "",
          shift_label_ar: parsed.shelterSchedule.meta?.shift_label_ar || "",
          start_time: parsed.shelterSchedule.meta?.start_time || "",
          end_time: parsed.shelterSchedule.meta?.end_time || "",
          blocks: parsed.shelterSchedule.sections
        }
      ];
    }
    if (!Array.isArray(parsed.shelterSchedule.shifts)) parsed.shelterSchedule.shifts = [];
    delete parsed.shelterSchedule.sections;
    if (!parsed.auth || typeof parsed.auth !== "object") parsed.auth = { users: [] };
    if (!Array.isArray(parsed.auth.users)) parsed.auth.users = [];

    return parsed;
  } catch (err) {
    console.error("Failed to read/parse data.json:", err);
    return defaultData();
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function sanitizePublicData(data) {
  const safe = { ...data };
  delete safe.auth;
  return safe;
}

function sanitizeAdminData(data) {
  const safe = { ...data };
  safe.auth = {
    users: (data?.auth?.users || []).map((u) => ({
      username: u.username || "",
      role: u.role || "admin"
    }))
  };
  return safe;
}

function extractBearer(req) {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") return parts[1];
  return "";
}

function requireAuth(req, res, next) {
  const token = extractBearer(req);
  if (!token || !authTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  req.user = authTokens.get(token);
  return next();
}

function validateIncomingAdminData(payload) {
  if (!payload || typeof payload !== "object") return "Invalid payload";
  if (!Array.isArray(payload.people)) return "people must be an array";
  if (!Array.isArray(payload.categories)) return "categories must be an array";
  if (payload.shelterSchedule != null && typeof payload.shelterSchedule !== "object") {
    return "shelterSchedule must be an object";
  }
  if (payload?.shelterSchedule?.shifts != null && !Array.isArray(payload.shelterSchedule.shifts)) {
    return "shelterSchedule.shifts must be an array";
  }
  return "";
}

/* --------------------------
   API Routes
-------------------------- */

// health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// get contacts JSON (categorized)
app.get("/api/data", (req, res) => {
  const data = readData();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(sanitizePublicData(data));
});

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();
  const data = readData();
  const users = data?.auth?.users || [];
  const found = users.find(
    (u) =>
      String(u?.username || "").trim().toLowerCase() === username.toLowerCase() &&
      String(u?.password || "").trim() === password
  );

  if (!found) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(24).toString("hex");
  authTokens.set(token, { username: found.username, role: found.role || "admin" });
  return res.json({
    ok: true,
    token,
    user: { username: found.username, role: found.role || "admin" }
  });
});

app.get("/api/admin/data", requireAuth, (req, res) => {
  const data = readData();
  res.json(sanitizeAdminData(data));
});

app.put("/api/admin/data", requireAuth, (req, res) => {
  const incoming = req.body || {};
  const err = validateIncomingAdminData(incoming);
  if (err) return res.status(400).json({ ok: false, error: err });

  const current = readData();
  const updated = {
    ...current,
    meta: {
      ...current.meta,
      ...incoming.meta,
      generatedAt: new Date().toISOString()
    },
    people: incoming.people,
    categories: incoming.categories,
    shelterSchedule: {
      ...defaultData().shelterSchedule,
      ...(current.shelterSchedule || {}),
      ...(incoming.shelterSchedule || {}),
      meta: {
        ...defaultData().shelterSchedule.meta,
        ...(current.shelterSchedule?.meta || {}),
        ...(incoming.shelterSchedule?.meta || {})
      },
      shifts: Array.isArray(incoming.shelterSchedule?.shifts)
        ? incoming.shelterSchedule.shifts
        : Array.isArray(current.shelterSchedule?.shifts)
          ? current.shelterSchedule.shifts
          : []
    },
    auth: current.auth
  };

  try {
    writeData(updated);
    return res.json({ ok: true, data: sanitizeAdminData(updated) });
  } catch (e) {
    console.error("Failed to write data.json:", e);
    return res.status(500).json({ ok: false, error: "Failed to save data" });
  }
});

/* --------------------------
   Serve frontend
-------------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

/* --------------------------
   Start server
-------------------------- */
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Serving public from: ${publicDir}`);
  console.log(`Reading contacts from: ${dataPath}`);
});
