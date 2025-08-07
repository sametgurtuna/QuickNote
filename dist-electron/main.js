import { app as l, autoUpdater as S, globalShortcut as m, nativeImage as C, Tray as _, Menu as E, ipcMain as c, BrowserWindow as u, screen as x } from "electron";
import { fileURLToPath as F } from "node:url";
import i from "node:path";
import w from "node:fs/promises";
import { randomUUID as O } from "node:crypto";
const T = i.dirname(F(import.meta.url));
process.env.APP_ROOT = i.join(T, "..");
const p = process.env.VITE_DEV_SERVER_URL, V = i.join(process.env.APP_ROOT, "dist-electron"), k = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? i.join(process.env.APP_ROOT, "public") : k;
let r = null, a = null, d = null;
const y = () => i.join(l.getPath("userData"), "notes.json");
async function R() {
  const e = y();
  try {
    await w.access(e);
  } catch {
    await w.mkdir(i.dirname(e), { recursive: !0 }), await w.writeFile(e, "[]", "utf-8");
  }
}
async function h() {
  await R();
  const e = await w.readFile(y(), "utf-8");
  try {
    const n = JSON.parse(e);
    return Array.isArray(n) ? n.map((o) => {
      const s = (/* @__PURE__ */ new Date()).toISOString();
      return {
        id: o.id || O(),
        text: o.text || "",
        tags: Array.isArray(o.tags) ? o.tags : [],
        createdAt: o.createdAt || s,
        updatedAt: o.updatedAt || o.createdAt || s
      };
    }) : [];
  } catch {
    return [];
  }
}
async function b(e) {
  console.log("💾 Writing notes to file:", e.length, "notes"), console.log("📁 File path:", y());
  try {
    await w.writeFile(y(), JSON.stringify(e, null, 2), "utf-8"), console.log("✅ Notes written successfully");
  } catch (n) {
    throw console.error("❌ Failed to write notes:", n), n;
  }
}
function v(e) {
  const n = /* @__PURE__ */ new Set(), t = /(^|\s)#([\p{L}\p{N}_-]+)/gu;
  let o;
  for (; o = t.exec(e); )
    n.add(o[2].toLowerCase());
  return Array.from(n);
}
function P(e, n) {
  const t = x.getPrimaryDisplay().workArea, o = Math.floor(t.x + (t.width - e) / 2), s = Math.floor(t.y + (t.height - n) / 3);
  return { x: o, y: s };
}
function I() {
  if (r) return r;
  const e = 520, n = 320, { x: t, y: o } = P(e, n);
  r = new u({
    width: e,
    height: n,
    x: t,
    y: o,
    frame: !1,
    transparent: !1,
    resizable: !0,
    alwaysOnTop: !0,
    skipTaskbar: !0,
    show: !1,
    vibrancy: process.platform === "win32" ? void 0 : "under-window",
    webPreferences: {
      preload: i.join(T, "preload.mjs")
    }
  });
  const s = `${p}?window=note`;
  return p ? r.loadURL(s) : r.loadFile(i.join(k, "index.html"), { search: "?window=note" }), r.on("blur", () => {
    r == null || r.hide();
  }), r.on("closed", () => r = null), r;
}
function A() {
  if (a) return a;
  const e = 720, n = 520, { x: t, y: o } = P(e, n);
  a = new u({
    width: e,
    height: n,
    x: t,
    y: o,
    frame: !1,
    resizable: !0,
    alwaysOnTop: !1,
    skipTaskbar: !1,
    show: !1,
    webPreferences: {
      preload: i.join(T, "preload.mjs")
    }
  });
  const s = `${p}?window=history`;
  return p ? a.loadURL(s) : a.loadFile(i.join(k, "index.html"), { search: "?window=history" }), a.on("closed", () => a = null), a;
}
function N() {
  const e = I();
  e.isVisible() ? e.hide() : (e.center(), e.show(), e.focus(), e.webContents.send("note:show"));
}
function D() {
  m.unregisterAll(), m.register("CommandOrControl+Shift+N", () => {
    N();
  }), m.register("CommandOrControl+Alt+N", () => {
    const e = A();
    e.show(), e.focus();
  });
}
function j() {
  const e = C.createFromNamedImage("NSImageNameApplicationIcon");
  if (e.isEmpty()) {
    const t = Buffer.from([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      // PNG header
      0,
      0,
      0,
      13,
      73,
      72,
      68,
      82,
      // IHDR chunk
      0,
      0,
      0,
      16,
      0,
      0,
      0,
      16,
      // 16x16
      8,
      6,
      0,
      0,
      0,
      31,
      243,
      255,
      97,
      // RGB+Alpha
      0,
      0,
      0,
      31,
      73,
      68,
      65,
      84,
      // IDAT chunk
      120,
      156,
      98,
      252,
      255,
      255,
      63,
      3,
      // Compressed white square
      0,
      8,
      0,
      1,
      0,
      1,
      0,
      0,
      0,
      24,
      221,
      141,
      180,
      28,
      0,
      0,
      0,
      0,
      73,
      69,
      78,
      68,
      174,
      66,
      96,
      130
      // End
    ]);
    d = new _(C.createFromBuffer(t));
  } else
    d = new _(e);
  d.setToolTip("Quick Note - Hızlı Not Alma");
  const n = E.buildFromTemplate([
    {
      label: "✨ Hızlı Not (Ctrl+Shift+N)",
      click: () => N()
    },
    {
      label: "📚 Geçmiş (Ctrl+Alt+N)",
      click: () => {
        const t = A();
        t.show(), t.focus();
      }
    },
    { type: "separator" },
    {
      label: "Hakkında",
      click: () => {
        const { dialog: t } = require("electron");
        t.showMessageBox({
          type: "info",
          title: "Quick Note",
          message: "Quick Note v0.0.4",
          detail: `Hızlı not alma uygulaması

Ctrl+Shift+N: Hızlı not
Ctrl+Alt+N: Geçmiş`
        });
      }
    },
    { type: "separator" },
    { label: "🚪 Çıkış", role: "quit" }
  ]);
  d.setContextMenu(n), d.on("click", () => N()), d.on("double-click", () => {
    const t = A();
    t.show(), t.focus();
  });
}
function L() {
  c.handle("notes:getAll", async () => {
    const e = await h();
    return console.log("📚 Loading notes:", e.length, "total"), e.sort((n, t) => {
      const o = n.updatedAt || n.createdAt || "1970-01-01T00:00:00.000Z";
      return (t.updatedAt || t.createdAt || "1970-01-01T00:00:00.000Z").localeCompare(o);
    });
  }), c.handle("notes:create", async (e, n) => {
    console.log("📝 Creating new note with text:", n.substring(0, 50) + "...");
    const t = (/* @__PURE__ */ new Date()).toISOString(), o = {
      id: O(),
      text: n,
      tags: v(n),
      createdAt: t,
      updatedAt: t
    }, s = await h();
    return console.log("📚 Current notes count before add:", s.length), s.unshift(o), await b(s), console.log("📝 Note created successfully, ID:", o.id), console.log("📡 Sending notes:refresh to all windows"), u.getAllWindows().forEach((f) => {
      console.log("📡 Sending to window:", f.getTitle()), f.webContents.send("notes:refresh");
    }), o;
  }), c.handle("notes:update", async (e, n, t) => {
    const o = await h(), s = o.findIndex((g) => g.id === n);
    if (s === -1) return null;
    const f = (/* @__PURE__ */ new Date()).toISOString();
    return o[s] = { ...o[s], text: t, tags: v(t), updatedAt: f }, await b(o), console.log("📡 Sending notes:refresh to all windows"), u.getAllWindows().forEach((g) => {
      console.log("📡 Sending to window:", g.getTitle()), g.webContents.send("notes:refresh");
    }), o[s];
  }), c.handle("notes:delete", async (e, n) => {
    const o = (await h()).filter((s) => s.id !== n);
    return await b(o), console.log("📡 Sending notes:refresh to all windows"), u.getAllWindows().forEach((s) => {
      console.log("📡 Sending to window:", s.getTitle()), s.webContents.send("notes:refresh");
    }), !0;
  }), c.handle("app:hideWindow", () => {
    r == null || r.hide(), a == null || a.hide();
  }), c.handle("app:openHistory", () => {
    const e = A();
    e.show(), e.focus();
  }), c.handle("app:openNewNote", () => {
    N();
  });
}
l.setAppUserModelId("Quick Note");
process.defaultApp || (S.setFeedURL({
  url: "https://github.com/samet/quicknote/releases/latest",
  serverType: "json"
}), S.checkForUpdates(), setInterval(() => {
  S.checkForUpdates();
}, 24 * 60 * 60 * 1e3));
process.defaultApp || l.setLoginItemSettings({
  openAtLogin: !0,
  openAsHidden: !0,
  name: "Quick Note",
  path: process.execPath,
  args: ["--hidden"]
});
l.whenReady().then(async () => {
  await R(), j(), L(), D(), I();
  const e = process.argv.includes("--hidden") || l.getLoginItemSettings().wasOpenedAsHidden;
  console.log(e ? "🔇 Quick Note gizli başlatıldı (sistem başlangıcı)" : "🚀 Quick Note başlatıldı!"), console.log("📝 Ctrl+Shift+N: Hızlı not penceresi"), console.log("📚 Ctrl+Alt+N: Geçmiş penceresi");
});
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (r = null, a = null);
});
l.on("activate", () => {
  r || I();
});
l.on("will-quit", () => {
  m.unregisterAll();
});
export {
  V as MAIN_DIST,
  k as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
