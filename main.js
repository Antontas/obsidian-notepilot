var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => QoderChatPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/settings.ts
var PROVIDER_PRESETS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    label: "OpenAI \u517C\u5BB9\u63A5\u53E3"
  },
  dashscope: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3.7-plus",
    label: "\u963F\u91CC\u4E91\u767E\u70BC DashScope"
  }
};
var PROVIDER_MODELS = {
  dashscope: [
    "qwen3.7-flash-2026-07-15",
    "qwen3.7-plus",
    "qwen3.5-ocr",
    "qwen3.7-flash",
    "qwen3.7-max-2026-05-17",
    "qwen3.7-max-2026-06-08",
    "qwen3.7-max-preview",
    "deepseek-v4-flash-0731",
    "qwen3.7-max",
    "glm-5.2"
  ],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o3-mini"]
};
var SUGGESTIONS = [
  { title: "\u603B\u7ED3\u7B14\u8BB0", prompt: "\u8BF7\u603B\u7ED3\u5F53\u524D\u7B14\u8BB0\u7684\u6838\u5FC3\u8981\u70B9\uFF0C\u7528\u7B80\u6D01\u7684\u6761\u76EE\u5217\u51FA\u3002" },
  { title: "\u6DA6\u8272\u7B14\u8BB0", prompt: "\u8BF7\u5E2E\u6211\u6DA6\u8272\u5F53\u524D\u7B14\u8BB0\uFF0C\u4FDD\u6301\u539F\u610F\uFF0C\u4F7F\u8BED\u8A00\u66F4\u6D41\u7545\u4E13\u4E1A\u3002" },
  { title: "\u751F\u6210\u5927\u7EB2", prompt: "\u8BF7\u6839\u636E\u5F53\u524D\u7B14\u8BB0\u5185\u5BB9\u751F\u6210\u4E00\u4EFD\u7ED3\u6784\u5316\u5927\u7EB2\u3002" },
  { title: "\u7FFB\u8BD1\u7B14\u8BB0", prompt: "\u8BF7\u5C06\u5F53\u524D\u7B14\u8BB0\u7FFB\u8BD1\u6210\u82F1\u6587\uFF0C\u4FDD\u6301 Markdown \u683C\u5F0F\u3002" }
];
var DEFAULT_SETTINGS = {
  provider: "dashscope",
  baseUrl: PROVIDER_PRESETS.dashscope.baseUrl,
  apiKey: "",
  model: PROVIDER_PRESETS.dashscope.model,
  systemPrompt: "\u4F60\u662F Qoder Clone\uFF0C\u4E00\u4E2A\u96C6\u6210\u5728 Obsidian \u4E2D\u7684 AI \u7F16\u7A0B\u4E0E\u5199\u4F5C\u52A9\u624B\u3002\u8BF7\u7528\u4E2D\u6587\u56DE\u7B54\uFF0C\u56DE\u7B54\u7B80\u6D01\u3001\u51C6\u786E\uFF0C\u5FC5\u8981\u65F6\u4F7F\u7528 Markdown \u683C\u5F0F\u3002",
  temperature: 0.7,
  maxTokens: 2048,
  stream: true,
  includeActiveNote: true,
  maxNoteChars: 8e3,
  rulesEnabled: true
};

// src/sessions.ts
function genSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function createSession() {
  const now = Date.now();
  return {
    id: genSessionId(),
    title: "\u65B0\u5BF9\u8BDD",
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}
function deriveTitle(session) {
  if (session.title !== "\u65B0\u5BF9\u8BDD") return;
  const first = session.messages.find((m) => m.role === "user");
  if (first) {
    const text = first.content.replace(/\s+/g, " ").trim();
    session.title = text.length > 30 ? text.slice(0, 30) + "\u2026" : text || "\u65B0\u5BF9\u8BDD";
  }
}
function sessionToMarkdown(session) {
  const lines = [`# ${session.title}`, ""];
  for (const m of session.messages) {
    if (m.role === "user") {
      lines.push("**\u7528\u6237\uFF1A**", "", m.content, "");
    } else if (m.role === "assistant") {
      lines.push("**Qoder Clone\uFF1A**", "", m.content, "");
    } else {
      lines.push(`> \u26A0\uFE0F ${m.content}`, "");
    }
  }
  return lines.join("\n");
}
function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// src/llm.ts
async function verifyApiKey(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${settings.apiKey}`
  };
  try {
    const resp = await fetch(base + "/models", { headers });
    if (resp.ok) {
      return { ok: true, message: "\u767B\u5F55\u6210\u529F" };
    }
    if (resp.status === 401 || resp.status === 403) {
      return { ok: false, message: `API Key \u65E0\u6548\u6216\u65E0\u6743\u8BBF\u95EE\uFF08${resp.status}\uFF09` };
    }
    if (resp.status !== 404) {
      return { ok: false, message: `\u9A8C\u8BC1\u5931\u8D25\uFF08HTTP ${resp.status}\uFF09` };
    }
  } catch (e) {
    return { ok: false, message: `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}` };
  }
  try {
    const resp = await fetch(base + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1,
        stream: false
      })
    });
    if (resp.ok) return { ok: true, message: "\u767B\u5F55\u6210\u529F" };
    if (resp.status === 401 || resp.status === 403) {
      return { ok: false, message: `API Key \u65E0\u6548\u6216\u65E0\u6743\u8BBF\u95EE\uFF08${resp.status}\uFF09` };
    }
    let detail = "";
    try {
      const body = await resp.json();
      detail = ((_a = body == null ? void 0 : body.error) == null ? void 0 : _a.message) || "";
    } catch (e) {
    }
    return { ok: false, message: `\u9A8C\u8BC1\u5931\u8D25\uFF08HTTP ${resp.status}\uFF09${detail ? "\uFF1A" + detail : ""}` };
  } catch (e) {
    return { ok: false, message: `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}` };
  }
}
function chatCompletion(settings, messages, callbacks, onDone) {
  const controller = new AbortController();
  const run = async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const url = settings.baseUrl.replace(/\/+$/, "") + "/chat/completions";
    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: settings.stream
        })
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        callbacks.onError(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}`);
      }
      onDone();
      return;
    }
    if (!resp.ok) {
      let detail = "";
      try {
        const body = await resp.json();
        detail = ((_a = body == null ? void 0 : body.error) == null ? void 0 : _a.message) || JSON.stringify(body);
      } catch (e) {
        detail = await resp.text().catch(() => "");
      }
      callbacks.onError(`\u63A5\u53E3\u9519\u8BEF ${resp.status}\uFF1A${detail}`);
      onDone();
      return;
    }
    if (!settings.stream || !resp.body) {
      try {
        const data = await resp.json();
        const text = (_e = (_d = (_c = (_b = data == null ? void 0 : data.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.content) != null ? _e : "(\u7A7A\u56DE\u590D)";
        callbacks.onToken(text);
      } catch (e) {
        callbacks.onError(`\u89E3\u6790\u54CD\u5E94\u5931\u8D25\uFF1A${e.message}`);
      }
      onDone();
      return;
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = (_f = lines.pop()) != null ? _f : "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = (_i = (_h = (_g = json == null ? void 0 : json.choices) == null ? void 0 : _g[0]) == null ? void 0 : _h.delta) == null ? void 0 : _i.content;
            if (typeof delta === "string" && delta.length > 0) {
              callbacks.onToken(delta);
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        callbacks.onError(`\u6D41\u5F0F\u8BFB\u53D6\u4E2D\u65AD\uFF1A${e.message}`);
      }
    }
    onDone();
  };
  run();
  return controller;
}

// src/diff.ts
function lineDiff(oldText, newText) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const n = a.length;
  const m = b.length;
  const dp = Array.from(
    { length: n + 1 },
    () => new Array(m + 1).fill(0)
  );
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      dp[i2][j2] = a[i2] === b[j2] ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
    }
  }
  const result = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "del", text: a[i] });
      i++;
    } else {
      result.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) {
    result.push({ type: "del", text: a[i] });
    i++;
  }
  while (j < m) {
    result.push({ type: "add", text: b[j] });
    j++;
  }
  return result;
}

