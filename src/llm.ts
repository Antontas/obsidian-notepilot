// Qoder Chat —— 多协议大模型客户端
// 支持 OpenAI 兼容 / Anthropic 原生 / Gemini 原生三种协议，均支持流式 SSE

import { ApiFormat, PROVIDER_PRESETS, QoderChatSettings } from "./settings";

export interface LlmRequestMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface LlmCallbacks {
	onToken: (partialText: string) => void;
	onError: (message: string) => void;
}

/** 当前服务商使用的协议格式 */
export function apiFormatOf(settings: QoderChatSettings): ApiFormat {
	return PROVIDER_PRESETS[settings.provider].format;
}

// ============ 登录验证 ============

/**
 * 登录验证：按协议格式分发，校验 API Key 是否有效。
 */
export async function verifyApiKey(
	settings: QoderChatSettings
): Promise<{ ok: boolean; message: string }> {
	switch (apiFormatOf(settings)) {
		case "anthropic":
			return verifyAnthropic(settings);
		case "gemini":
			return verifyGemini(settings);
		default:
			return verifyOpenAI(settings);
	}
}

/** OpenAI 兼容协议：优先 /models 接口，不存在则回退为最小对话请求 */
async function verifyOpenAI(
	settings: QoderChatSettings
): Promise<{ ok: boolean; message: string }> {
	const base = settings.baseUrl.replace(/\/+$/, "");
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${settings.apiKey}`,
	};

	try {
		const resp = await fetch(base + "/models", { headers });
		if (resp.ok) {
			return { ok: true, message: "登录成功" };
		}
		if (resp.status === 401 || resp.status === 403) {
			return { ok: false, message: `API Key 无效或无权访问（${resp.status}）` };
		}
		if (resp.status !== 404) {
			return { ok: false, message: `验证失败（HTTP ${resp.status}）` };
		}
	} catch (e) {
		return { ok: false, message: `网络请求失败：${(e as Error).message}` };
	}

	// /models 不存在，回退为最小对话验证
	try {
		const resp = await fetch(base + "/chat/completions", {
			method: "POST",
			headers,
			body: JSON.stringify({
				model: settings.model,
				messages: [{ role: "user", content: "hi" }],
				max_tokens: 1,
				stream: false,
			}),
		});
		if (resp.ok) return { ok: true, message: "登录成功" };
		if (resp.status === 401 || resp.status === 403) {
			return { ok: false, message: `API Key 无效或无权访问（${resp.status}）` };
		}
		let detail = "";
		try {
			const body = await resp.json();
			detail = body?.error?.message || "";
		} catch {
			// ignore
		}
		return { ok: false, message: `验证失败（HTTP ${resp.status}）${detail ? "：" + detail : ""}` };
	} catch (e) {
		return { ok: false, message: `网络请求失败：${(e as Error).message}` };
	}
}

/** Anthropic 原生协议：GET /v1/models，x-api-key 认证 */
async function verifyAnthropic(
	settings: QoderChatSettings
): Promise<{ ok: boolean; message: string }> {
	const base = settings.baseUrl.replace(/\/+$/, "");
	const headers = {
		"x-api-key": settings.apiKey,
		"anthropic-version": "2023-06-01",
	};

	try {
		const resp = await fetch(base + "/v1/models", { headers });
		if (resp.ok) return { ok: true, message: "登录成功" };
		if (resp.status === 401 || resp.status === 403) {
			return { ok: false, message: `API Key 无效或无权访问（${resp.status}）` };
		}
		let detail = "";
		try {
			const body = await resp.json();
			detail = body?.error?.message || "";
		} catch {
			// ignore
		}
		return { ok: false, message: `验证失败（HTTP ${resp.status}）${detail ? "：" + detail : ""}` };
	} catch (e) {
		return { ok: false, message: `网络请求失败：${(e as Error).message}` };
	}
}

/** Gemini 原生协议：GET /v1beta/models?key=... */
async function verifyGemini(
	settings: QoderChatSettings
): Promise<{ ok: boolean; message: string }> {
	const base = settings.baseUrl.replace(/\/+$/, "");
	try {
		const resp = await fetch(
			base + "/v1beta/models?key=" + encodeURIComponent(settings.apiKey)
		);
		if (resp.ok) return { ok: true, message: "登录成功" };
		if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
			return { ok: false, message: `API Key 无效（HTTP ${resp.status}）` };
		}
		let detail = "";
		try {
			const body = await resp.json();
			detail = body?.error?.message || "";
		} catch {
			// ignore
		}
		return { ok: false, message: `验证失败（HTTP ${resp.status}）${detail ? "：" + detail : ""}` };
	} catch (e) {
		return { ok: false, message: `网络请求失败：${(e as Error).message}` };
	}
}

// ============ 对话调用（统一入口，按协议分发） ============

export function chatCompletion(
	settings: QoderChatSettings,
	messages: LlmRequestMessage[],
	callbacks: LlmCallbacks,
	onDone: () => void
): AbortController {
	switch (apiFormatOf(settings)) {
		case "anthropic":
			return anthropicCompletion(settings, messages, callbacks, onDone);
		case "gemini":
			return geminiCompletion(settings, messages, callbacks, onDone);
		default:
			return openAICompletion(settings, messages, callbacks, onDone);
	}
}

// ============ OpenAI 兼容协议 ============

/**
 * 调用 OpenAI 兼容的 chat/completions 接口。
 * 支持流式（SSE data: 行）与非流式两种模式，返回 AbortController 以便中断。
 */
function openAICompletion(
	settings: QoderChatSettings,
	messages: LlmRequestMessage[],
	callbacks: LlmCallbacks,
	onDone: () => void
): AbortController {
	const controller = new AbortController();

	const run = async () => {
		const url = settings.baseUrl.replace(/\/+$/, "") + "/chat/completions";
		let resp: Response;
		try {
			resp = await fetch(url, {
				method: "POST",
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${settings.apiKey}`,
				},
				body: JSON.stringify({
					model: settings.model,
					messages,
					temperature: settings.temperature,
					max_tokens: settings.maxTokens,
					stream: settings.stream,
				}),
			});
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`网络请求失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		if (!resp.ok) {
			callbacks.onError(`接口错误 ${resp.status}：${await errorDetail(resp)}`);
			onDone();
			return;
		}

		if (!settings.stream || !resp.body) {
			try {
				const data = await resp.json();
				const text = data?.choices?.[0]?.message?.content ?? "(空回复)";
				callbacks.onToken(text);
			} catch (e) {
				callbacks.onError(`解析响应失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		// 流式解析 SSE
		const reader = resp.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith("data:")) continue;
					const payload = trimmed.slice(5).trim();
					if (payload === "[DONE]") continue;
					try {
						const json = JSON.parse(payload);
						const delta = json?.choices?.[0]?.delta?.content;
						if (typeof delta === "string" && delta.length > 0) {
							callbacks.onToken(delta);
						}
					} catch {
						// 忽略不完整的分片
					}
				}
			}
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`流式读取中断：${(e as Error).message}`);
			}
		}
		onDone();
	};

	run();
	return controller;
}

