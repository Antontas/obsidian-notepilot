// 会话管理 —— 参照 Continue 的 session 模型（id/title/messages/时间戳）

export interface ChatMessage {
	role: "user" | "assistant" | "error";
	content: string;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: number;
	updatedAt: number;
}

export function genSessionId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createSession(): ChatSession {
	const now = Date.now();
	return {
		id: genSessionId(),
		title: "新对话",
		messages: [],
		createdAt: now,
		updatedAt: now,
	};
}

/** 用第一条用户消息生成会话标题（截断 30 字） */
export function deriveTitle(session: ChatSession): void {
	if (session.title !== "新对话") return;
	const first = session.messages.find((m) => m.role === "user");
	if (first) {
		const text = first.content.replace(/\s+/g, " ").trim();
		session.title = text.length > 30 ? text.slice(0, 30) + "…" : text || "新对话";
	}
}

/** 导出会话为 Markdown（参照 Continue 的 Save Chat as Markdown） */
export function sessionToMarkdown(session: ChatSession): string {
	const lines: string[] = [`# ${session.title}`, ""];
	for (const m of session.messages) {
		if (m.role === "user") {
			lines.push("**用户：**", "", m.content, "");
		} else if (m.role === "assistant") {
			lines.push("**Qoder Clone：**", "", m.content, "");
		} else {
			lines.push(`> ⚠️ ${m.content}`, "");
		}
	}
	return lines.join("\n");
}

export function formatDate(ts: number): string {
	const d = new Date(ts);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
