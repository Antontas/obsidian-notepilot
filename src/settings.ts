// NotePilot —— 设置类型与默认值

import { ChatSession } from "./sessions";

export interface StoredData {
	settings: NotePilotSettings;
	sessions: ChatSession[];
	currentSessionId: string;
}

/** 支持的服务商（OpenAI 兼容 + Anthropic / Gemini 原生协议） */
export type Provider =
	| "openai"
	| "dashscope"
	| "deepseek"
	| "moonshot"
	| "zhipu"
	| "siliconflow"
	| "ollama"
	| "openrouter"
	| "groq"
	| "custom"
	| "anthropic"
	| "gemini";

/** API 协议格式：OpenAI 兼容 / Anthropic 原生 / Gemini 原生 */
export type ApiFormat = "openai" | "anthropic" | "gemini";

export interface NotePilotSettings {
	provider: Provider;
	baseUrl: string;
	apiKey: string;
	model: string;
	systemPrompt: string;
	temperature: number;
	maxTokens: number;
	stream: boolean;
	includeActiveNote: boolean;
	maxNoteChars: number;
	rulesEnabled: boolean;
	agentMode: boolean;
}

export interface ProviderPreset {
	baseUrl: string;
	model: string;
	label: string;
	/** 获取 API Key 的页面（本地/自定义服务可留空） */
	keyUrl: string;
	/** 协议格式 */
	format: ApiFormat;
}

export const PROVIDER_PRESETS: Record<Provider, ProviderPreset> = {
	dashscope: {
		baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
		model: "qwen3.7-plus",
		label: "阿里云百炼 DashScope",
		keyUrl: "https://bailian.console.aliyun.com/",
		format: "openai",
	},
	openai: {
		baseUrl: "https://api.openai.com/v1",
		model: "gpt-4o-mini",
		label: "OpenAI",
		keyUrl: "https://platform.openai.com/api-keys",
		format: "openai",
	},
	deepseek: {
		baseUrl: "https://api.deepseek.com/v1",
		model: "deepseek-chat",
		label: "DeepSeek 深度求索",
		keyUrl: "https://platform.deepseek.com/",
		format: "openai",
	},
	moonshot: {
		baseUrl: "https://api.moonshot.cn/v1",
		model: "moonshot-v1-8k",
		label: "Moonshot Kimi",
		keyUrl: "https://platform.moonshot.cn/",
		format: "openai",
	},
	zhipu: {
		baseUrl: "https://open.bigmodel.cn/api/paas/v4",
		model: "glm-4-flash",
		label: "智谱 GLM",
		keyUrl: "https://open.bigmodel.cn/",
		format: "openai",
	},
	siliconflow: {
		baseUrl: "https://api.siliconflow.cn/v1",
		model: "deepseek-ai/DeepSeek-V3",
		label: "硅基流动 SiliconFlow",
		keyUrl: "https://cloud.siliconflow.cn/",
		format: "openai",
	},
	ollama: {
		baseUrl: "http://localhost:11434/v1",
		model: "llama3.2",
		label: "Ollama 本地服务",
		keyUrl: "https://ollama.com/",
		format: "openai",
	},
	openrouter: {
		baseUrl: "https://openrouter.ai/api/v1",
		model: "anthropic/claude-3.5-sonnet",
		label: "OpenRouter",
		keyUrl: "https://openrouter.ai/keys",
		format: "openai",
	},
	groq: {
		baseUrl: "https://api.groq.com/openai/v1",
		model: "llama-3.3-70b-versatile",
		label: "Groq",
		keyUrl: "https://console.groq.com/keys",
		format: "openai",
	},
	custom: {
		baseUrl: "",
		model: "",
		label: "自定义服务商（OpenAI 兼容）",
		keyUrl: "",
		format: "openai",
	},
	anthropic: {
		baseUrl: "https://api.anthropic.com",
		model: "claude-sonnet-4-5",
		label: "Anthropic Claude（原生协议）",
		keyUrl: "https://console.anthropic.com/",
		format: "anthropic",
	},
	gemini: {
		baseUrl: "https://generativelanguage.googleapis.com",
		model: "gemini-2.5-flash",
		label: "Google Gemini（原生协议）",
		keyUrl: "https://aistudio.google.com/apikey",
		format: "gemini",
	},
};

export const PROVIDER_MODELS: Record<Provider, string[]> = {
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
		"glm-5.2",
	],
	openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o3-mini"],
	deepseek: ["deepseek-chat", "deepseek-reasoner"],
	moonshot: [
		"moonshot-v1-8k",
		"moonshot-v1-32k",
		"moonshot-v1-128k",
		"kimi-k2-0711-preview",
	],
	zhipu: ["glm-4-flash", "glm-4-plus", "glm-4-air", "glm-5.2"],
	siliconflow: [
		"deepseek-ai/DeepSeek-V3",
		"Qwen/Qwen2.5-72B-Instruct",
		"THUDM/glm-4-9b-chat",
	],
	ollama: ["llama3.2", "qwen2.5:7b", "deepseek-r1:7b", "mistral"],
	openrouter: [
		"anthropic/claude-3.5-sonnet",
		"openai/gpt-4o",
		"google/gemini-2.0-flash-001",
		"deepseek/deepseek-chat",
	],
	groq: [
		"llama-3.3-70b-versatile",
		"llama-3.1-8b-instant",
		"mixtral-8x7b-32768",
	],
	custom: [],
	anthropic: [
		"claude-sonnet-4-5",
		"claude-opus-4-1",
		"claude-3-7-sonnet-latest",
		"claude-3-5-haiku-latest",
	],
	gemini: [
		"gemini-2.5-flash",
		"gemini-2.5-pro",
		"gemini-2.0-flash",
		"gemini-2.0-flash-lite",
	],
};

export const SUGGESTIONS: { title: string; prompt: string }[] = [
	{ title: "总结笔记", prompt: "请总结当前笔记的核心要点，用简洁的条目列出。" },
	{ title: "润色笔记", prompt: "请帮我润色当前笔记，保持原意，使语言更流畅专业。" },
	{ title: "生成大纲", prompt: "请根据当前笔记内容生成一份结构化大纲。" },
	{ title: "翻译笔记", prompt: "请将当前笔记翻译成英文，保持 Markdown 格式。" },
];

export const DEFAULT_SETTINGS: NotePilotSettings = {
	provider: "dashscope",
	baseUrl: PROVIDER_PRESETS.dashscope.baseUrl,
	apiKey: "",
	model: PROVIDER_PRESETS.dashscope.model,
	systemPrompt:
		"你是 ObsidianAI，一个集成在 Obsidian 中的 AI 编程与写作助手。请用中文回答，回答简洁、准确，必要时使用 Markdown 格式。",
	temperature: 0.7,
	maxTokens: 2048,
	stream: true,
	includeActiveNote: true,
	maxNoteChars: 8000,
	rulesEnabled: true,
	agentMode: false,
};