// src/chatView.ts
var import_obsidian = require("obsidian");

// src/rules.ts
var RULES_DIR = ".qoder-rules";
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { body: text, alwaysApply: true };
  const body = text.slice(match[0].length);
  const alwaysApply = !/alwaysApply:\s*false/.test(match[1]);
  return { body, alwaysApply };
}
async function loadRules(app) {
  const folder = app.vault.getAbstractFileByPath(RULES_DIR);
  if (!folder) return "";
  const rules = [];
  const files = app.vault.getMarkdownFiles().filter(
    (f) => f.path.startsWith(RULES_DIR + "/")
  );
  for (const file of files) {
    try {
      const raw = await app.vault.read(file);
      const { body, alwaysApply } = parseFrontmatter(raw);
      if (alwaysApply && body.trim()) {
        rules.push({ name: file.basename, content: body.trim(), alwaysApply });
      }
    } catch (e) {
    }
  }
  if (rules.length === 0) return "";
  return rules.map((r) => `### \u89C4\u5219\uFF1A${r.name}
${r.content}`).join("\n\n");
}

// src/chatView.ts
var VIEW_TYPE_QODER_CHAT = "qoder-chat-view";
var QoderChatView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.state = "chat";
    this.popupEl = null;
    this.popupItems = [];
    this.popupIndex = 0;
    this.attachedFiles = [];
    this.abortController = null;
    this.generating = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_QODER_CHAT;
  }
  getDisplayText() {
    return "Qoder Clone";
  }
  getIcon() {
    return "bot";
  }
  async onOpen() {
    this.render();
  }
  async onClose() {
    this.stop();
  }
  refresh() {
    this.render();
  }
  render() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("qoder-view");
    if (!this.plugin.isLoggedIn()) {
      this.renderLogin(root);
      return;
    }
    if (this.state === "history") {
      this.renderHistory(root);
    } else {
      this.renderChat(root);
    }
  }
  // ============ 登录页 ============
  renderLogin(root) {
    const wrap = root.createDiv({ cls: "qoder-login-wrap" });
    const card = wrap.createDiv({ cls: "qoder-login-card" });
    const logo = card.createDiv({ cls: "qoder-logo" });
    (0, import_obsidian.setIcon)(logo, "bot");
    card.createEl("div", { cls: "qoder-logo-text", text: "Qoder" });
    card.createEl("h2", { cls: "qoder-login-title", text: "\u767B\u5F55 Qoder Clone" });
    card.createEl("p", {
      cls: "qoder-login-desc",
      text: "\u4F7F\u7528\u963F\u91CC\u4E91\u767E\u70BC\uFF08DashScope\uFF09\u51ED\u8BC1\u767B\u5F55\uFF0C\u5BC6\u94A5\u4EC5\u4FDD\u5B58\u5728\u672C\u673A Obsidian \u914D\u7F6E\u4E2D\u3002"
    });
    const keyInput = card.createEl("input", {
      cls: "qoder-login-input",
      type: "password",
      attr: { placeholder: "\u8F93\u5165\u963F\u91CC\u4E91\u767E\u70BC API Key\uFF08sk-...\uFF09" }
    });
    const adv = card.createDiv({ cls: "qoder-login-adv" });
    adv.createEl("label", { text: "Base URL" });
    const urlInput = adv.createEl("input", {
      cls: "qoder-login-input",
      type: "text",
      value: this.plugin.settings.baseUrl
    });
    const statusEl = card.createDiv({ cls: "qoder-login-status" });
    const loginBtn = card.createEl("button", {
      cls: "qoder-login-btn",
      text: "\u767B \u5F55"
    });
    const link = card.createEl("a", {
      cls: "qoder-login-link",
      text: "\u524D\u5F80\u963F\u91CC\u4E91\u767E\u70BC\u83B7\u53D6 API Key \u2192"
    });
    link.addEventListener("click", (e) => {
      e.preventDefault();
      void window.open("https://bailian.console.aliyun.com/", "_blank");
    });
    const doLogin = async () => {
      const key = keyInput.value.trim();
      if (!key) {
        statusEl.setText("\u8BF7\u8F93\u5165 API Key");
        return;
      }
      loginBtn.disabled = true;
      statusEl.setText("\u6B63\u5728\u9A8C\u8BC1\u51ED\u8BC1\u2026");
      this.plugin.settings.apiKey = key;
      const url = urlInput.value.trim();
      if (url) this.plugin.settings.baseUrl = url;
      const result = await verifyApiKey(this.plugin.settings);
      loginBtn.disabled = false;
      if (result.ok) {
        new import_obsidian.Notice("Qoder Clone \u767B\u5F55\u6210\u529F");
        await this.plugin.saveAll();
        this.plugin.updateStatusBar();
        this.render();
      } else {
        this.plugin.settings.apiKey = "";
        statusEl.setText(result.message);
      }
    };
    loginBtn.addEventListener("click", () => void doLogin());
    keyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") void doLogin();
    });
    keyInput.focus();
  }
  // ============ 历史会话列表（参照 Continue History 页） ============
  renderHistory(root) {
    const header = root.createDiv({ cls: "qoder-header" });
    const backBtn = header.createEl("button", {
      cls: "qoder-icon-btn",
      attr: { title: "\u8FD4\u56DE\u804A\u5929" }
    });
    (0, import_obsidian.setIcon)(backBtn, "arrow-left");
    backBtn.addEventListener("click", () => {
      this.state = "chat";
      this.render();
    });
    header.createDiv({ cls: "qoder-header-title", text: "\u5386\u53F2\u4F1A\u8BDD" });
    header.createDiv({ cls: "qoder-toolbar-spacer" });
    const newBtn = header.createEl("button", {
      cls: "qoder-icon-btn",
      attr: { title: "\u65B0\u5BF9\u8BDD" }
    });
    (0, import_obsidian.setIcon)(newBtn, "square-plus");
    newBtn.addEventListener("click", () => {
      this.plugin.newSession();
      this.state = "chat";
      this.render();
    });
    const list = root.createDiv({ cls: "qoder-history-list" });
    const sessions = [...this.plugin.sessions].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    if (sessions.length === 0) {
      list.createDiv({ cls: "qoder-chat-empty", text: "\u6682\u65E0\u4F1A\u8BDD" });
      return;
    }
    for (const s of sessions) {
      const row = list.createDiv({ cls: "qoder-history-row" });
      if (s.id === this.plugin.currentSessionId) {
        row.addClass("qoder-history-row-active");
      }
      const body = row.createDiv({ cls: "qoder-history-body" });
      const titleRow = body.createDiv({ cls: "qoder-history-title-row" });
      const titleEl = titleRow.createSpan({
        cls: "qoder-history-title",
        text: s.title
      });
      const count = s.messages.filter((m) => m.role !== "error").length;
      titleRow.createSpan({ cls: "qoder-history-count", text: String(count) });
      body.createDiv({
        cls: "qoder-history-date",
        text: formatDate(s.updatedAt)
      });
      const actions = row.createDiv({ cls: "qoder-history-actions" });
      const editBtn = actions.createEl("button", {
        cls: "qoder-icon-btn",
        attr: { title: "\u91CD\u547D\u540D" }
      });
      (0, import_obsidian.setIcon)(editBtn, "pencil");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.startRename(row, titleEl, s.id);
      });
      const exportBtn = actions.createEl("button", {
        cls: "qoder-icon-btn",
        attr: { title: "\u5BFC\u51FA\u4E3A Markdown" }
      });
      (0, import_obsidian.setIcon)(exportBtn, "download");
      exportBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.exportSession(s.id);
      });
      const delBtn = actions.createEl("button", {
        cls: "qoder-icon-btn qoder-icon-btn-danger",
        attr: { title: "\u5220\u9664" }
      });
      (0, import_obsidian.setIcon)(delBtn, "trash-2");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.confirm(`\u5220\u9664\u4F1A\u8BDD\u300C${s.title}\u300D\uFF1F`)) {
          this.plugin.deleteSession(s.id);
          this.render();
        }
      });
      row.addEventListener("click", () => {
        this.plugin.switchSession(s.id);
        this.state = "chat";
        this.render();
      });
    }
  }
  startRename(row, titleEl, id) {
    const session = this.plugin.sessions.find((x) => x.id === id);
    if (!session) return;
    const input = document.createElement("input");
    input.type = "text";
    input.value = session.title;
    input.addClass("qoder-history-rename");
    titleEl.replaceWith(input);
    input.focus();
    input.select();
    const commit = async () => {
      const v = input.value.trim();
      if (v) session.title = v;
      await this.plugin.saveAll();
      this.render();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") void commit();
      else if (e.key === "Escape") this.render();
    });
    input.addEventListener("blur", () => void commit());
  }
  async exportSession(id) {
    const session = this.plugin.sessions.find((x) => x.id === id);
    if (!session) return;
    const safe = session.title.replace(/[\\/:*?"<>|#^\[\]]/g, "").slice(0, 40);
    let path = `Qoder Clone ${safe}.md`;
    let n = 1;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = `Qoder Clone ${safe} ${n++}.md`;
    }
    const file = await this.app.vault.create(path, sessionToMarkdown(session));
    new import_obsidian.Notice(`\u5DF2\u5BFC\u51FA\uFF1A${path}`);
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
  }
  // ============ 聊天页 ============
  renderChat(root) {
    const header = root.createDiv({ cls: "qoder-header" });
    const title = header.createDiv({ cls: "qoder-header-title" });
    (0, import_obsidian.setIcon)(title, "bot");
    title.createSpan({ text: "Qoder Clone" });
    header.createDiv({ cls: "qoder-toolbar-spacer" });
    const historyBtn = header.createEl("button", {
      cls: "qoder-icon-btn",
      attr: { title: "\u5386\u53F2\u4F1A\u8BDD" }
    });
    (0, import_obsidian.setIcon)(historyBtn, "history");
    historyBtn.addEventListener("click", () => {
      this.state = "history";
      this.render();
    });
    const newBtn = header.createEl("button", {
      cls: "qoder-icon-btn",
      attr: { title: "\u65B0\u5BF9\u8BDD" }
    });
    (0, import_obsidian.setIcon)(newBtn, "square-plus");
    newBtn.addEventListener("click", () => {
      this.plugin.newSession();
      this.attachedFiles = [];
      this.render();
    });
    const logoutBtn = header.createEl("button", {
      cls: "qoder-icon-btn",
      attr: { title: "\u9000\u51FA\u767B\u5F55" }
    });
    (0, import_obsidian.setIcon)(logoutBtn, "log-out");
    logoutBtn.addEventListener("click", () => this.logout());
    this.messagesEl = root.createDiv({ cls: "qoder-chat-messages" });
    this.renderMessages();
    this.chipsEl = root.createDiv({ cls: "qoder-chips" });
    this.renderChips();
    const inputBox = root.createDiv({ cls: "qoder-input-box" });
    this.inputEl = inputBox.createEl("textarea", {
      cls: "qoder-chat-input",
      attr: {
        placeholder: "\u63D0\u95EE\u2026\uFF08@ \u5F15\u7528\u7B14\u8BB0\uFF0CEnter \u53D1\u9001\uFF09",
        rows: "2"
      }
    });
    const toolbar = inputBox.createDiv({ cls: "qoder-input-toolbar" });
    const modelSelect = toolbar.createEl("select", {
      cls: "qoder-model-select"
    });
    const models = PROVIDER_MODELS[this.plugin.settings.provider];
    const current = this.plugin.settings.model;
    const options = models.includes(current) ? models : [current, ...models];
    for (const m of options) {
      const opt = modelSelect.createEl("option", { value: m, text: m });
      if (m === current) opt.selected = true;
    }
    modelSelect.addEventListener("change", () => {
      this.plugin.settings.model = modelSelect.value;
      void this.plugin.saveAll();
      this.plugin.updateStatusBar();
    });
    if (this.plugin.settings.includeActiveNote) {
      const badge = toolbar.createDiv({
        cls: "qoder-ctx-badge",
        text: "\u{1F4C4} \u5F53\u524D\u7B14\u8BB0"
      });
      badge.setAttribute("title", "\u63D0\u95EE\u65F6\u5C06\u9644\u5E26\u5F53\u524D\u7B14\u8BB0\u5185\u5BB9");
    }
    toolbar.createDiv({ cls: "qoder-toolbar-spacer" });
    this.stopBtn = toolbar.createEl("button", {
      cls: "qoder-chat-stop",
      text: "\u505C\u6B62"
    });
    this.stopBtn.style.display = "none";
    this.stopBtn.addEventListener("click", () => this.stop());
    this.sendBtn = toolbar.createEl("button", { cls: "qoder-chat-send" });
    (0, import_obsidian.setIcon)(this.sendBtn, "arrow-up");
    this.sendBtn.setAttribute("aria-label", "\u53D1\u9001");
    this.sendBtn.addEventListener("click", () => void this.send());
    this.inputEl.addEventListener("keydown", (e) => this.onInputKeydown(e));
    this.inputEl.addEventListener("input", () => this.onInput());
    if (this.generating) this.setBusy(true);
  }
  renderMessages() {
    this.messagesEl.empty();
    const session = this.plugin.currentSession();
    if (session.messages.length === 0) {
      this.renderWelcome();
      return;
    }
    for (const msg of session.messages) {
      const el = this.appendMessageEl(msg);
      if (msg.role === "assistant") this.addCodeActions(el);
    }
    this.scrollToBottom();
  }
  renderWelcome() {
    const w = this.messagesEl.createDiv({ cls: "qoder-welcome" });
    w.createDiv({ cls: "qoder-welcome-hi", text: "\u4F60\u597D \u{1F44B}" });
    w.createDiv({
      cls: "qoder-welcome-sub",
      text: "\u6211\u662F Qoder Clone\uFF0C\u53EF\u4EE5\u5E2E\u4F60\u603B\u7ED3\u3001\u6DA6\u8272\u3001\u6539\u5199\u7B14\u8BB0\u4E0E\u95EE\u7B54\u3002\u8F93\u5165 @ \u53EF\u5F15\u7528\u5E93\u5185\u7B14\u8BB0\u3002"
    });
    const grid = w.createDiv({ cls: "qoder-suggestions" });
    for (const s of SUGGESTIONS) {
      const btn = grid.createEl("button", {
        cls: "qoder-suggestion-btn",
        text: s.title
      });
      btn.addEventListener("click", () => void this.sendText(s.prompt));
    }
  }
  appendMessageEl(msg) {
    const cls = msg.role === "user" ? "qoder-msg qoder-msg-user" : msg.role === "error" ? "qoder-msg qoder-msg-system-err" : "qoder-msg qoder-msg-assistant";
    const el = this.messagesEl.createDiv({ cls });
    if (msg.role === "user" || msg.role === "error") {
      el.setText(msg.content);
    } else {
      import_obsidian.MarkdownRenderer.render(this.app, msg.content, el, "", this).then(() => this.addCodeActions(el)).catch(() => el.setText(msg.content));
    }
    return el;
  }
  /** 为代码块添加 复制 / 插入笔记 按钮（参照 Continue 代码块操作） */
  addCodeActions(el) {
    el.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".qoder-code-actions")) return;
      const bar = document.createElement("div");
      bar.addClass("qoder-code-actions");
      const copyBtn = bar.createEl("button", { text: "\u590D\u5236" });
      copyBtn.addEventListener("click", () => {
        var _a;
        const code = pre.querySelector("code");
        void navigator.clipboard.writeText((_a = code == null ? void 0 : code.innerText) != null ? _a : "").then(() => new import_obsidian.Notice("\u5DF2\u590D\u5236\u4EE3\u7801"));
      });
      const insertBtn = bar.createEl("button", { text: "\u63D2\u5165\u7B14\u8BB0" });
      insertBtn.addEventListener("click", () => {
        var _a;
        const code = pre.querySelector("code");
        this.insertIntoNote((_a = code == null ? void 0 : code.innerText) != null ? _a : "");
      });
      pre.appendChild(bar);
    });
  }
  insertIntoNote(text) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const editor = view == null ? void 0 : view.editor;
    if (!editor) {
      new import_obsidian.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u7B14\u8BB0");
      return;
    }
    const cursor = editor.getCursor();
    editor.replaceRange(text + "\n", cursor);
    new import_obsidian.Notice("\u5DF2\u63D2\u5165\u5230\u5F53\u524D\u7B14\u8BB0");
  }
  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
  setBusy(busy) {
    this.generating = busy;
    this.sendBtn.disabled = busy;
    this.sendBtn.style.display = busy ? "none" : "";
    this.stopBtn.style.display = busy ? "" : "none";
    this.inputEl.disabled = busy;
  }
  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.setBusy(false);
    }
  }
  logout() {
    if (!window.confirm("\u786E\u5B9A\u9000\u51FA\u767B\u5F55\uFF1F\u5C06\u6E05\u9664\u5DF2\u4FDD\u5B58\u7684\u51ED\u8BC1\u3002")) return;
    this.stop();
    this.plugin.settings.apiKey = "";
    void this.plugin.saveAll();
    this.plugin.updateStatusBar();
    this.render();
    new import_obsidian.Notice("\u5DF2\u9000\u51FA\u767B\u5F55");
  }
  async sendText(text) {
    this.inputEl.value = text;
    await this.send();
  }
  // ============ @ 引用（参照 Continue 的 @file 上下文） ============
  onInput() {
    var _a;
    const value = this.inputEl.value;
    const caret = (_a = this.inputEl.selectionStart) != null ? _a : value.length;
    const before = value.slice(0, caret);
    const match = before.match(/@([^\s@]*)$/);
    if (match) {
      this.showAtPopup(match[1]);
    } else {
      this.hideAtPopup();
    }
  }
  onInputKeydown(e) {
    if (this.popupEl) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.popupIndex = Math.min(
          this.popupIndex + 1,
          this.popupItems.length - 1
        );
        this.highlightPopup();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.popupIndex = Math.max(this.popupIndex - 1, 0);
        this.highlightPopup();
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const file = this.popupItems[this.popupIndex];
        if (file) this.selectAtFile(file);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this.hideAtPopup();
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void this.send();
    }
  }
  showAtPopup(query) {
    const files = this.app.vault.getMarkdownFiles().filter((f) => !f.path.startsWith(".obsidian/")).filter(
      (f) => query ? (f.basename + f.path).toLowerCase().includes(query.toLowerCase()) : true
    ).slice(0, 20);
    this.popupItems = files;
    this.popupIndex = 0;
    if (!this.popupEl) {
      const root = this.containerEl.children[1];
      this.popupEl = root.createDiv({ cls: "qoder-at-popup" });
    }
    this.popupEl.empty();
    if (files.length === 0) {
      this.popupEl.createDiv({
        cls: "qoder-at-item qoder-at-empty",
        text: "\u6CA1\u6709\u5339\u914D\u7684\u7B14\u8BB0"
      });
      return;
    }
    files.forEach((f, idx) => {
      const item = this.popupEl.createDiv({ cls: "qoder-at-item" });
      item.createSpan({ cls: "qoder-at-name", text: f.basename });
      item.createSpan({ cls: "qoder-at-path", text: f.path });
      if (idx === this.popupIndex) item.addClass("qoder-at-active");
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.selectAtFile(f);
      });
    });
  }
  highlightPopup() {
    if (!this.popupEl) return;
    this.popupEl.querySelectorAll(".qoder-at-item").forEach((el, idx) => {
      el.toggleClass("qoder-at-active", idx === this.popupIndex);
    });
  }
  hideAtPopup() {
    var _a;
    (_a = this.popupEl) == null ? void 0 : _a.remove();
    this.popupEl = null;
  }
  selectAtFile(file) {
    var _a;
    const value = this.inputEl.value;
    const caret = (_a = this.inputEl.selectionStart) != null ? _a : value.length;
    const before = value.slice(0, caret);
    const match = before.match(/@([^\s@]*)$/);
    if (match && match.index !== void 0) {
      const insert = `@${file.basename} `;
      this.inputEl.value = before.slice(0, match.index) + insert + value.slice(caret);
      this.inputEl.focus();
      const pos = match.index + insert.length;
      this.inputEl.setSelectionRange(pos, pos);
    }
    if (!this.attachedFiles.includes(file.path)) {
      this.attachedFiles.push(file.path);
    }
    this.hideAtPopup();
    this.renderChips();
  }
  renderChips() {
    var _a, _b;
    this.chipsEl.empty();
    if (this.attachedFiles.length === 0) {
      this.chipsEl.style.display = "none";
      return;
    }
    this.chipsEl.style.display = "";
    for (const path of this.attachedFiles) {
      const chip = this.chipsEl.createDiv({ cls: "qoder-chip" });
      const name = (_b = (_a = path.split("/").pop()) == null ? void 0 : _a.replace(/\.md$/, "")) != null ? _b : path;
      chip.createSpan({ text: `\u{1F4C4} ${name}` });
      const x = chip.createSpan({ cls: "qoder-chip-x", text: "\xD7" });
      x.addEventListener("click", () => {
        this.attachedFiles = this.attachedFiles.filter((p) => p !== path);
        this.renderChips();
      });
    }
  }
  // ============ 发送 ============
  async send() {
    var _a, _b;
    let text = this.inputEl.value.trim();
    if (!text || this.abortController) return;
    const settings = this.plugin.settings;
    if (!settings.apiKey) {
      new import_obsidian.Notice("\u8BF7\u5148\u767B\u5F55");
      return;
    }
    for (const path of this.attachedFiles) {
      const name = (_b = (_a = path.split("/").pop()) == null ? void 0 : _a.replace(/\.md$/, "")) != null ? _b : "";
      if (name) text = text.replace(new RegExp(`@${name}\\s?`, "g"), "");
    }
    text = text.trim();
    if (!text) return;
    this.inputEl.value = "";
    const attached = [...this.attachedFiles];
    this.attachedFiles = [];
    this.renderChips();
    const session = this.plugin.currentSession();
    const userMsg = { role: "user", content: text };
    session.messages.push(userMsg);
    const assistantMsg = { role: "assistant", content: "" };
    session.messages.push(assistantMsg);
    this.renderMessages();
    const assistantEl = this.messagesEl.lastElementChild;
    assistantEl.empty();
    assistantEl.createSpan({ cls: "qoder-thinking", text: "\u601D\u8003\u4E2D\u2026" });
    this.setBusy(true);
    const requestMessages = await this.buildRequestMessages(attached);
    let acc = "";
    this.abortController = chatCompletion(
      settings,
      requestMessages,
      {
        onToken: (partial) => {
          acc += partial;
          assistantMsg.content = acc;
          assistantEl.empty();
          import_obsidian.MarkdownRenderer.render(
            this.app,
            acc,
            assistantEl,
            "",
            this
          ).then(() => this.addCodeActions(assistantEl)).catch(() => assistantEl.setText(acc));
          this.scrollToBottom();
        },
        onError: (message) => {
          assistantMsg.role = "error";
          assistantMsg.content = message;
          assistantEl.className = "qoder-msg qoder-msg-system-err";
          assistantEl.setText(message);
          new import_obsidian.Notice(message);
        }
      },
      () => {
        this.abortController = null;
        this.setBusy(false);
        if (!assistantMsg.content) {
          assistantEl.empty();
          assistantEl.setText("(\u65E0\u5185\u5BB9)");
        } else {
          this.addCodeActions(assistantEl);
        }
        this.plugin.touchSession(session);
        void this.plugin.saveAll();
        this.scrollToBottom();
      }
    );
  }
  /** 组装请求：系统提示 + Rules + 当前笔记 + @引用文件 + 历史 */
  async buildRequestMessages(attached) {
    const settings = this.plugin.settings;
    const session = this.plugin.currentSession();
    const out = [];
    out.push({ role: "system", content: settings.systemPrompt });
    if (settings.rulesEnabled) {
      const rules = await loadRules(this.app);
      if (rules) {
        out.push({
          role: "system",
          content: `\u4EE5\u4E0B\u662F\u5FC5\u987B\u9075\u5B88\u7684\u89C4\u5219\uFF1A
${rules}`
        });
      }
    }
    if (settings.includeActiveNote) {
      const note = await this.getActiveNoteContext();
      if (note) {
        out.push({
          role: "system",
          content: `\u5F53\u524D\u7B14\u8BB0\u300C${note.title}\u300D\u5185\u5BB9\u5982\u4E0B\uFF0C\u56DE\u7B54\u65F6\u53EF\u53C2\u8003\uFF1A
${note.body}`
        });
      }
    }
    for (const path of attached) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof import_obsidian.TFile) {
        try {
          const content = await this.app.vault.read(file);
          out.push({
            role: "system",
            content: "```" + path + "\n" + content + "\n```"
          });
        } catch (e) {
        }
      }
    }
    for (const m of session.messages) {
      if ((m.role === "user" || m.role === "assistant") && m.content) {
        out.push({ role: m.role, content: m.content });
      }
    }
    return out;
  }
  async getActiveNoteContext() {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") return null;
    try {
      let content = await this.app.vault.read(file);
      const max = this.plugin.settings.maxNoteChars;
      if (content.length > max) {
        content = content.slice(0, max) + "\n\u2026(\u5185\u5BB9\u8FC7\u957F\u5DF2\u622A\u65AD)";
      }
      return { title: file.basename, body: content };
    } catch (e) {
      return null;
    }
  }
};