// ============ Anthropic 原生协议 ============

/**
 * 调用 Anthropic Messages API（POST {base}/v1/messages）。
 * 认证头 x-api-key + anthropic-version；system 独立字段；
 * 流式为 SSE，content_block_delta 事件的 delta.text 为增量文本。
 */
function anthropicCompletion(
	settings: QoderChatSettings,
	messages: LlmRequestMessage[],
	callbacks: LlmCallbacks,
	onDone: () => void
): AbortController {
	const controller = new AbortController();

	const run = async () => {
		const base = settings.baseUrl.replace(/\/+$/, "");
		const system = messages
			.filter((m) => m.role === "system")
			.map((m) => m.content)
			.join("\n\n");
		const turns = normalizeTurns(messages.filter((m) => m.role !== "system"));

		let resp: Response;
		try {
			resp = await fetch(base + "/v1/messages", {
				method: "POST",
				signal: controller.signal,
				headers: {
					"Content-Type": "application/json",
					"x-api-key": settings.apiKey,
					"anthropic-version": "2023-06-01",
				},
				body: JSON.stringify({
					model: settings.model,
					max_tokens: settings.maxTokens,
					temperature: settings.temperature,
					...(system ? { system } : {}),
					messages: turns,
					stream: settings.stream,
				}),
			});
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`网络请求失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		if (!resp.ok) {
			callbacks.onError(`接口错误 ${resp.status}：${await errorDetail(resp)}`);
			onDone();
			return;
		}

		if (!settings.stream || !resp.body) {
			try {
				const data = await resp.json();
				const blocks: { type?: string; text?: string }[] = data?.content ?? [];
				const text = blocks
					.filter((b) => b.type === "text" && typeof b.text === "string")
					.map((b) => b.text)
					.join("");
				callbacks.onToken(text || "(空回复)");
			} catch (e) {
				callbacks.onError(`解析响应失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		// 流式解析 SSE（事件：content_block_delta → delta.text）
		const reader = resp.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith("data:")) continue;
					const payload = trimmed.slice(5).trim();
					try {
						const json = JSON.parse(payload);
						const delta = json?.delta?.text;
						if (
							json?.type === "content_block_delta" &&
							typeof delta === "string" &&
							delta.length > 0
						) {
							callbacks.onToken(delta);
						}
					} catch {
						// 忽略不完整的分片
					}
				}
			}
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`流式读取中断：${(e as Error).message}`);
			}
		}
		onDone();
	};

	run();
	return controller;
}

