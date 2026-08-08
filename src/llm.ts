// Qoder Chat —— OpenAI 兼容协议客户端（支持流式 SSE）

import { QoderChatSettings } from "./settings";

export interface LlmRequestMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface LlmCallbacks {
	onToken: (partialText: string) => void;
	onError: (message: string) => void;
}

/**
 * 登录验证：校验 API Key 是否有效。
 * 优先调用 /models 接口；若接口不存在则回退为一次最小化对话请求。
 */
export async function verifyApiKey(
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

/**
 * 调用 OpenAI 兼容的 chat/completions 接口。
 * 支持流式（SSE data: 行）与非流式两种模式，返回 AbortController 以便中断。
 */
export function chatCompletion(
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
			let detail = "";
			try {
				const body = await resp.json();
				detail = body?.error?.message || JSON.stringify(body);
			} catch {
				detail = await resp.text().catch(() => "");
			}
			callbacks.onError(`接口错误 ${resp.status}：${detail}`);
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