// src/main.ts
var QoderChatPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.sessions = [];
    this.currentSessionId = "";
    this.statusBarEl = null;
  }
  isLoggedIn() {
    return this.settings.apiKey.trim().length > 0;
  }
  // ============ 会话管理（参照 Continue session 模型） ============
  currentSession() {
    let s = this.sessions.find((x) => x.id === this.currentSessionId);
    if (!s) {
      s = createSession();
      this.sessions.unshift(s);
      this.currentSessionId = s.id;
    }
    return s;
  }
  newSession() {
    const s = createSession();
    this.sessions.unshift(s);
    this.currentSessionId = s.id;
    void this.saveAll();
    return s;
  }
  switchSession(id) {
    if (this.sessions.some((s) => s.id === id)) {
      this.currentSessionId = id;
      void this.saveAll();
    }
  }
  deleteSession(id) {
    var _a, _b;
    this.sessions = this.sessions.filter((s) => s.id !== id);
    if (this.currentSessionId === id) {
      this.currentSessionId = (_b = (_a = this.sessions[0]) == null ? void 0 : _a.id) != null ? _b : "";
    }
    void this.saveAll();
  }
  touchSession(s) {
    s.updatedAt = Date.now();
    deriveTitle(s);
  }
  async onload() {
    await this.loadAll();
    this.registerView(
      VIEW_TYPE_QODER_CHAT,
      (leaf) => new QoderChatView(leaf, this)
    );
    this.statusBarEl = this.addStatusBarItem();
    this.updateStatusBar();
    this.addRibbonIcon("bot", "\u6253\u5F00 Qoder Clone", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-qoder-chat",
      name: "\u6253\u5F00 Qoder Clone \u9762\u677F",
      callback: () => void this.activateView()
    });
    this.addCommand({
      id: "new-qoder-chat",
      name: "\u65B0\u5EFA Qoder Clone \u5BF9\u8BDD",
      callback: () => {
        this.newSession();
        this.refreshView();
      }
    });
    this.addCommand({
      id: "inline-chat",
      name: "Inline Chat\uFF1AAI \u6539\u5199\u9009\u4E2D\u6587\u672C\uFF08Diff \u9884\u89C8\uFF09",
      editorCallback: (editor, view) => void this.inlineChat(editor, view)
    });
    this.addCommand({
      id: "logout-qoder-chat",
      name: "\u9000\u51FA Qoder Clone \u767B\u5F55",
      callback: () => {
        this.settings.apiKey = "";
        void this.saveAll();
        this.updateStatusBar();
        this.refreshView();
        new import_obsidian2.Notice("\u5DF2\u9000\u51FA Qoder Clone \u767B\u5F55");
      }
    });
    this.addSettingTab(new QoderChatSettingTab(this.app, this));
  }
  updateStatusBar() {
    if (!this.statusBarEl) return;
    if (this.isLoggedIn()) {
      this.statusBarEl.setText(
        `Qoder \xB7 \u5DF2\u767B\u5F55 \xB7 ${this.settings.model}`
      );
    } else {
      this.statusBarEl.setText("Qoder \xB7 \u672A\u767B\u5F55");
    }
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_QODER_CHAT);
  }
  async activateView() {
    var _a;
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_QODER_CHAT)[0];
    if (!leaf) {
      leaf = (_a = workspace.getRightLeaf(false)) != null ? _a : void 0;
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_QODER_CHAT,
          active: true
        });
      }
    }
    if (leaf) workspace.revealLeaf(leaf);
  }
  refreshView() {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_QODER_CHAT)[0];
    const view = leaf == null ? void 0 : leaf.view;
    view == null ? void 0 : view.refresh();
  }
  async loadAll() {
    var _a, _b, _c;
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data == null ? void 0 : data.settings);
    this.sessions = Array.isArray(data == null ? void 0 : data.sessions) ? data == null ? void 0 : data.sessions : [];
    if (this.sessions.length === 0 && Array.isArray(data == null ? void 0 : data.messages)) {
      const legacy = data == null ? void 0 : data.messages;
      if (legacy.length > 0) {
        const s = createSession();
        s.messages = legacy;
        deriveTitle(s);
        this.sessions.push(s);
      }
    }
    this.currentSessionId = (_c = (_b = data == null ? void 0 : data.currentSessionId) != null ? _b : (_a = this.sessions[0]) == null ? void 0 : _a.id) != null ? _c : "";
  }
  async saveAll() {
    const data = {
      settings: this.settings,
      sessions: this.sessions,
      currentSessionId: this.currentSessionId
    };
    await this.saveData(data);
  }
  // ============ 非聊天补全（Inline Chat 用） ============
  async complete(promptMessages) {
    return new Promise((resolve, reject) => {
      let text = "";
      chatCompletion(
        this.settings,
        promptMessages,
        {
          onToken: (p) => {
            text += p;
          },
          onError: (message) => reject(new Error(message))
        },
        () => resolve(text)
      );
    });
  }
  /** Inline Chat：选中文本 → 指令 → AI 改写 → Diff 预览 → 应用 */
  async inlineChat(editor, view) {
    if (!this.isLoggedIn()) {
      new import_obsidian2.Notice("\u8BF7\u5148\u767B\u5F55 Qoder Clone");
      return;
    }
    const sel = editor.getSelection();
    if (!sel.trim()) {
      new import_obsidian2.Notice("\u8BF7\u5148\u5728\u7F16\u8F91\u5668\u4E2D\u9009\u4E2D\u8981\u6539\u5199\u7684\u6587\u672C");
      return;
    }
    const instruction = await new InstructionModal(this.app).openAndWait();
    if (instruction === null) return;
    new import_obsidian2.Notice("Qoder Clone \u6B63\u5728\u6539\u5199\u2026");
    let result;
    try {
      result = await this.complete([
        {
          role: "system",
          content: "\u4F60\u662F\u4E00\u4E2A\u6587\u672C\u6539\u5199\u52A9\u624B\u3002\u6839\u636E\u7528\u6237\u6307\u4EE4\u4FEE\u6539\u7ED9\u5B9A\u6587\u672C\u3002\u53EA\u8F93\u51FA\u4FEE\u6539\u540E\u7684\u5B8C\u6574\u6587\u672C\u672C\u8EAB\uFF0C\u4E0D\u8981\u8F93\u51FA\u4EFB\u4F55\u89E3\u91CA\u3001\u524D\u7F00\u6216 Markdown \u4EE3\u7801\u5757\u56F4\u680F\u3002"
        },
        {
          role: "user",
          content: `\u6307\u4EE4\uFF1A${instruction}

\u9700\u8981\u6539\u5199\u7684\u6587\u672C\uFF1A
${sel}`
        }
      ]);
    } catch (e) {
      new import_obsidian2.Notice(`\u6539\u5199\u5931\u8D25\uFF1A${e.message}`);
      return;
    }
    result = stripFences(result.trim());
    if (!result) {
      new import_obsidian2.Notice("\u6A21\u578B\u672A\u8FD4\u56DE\u6709\u6548\u5185\u5BB9");
      return;
    }
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const accept = await new DiffModal(this.app, sel, result).openAndWait();
    if (accept) {
      editor.replaceRange(result, from, to);
      new import_obsidian2.Notice("\u5DF2\u5E94\u7528\u6539\u5199");
    } else {
      new import_obsidian2.Notice("\u5DF2\u53D6\u6D88");
    }
  }
};
function stripFences(text) {
  const m = text.match(/^```[\w-]*\r?\n([\s\S]*?)\r?\n```$/);
  return m ? m[1] : text;
}
var InstructionModal = class extends import_obsidian2.Modal {
  constructor() {
    super(...arguments);
    this.resolveFn = null;
  }
  openAndWait() {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("qoder-modal");
    contentEl.createEl("h3", { text: "Inline Chat\uFF1A\u5982\u4F55\u6539\u5199\u9009\u4E2D\u6587\u672C\uFF1F" });
    const input = contentEl.createEl("textarea", {
      cls: "qoder-modal-input",
      attr: {
        placeholder: "\u4F8B\u5982\uFF1A\u6DA6\u8272\u8BED\u8A00 / \u7FFB\u8BD1\u6210\u82F1\u6587 / \u7CBE\u7B80\u4E3A 3 \u53E5\u8BDD\u2026",
        rows: "3"
      }
    });
    const row = contentEl.createDiv({ cls: "qoder-modal-row" });
    const cancel = row.createEl("button", { text: "\u53D6\u6D88" });
    const ok = row.createEl("button", {
      text: "\u6539\u5199",
      cls: "mod-cta"
    });
    const done = (value) => {
      var _a;
      (_a = this.resolveFn) == null ? void 0 : _a.call(this, value);
      this.resolveFn = null;
      this.close();
    };
    cancel.addEventListener("click", () => done(null));
    ok.addEventListener("click", () => {
      const v = input.value.trim();
      if (v) done(v);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = input.value.trim();
        if (v) done(v);
      } else if (e.key === "Escape") {
        done(null);
      }
    });
    input.focus();
  }
  onClose() {
    var _a;
    (_a = this.resolveFn) == null ? void 0 : _a.call(this, null);
    this.resolveFn = null;
    this.contentEl.empty();
  }
};
var DiffModal = class extends import_obsidian2.Modal {
  constructor(app, oldText, newText) {
    super(app);
    this.resolveFn = null;
    this.oldText = oldText;
    this.newText = newText;
  }
  openAndWait() {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("qoder-modal");
    contentEl.createEl("h3", { text: "\u6539\u52A8\u9884\u89C8\uFF08Diff\uFF09" });
    const diffEl = contentEl.createDiv({ cls: "qoder-diff" });
    for (const line of lineDiff(this.oldText, this.newText)) {
      const row2 = diffEl.createDiv({ cls: `qoder-diff-line qoder-diff-${line.type}` });
      const mark = line.type === "add" ? "+" : line.type === "del" ? "\u2212" : " ";
      row2.createSpan({ cls: "qoder-diff-mark", text: mark });
      row2.createSpan({ text: line.text || " " });
    }
    const row = contentEl.createDiv({ cls: "qoder-modal-row" });
    const reject = row.createEl("button", { text: "\u62D2\u7EDD" });
    const accept = row.createEl("button", {
      text: "\u63A5\u53D7\u6539\u52A8",
      cls: "mod-cta"
    });
    const done = (value) => {
      var _a;
      (_a = this.resolveFn) == null ? void 0 : _a.call(this, value);
      this.resolveFn = null;
      this.close();
    };
    reject.addEventListener("click", () => done(false));
    accept.addEventListener("click", () => done(true));
  }
  onClose() {
    var _a;
    (_a = this.resolveFn) == null ? void 0 : _a.call(this, false);
    this.resolveFn = null;
    this.contentEl.empty();
  }
};
var QoderChatSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Qoder Clone \u8BBE\u7F6E" });
    new import_obsidian2.Setting(containerEl).setName("\u767B\u5F55\u72B6\u6001").setDesc(
      this.plugin.isLoggedIn() ? `\u5DF2\u767B\u5F55\uFF08\u6A21\u578B\uFF1A${this.plugin.settings.model}\uFF09` : "\u672A\u767B\u5F55\uFF0C\u8BF7\u5728\u804A\u5929\u9762\u677F\u767B\u5F55\u9875\u8F93\u5165\u51ED\u8BC1"
    );
    new import_obsidian2.Setting(containerEl).setName("\u670D\u52A1\u5546\u9884\u8BBE").setDesc("\u9009\u62E9\u540E\u81EA\u52A8\u586B\u5145\u5BF9\u5E94\u7684 Base URL \u4E0E\u9ED8\u8BA4\u6A21\u578B").addDropdown(
      (dropdown) => dropdown.addOptions({
        dashscope: PROVIDER_PRESETS.dashscope.label,
        openai: PROVIDER_PRESETS.openai.label
      }).setValue(this.plugin.settings.provider).onChange(async (value) => {
        this.plugin.settings.provider = value;
        const preset = PROVIDER_PRESETS[value];
        this.plugin.settings.baseUrl = preset.baseUrl;
        this.plugin.settings.model = preset.model;
        await this.plugin.saveAll();
        this.display();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Base URL").setDesc("OpenAI \u517C\u5BB9\u63A5\u53E3\u5730\u5740").addText(
      (text) => text.setPlaceholder("https://.../v1").setValue(this.plugin.settings.baseUrl).onChange(async (value) => {
        this.plugin.settings.baseUrl = value.trim();
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("API Key").setDesc("BYOK\uFF1A\u4F60\u81EA\u5DF1\u7684\u5BC6\u94A5\uFF0C\u4EC5\u4FDD\u5B58\u5728\u672C\u5730").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value.trim();
        await this.plugin.saveAll();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("\u6A21\u578B").setDesc("\u4F8B\u5982 qwen3.7-plus / gpt-4o-mini").addText(
      (text) => text.setPlaceholder("\u6A21\u578B\u540D\u79F0").setValue(this.plugin.settings.model).onChange(async (value) => {
        this.plugin.settings.model = value.trim();
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u7CFB\u7EDF\u63D0\u793A\u8BCD").setDesc("\u5B9A\u4E49\u52A9\u624B\u7684\u89D2\u8272\u4E0E\u56DE\u7B54\u98CE\u683C").addTextArea((text) => {
      text.inputEl.rows = 4;
      text.inputEl.cols = 40;
      text.setValue(this.plugin.settings.systemPrompt).onChange(async (value) => {
        this.plugin.settings.systemPrompt = value;
        await this.plugin.saveAll();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("\u542F\u7528 Rules \u89C4\u5219\u6587\u4EF6").setDesc(`\u8BFB\u53D6\u5E93\u6839\u76EE\u5F55 .qoder-rules/*.md \u4E2D\u7684\u89C4\u5219\uFF0C\u81EA\u52A8\u6CE8\u5165\u5BF9\u8BDD\uFF08\u53C2\u7167 Continue \u7684 rules \u673A\u5236\uFF09`).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.rulesEnabled).onChange(async (value) => {
        this.plugin.settings.rulesEnabled = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u6D41\u5F0F\u8F93\u51FA").setDesc("\u9010\u5B57\u8F93\u51FA\u56DE\u590D\uFF08\u63A8\u8350\u5F00\u542F\uFF09").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stream).onChange(async (value) => {
        this.plugin.settings.stream = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u643A\u5E26\u5F53\u524D\u7B14\u8BB0\u4E0A\u4E0B\u6587").setDesc("\u63D0\u95EE\u65F6\u81EA\u52A8\u9644\u5E26\u5F53\u524D\u6253\u5F00\u7B14\u8BB0\u7684\u5185\u5BB9").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeActiveNote).onChange(async (value) => {
        this.plugin.settings.includeActiveNote = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Temperature").setDesc("\u751F\u6210\u968F\u673A\u6027\uFF080 - 2\uFF09").addSlider(
      (slider) => slider.setLimits(0, 2, 0.1).setValue(this.plugin.settings.temperature).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.temperature = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("\u7B14\u8BB0\u4E0A\u4E0B\u6587\u6700\u5927\u5B57\u7B26\u6570").setDesc("\u8D85\u51FA\u90E8\u5206\u5C06\u88AB\u622A\u65AD").addText(
      (text) => text.setPlaceholder("8000").setValue(String(this.plugin.settings.maxNoteChars)).onChange(async (value) => {
        const n = parseInt(value, 10);
        if (!isNaN(n) && n > 0) {
          this.plugin.settings.maxNoteChars = n;
          await this.plugin.saveAll();
        }
      })
    );
    containerEl.createEl("p", {
      cls: "qoder-settings-notice",
      text: "\u8BF4\u660E\uFF1A\u672C\u63D2\u4EF6\u4E3A\u4EFF Qoder \u7684\u72EC\u7ACB\u5B9E\u73B0\uFF0C\u754C\u9762\u4E0E\u4EA4\u4E92\u53C2\u7167\u5F00\u6E90\u9879\u76EE Continue\uFF08Apache 2.0\uFF09\u3002BYOK \u6A21\u5F0F\u9700\u8981\u4F60\u81EA\u5DF1\u63D0\u4F9B\u5927\u6A21\u578B API\uFF0C\u5BC6\u94A5\u4EC5\u5B58\u50A8\u5728\u672C\u673A Obsidian \u914D\u7F6E\u4E2D\u3002"
    });
  }
  hide() {
    super.hide();
    this.plugin.updateStatusBar();
    this.plugin.refreshView();
  }
};
