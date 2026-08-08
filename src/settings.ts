// Qoder Chat —— 设置类型与默认值

import { ChatSession } from "./sessions";

export interface StoredData {
	settings: QoderChatSettings;
	sessions: ChatSession[];
	currentSessionId: string;
}

export interface QoderChatSettings {
	provider: "openai" | "dashscope";
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
}

export const PROVIDER_PRESETS: Record<
	"openai" | "dashscope",
	{ baseUrl: string; model: string; label: string }
> = {
	openai: {
		baseUrl: "https://api.openai.com/v1",
		model: "gpt-4o-mini",
		label: "OpenAI 兼容接口",
	},
	dashscope: {
		baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
		model: "qwen3.7-plus",
		label: "阿里云百炼 DashScope",
	},
};

export const PROVIDER_MODELS: Record<"openai" | "dashscope", string[]> = {
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
};

export const SUGGESTIONS: { title: string; prompt: string }[] = [
	{ title: "总结笔记", prompt: "请总结当前笔记的核心要点，用简洁的条目列出。" },
	{ title: "润色笔记", prompt: "请帮我润色当前笔记，保持原意，使语言更流畅专业。" },
	{ title: "生成大纲", prompt: "请根据当前笔记内容生成一份结构化大纲。" },
	{ title: "翻译笔记", prompt: "请将当前笔记翻译成英文，保持 Markdown 格式。" },
];

export const DEFAULT_SETTINGS: QoderChatSettings = {
	provider: "dashscope",
	baseUrl: PROVIDER_PRESETS.dashscope.baseUrl,
	apiKey: "",
	model: PROVIDER_PRESETS.dashscope.model,
	systemPrompt:
		"你是 Qoder Chat，一个集成在 Obsidian 中的 AI 编程与写作助手。请用中文回答，回答简洁、准确，必要时使用 Markdown 格式。",
	temperature: 0.7,
	maxTokens: 2048,
	stream: true,
	includeActiveNote: true,
	maxNoteChars: 8000,
	rulesEnabled: true,
};