// ============ Gemini 原生协议 ============

/**
 * 调用 Google Gemini API（:generateContent / :streamGenerateContent?alt=sse）。
 * 认证走 ?key= 查询参数；system → systemInstruction，assistant → model。
 */
function geminiCompletion(
	settings: QoderChatSettings,
	messages: LlmRequestMessage[],
	callbacks: LlmCallbacks,
	onDone: () => void
): AbortController {
	const controller = new AbortController();

	const run = async () => {
		const base = settings.baseUrl.replace(/\/+$/, "");
		const system = messages
			.filter((m) => m.role === "system")
			.map((m) => m.content)
			.join("\n\n");
		const contents = normalizeTurns(messages.filter((m) => m.role !== "system")).map(
			(m) => ({
				role: m.role === "assistant" ? "model" : "user",
				parts: [{ text: m.content }],
			})
		);

		const action = settings.stream ? "streamGenerateContent" : "generateContent";
		const query = `?key=${encodeURIComponent(settings.apiKey)}${settings.stream ? "&alt=sse" : ""}`;
		const url = `${base}/v1beta/models/${encodeURIComponent(settings.model)}:${action}${query}`;

		let resp: Response;
		try {
			resp = await fetch(url, {
				method: "POST",
				signal: controller.signal,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
					contents,
					generationConfig: {
						temperature: settings.temperature,
						maxOutputTokens: settings.maxTokens,
					},
				}),
			});
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`网络请求失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		if (!resp.ok) {
			callbacks.onError(`接口错误 ${resp.status}：${await errorDetail(resp)}`);
			onDone();
			return;
		}

		if (!settings.stream || !resp.body) {
			try {
				const data = await resp.json();
				callbacks.onToken(geminiExtractText(data) || "(空回复)");
			} catch (e) {
				callbacks.onError(`解析响应失败：${(e as Error).message}`);
			}
			onDone();
			return;
		}

		// 流式解析 SSE（alt=sse 模式，data: 行为 JSON 分片）
		const reader = resp.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed.startsWith("data:")) continue;
					const payload = trimmed.slice(5).trim();
					try {
						const json = JSON.parse(payload);
						const text = geminiExtractText(json);
						if (text.length > 0) callbacks.onToken(text);
					} catch {
						// 忽略不完整的分片
					}
				}
			}
		} catch (e) {
			if ((e as Error).name !== "AbortError") {
				callbacks.onError(`流式读取中断：${(e as Error).message}`);
			}
		}
		onDone();
	};

	run();
	return controller;
}

// ============ 工具函数 ============

/** 从响应中提取错误详情（OpenAI/Anthropic/Gemini 均为 error.message 结构） */
async function errorDetail(resp: Response): Promise<string> {
	try {
		const body = await resp.json();
		return body?.error?.message || JSON.stringify(body);
	} catch {
		return await resp.text().catch(() => "");
	}
}

/** 合并连续同角色消息，并保证以 user 开头（Anthropic/Gemini 均要求 user↔assistant 交替） */
function normalizeTurns(messages: LlmRequestMessage[]): LlmRequestMessage[] {
	const out: LlmRequestMessage[] = [];
	for (const m of messages) {
		const last = out[out.length - 1];
		if (last && last.role === m.role) {
			last.content += "\n\n" + m.content;
		} else {
			out.push({ role: m.role, content: m.content });
		}
	}
	if (out[0]?.role !== "user") {
		out.unshift({ role: "user", content: "（继续）" });
	}
	return out;
}

/** 从 Gemini 响应中提取文本（candidates[0].content.parts[].text） */
function geminiExtractText(json: unknown): string {
	const data = json as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const parts = data?.candidates?.[0]?.content?.parts ?? [];
	return parts
		.filter((p) => typeof p?.text === "string")
		.map((p) => p?.text)
		.join("");
}
