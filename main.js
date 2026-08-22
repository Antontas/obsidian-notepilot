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
  default: () => NotePilotPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");
var import_view = require("@codemirror/view");

// src/settings.ts
var PROVIDER_PRESETS = {
  dashscope: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3.7-plus",
    label: "\u963F\u91CC\u4E91\u767E\u70BC DashScope",
    keyUrl: "https://bailian.console.aliyun.com/",
    format: "openai"
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    label: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    format: "openai"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    label: "DeepSeek \u6DF1\u5EA6\u6C42\u7D22",
    keyUrl: "https://platform.deepseek.com/",
    format: "openai"
  },
  moonshot: {
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    label: "Moonshot Kimi",
    keyUrl: "https://platform.moonshot.cn/",
    format: "openai"
  },
  zhipu: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
    label: "\u667A\u8C31 GLM",
    keyUrl: "https://open.bigmodel.cn/",
    format: "openai"
  },
  siliconflow: {
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    label: "\u7845\u57FA\u6D41\u52A8 SiliconFlow",
    keyUrl: "https://cloud.siliconflow.cn/",
    format: "openai"
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    label: "Ollama \u672C\u5730\u670D\u52A1",
    keyUrl: "https://ollama.com/",
    format: "openai"
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-3.5-sonnet",
    label: "OpenRouter",
    keyUrl: "https://openrouter.ai/keys",
    format: "openai"
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    label: "Groq",
    keyUrl: "https://console.groq.com/keys",
    format: "openai"
  },
  custom: {
    baseUrl: "",
    model: "",
    label: "\u81EA\u5B9A\u4E49\u670D\u52A1\u5546\uFF08OpenAI \u517C\u5BB9\uFF09",
    keyUrl: "",
    format: "openai"
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-5",
    label: "Anthropic Claude\uFF08\u539F\u751F\u534F\u8BAE\uFF09",
    keyUrl: "https://console.anthropic.com/",
    format: "anthropic"
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com",
    model: "gemini-2.5-flash",
    label: "Google Gemini\uFF08\u539F\u751F\u534F\u8BAE\uFF09",
    keyUrl: "https://aistudio.google.com/apikey",
    format: "gemini"
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
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o3-mini"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  moonshot: [
    "moonshot-v1-8k",
    "moonshot-v1-32k",
    "moonshot-v1-128k",
    "kimi-k2-0711-preview"
  ],
  zhipu: ["glm-4-flash", "glm-4-plus", "glm-4-air", "glm-5.2"],
  siliconflow: [
    "deepseek-ai/DeepSeek-V3",
    "Qwen/Qwen2.5-72B-Instruct",
    "THUDM/glm-4-9b-chat"
  ],
  ollama: ["llama3.2", "qwen2.5:7b", "deepseek-r1:7b", "mistral"],
  openrouter: [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "google/gemini-2.0-flash-001",
    "deepseek/deepseek-chat"
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
  ],
  custom: [],
  anthropic: [
    "claude-sonnet-4-5",
    "claude-opus-4-1",
    "claude-3-7-sonnet-latest",
    "claude-3-5-haiku-latest"
  ],
  gemini: [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ]
};
var DEFAULT_SETTINGS = {
  provider: "dashscope",
  baseUrl: PROVIDER_PRESETS.dashscope.baseUrl,
  apiKey: "",
  model: PROVIDER_PRESETS.dashscope.model,
  systemPrompt: "\u4F60\u662F ObsidianAI\uFF0C\u4E00\u4E2A\u96C6\u6210\u5728 Obsidian \u4E2D\u7684 AI \u7F16\u7A0B\u4E0E\u5199\u4F5C\u52A9\u624B\u3002\u8BF7\u7528\u4E2D\u6587\u56DE\u7B54\uFF0C\u56DE\u7B54\u7B80\u6D01\u3001\u51C6\u786E\uFF0C\u5FC5\u8981\u65F6\u4F7F\u7528 Markdown \u683C\u5F0F\u3002",
  temperature: 0.7,
  maxTokens: 2048,
  stream: true,
  includeActiveNote: true,
  maxNoteChars: 8e3,
  rulesEnabled: true,
  agentMode: false
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
      lines.push("**ObsidianAI\uFF1A**", "", m.content, "");
    } else {
      lines.push(`> ${m.content}`, "");
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
function apiFormatOf(settings) {
  return PROVIDER_PRESETS[settings.provider].format;
}
async function verifyApiKey(settings) {
  switch (apiFormatOf(settings)) {
    case "anthropic":
      return verifyAnthropic(settings);
    case "gemini":
      return verifyGemini(settings);
    default:
      return verifyOpenAI(settings);
  }
}
async function verifyOpenAI(settings) {
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
async function verifyAnthropic(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  const headers = {
    "x-api-key": settings.apiKey,
    "anthropic-version": "2023-06-01"
  };
  try {
    const resp = await fetch(base + "/v1/models", { headers });
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
async function verifyGemini(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  try {
    const resp = await fetch(
      base + "/v1beta/models?key=" + encodeURIComponent(settings.apiKey)
    );
    if (resp.ok) return { ok: true, message: "\u767B\u5F55\u6210\u529F" };
    if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
      return { ok: false, message: `API Key \u65E0\u6548\uFF08HTTP ${resp.status}\uFF09` };
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
async function fetchModels(settings) {
  switch (apiFormatOf(settings)) {
    case "anthropic":
      return fetchAnthropicModels(settings);
    case "gemini":
      return fetchGeminiModels(settings);
    default:
      return fetchOpenAIModels(settings);
  }
}
var NON_CHAT_KEYWORDS = [
  "embedding",
  "tts",
  "audio",
  "whisper",
  "moderation",
  "dall-e",
  "image",
  "rerank",
  "voice",
  "speech"
];
async function fetchOpenAIModels(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  try {
    const resp = await fetch(base + "/models", {
      headers: { Authorization: `Bearer ${settings.apiKey}` }
    });
    if (!resp.ok) {
      return { ok: false, models: [], message: `\u83B7\u53D6\u6A21\u578B\u5217\u8868\u5931\u8D25\uFF08HTTP ${resp.status}\uFF09` };
    }
    const data = await resp.json();
    const ids = ((_a = data == null ? void 0 : data.data) != null ? _a : []).map((m) => typeof (m == null ? void 0 : m.id) === "string" ? m.id : "").filter(
      (id) => id && !NON_CHAT_KEYWORDS.some((k) => id.toLowerCase().includes(k))
    );
    return ids.length > 0 ? { ok: true, models: ids, message: `\u5171 ${ids.length} \u4E2A\u6A21\u578B` } : { ok: false, models: [], message: "\u63A5\u53E3\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868" };
  } catch (e) {
    return { ok: false, models: [], message: `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}` };
  }
}
async function fetchAnthropicModels(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  try {
    const resp = await fetch(base + "/v1/models", {
      headers: {
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01"
      }
    });
    if (!resp.ok) {
      return { ok: false, models: [], message: `\u83B7\u53D6\u6A21\u578B\u5217\u8868\u5931\u8D25\uFF08HTTP ${resp.status}\uFF09` };
    }
    const data = await resp.json();
    const ids = ((_a = data == null ? void 0 : data.data) != null ? _a : []).map((m) => typeof (m == null ? void 0 : m.id) === "string" ? m.id : "").filter((id) => id);
    return ids.length > 0 ? { ok: true, models: ids, message: `\u5171 ${ids.length} \u4E2A\u6A21\u578B` } : { ok: false, models: [], message: "\u63A5\u53E3\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868" };
  } catch (e) {
    return { ok: false, models: [], message: `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}` };
  }
}
async function fetchGeminiModels(settings) {
  var _a;
  const base = settings.baseUrl.replace(/\/+$/, "");
  try {
    const resp = await fetch(
      base + "/v1beta/models?key=" + encodeURIComponent(settings.apiKey)
    );
    if (!resp.ok) {
      return { ok: false, models: [], message: `\u83B7\u53D6\u6A21\u578B\u5217\u8868\u5931\u8D25\uFF08HTTP ${resp.status}\uFF09` };
    }
    const data = await resp.json();
    const ids = ((_a = data == null ? void 0 : data.models) != null ? _a : []).filter(
      (m) => {
        var _a2;
        return (_a2 = m == null ? void 0 : m.supportedGenerationMethods) == null ? void 0 : _a2.includes("generateContent");
      }
    ).map(
      (m) => typeof (m == null ? void 0 : m.name) === "string" ? m.name.replace(/^models\//, "") : ""
    ).filter((id) => id);
    return ids.length > 0 ? { ok: true, models: ids, message: `\u5171 ${ids.length} \u4E2A\u6A21\u578B` } : { ok: false, models: [], message: "\u63A5\u53E3\u672A\u8FD4\u56DE\u6A21\u578B\u5217\u8868" };
  } catch (e) {
    return { ok: false, models: [], message: `\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${e.message}` };
  }
}
function chatCompletion(settings, messages, callbacks, onDone) {
  switch (apiFormatOf(settings)) {
    case "anthropic":
      return anthropicCompletion(settings, messages, callbacks, onDone);
    case "gemini":
      return geminiCompletion(settings, messages, callbacks, onDone);
    default:
      return openAICompletion(settings, messages, callbacks, onDone);
  }
}
function openAICompletion(settings, messages, callbacks, onDone) {
  const controller = new AbortController();
  const run = async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
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
      callbacks.onError(`\u63A5\u53E3\u9519\u8BEF ${resp.status}\uFF1A${await errorDetail(resp)}`);
      onDone();
      return;
    }
    if (!settings.stream || !resp.body) {
      try {
        const data = await resp.json();
        const text = (_d = (_c = (_b = (_a = data == null ? void 0 : data.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) != null ? _d : "(\u7A7A\u56DE\u590D)";
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
        buffer = (_e = lines.pop()) != null ? _e : "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = (_h = (_g = (_f = json == null ? void 0 : json.choices) == null ? void 0 : _f[0]) == null ? void 0 : _g.delta) == null ? void 0 : _h.content;
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
function anthropicCompletion(settings, messages, callbacks, onDone) {
  const controller = new AbortController();
  const run = async () => {
    var _a, _b, _c;
    const base = settings.baseUrl.replace(/\/+$/, "");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const turns = normalizeTurns(messages.filter((m) => m.role !== "system"));
    let resp;
    try {
      resp = await fetch(base + "/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
          ...system ? { system } : {},
          messages: turns,
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
      callbacks.onError(`\u63A5\u53E3\u9519\u8BEF ${resp.status}\uFF1A${await errorDetail(resp)}`);
      onDone();
      return;
    }
    if (!settings.stream || !resp.body) {
      try {
        const data = await resp.json();
        const blocks = (_a = data == null ? void 0 : data.content) != null ? _a : [];
        const text = blocks.filter((b) => b.type === "text" && typeof b.text === "string").map((b) => b.text).join("");
        callbacks.onToken(text || "(\u7A7A\u56DE\u590D)");
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
        buffer = (_b = lines.pop()) != null ? _b : "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          try {
            const json = JSON.parse(payload);
            const delta = (_c = json == null ? void 0 : json.delta) == null ? void 0 : _c.text;
            if ((json == null ? void 0 : json.type) === "content_block_delta" && typeof delta === "string" && delta.length > 0) {
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
function geminiCompletion(settings, messages, callbacks, onDone) {
  const controller = new AbortController();
  const run = async () => {
    var _a;
    const base = settings.baseUrl.replace(/\/+$/, "");
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = normalizeTurns(messages.filter((m) => m.role !== "system")).map(
      (m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      })
    );
    const action = settings.stream ? "streamGenerateContent" : "generateContent";
    const query = `?key=${encodeURIComponent(settings.apiKey)}${settings.stream ? "&alt=sse" : ""}`;
    const url = `${base}/v1beta/models/${encodeURIComponent(settings.model)}:${action}${query}`;
    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...system ? { systemInstruction: { parts: [{ text: system }] } } : {},
          contents,
          generationConfig: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxTokens
          }
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
      callbacks.onError(`\u63A5\u53E3\u9519\u8BEF ${resp.status}\uFF1A${await errorDetail(resp)}`);
      onDone();
      return;
    }
    if (!settings.stream || !resp.body) {
      try {
        const data = await resp.json();
        callbacks.onToken(geminiExtractText(data) || "(\u7A7A\u56DE\u590D)");
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
        buffer = (_a = lines.pop()) != null ? _a : "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          try {
            const json = JSON.parse(payload);
            const text = geminiExtractText(json);
            if (text.length > 0) callbacks.onToken(text);
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
async function errorDetail(resp) {
  var _a;
  try {
    const body = await resp.json();
    return ((_a = body == null ? void 0 : body.error) == null ? void 0 : _a.message) || JSON.stringify(body);
  } catch (e) {
    return await resp.text().catch(() => "");
  }
}
function normalizeTurns(messages) {
  var _a;
  const out = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) {
      last.content += "\n\n" + m.content;
    } else {
      out.push({ role: m.role, content: m.content });
    }
  }
  if (((_a = out[0]) == null ? void 0 : _a.role) !== "user") {
    out.unshift({ role: "user", content: "\uFF08\u7EE7\u7EED\uFF09" });
  }
  return out;
}
function geminiExtractText(json) {
  var _a, _b, _c, _d;
  const data = json;
  const parts = (_d = (_c = (_b = (_a = data == null ? void 0 : data.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) != null ? _d : [];
  return parts.filter((p) => typeof (p == null ? void 0 : p.text) === "string").map((p) => p == null ? void 0 : p.text).join("");
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
var import_obsidian2 = require("obsidian");

// src/rules.ts
var RULES_DIR = ".notepilot-rules";
var LEGACY_RULES_DIR = ".qoder-rules";
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { body: text, alwaysApply: true };
  const body = text.slice(match[0].length);
  const alwaysApply = !/alwaysApply:\s*false/.test(match[1]);
  return { body, alwaysApply };
}
async function loadRules(app) {
  const files = app.vault.getMarkdownFiles().filter(
    (f) => f.path.startsWith(RULES_DIR + "/") || f.path.startsWith(LEGACY_RULES_DIR + "/")
  );
  if (files.length === 0) return "";
  const rules = [];
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
  const newNames = new Set(
    files.filter((f) => f.path.startsWith(RULES_DIR + "/")).map((f) => f.basename)
  );
  const deduped = rules.filter(
    (r) => newNames.has(r.name) || !files.some((f) => f.path.startsWith(LEGACY_RULES_DIR + "/") && f.basename === r.name)
  );
  if (deduped.length === 0) return "";
  return deduped.map((r) => `### \u89C4\u5219\uFF1A${r.name}
${r.content}`).join("\n\n");
}

// src/fileTools.ts
var import_obsidian = require("obsidian");
var EDIT_ACTIONS = [
  "create",
  "write",
  "replace"
];
function validateEdit(obj) {
  if (!obj.path || !obj.action) {
    throw new Error("\u7F3A\u5C11 path \u6216 action \u5B57\u6BB5");
  }
  if (obj.action === "replace" && (obj.search === void 0 || obj.replace === void 0)) {
    throw new Error("replace \u9700\u8981 search \u4E0E replace \u5B57\u6BB5");
  }
  if ((obj.action === "create" || obj.action === "write") && obj.content === void 0) {
    throw new Error(`${obj.action} \u9700\u8981 content \u5B57\u6BB5`);
  }
}
function parseEditBlocks(text) {
  const out = [];
  const re = /```([^\n`]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const lang = m[1].trim().toLowerCase();
    let body = m[2].trim();
    let isEditFence = lang === "notepilot-edit" || lang === "qoder-edit" || lang === "qoder_edit";
    const firstLine = body.split("\n", 1)[0].trim();
    if (!isEditFence && /^(notepilot|qoder)[-_ ]?edit$/i.test(firstLine)) {
      body = body.slice(firstLine.length).trim();
      isEditFence = true;
    }
    if (!isEditFence && !body.startsWith("{")) continue;
    try {
      const obj = JSON.parse(body);
      if (!isEditFence) {
        const shapeOk = typeof obj.path === "string" && EDIT_ACTIONS.includes(obj.action);
        if (!shapeOk) continue;
      }
      validateEdit(obj);
      out.push({ raw: body, edit: obj, error: null });
    } catch (e) {
      if (isEditFence) {
        out.push({ raw: body, edit: null, error: e.message });
      }
    }
  }
  return out;
}
async function ensureFolder(app, path) {
  const parts = path.split("/");
  parts.pop();
  let cur = "";
  for (const p of parts) {
    if (!p) continue;
    cur = cur ? `${cur}/${p}` : p;
    if (!app.vault.getAbstractFileByPath(cur)) {
      await app.vault.createFolder(cur);
    }
  }
}
async function applyEdit(app, edit) {
  var _a, _b, _c;
  const path = edit.path.replace(/^\/+/, "");
  if (edit.action === "create") {
    if (app.vault.getAbstractFileByPath(path)) {
      throw new Error(`\u6587\u4EF6\u5DF2\u5B58\u5728\uFF1A${path}`);
    }
    await ensureFolder(app, path);
    await app.vault.create(path, (_a = edit.content) != null ? _a : "");
    return `\u5DF2\u521B\u5EFA ${path}`;
  }
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof import_obsidian.TFile)) {
    throw new Error(`\u672A\u627E\u5230\u6587\u4EF6\uFF1A${path}`);
  }
  if (edit.action === "write") {
    await app.vault.modify(file, (_b = edit.content) != null ? _b : "");
    return `\u5DF2\u8986\u5199 ${path}`;
  }
  const search = (_c = edit.search) != null ? _c : "";
  if (!search) throw new Error("search \u5185\u5BB9\u4E3A\u7A7A");
  await app.vault.process(file, (data) => {
    var _a2;
    const idx = data.indexOf(search);
    if (idx === -1) {
      throw new Error("\u672A\u627E\u5230\u4E0E search \u5339\u914D\u7684\u539F\u6587");
    }
    return data.slice(0, idx) + ((_a2 = edit.replace) != null ? _a2 : "") + data.slice(idx + search.length);
  });
  return `\u5DF2\u4FEE\u6539 ${path}`;
}
function agentToolPrompt(app) {
  const files = app.vault.getMarkdownFiles().filter((f) => !f.path.startsWith(".obsidian/")).slice(0, 300).map((f) => f.path);
  return [
    "\u4F60\u5F53\u524D\u5904\u4E8E Agent \u6A21\u5F0F\uFF0C\u5177\u5907\u4FEE\u6539\u672C\u5730\u6587\u4EF6\u7684\u80FD\u529B\u3002\u5F53\u7528\u6237\u8981\u6C42\u521B\u5EFA\u3001\u4FEE\u6539\u6216\u66F4\u65B0\u7B14\u8BB0\u65F6\uFF0C\u8BF7\u5728\u6587\u5B57\u56DE\u590D\u4E4B\u540E\u8F93\u51FA\u4E00\u4E2A\u6216\u591A\u4E2A\u7F16\u8F91\u5757\u3002",
    "\u7F16\u8F91\u5757\u683C\u5F0F\u5FC5\u987B\u4E25\u683C\u4E3A\uFF1A\u4E09\u4E2A\u53CD\u5F15\u53F7 + notepilot-edit \u4F5C\u4E3A\u56F4\u680F\u8BED\u8A00\uFF0C\u5757\u5185\u4E3A\u5355\u884C\u6216\u591A\u884C\u7684\u4E25\u683C JSON\u3002\u793A\u4F8B\uFF1A",
    "```notepilot-edit",
    '{"action":"replace","path":"\u7B14\u8BB0.md","search":"\u88AB\u66FF\u6362\u7684\u539F\u6587","replace":"\u65B0\u5185\u5BB9"}',
    "```",
    "\u4E09\u79CD action\uFF1A",
    '- \u66FF\u6362\u6587\u4EF6\u4E2D\u7684\u90E8\u5206\u5185\u5BB9\uFF1A{"action":"replace","path":"\u7B14\u8BB0.md","search":"\u88AB\u66FF\u6362\u7684\u539F\u6587\uFF08\u5FC5\u987B\u4E0E\u6587\u4EF6\u5185\u5BB9\u5B8C\u5168\u4E00\u81F4\uFF09","replace":"\u65B0\u5185\u5BB9"}',
    '- \u521B\u5EFA\u65B0\u6587\u4EF6\uFF1A{"action":"create","path":"\u76EE\u5F55/\u65B0\u6587\u4EF6.md","content":"\u5B8C\u6574\u5185\u5BB9"}',
    '- \u8986\u5199\u6574\u4E2A\u6587\u4EF6\uFF1A{"action":"write","path":"\u7B14\u8BB0.md","content":"\u5B8C\u6574\u5185\u5BB9"}',
    "\u89C4\u5219\uFF1A\u56F4\u680F\u8BED\u8A00\u5FC5\u987B\u662F notepilot-edit\uFF0C\u4E0D\u5F97\u6539\u7528 json \u6216\u5176\u4ED6\u8BED\u8A00\uFF1Bpath \u4E3A\u76F8\u5BF9\u5E93\u6839\u76EE\u5F55\u7684\u8DEF\u5F84\uFF1BJSON \u5FC5\u987B\u5408\u6CD5\u4E14\u6B63\u786E\u8F6C\u4E49\u6362\u884C\u4E0E\u5F15\u53F7\uFF1B\u6240\u6709\u4FEE\u6539\u90FD\u4F1A\u5148\u5C55\u793A\u7ED9\u7528\u6237\u5BA1\u6279\u540E\u624D\u751F\u6548\uFF0C\u56E0\u6B64\u53EF\u653E\u5FC3\u8F93\u51FA\uFF1B\u80FD\u4F7F\u7528 replace \u65F6\u4F18\u5148\u4F7F\u7528 replace\u3002",
    files.length > 0 ? `\u5F53\u524D\u5E93\u5185\u7684 Markdown \u6587\u4EF6\u5217\u8868\uFF1A
${files.join("\n")}` : "\u5F53\u524D\u5E93\u5185\u6682\u65E0 Markdown \u6587\u4EF6\u3002"
  ].join("\n");
}

// src/chatView.ts
var VIEW_TYPE_NOTEPILOT = "notepilot-chat-view";
var NotePilotView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.sidebarOpen = false;
    this.chatContentEl = null;
    this.popupEl = null;
    this.popupItems = [];
    this.popupIndex = 0;
    this.attachedFiles = [];
    this.quotedText = null;
    this.externalFiles = [];
    this.abortController = null;
    this.generating = false;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_NOTEPILOT;
  }
  getDisplayText() {
    return "ObsidianAI";
  }
  getIcon() {
    return "sparkles";
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
    root.addClass("oa-view");
    if (!this.plugin.isLoggedIn()) {
      this.renderLogin(root);
      return;
    }
    this.renderActivityBar(root);
    const main = root.createDiv({ cls: "oa-main" });
    if (this.sidebarOpen) {
      this.renderSidebar(main);
    }
    this.renderChat(main);
  }
  // ============ 登录页 ============
  renderLogin(root) {
    const wrap = root.createDiv({ cls: "oa-login" });
    const card = wrap.createDiv({ cls: "oa-login__card" });
    const logo = card.createDiv({ cls: "oa-login__logo" });
    (0, import_obsidian2.setIcon)(logo, "sparkles");
    card.createEl("div", { cls: "oa-login__brand", text: "ObsidianAI" });
    card.createEl("h2", { cls: "oa-login__title", text: "\u767B\u5F55 ObsidianAI" });
    card.createEl("p", {
      cls: "oa-login__desc",
      text: "\u9009\u62E9\u670D\u52A1\u5546\u5E76\u8F93\u5165 API Key \u767B\u5F55\uFF0C\u5BC6\u94A5\u4EC5\u4FDD\u5B58\u5728\u672C\u673A Obsidian \u914D\u7F6E\u4E2D\u3002"
    });
    const providerSelect = card.createEl("select", {
      cls: "oa-login__field"
    });
    for (const [p, preset] of Object.entries(PROVIDER_PRESETS)) {
      const opt = providerSelect.createEl("option", {
        value: p,
        text: preset.label
      });
      if (p === this.plugin.settings.provider) opt.selected = true;
    }
    const keyInput = card.createEl("input", {
      cls: "oa-login__field",
      type: "password",
      attr: { placeholder: "\u8F93\u5165 API Key\uFF08sk-...\uFF09" }
    });
    const adv = card.createDiv({ cls: "oa-login__advanced" });
    adv.createEl("label", { text: "Base URL" });
    const urlInput = adv.createEl("input", {
      cls: "oa-login__field",
      type: "text",
      value: this.plugin.settings.baseUrl
    });
    const statusEl = card.createDiv({ cls: "oa-login__status" });
    const loginBtn = card.createEl("button", {
      cls: "oa-login__btn",
      text: "\u767B \u5F55",
      attr: { "aria-label": "\u767B\u5F55" }
    });
    const link = card.createEl("a", {
      cls: "oa-login__link",
      text: "\u83B7\u53D6 API Key"
    });
    const keyPlaceholders = {
      ollama: "\u672C\u5730\u670D\u52A1\u65E0\u9700\u5BC6\u94A5\uFF0C\u53EF\u7559\u7A7A",
      custom: "API Key\uFF08\u81EA\u5B9A\u4E49\u670D\u52A1\u53EF\u7559\u7A7A\uFF09",
      anthropic: "\u8F93\u5165 Anthropic API Key\uFF08sk-ant-...\uFF09",
      gemini: "\u8F93\u5165 Google AI Studio API Key\uFF08AIza...\uFF09"
    };
    const applyProvider = (p) => {
      var _a;
      const preset = PROVIDER_PRESETS[p];
      this.plugin.settings.provider = p;
      this.plugin.availableModels = null;
      if (preset.baseUrl) {
        this.plugin.settings.baseUrl = preset.baseUrl;
        urlInput.value = preset.baseUrl;
      }
      if (preset.model) this.plugin.settings.model = preset.model;
      keyInput.setAttribute(
        "placeholder",
        (_a = keyPlaceholders[p]) != null ? _a : `\u8F93\u5165 ${preset.label} API Key\uFF08sk-...\uFF09`
      );
      if (preset.keyUrl) {
        link.style.display = "";
        link.setText(`\u524D\u5F80 ${preset.label} \u83B7\u53D6 API Key`);
      } else {
        link.style.display = "none";
      }
    };
    applyProvider(this.plugin.settings.provider);
    providerSelect.addEventListener("change", () => {
      applyProvider(providerSelect.value);
    });
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const preset = PROVIDER_PRESETS[this.plugin.settings.provider];
      void window.open(preset.keyUrl, "_blank");
    });
    const doLogin = async () => {
      const provider = providerSelect.value;
      const key = keyInput.value.trim();
      if (!key && provider !== "ollama" && provider !== "custom") {
        statusEl.setText("\u8BF7\u8F93\u5165 API Key");
        return;
      }
      loginBtn.disabled = true;
      loginBtn.setAttribute("aria-busy", "true");
      statusEl.setText("\u6B63\u5728\u9A8C\u8BC1\u51ED\u8BC1...");
      this.plugin.settings.provider = provider;
      this.plugin.settings.apiKey = key || (provider === "ollama" ? "ollama" : "custom");
      const url = urlInput.value.trim();
      if (url) this.plugin.settings.baseUrl = url;
      const result = await verifyApiKey(this.plugin.settings);
      loginBtn.disabled = false;
      loginBtn.setAttribute("aria-busy", "false");
      if (result.ok) {
        new import_obsidian2.Notice("ObsidianAI \u767B\u5F55\u6210\u529F");
        await this.plugin.saveAll();
        const fetched = await fetchModels(this.plugin.settings);
        this.plugin.availableModels = fetched.ok ? fetched.models : null;
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
  // ============ 活动栏（JetBrains 左侧图标条） ============
  renderActivityBar(root) {
    const bar = root.createDiv({ cls: "oa-actbar" });
    const chatBtn = bar.createEl("button", {
      cls: "oa-actbar__btn oa-actbar__btn--active",
      attr: { title: "\u804A\u5929" }
    });
    (0, import_obsidian2.setIcon)(chatBtn, "message-square");
    const historyBtn = bar.createEl("button", {
      cls: `oa-actbar__btn${this.sidebarOpen ? " oa-actbar__btn--active" : ""}`,
      attr: { title: "\u5386\u53F2\u4F1A\u8BDD" }
    });
    (0, import_obsidian2.setIcon)(historyBtn, "clock");
    historyBtn.addEventListener("click", () => {
      this.sidebarOpen = !this.sidebarOpen;
      this.render();
    });
    const newBtn = bar.createEl("button", {
      cls: "oa-actbar__btn",
      attr: { title: "\u65B0\u5EFA\u5BF9\u8BDD" }
    });
    (0, import_obsidian2.setIcon)(newBtn, "plus-square");
    newBtn.addEventListener("click", () => {
      this.plugin.newSession();
      this.attachedFiles = [];
      this.render();
    });
    bar.createDiv({ cls: "oa-actbar__spacer" });
    const settingsBtn = bar.createEl("button", {
      cls: "oa-actbar__btn",
      attr: { title: "\u8BBE\u7F6E" }
    });
    (0, import_obsidian2.setIcon)(settingsBtn, "settings");
    settingsBtn.addEventListener("click", () => {
      var _a;
      (_a = this.app.setting) == null ? void 0 : _a.open();
    });
    const logoutBtn = bar.createEl("button", {
      cls: "oa-actbar__btn oa-actbar__btn--danger",
      attr: { title: "\u9000\u51FA\u767B\u5F55" }
    });
    (0, import_obsidian2.setIcon)(logoutBtn, "log-out");
    logoutBtn.addEventListener("click", () => this.logout());
  }
  // ============ 历史会话侧边栏（JetBrains 项目树风格） ============
  renderSidebar(main) {
    const sidebar = main.createDiv({ cls: "oa-sidebar" });
    const header = sidebar.createDiv({ cls: "oa-sidebar__header" });
    header.createDiv({ cls: "oa-sidebar__title", text: "\u4F1A\u8BDD" });
    const closeBtn = header.createEl("button", {
      cls: "oa-sidebar__action",
      attr: { title: "\u5173\u95ED\u4FA7\u8FB9\u680F" }
    });
    (0, import_obsidian2.setIcon)(closeBtn, "x");
    closeBtn.addEventListener("click", () => {
      this.sidebarOpen = false;
      this.render();
    });
    const list = sidebar.createDiv({ cls: "oa-sidebar__list" });
    const sessions = [...this.plugin.sessions].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    if (sessions.length === 0) {
      list.createDiv({ cls: "oa-empty", text: "\u6682\u65E0\u4F1A\u8BDD" });
      return;
    }
    for (const s of sessions) {
      const row = list.createDiv({ cls: "oa-sidebar__row" });
      if (s.id === this.plugin.currentSessionId) {
        row.addClass("oa-sidebar__row--active");
      }
      const body = row.createDiv({ cls: "oa-sidebar__body" });
      const titleRow = body.createDiv({ cls: "oa-sidebar__title-row" });
      const titleEl = titleRow.createSpan({
        cls: "oa-sidebar__name",
        text: s.title
      });
      const count = s.messages.filter((m) => m.role !== "error").length;
      titleRow.createSpan({ cls: "oa-sidebar__count", text: String(count) });
      body.createDiv({
        cls: "oa-sidebar__date",
        text: formatDate(s.updatedAt)
      });
      const actions = row.createDiv({ cls: "oa-sidebar__actions" });
      const editBtn = actions.createEl("button", {
        cls: "oa-sidebar__action",
        attr: { title: "\u91CD\u547D\u540D" }
      });
      (0, import_obsidian2.setIcon)(editBtn, "pencil");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.startRename(row, titleEl, s.id);
      });
      const exportBtn = actions.createEl("button", {
        cls: "oa-sidebar__action",
        attr: { title: "\u5BFC\u51FA\u4E3A Markdown" }
      });
      (0, import_obsidian2.setIcon)(exportBtn, "download");
      exportBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.exportSession(s.id);
      });
      const delBtn = actions.createEl("button", {
        cls: "oa-sidebar__action oa-sidebar__action--danger",
        attr: { title: "\u5220\u9664" }
      });
      (0, import_obsidian2.setIcon)(delBtn, "trash-2");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.confirm(`\u5220\u9664\u4F1A\u8BDD\u300C${s.title}\u300D\uFF1F`)) {
          this.plugin.deleteSession(s.id);
          this.render();
        }
      });
      row.addEventListener("click", () => {
        this.plugin.switchSession(s.id);
        this.sidebarOpen = false;
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
    input.addClass("oa-sidebar__rename");
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
    let path = `ObsidianAI ${safe}.md`;
    let n = 1;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = `ObsidianAI ${safe} ${n++}.md`;
    }
    const file = await this.app.vault.create(path, sessionToMarkdown(session));
    new import_obsidian2.Notice(`\u5DF2\u5BFC\u51FA\uFF1A${path}`);
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
  }
  // ============ 聊天页（JetBrains 工具窗口风格） ============
  renderChat(main) {
    const content = main.createDiv({ cls: "oa-content" });
    this.chatContentEl = content;
    const titlebar = content.createDiv({ cls: "oa-titlebar" });
    const title = titlebar.createDiv({ cls: "oa-titlebar__title" });
    (0, import_obsidian2.setIcon)(title, "sparkles");
    title.createSpan({ text: "NotePilot" });
    titlebar.createDiv({ cls: "oa-titlebar__spacer" });
    const agentBtn = titlebar.createEl("button", {
      cls: "oa-mode-btn"
    });
    (0, import_obsidian2.setIcon)(agentBtn, "bot");
    agentBtn.createSpan({ text: " Agent" });
    agentBtn.setAttribute("title", "Agent \u6A21\u5F0F\uFF1AAI \u53EF\u5EFA\u8BAE\u521B\u5EFA/\u4FEE\u6539\u5E93\u5185\u6587\u4EF6\uFF08\u9700\u4F60\u5BA1\u6279\uFF09");
    const syncAgentBtn = () => agentBtn.toggleClass("oa-mode-btn--active", this.plugin.settings.agentMode);
    syncAgentBtn();
    agentBtn.addEventListener("click", () => {
      var _a;
      this.plugin.settings.agentMode = !this.plugin.settings.agentMode;
      void this.plugin.saveAll();
      syncAgentBtn();
      (_a = this.renderStatusBar) == null ? void 0 : _a.call(this, content);
      new import_obsidian2.Notice(
        this.plugin.settings.agentMode ? "Agent \u6A21\u5F0F\u5DF2\u5F00\u542F\uFF1AAI \u53EF\u63D0\u51FA\u6587\u4EF6\u4FEE\u6539\u5EFA\u8BAE" : "Agent \u6A21\u5F0F\u5DF2\u5173\u95ED"
      );
    });
    titlebar.createDiv({ cls: "oa-titlebar__spacer" });
    const userEl = titlebar.createDiv({ cls: "oa-titlebar__user" });
    const avatar = userEl.createDiv({ cls: "oa-titlebar__avatar" });
    avatar.createSpan({ text: this.plugin.settings.apiKey ? this.plugin.settings.apiKey.charAt(0).toUpperCase() : "?" });
    const username = this.plugin.settings.provider === "openai" ? "OpenAI" : this.plugin.settings.provider;
    userEl.createSpan({ text: username });
    (0, import_obsidian2.setIcon)(userEl, "chevron-down");
    this.renderTabs(content);
    this.messagesEl = content.createDiv({ cls: "oa-chat__messages" });
    this.renderMessages();
    if (this.quotedText === null && this.plugin.pendingQuotedText) {
      this.quotedText = this.plugin.pendingQuotedText;
      this.plugin.pendingQuotedText = null;
    }
    this.chipsEl = content.createDiv({ cls: "oa-chips" });
    this.renderChips();
    const inputBox = content.createDiv({ cls: "oa-input__box" });
    const ctxBtn = inputBox.createDiv({ cls: "oa-input__ctx-btn" });
    (0, import_obsidian2.setIcon)(ctxBtn, "plus");
    ctxBtn.createSpan({ text: " \u6DFB\u52A0\u4E0A\u4E0B\u6587" });
    ctxBtn.addEventListener("click", () => {
      this.inputEl.focus();
      this.inputEl.value += "@";
      this.onInput();
    });
    this.inputEl = inputBox.createEl("textarea", {
      cls: "oa-input__textarea",
      attr: {
        placeholder: "\u63D0\u95EE...\uFF08@ \u5F15\u7528\u7B14\u8BB0\uFF0C\u62D6\u5165\u6587\u4EF6\u9644\u52A0\uFF0CEnter \u53D1\u9001\uFF09",
        rows: "2"
      }
    });
    this.registerDomEvent(inputBox, "dragover", (evt) => {
      evt.preventDefault();
      if (evt.dataTransfer) evt.dataTransfer.dropEffect = "copy";
      inputBox.addClass("oa-input__box--dragover");
    });
    this.registerDomEvent(inputBox, "dragleave", () => {
      inputBox.removeClass("oa-input__box--dragover");
    });
    this.registerDomEvent(inputBox, "drop", (evt) => {
      inputBox.removeClass("oa-input__box--dragover");
      void this.onDropFiles(evt);
    });
    const toolbar = inputBox.createDiv({ cls: "oa-input__toolbar" });
    const modelSelect = toolbar.createEl("select", {
      cls: "oa-input__model"
    });
    const presetModels = PROVIDER_MODELS[this.plugin.settings.provider];
    const fetched = this.plugin.availableModels;
    const baseModels = fetched && fetched.length > 0 ? fetched : presetModels;
    const current = this.plugin.settings.model;
    const options = baseModels.includes(current) ? baseModels : [current, ...baseModels];
    const fillModelSelect = () => {
      modelSelect.empty();
      for (const m of options) {
        const opt = modelSelect.createEl("option", { value: m, text: m });
        if (m === current) opt.selected = true;
      }
    };
    fillModelSelect();
    modelSelect.addEventListener("change", () => {
      this.plugin.settings.model = modelSelect.value;
      void this.plugin.saveAll();
      this.plugin.updateStatusBar();
    });
    const refreshModelsBtn = toolbar.createEl("button", {
      cls: "oa-titlebar__btn",
      attr: { title: "\u4ECE API \u62C9\u53D6\u53EF\u7528\u6A21\u578B\u5217\u8868" }
    });
    (0, import_obsidian2.setIcon)(refreshModelsBtn, "refresh-cw");
    refreshModelsBtn.addEventListener("click", () => {
      void this.refreshModels(modelSelect, refreshModelsBtn);
    });
    if (this.plugin.settings.includeActiveNote) {
      const badge = toolbar.createDiv({
        cls: "oa-input__badge"
      });
      (0, import_obsidian2.setIcon)(badge, "file-text");
      badge.createSpan({ text: " \u5F53\u524D\u7B14\u8BB0" });
      badge.setAttribute("title", "\u63D0\u95EE\u65F6\u5C06\u9644\u5E26\u5F53\u524D\u7B14\u8BB0\u5185\u5BB9");
    }
    toolbar.createDiv({ cls: "oa-input__toolbar-spacer" });
    this.stopBtn = toolbar.createEl("button", {
      cls: "oa-input__stop",
      attr: { "aria-label": "\u505C\u6B62\u751F\u6210" }
    });
    (0, import_obsidian2.setIcon)(this.stopBtn, "square");
    this.stopBtn.style.display = "none";
    this.stopBtn.addEventListener("click", () => this.stop());
    this.sendBtn = toolbar.createEl("button", { cls: "oa-input__send" });
    (0, import_obsidian2.setIcon)(this.sendBtn, "arrow-up");
    this.sendBtn.setAttribute("aria-label", "\u53D1\u9001\u6D88\u606F");
    this.sendBtn.addEventListener("click", () => void this.send());
    this.inputEl.addEventListener("keydown", (e) => this.onInputKeydown(e));
    this.inputEl.addEventListener("input", () => this.onInput());
    this.renderStatusBar(content);
    if (this.generating) this.setBusy(true);
  }
  // ============ 会话标签页 ============
  renderTabs(content) {
    const tabs = content.createDiv({ cls: "oa-tabs" });
    const sessions = [...this.plugin.sessions].sort((a, b) => b.updatedAt - a.updatedAt);
    for (const s of sessions) {
      const tab = tabs.createDiv({ cls: `oa-tab${s.id === this.plugin.currentSessionId ? " oa-tab--active" : ""}` });
      tab.createSpan({ text: s.title });
      const closeBtn = tab.createEl("button", { cls: "oa-tab__close" });
      closeBtn.textContent = "\xD7";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sessions.length <= 1) return;
        this.plugin.deleteSession(s.id);
        this.render();
      });
      tab.addEventListener("click", () => {
        this.plugin.switchSession(s.id);
        this.render();
      });
    }
    const addBtn = tabs.createDiv({ cls: "oa-tabs__add" });
    (0, import_obsidian2.setIcon)(addBtn, "plus");
    addBtn.addEventListener("click", () => {
      this.plugin.newSession();
      this.attachedFiles = [];
      this.render();
    });
  }
  // ============ 状态栏 ============
  renderStatusBar(content) {
    content.querySelectorAll(".oa-statusbar").forEach((el) => el.remove());
    const bar = content.createDiv({ cls: "oa-statusbar" });
    const modelItem = bar.createSpan({ cls: "oa-statusbar__item" });
    (0, import_obsidian2.setIcon)(modelItem, "cpu");
    modelItem.createSpan({ text: this.plugin.settings.model });
    bar.createSpan({ cls: "oa-statusbar__sep" });
    if (this.plugin.settings.agentMode) {
      const agentItem = bar.createSpan({ cls: "oa-statusbar__item oa-statusbar__item--accent" });
      (0, import_obsidian2.setIcon)(agentItem, "bot");
      agentItem.createSpan({ text: "Agent" });
      bar.createSpan({ cls: "oa-statusbar__sep" });
    }
    if (this.plugin.settings.includeActiveNote) {
      const noteItem = bar.createSpan({ cls: "oa-statusbar__item" });
      (0, import_obsidian2.setIcon)(noteItem, "file-text");
      noteItem.createSpan({ text: "\u7B14\u8BB0\u4E0A\u4E0B\u6587" });
    }
    const providerLabel = PROVIDER_PRESETS[this.plugin.settings.provider].label;
    bar.createSpan({ cls: "oa-statusbar__item oa-statusbar__item--right", text: providerLabel });
  }
  renderMessages() {
    this.messagesEl.empty();
    const session = this.plugin.currentSession();
    if (session.messages.length === 0) {
      this.renderWelcome();
      return;
    }
    for (const msg of session.messages) {
      this.appendMessageEl(msg);
    }
    this.scrollToBottom();
  }
  renderWelcome() {
    const w = this.messagesEl.createDiv({ cls: "oa-welcome" });
    const icon = w.createDiv({ cls: "oa-welcome__icon" });
    (0, import_obsidian2.setIcon)(icon, "sparkles");
    w.createDiv({ cls: "oa-welcome__title", text: "NotePilot" });
    w.createDiv({
      cls: "oa-welcome__sub",
      text: "\u6211\u53EF\u4EE5\u5E2E\u4F60\u603B\u7ED3\u3001\u6DA6\u8272\u3001\u6539\u5199\u7B14\u8BB0\u4E0E\u95EE\u7B54\u3002"
    });
    const shortcuts = w.createDiv({ cls: "oa-welcome__shortcuts" });
    const items = [
      { key: "Shift + Enter", desc: "\u6362\u884C" },
      { key: "Ctrl + Shift + L", desc: "\u6253\u5F00/\u5173\u95ED\u9762\u677F" },
      { key: "@", desc: "\u5F15\u7528\u7B14\u8BB0" },
      { key: "Alt + N", desc: "\u65B0\u5EFA\u4F1A\u8BDD" },
      { key: "Alt + M", desc: "\u5207\u6362\u6A21\u5F0F" }
    ];
    for (const item of items) {
      const row = shortcuts.createDiv({ cls: "oa-welcome__shortcut" });
      row.createSpan({ cls: "oa-welcome__shortcut-desc", text: item.desc });
      const keys = row.createDiv({ cls: "oa-welcome__shortcut-keys" });
      for (const k of item.key.split(" + ")) {
        keys.createSpan({ cls: "oa-welcome__shortcut-key", text: k });
      }
    }
  }
  appendMessageEl(msg) {
    const cls = msg.role === "user" ? "oa-msg oa-msg--user" : msg.role === "error" ? "oa-msg oa-msg--error" : "oa-msg oa-msg--assistant";
    const el = this.messagesEl.createDiv({ cls });
    if (msg.role === "user" || msg.role === "assistant") {
      const header = el.createDiv({ cls: "oa-msg-header" });
      const avatarDiv = header.createDiv({ cls: msg.role === "user" ? "oa-msg-header__avatar oa-msg-header__avatar--accent" : "oa-msg-header__avatar" });
      (0, import_obsidian2.setIcon)(avatarDiv, msg.role === "user" ? "user" : "sparkles");
      header.createSpan({ cls: "oa-msg-header__name", text: msg.role === "user" ? "You" : "NotePilot" });
    }
    if (msg.role === "user" || msg.role === "error") {
      el.setText(msg.content);
    } else {
      import_obsidian2.MarkdownRenderer.render(this.app, msg.content, el, "", this).then(() => {
        this.addCodeActions(el);
        this.renderEditCards(el, msg.content);
      }).catch(() => el.setText(msg.content));
    }
    return el;
  }
  /** 为代码块添加 复制 / 插入笔记 按钮（参照 Continue 代码块操作） */
  addCodeActions(el) {
    el.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".oa-code-actions")) return;
      const bar = document.createElement("div");
      bar.addClass("oa-code-actions");
      const copyBtn = bar.createEl("button", { cls: "oa-code-actions__btn", text: "\u590D\u5236" });
      copyBtn.addEventListener("click", () => {
        var _a;
        const code = pre.querySelector("code");
        void navigator.clipboard.writeText((_a = code == null ? void 0 : code.innerText) != null ? _a : "").then(() => new import_obsidian2.Notice("\u5DF2\u590D\u5236\u4EE3\u7801"));
      });
      const insertBtn = bar.createEl("button", { cls: "oa-code-actions__btn", text: "\u63D2\u5165\u7B14\u8BB0" });
      insertBtn.addEventListener("click", () => {
        var _a;
        const code = pre.querySelector("code");
        this.insertIntoNote((_a = code == null ? void 0 : code.innerText) != null ? _a : "");
      });
      pre.appendChild(bar);
    });
  }
  insertIntoNote(text) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    const editor = view == null ? void 0 : view.editor;
    if (!editor) {
      new import_obsidian2.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u7B14\u8BB0");
      return;
    }
    const cursor = editor.getCursor();
    editor.replaceRange(text + "\n", cursor);
    new import_obsidian2.Notice("\u5DF2\u63D2\u5165\u5230\u5F53\u524D\u7B14\u8BB0");
  }
  // ============ 文件修改审批卡片（Agent 模式） ============
  /** 移除已被识别为编辑块的原始代码块，避免 JSON 与审批卡片同时展示 */
  stripRenderedEditBlocks(container, parsed) {
    const raws = new Set(
      parsed.filter((p) => p.edit !== null).map((p) => p.raw)
    );
    container.querySelectorAll("pre").forEach((pre) => {
      var _a, _b, _c;
      let t = ((_c = (_b = (_a = pre.querySelector("code")) == null ? void 0 : _a.textContent) != null ? _b : pre.textContent) != null ? _c : "").trim();
      const firstLine = t.split("\n", 1)[0].trim();
      if (/^(notepilot|qoder)[-_ ]?edit$/i.test(firstLine)) {
        t = t.slice(firstLine.length).trim();
      }
      if (raws.has(t)) pre.remove();
    });
  }
  renderEditCards(container, text) {
    var _a, _b, _c, _d;
    const parsed = parseEditBlocks(text);
    if (parsed.length > 0) {
      this.stripRenderedEditBlocks(container, parsed);
    }
    if (parsed.length === 0 || container.querySelector(".oa-edit-cards")) {
      return;
    }
    const wrap = container.createDiv({ cls: "oa-edit-cards" });
    const titleEl = wrap.createDiv({
      cls: "oa-edit-cards__title"
    });
    (0, import_obsidian2.setIcon)(titleEl, "pencil");
    titleEl.createSpan({ text: ` \u68C0\u6D4B\u5230 ${parsed.length} \u9879\u6587\u4EF6\u4FEE\u6539\u5EFA\u8BAE\uFF0C\u786E\u8BA4\u540E\u751F\u6548` });
    for (const p of parsed) {
      const card = wrap.createDiv({ cls: "oa-edit-card" });
      if (!p.edit) {
        card.createDiv({
          cls: "oa-edit-card__path",
          text: `\u7F16\u8F91\u5757\u89E3\u6790\u5931\u8D25\uFF1A${(_a = p.error) != null ? _a : "\u672A\u77E5\u9519\u8BEF"}`
        });
        card.createEl("pre", { cls: "oa-edit-card__raw", text: p.raw });
        continue;
      }
      const edit = p.edit;
      const head = card.createDiv({ cls: "oa-edit-card__head" });
      head.createSpan({
        cls: `oa-edit-card__action oa-edit-card__action--${edit.action}`,
        text: edit.action === "replace" ? "\u66FF\u6362" : edit.action === "create" ? "\u65B0\u5EFA" : "\u8986\u5199"
      });
      head.createSpan({ cls: "oa-edit-card__path", text: edit.path });
      const diffEl = card.createDiv({ cls: "oa-edit-card__diff" });
      const addDiffLine = (type, lineText) => {
        const row = diffEl.createDiv({
          cls: `oa-diff__line oa-diff__line--${type}`
        });
        row.createSpan({
          cls: "oa-diff__mark",
          text: type === "add" ? "+" : type === "del" ? "\u2212" : " "
        });
        row.createSpan({ text: lineText || " " });
      };
      if (edit.action === "replace") {
        for (const line of lineDiff((_b = edit.search) != null ? _b : "", (_c = edit.replace) != null ? _c : "")) {
          addDiffLine(line.type, line.text);
        }
      } else {
        const allLines = ((_d = edit.content) != null ? _d : "").split("\n");
        for (const l of allLines.slice(0, 12)) addDiffLine("add", l);
        if (allLines.length > 12) {
          diffEl.createDiv({
            cls: "oa-diff__line",
            text: `...\uFF08\u5171 ${allLines.length} \u884C\uFF09`
          });
        }
      }
      const btnRow = card.createDiv({ cls: "oa-edit-card__btns" });
      const status = btnRow.createSpan({ cls: "oa-edit-card__status" });
      const reject = btnRow.createEl("button", {
        text: "\u62D2\u7EDD",
        cls: "oa-btn--secondary"
      });
      const apply = btnRow.createEl("button", {
        text: "\u5E94\u7528",
        cls: "mod-cta"
      });
      reject.addEventListener("click", () => {
        reject.disabled = true;
        apply.disabled = true;
        status.setText("\u5DF2\u62D2\u7EDD");
      });
      apply.addEventListener("click", () => {
        void (async () => {
          apply.disabled = true;
          try {
            const msg = await applyEdit(this.app, edit);
            status.setText(msg);
            reject.disabled = true;
            new import_obsidian2.Notice(msg);
          } catch (e) {
            status.setText(`\u9519\u8BEF: ${e.message}`);
            apply.disabled = false;
          }
        })();
      });
    }
  }
  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
  setBusy(busy) {
    this.generating = busy;
    this.sendBtn.disabled = busy;
    this.sendBtn.style.display = busy ? "none" : "";
    this.sendBtn.setAttribute("aria-busy", String(busy));
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
    new import_obsidian2.Notice("\u5DF2\u9000\u51FA\u767B\u5F55");
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
    var _a;
    const files = this.app.vault.getMarkdownFiles().filter((f) => !f.path.startsWith(".obsidian/")).filter(
      (f) => query ? (f.basename + f.path).toLowerCase().includes(query.toLowerCase()) : true
    ).slice(0, 20);
    this.popupItems = files;
    this.popupIndex = 0;
    if (!this.popupEl) {
      const target = (_a = this.chatContentEl) != null ? _a : this.containerEl.children[1];
      this.popupEl = target.createDiv({ cls: "oa-popup" });
    }
    this.popupEl.empty();
    if (files.length === 0) {
      this.popupEl.createDiv({
        cls: "oa-popup__item oa-popup__empty",
        text: "\u6CA1\u6709\u5339\u914D\u7684\u7B14\u8BB0"
      });
      return;
    }
    files.forEach((f, idx) => {
      const item = this.popupEl.createDiv({ cls: "oa-popup__item" });
      item.createSpan({ cls: "oa-popup__name", text: f.basename });
      item.createSpan({ cls: "oa-popup__path", text: f.path });
      if (idx === this.popupIndex) item.addClass("oa-popup__item--active");
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.selectAtFile(f);
      });
    });
  }
  highlightPopup() {
    if (!this.popupEl) return;
    this.popupEl.querySelectorAll(".oa-popup__item").forEach((el, idx) => {
      el.toggleClass("oa-popup__item--active", idx === this.popupIndex);
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
    if (!this.chipsEl) return;
    this.chipsEl.empty();
    const hasAny = this.attachedFiles.length > 0 || this.quotedText !== null || this.externalFiles.length > 0;
    if (!hasAny) {
      this.chipsEl.style.display = "none";
      return;
    }
    this.chipsEl.style.display = "";
    if (this.quotedText !== null) {
      const q = this.quotedText;
      const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
      (0, import_obsidian2.setIcon)(chip, "quote");
      chip.createSpan({ text: ` \u5212\u8BCD\u9009\u4E2D\uFF08${q.length} \u5B57\uFF09` });
      chip.setAttribute("title", q.slice(0, 200));
      const x = chip.createSpan({ cls: "oa-chip__remove", text: "\xD7" });
      x.addEventListener("click", () => {
        this.quotedText = null;
        this.renderChips();
      });
    }
    for (const ef of this.externalFiles) {
      const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
      (0, import_obsidian2.setIcon)(chip, "paperclip");
      chip.createSpan({ text: ` ${ef.name}` });
      const x = chip.createSpan({ cls: "oa-chip__remove", text: "\xD7" });
      x.addEventListener("click", () => {
        this.externalFiles = this.externalFiles.filter((f) => f !== ef);
        this.renderChips();
      });
    }
    for (const path of this.attachedFiles) {
      const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
      const name = (_b = (_a = path.split("/").pop()) == null ? void 0 : _a.replace(/\.md$/, "")) != null ? _b : path;
      (0, import_obsidian2.setIcon)(chip, "file-text");
      chip.createSpan({ text: ` ${name}` });
      const x = chip.createSpan({ cls: "oa-chip__remove", text: "\xD7" });
      x.addEventListener("click", () => {
        this.attachedFiles = this.attachedFiles.filter((p) => p !== path);
        this.renderChips();
      });
    }
  }
  // ============ 划词提问与拖拽附加 ============
  /** 划词提问：引用选中文本作为提问上下文（silent 用于自动识别场景，不提示、不抢焦点） */
  attachQuotedText(text, silent = false) {
    this.quotedText = text;
    this.plugin.pendingQuotedText = null;
    this.renderChips();
    if (!silent) {
      if (this.inputEl) this.inputEl.focus();
      new import_obsidian2.Notice("\u5DF2\u5F15\u7528\u9009\u4E2D\u6587\u672C\uFF0C\u8F93\u5165\u95EE\u9898\u540E\u53D1\u9001");
    }
  }
  /** 从 API 拉取当前服务商的可用模型列表并刷新模型下拉框 */
  async refreshModels(modelSelect, refreshBtn) {
    refreshBtn.disabled = true;
    const result = await fetchModels(this.plugin.settings);
    refreshBtn.disabled = false;
    if (!result.ok) {
      new import_obsidian2.Notice(`\u62C9\u53D6\u6A21\u578B\u5217\u8868\u5931\u8D25\uFF1A${result.message}`);
      return;
    }
    this.plugin.availableModels = result.models;
    const current = this.plugin.settings.model;
    const options = result.models.includes(current) ? result.models : [current, ...result.models];
    modelSelect.empty();
    for (const m of options) {
      const opt = modelSelect.createEl("option", { value: m, text: m });
      if (m === current) opt.selected = true;
    }
    new import_obsidian2.Notice(`\u5DF2\u83B7\u53D6 ${result.models.length} \u4E2A\u53EF\u7528\u6A21\u578B`);
  }
  async onDropFiles(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const dt = evt.dataTransfer;
    if (!dt) return;
    if (dt.files.length > 0) {
      for (const f of Array.from(dt.files)) {
        await this.attachExternalFile(f);
      }
      return;
    }
    const plain = dt.getData("text/plain").trim();
    if (!plain) return;
    const file = this.resolveDraggedFile(plain);
    if (file instanceof import_obsidian2.TFile) {
      this.attachVaultFile(file);
    } else {
      new import_obsidian2.Notice(`\u65E0\u6CD5\u8BC6\u522B\u62D6\u5165\u7684\u5185\u5BB9\uFF1A${plain.slice(0, 80)}`);
    }
  }
  /** 解析拖入文本：obsidian://open URI / 纯路径 / 笔记名 → TFile */
  resolveDraggedFile(plain) {
    if (plain.startsWith("obsidian://")) {
      try {
        const url = new URL(plain);
        const file = url.searchParams.get("file");
        if (file) return this.resolvePlainPath(file);
      } catch (e) {
        const idx = plain.indexOf("file=");
        if (idx !== -1) {
          const raw = plain.slice(idx + 5).split("&")[0];
          let decoded = raw;
          try {
            decoded = decodeURIComponent(raw);
          } catch (e2) {
          }
          return this.resolvePlainPath(decoded);
        }
      }
      return null;
    }
    return this.resolvePlainPath(plain);
  }
  /** 依次尝试多种路径解释（+ 可能为路径分隔符或空格），并用笔记名兜底 */
  resolvePlainPath(plain) {
    var _a;
    const candidates = [
      plain,
      plain.replace(/\+/g, "/"),
      plain.replace(/\+/g, " ")
    ];
    for (const c of candidates) {
      const abs = this.app.vault.getAbstractFileByPath(c);
      if (abs instanceof import_obsidian2.TFile) return abs;
      const f = this.app.metadataCache.getFirstLinkpathDest(c, "");
      if (f instanceof import_obsidian2.TFile) return f;
    }
    for (const c of candidates) {
      const name = (_a = c.split("/").pop()) != null ? _a : "";
      if (!name || name === c) continue;
      const f = this.app.metadataCache.getFirstLinkpathDest(name, "");
      if (f instanceof import_obsidian2.TFile) return f;
    }
    return null;
  }
  attachVaultFile(file) {
    if (file.extension === "md") {
      if (!this.attachedFiles.includes(file.path)) {
        this.attachedFiles.push(file.path);
      }
      this.renderChips();
      new import_obsidian2.Notice(`\u5DF2\u9644\u52A0\u7B14\u8BB0\uFF1A${file.basename}`);
      return;
    }
    void this.app.vault.cachedRead(file).then((content) => this.pushExternal(file.name, content)).catch(() => new import_obsidian2.Notice(`\u8BFB\u53D6\u5931\u8D25\uFF1A${file.path}`));
  }
  async attachExternalFile(f) {
    if (f.size > 1024 * 1024) {
      new import_obsidian2.Notice(`\u6587\u4EF6\u8FC7\u5927\uFF08>1MB\uFF09\uFF1A${f.name}`);
      return;
    }
    const textLike = f.type.startsWith("text/") || f.type === "application/json" || /\.(md|txt|markdown|json|csv|tsv|js|ts|css|html|xml|ya?ml)$/i.test(
      f.name
    );
    if (!textLike) {
      new import_obsidian2.Notice(`\u4EC5\u652F\u6301\u9644\u52A0\u6587\u672C\u6587\u4EF6\uFF1A${f.name}`);
      return;
    }
    this.pushExternal(f.name, await f.text());
  }
  pushExternal(name, content) {
    if (!this.externalFiles.some((f) => f.name === name)) {
      this.externalFiles.push({ name, content });
    }
    this.renderChips();
    new import_obsidian2.Notice(`\u5DF2\u9644\u52A0\u6587\u4EF6\uFF1A${name}`);
  }
  // ============ 发送 ============
  async send() {
    var _a, _b;
    let text = this.inputEl.value.trim();
    if (!text || this.abortController) return;
    const settings = this.plugin.settings;
    if (!settings.apiKey) {
      new import_obsidian2.Notice("\u8BF7\u5148\u767B\u5F55");
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
    const quoted = this.quotedText;
    const external = [...this.externalFiles];
    this.attachedFiles = [];
    this.quotedText = null;
    this.externalFiles = [];
    this.renderChips();
    const session = this.plugin.currentSession();
    const userMsg = { role: "user", content: text };
    session.messages.push(userMsg);
    const assistantMsg = { role: "assistant", content: "" };
    session.messages.push(assistantMsg);
    this.renderMessages();
    const assistantEl = this.messagesEl.lastElementChild;
    assistantEl.empty();
    assistantEl.createSpan({ cls: "oa-msg--thinking", text: "\u601D\u8003\u4E2D..." });
    this.setBusy(true);
    const requestMessages = await this.buildRequestMessages(
      attached,
      quoted,
      external
    );
    let acc = "";
    this.abortController = chatCompletion(
      settings,
      requestMessages,
      {
        onToken: (partial) => {
          acc += partial;
          assistantMsg.content = acc;
          assistantEl.empty();
          import_obsidian2.MarkdownRenderer.render(
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
          assistantEl.className = "oa-msg oa-msg--error";
          assistantEl.setText(message);
          new import_obsidian2.Notice(message);
        }
      },
      () => {
        this.abortController = null;
        this.setBusy(false);
        if (!assistantMsg.content) {
          assistantEl.empty();
          assistantEl.setText("\uFF08\u65E0\u5185\u5BB9\uFF09");
        } else {
          this.addCodeActions(assistantEl);
          this.renderEditCards(assistantEl, assistantMsg.content);
        }
        this.plugin.touchSession(session);
        void this.plugin.saveAll();
        this.scrollToBottom();
      }
    );
  }
  /** 组装请求：系统提示 + Rules + 当前笔记 + @引用/划词/拖拽附件 + 历史 */
  async buildRequestMessages(attached, quoted, external) {
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
    if (settings.agentMode) {
      out.push({ role: "system", content: agentToolPrompt(this.app) });
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
      if (file instanceof import_obsidian2.TFile) {
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
    if (quoted) {
      out.push({
        role: "system",
        content: `\u7528\u6237\u5212\u8BCD\u9009\u4E2D\u4E86\u4EE5\u4E0B\u6587\u672C\uFF0C\u8BF7\u56F4\u7ED5\u8BE5\u6587\u672C\u56DE\u7B54\u95EE\u9898\uFF1A
"""
${quoted}
"""`
      });
    }
    for (const ef of external) {
      out.push({
        role: "system",
        content: "```" + ef.name + "\n" + ef.content + "\n```"
      });
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
function selectionAutoQuoteExtension(plugin) {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.timer = null;
      }
      update(u) {
        if (!u.selectionSet && !u.docChanged) return;
        if (this.timer !== null) window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
          const view = u.view;
          const sel = view.state.selection.main;
          if (!view.hasFocus || sel.empty) return;
          const text = view.state.sliceDoc(sel.from, sel.to);
          if (text.trim()) plugin.autoQuoteSelection(text);
        }, 600);
      }
      destroy() {
        if (this.timer !== null) window.clearTimeout(this.timer);
      }
    }
  );
}
var NotePilotPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.sessions = [];
    this.currentSessionId = "";
    this.statusBarEl = null;
    /** 自动识别划词时暂存的选区文本（面板未打开时暂存，面板打开后消费） */
    this.pendingQuotedText = null;
    /** 从 API 拉取到的可用模型列表（null 表示未拉取；切换服务商时清空） */
    this.availableModels = null;
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
      VIEW_TYPE_NOTEPILOT,
      (leaf) => new NotePilotView(leaf, this)
    );
    this.statusBarEl = this.addStatusBarItem();
    this.updateStatusBar();
    this.addRibbonIcon("sparkles", "\u6253\u5F00 ObsidianAI", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-notepilot",
      name: "\u6253\u5F00 ObsidianAI \u9762\u677F",
      callback: () => void this.activateView()
    });
    this.addCommand({
      id: "new-notepilot-chat",
      name: "\u65B0\u5EFA ObsidianAI \u5BF9\u8BDD",
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
      id: "ask-selection",
      name: "\u5212\u8BCD\u63D0\u95EE\uFF1A\u5C31\u9009\u4E2D\u6587\u672C\u63D0\u95EE",
      editorCallback: (editor) => {
        const sel = editor.getSelection();
        if (!sel.trim()) {
          new import_obsidian3.Notice("\u8BF7\u5148\u9009\u4E2D\u6587\u672C");
          return;
        }
        void this.askSelection(sel);
      }
    });
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        const sel = editor.getSelection();
        if (!sel.trim()) return;
        menu.addItem((item) => {
          item.setTitle("ObsidianAI\uFF1A\u5212\u8BCD\u63D0\u95EE").setIcon("quote").onClick(() => void this.askSelection(sel));
        });
      })
    );
    this.addCommand({
      id: "logout-notepilot-chat",
      name: "\u9000\u51FA ObsidianAI \u767B\u5F55",
      callback: () => {
        this.settings.apiKey = "";
        void this.saveAll();
        this.updateStatusBar();
        this.refreshView();
        new import_obsidian3.Notice("\u5DF2\u9000\u51FA ObsidianAI \u767B\u5F55");
      }
    });
    this.addSettingTab(new NotePilotSettingTab(this.app, this));
    this.registerEditorExtension(selectionAutoQuoteExtension(this));
  }
  updateStatusBar() {
    if (!this.statusBarEl) return;
    if (this.isLoggedIn()) {
      this.statusBarEl.setText(
        `ObsidianAI \xB7 \u5DF2\u767B\u5F55 \xB7 ${this.settings.model}`
      );
    } else {
      this.statusBarEl.setText("ObsidianAI \xB7 \u672A\u767B\u5F55");
    }
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NOTEPILOT);
  }
  async activateView() {
    var _a;
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_NOTEPILOT)[0];
    if (!leaf) {
      leaf = (_a = workspace.getRightLeaf(false)) != null ? _a : void 0;
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_NOTEPILOT,
          active: true
        });
      }
    }
    if (leaf) workspace.revealLeaf(leaf);
  }
  /** 划词提问：打开面板并将选中文本引用到输入框 */
  async askSelection(text) {
    await this.activateView();
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEPILOT)[0];
    const view = leaf == null ? void 0 : leaf.view;
    view == null ? void 0 : view.attachQuotedText(text);
  }
  /** 自动识别划词：记录选区文本并同步到已打开的面板（不抢焦点、不提示） */
  autoQuoteSelection(text) {
    this.pendingQuotedText = text;
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEPILOT)[0];
    const view = leaf == null ? void 0 : leaf.view;
    view == null ? void 0 : view.attachQuotedText(text, true);
  }
  refreshView() {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_NOTEPILOT)[0];
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
      new import_obsidian3.Notice("\u8BF7\u5148\u767B\u5F55 ObsidianAI");
      return;
    }
    const sel = editor.getSelection();
    if (!sel.trim()) {
      new import_obsidian3.Notice("\u8BF7\u5148\u5728\u7F16\u8F91\u5668\u4E2D\u9009\u4E2D\u8981\u6539\u5199\u7684\u6587\u672C");
      return;
    }
    const instruction = await new InstructionModal(this.app).openAndWait();
    if (instruction === null) return;
    new import_obsidian3.Notice("ObsidianAI \u6B63\u5728\u6539\u5199...");
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
      new import_obsidian3.Notice(`\u6539\u5199\u5931\u8D25\uFF1A${e.message}`);
      return;
    }
    result = stripFences(result.trim());
    if (!result) {
      new import_obsidian3.Notice("\u6A21\u578B\u672A\u8FD4\u56DE\u6709\u6548\u5185\u5BB9");
      return;
    }
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const accept = await new DiffModal(this.app, sel, result).openAndWait();
    if (accept) {
      editor.replaceRange(result, from, to);
      new import_obsidian3.Notice("\u5DF2\u5E94\u7528\u6539\u5199");
    } else {
      new import_obsidian3.Notice("\u5DF2\u53D6\u6D88");
    }
  }
};
function stripFences(text) {
  const m = text.match(/^```[\w-]*\r?\n([\s\S]*?)\r?\n```$/);
  return m ? m[1] : text;
}
var InstructionModal = class extends import_obsidian3.Modal {
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
    contentEl.addClass("oa-modal");
    contentEl.createEl("h3", { cls: "oa-modal__title", text: "Inline Chat\uFF1A\u5982\u4F55\u6539\u5199\u9009\u4E2D\u6587\u672C\uFF1F" });
    const input = contentEl.createEl("textarea", {
      cls: "oa-modal__body",
      attr: {
        placeholder: "\u4F8B\u5982\uFF1A\u6DA6\u8272\u8BED\u8A00 / \u7FFB\u8BD1\u6210\u82F1\u6587 / \u7CBE\u7B80\u4E3A 3 \u53E5\u8BDD...",
        rows: "3"
      }
    });
    const row = contentEl.createDiv({ cls: "oa-modal__actions" });
    const cancel = row.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "oa-btn--secondary"
    });
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
var DiffModal = class extends import_obsidian3.Modal {
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
    contentEl.addClass("oa-modal");
    contentEl.createEl("h3", { cls: "oa-modal__title", text: "\u6539\u52A8\u9884\u89C8\uFF08Diff\uFF09" });
    const diffEl = contentEl.createDiv({ cls: "oa-diff" });
    for (const line of lineDiff(this.oldText, this.newText)) {
      const row2 = diffEl.createDiv({ cls: `oa-diff__line oa-diff__line--${line.type}` });
      const mark = line.type === "add" ? "+" : line.type === "del" ? "\u2212" : " ";
      row2.createSpan({ cls: "oa-diff__mark", text: mark });
      row2.createSpan({ text: line.text || " " });
    }
    const row = contentEl.createDiv({ cls: "oa-modal__actions" });
    const reject = row.createEl("button", {
      text: "\u62D2\u7EDD",
      cls: "oa-btn--secondary"
    });
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
var NotePilotSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "ObsidianAI \u8BBE\u7F6E" });
    new import_obsidian3.Setting(containerEl).setName("\u767B\u5F55\u72B6\u6001").setDesc(
      this.plugin.isLoggedIn() ? `\u5DF2\u767B\u5F55\uFF08\u6A21\u578B\uFF1A${this.plugin.settings.model}\uFF09` : "\u672A\u767B\u5F55\uFF0C\u8BF7\u5728\u804A\u5929\u9762\u677F\u767B\u5F55\u9875\u8F93\u5165\u51ED\u8BC1"
    );
    new import_obsidian3.Setting(containerEl).setName("\u670D\u52A1\u5546\u9884\u8BBE").setDesc("\u9009\u62E9\u540E\u81EA\u52A8\u586B\u5145\u5BF9\u5E94\u7684 Base URL \u4E0E\u9ED8\u8BA4\u6A21\u578B").addDropdown((dropdown) => {
      const options = {};
      for (const [k, v] of Object.entries(PROVIDER_PRESETS)) {
        options[k] = v.label;
      }
      return dropdown.addOptions(options).setValue(this.plugin.settings.provider).onChange(async (value) => {
        this.plugin.settings.provider = value;
        const preset = PROVIDER_PRESETS[value];
        if (preset.baseUrl) this.plugin.settings.baseUrl = preset.baseUrl;
        if (preset.model) this.plugin.settings.model = preset.model;
        this.plugin.availableModels = null;
        await this.plugin.saveAll();
        this.display();
      });
    });
    const formatLabels = {
      openai: "OpenAI \u517C\u5BB9\u534F\u8BAE",
      anthropic: "Anthropic \u539F\u751F\u534F\u8BAE",
      gemini: "Gemini \u539F\u751F\u534F\u8BAE"
    };
    new import_obsidian3.Setting(containerEl).setName("Base URL").setDesc(
      `\u63A5\u53E3\u5730\u5740\uFF08\u5F53\u524D\u534F\u8BAE\uFF1A${formatLabels[PROVIDER_PRESETS[this.plugin.settings.provider].format]}\uFF09`
    ).addText(
      (text) => text.setPlaceholder("https://.../v1").setValue(this.plugin.settings.baseUrl).onChange(async (value) => {
        this.plugin.settings.baseUrl = value.trim();
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("API Key").setDesc("BYOK\uFF1A\u4F60\u81EA\u5DF1\u7684\u5BC6\u94A5\uFF0C\u4EC5\u4FDD\u5B58\u5728\u672C\u5730").addText((text) => {
      text.inputEl.type = "password";
      text.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value.trim();
        await this.plugin.saveAll();
      });
    });
    new import_obsidian3.Setting(containerEl).setName("\u6A21\u578B").setDesc(
      this.plugin.settings.provider === "custom" ? "\u81EA\u5B9A\u4E49\u670D\u52A1\u5546\u7684\u6A21\u578B\u540D\u79F0\uFF0C\u8BF7\u624B\u52A8\u586B\u5199" : "\u4F8B\u5982 qwen3.7-plus / gpt-4o-mini / gemini-2.5-flash"
    ).addText(
      (text) => text.setPlaceholder("\u6A21\u578B\u540D\u79F0").setValue(this.plugin.settings.model).onChange(async (value) => {
        this.plugin.settings.model = value.trim();
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u7CFB\u7EDF\u63D0\u793A\u8BCD").setDesc("\u5B9A\u4E49\u52A9\u624B\u7684\u89D2\u8272\u4E0E\u56DE\u7B54\u98CE\u683C").addTextArea((text) => {
      text.inputEl.rows = 4;
      text.inputEl.cols = 40;
      text.setValue(this.plugin.settings.systemPrompt).onChange(async (value) => {
        this.plugin.settings.systemPrompt = value;
        await this.plugin.saveAll();
      });
    });
    new import_obsidian3.Setting(containerEl).setName("\u542F\u7528 Rules \u89C4\u5219\u6587\u4EF6").setDesc(`\u8BFB\u53D6\u5E93\u6839\u76EE\u5F55 .notepilot-rules/*.md \u4E2D\u7684\u89C4\u5219\uFF0C\u81EA\u52A8\u6CE8\u5165\u5BF9\u8BDD\uFF08\u53C2\u7167 Continue \u7684 rules \u673A\u5236\uFF09`).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.rulesEnabled).onChange(async (value) => {
        this.plugin.settings.rulesEnabled = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u6D41\u5F0F\u8F93\u51FA").setDesc("\u9010\u5B57\u8F93\u51FA\u56DE\u590D\uFF08\u63A8\u8350\u5F00\u542F\uFF09").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stream).onChange(async (value) => {
        this.plugin.settings.stream = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u643A\u5E26\u5F53\u524D\u7B14\u8BB0\u4E0A\u4E0B\u6587").setDesc("\u63D0\u95EE\u65F6\u81EA\u52A8\u9644\u5E26\u5F53\u524D\u6253\u5F00\u7B14\u8BB0\u7684\u5185\u5BB9").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeActiveNote).onChange(async (value) => {
        this.plugin.settings.includeActiveNote = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Temperature").setDesc("\u751F\u6210\u968F\u673A\u6027\uFF080 - 2\uFF09").addSlider(
      (slider) => slider.setLimits(0, 2, 0.1).setValue(this.plugin.settings.temperature).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.temperature = value;
        await this.plugin.saveAll();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("\u7B14\u8BB0\u4E0A\u4E0B\u6587\u6700\u5927\u5B57\u7B26\u6570").setDesc("\u8D85\u51FA\u90E8\u5206\u5C06\u88AB\u622A\u65AD").addText(
      (text) => text.setPlaceholder("8000").setValue(String(this.plugin.settings.maxNoteChars)).onChange(async (value) => {
        const n = parseInt(value, 10);
        if (!isNaN(n) && n > 0) {
          this.plugin.settings.maxNoteChars = n;
          await this.plugin.saveAll();
        }
      })
    );
    containerEl.createEl("p", {
      cls: "oa-settings__notice",
      text: "\u8BF4\u660E\uFF1A\u672C\u63D2\u4EF6\u4E3A ObsidianAI \u7684\u72EC\u7ACB\u5B9E\u73B0\uFF0C\u754C\u9762\u4E0E\u4EA4\u4E92\u53C2\u7167\u5F00\u6E90\u9879\u76EE Continue\uFF08Apache 2.0\uFF09\u3002BYOK \u6A21\u5F0F\u9700\u8981\u4F60\u81EA\u5DF1\u63D0\u4F9B\u5927\u6A21\u578B API\uFF0C\u5BC6\u94A5\u4EC5\u5B58\u50A8\u5728\u672C\u673A Obsidian \u914D\u7F6E\u4E2D\u3002"
    });
  }
  hide() {
    super.hide();
    this.plugin.updateStatusBar();
    this.plugin.refreshView();
  }
};
