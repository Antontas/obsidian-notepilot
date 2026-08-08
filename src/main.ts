// Qoder Clone —— 插件主入口
// UI/架构参照 Continue（Apache 2.0, github.com/continuedev/continue）独立实现

import type { Editor, WorkspaceLeaf } from "obsidian";
import {
	App,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import {
	DEFAULT_SETTINGS,
	PROVIDER_PRESETS,
	QoderChatSettings,
	StoredData,
} from "./settings";
import {
	ChatSession,
	createSession,
	deriveTitle,
} from "./sessions";
import { chatCompletion, LlmRequestMessage } from "./llm";
import { lineDiff } from "./diff";
import { QoderChatView, VIEW_TYPE_QODER_CHAT } from "./chatView";

export default class QoderChatPlugin extends Plugin {
	settings: QoderChatSettings = DEFAULT_SETTINGS;
	sessions: ChatSession[] = [];
	currentSessionId = "";
	private statusBarEl: HTMLElement | null = null;

	isLoggedIn(): boolean {
		return this.settings.apiKey.trim().length > 0;
	}

	// ============ 会话管理（参照 Continue session 模型） ============

	currentSession(): ChatSession {
		let s = this.sessions.find((x) => x.id === this.currentSessionId);
		if (!s) {
			s = createSession();
			this.sessions.unshift(s);
			this.currentSessionId = s.id;
		}
		return s;
	}

	newSession(): ChatSession {
		const s = createSession();
		this.sessions.unshift(s);
		this.currentSessionId = s.id;
		void this.saveAll();
		return s;
	}

	switchSession(id: string): void {
		if (this.sessions.some((s) => s.id === id)) {
			this.currentSessionId = id;
			void this.saveAll();
		}
	}

	deleteSession(id: string): void {
		this.sessions = this.sessions.filter((s) => s.id !== id);
		if (this.currentSessionId === id) {
			this.currentSessionId = this.sessions[0]?.id ?? "";
		}
		void this.saveAll();
	}

	touchSession(s: ChatSession): void {
		s.updatedAt = Date.now();
		deriveTitle(s);
	}

	async onload(): Promise<void> {
		await this.loadAll();

		this.registerView(
			VIEW_TYPE_QODER_CHAT,
			(leaf) => new QoderChatView(leaf, this)
		);

		this.statusBarEl = this.addStatusBarItem();
		this.updateStatusBar();

		this.addRibbonIcon("bot", "打开 Qoder Clone", () => {
			void this.activateView();
		});

		this.addCommand({
			id: "open-qoder-chat",
			name: "打开 Qoder Clone 面板",
			callback: () => void this.activateView(),
		});

		this.addCommand({
			id: "new-qoder-chat",
			name: "新建 Qoder Clone 对话",
			callback: () => {
				this.newSession();
				this.refreshView();
			},
		});

		this.addCommand({
			id: "inline-chat",
			name: "Inline Chat：AI 改写选中文本（Diff 预览）",
			editorCallback: (editor: Editor, view: MarkdownView) =>
				void this.inlineChat(editor, view),
		});

		this.addCommand({
			id: "logout-qoder-chat",
			name: "退出 Qoder Clone 登录",
			callback: () => {
				this.settings.apiKey = "";
				void this.saveAll();
				this.updateStatusBar();
				this.refreshView();
				new Notice("已退出 Qoder Clone 登录");
			},
		});

		this.addSettingTab(new QoderChatSettingTab(this.app, this));
	}

	updateStatusBar(): void {
		if (!this.statusBarEl) return;
		if (this.isLoggedIn()) {
			this.statusBarEl.setText(
				`Qoder · 已登录 · ${this.settings.model}`
			);
		} else {
			this.statusBarEl.setText("Qoder · 未登录");
		}
	}

	onunload(): void {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_QODER_CHAT);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | undefined =
			workspace.getLeavesOfType(VIEW_TYPE_QODER_CHAT)[0];
		if (!leaf) {
			leaf = workspace.getRightLeaf(false) ?? undefined;
			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_QODER_CHAT,
					active: true,
				});
			}
		}
		if (leaf) workspace.revealLeaf(leaf);
	}

	refreshView(): void {
		const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_QODER_CHAT)[0];
		const view = leaf?.view as QoderChatView | undefined;
		view?.refresh();
	}

	async loadAll(): Promise<void> {
		const data = (await this.loadData()) as
			| Partial<StoredData & { messages: unknown[] }>
			| null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
		this.sessions = Array.isArray(data?.sessions)
			? (data?.sessions as ChatSession[])
			: [];
		// 兼容旧版单会话数据
		if (this.sessions.length === 0 && Array.isArray(data?.messages)) {
			const legacy = data?.messages as ChatSession["messages"];
			if (legacy.length > 0) {
				const s = createSession();
				s.messages = legacy;
				deriveTitle(s);
				this.sessions.push(s);
			}
		}
		this.currentSessionId =
			data?.currentSessionId ?? this.sessions[0]?.id ?? "";
	}

	async saveAll(): Promise<void> {
		const data: StoredData = {
			settings: this.settings,
			sessions: this.sessions,
			currentSessionId: this.currentSessionId,
		};
		await this.saveData(data);
	}

	// ============ 非聊天补全（Inline Chat 用） ============

	async complete(promptMessages: LlmRequestMessage[]): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let text = "";
			chatCompletion(
				this.settings,
				promptMessages,
				{
					onToken: (p) => {
						text += p;
					},
					onError: (message) => reject(new Error(message)),
				},
				() => resolve(text)
			);
		});
	}

	/** Inline Chat：选中文本 → 指令 → AI 改写 → Diff 预览 → 应用 */
	async inlineChat(editor: Editor, view: MarkdownView): Promise<void> {
		if (!this.isLoggedIn()) {
			new Notice("请先登录 Qoder Clone");
			return;
		}
		const sel = editor.getSelection();
		if (!sel.trim()) {
			new Notice("请先在编辑器中选中要改写的文本");
			return;
		}

		const instruction = await new InstructionModal(this.app).openAndWait();
		if (instruction === null) return;

		new Notice("Qoder Clone 正在改写…");
		let result: string;
		try {
			result = await this.complete([
				{
					role: "system",
					content:
						"你是一个文本改写助手。根据用户指令修改给定文本。" +
						"只输出修改后的完整文本本身，不要输出任何解释、前缀或 Markdown 代码块围栏。",
				},
				{
					role: "user",
					content: `指令：${instruction}\n\n需要改写的文本：\n${sel}`,
				},
			]);
		} catch (e) {
			new Notice(`改写失败：${(e as Error).message}`);
			return;
		}

		result = stripFences(result.trim());
		if (!result) {
			new Notice("模型未返回有效内容");
			return;
		}

		const from = editor.getCursor("from");
		const to = editor.getCursor("to");
		const accept = await new DiffModal(this.app, sel, result).openAndWait();
		if (accept) {
			editor.replaceRange(result, from, to);
			new Notice("已应用改写");
		} else {
			new Notice("已取消");
		}
		void view;
	}
}

/** 去除模型输出可能包裹的 ``` 围栏 */
function stripFences(text: string): string {
	const m = text.match(/^```[\w-]*\r?\n([\s\S]*?)\r?\n```$/);
	return m ? m[1] : text;
}

// ============ 指令输入弹窗 ============

class InstructionModal extends Modal {
	private resolveFn: ((value: string | null) => void) | null = null;

	openAndWait(): Promise<string | null> {
		return new Promise((resolve) => {
			this.resolveFn = resolve;
			this.open();
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("qoder-modal");
		contentEl.createEl("h3", { text: "Inline Chat：如何改写选中文本？" });
		const input = contentEl.createEl("textarea", {
			cls: "qoder-modal-input",
			attr: {
				placeholder: "例如：润色语言 / 翻译成英文 / 精简为 3 句话…",
				rows: "3",
			},
		});
		const row = contentEl.createDiv({ cls: "qoder-modal-row" });
		const cancel = row.createEl("button", { text: "取消" });
		const ok = row.createEl("button", {
			text: "改写",
			cls: "mod-cta",
		});
		const done = (value: string | null) => {
			this.resolveFn?.(value);
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

	onClose(): void {
		this.resolveFn?.(null);
		this.resolveFn = null;
		this.contentEl.empty();
	}
}

// ============ Diff 预览弹窗（参照 Continue/Cline 的改动审批） ============

class DiffModal extends Modal {
	private oldText: string;
	private newText: string;
	private resolveFn: ((accept: boolean) => void) | null = null;

	constructor(app: App, oldText: string, newText: string) {
		super(app);
		this.oldText = oldText;
		this.newText = newText;
	}

	openAndWait(): Promise<boolean> {
		return new Promise((resolve) => {
			this.resolveFn = resolve;
			this.open();
		});
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("qoder-modal");
		contentEl.createEl("h3", { text: "改动预览（Diff）" });

		const diffEl = contentEl.createDiv({ cls: "qoder-diff" });
		for (const line of lineDiff(this.oldText, this.newText)) {
			const row = diffEl.createDiv({ cls: `qoder-diff-line qoder-diff-${line.type}` });
			const mark =
				line.type === "add" ? "+" : line.type === "del" ? "−" : " ";
			row.createSpan({ cls: "qoder-diff-mark", text: mark });
			row.createSpan({ text: line.text || " " });
		}

		const row = contentEl.createDiv({ cls: "qoder-modal-row" });
		const reject = row.createEl("button", { text: "拒绝" });
		const accept = row.createEl("button", {
			text: "接受改动",
			cls: "mod-cta",
		});
		const done = (value: boolean) => {
			this.resolveFn?.(value);
			this.resolveFn = null;
			this.close();
		};
		reject.addEventListener("click", () => done(false));
		accept.addEventListener("click", () => done(true));
	}

	onClose(): void {
		this.resolveFn?.(false);
		this.resolveFn = null;
		this.contentEl.empty();
	}
}

// ============ 设置页 ============

class QoderChatSettingTab extends PluginSettingTab {
	plugin: QoderChatPlugin;

	constructor(app: App, plugin: QoderChatPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Qoder Clone 设置" });

		new Setting(containerEl)
			.setName("登录状态")
			.setDesc(
				this.plugin.isLoggedIn()
					? `已登录（模型：${this.plugin.settings.model}）`
					: "未登录，请在聊天面板登录页输入凭证"
			);

		new Setting(containerEl)
			.setName("服务商预设")
			.setDesc("选择后自动填充对应的 Base URL 与默认模型")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						dashscope: PROVIDER_PRESETS.dashscope.label,
						openai: PROVIDER_PRESETS.openai.label,
					})
					.setValue(this.plugin.settings.provider)
					.onChange(async (value: "openai" | "dashscope") => {
						this.plugin.settings.provider = value;
						const preset = PROVIDER_PRESETS[value];
						this.plugin.settings.baseUrl = preset.baseUrl;
						this.plugin.settings.model = preset.model;
						await this.plugin.saveAll();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Base URL")
			.setDesc("OpenAI 兼容接口地址")
			.addText((text) =>
				text
					.setPlaceholder("https://.../v1")
					.setValue(this.plugin.settings.baseUrl)
					.onChange(async (value) => {
						this.plugin.settings.baseUrl = value.trim();
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("API Key")
			.setDesc("BYOK：你自己的密钥，仅保存在本地")
			.addText((text) => {
				text.inputEl.type = "password";
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveAll();
					});
			});

		new Setting(containerEl)
			.setName("模型")
			.setDesc("例如 qwen3.7-plus / gpt-4o-mini")
			.addText((text) =>
				text
					.setPlaceholder("模型名称")
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value.trim();
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("系统提示词")
			.setDesc("定义助手的角色与回答风格")
			.addTextArea((text) => {
				text.inputEl.rows = 4;
				text.inputEl.cols = 40;
				text
					.setValue(this.plugin.settings.systemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.systemPrompt = value;
						await this.plugin.saveAll();
					});
			});

		new Setting(containerEl)
			.setName("启用 Rules 规则文件")
			.setDesc(`读取库根目录 .qoder-rules/*.md 中的规则，自动注入对话（参照 Continue 的 rules 机制）`)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.rulesEnabled)
					.onChange(async (value) => {
						this.plugin.settings.rulesEnabled = value;
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("流式输出")
			.setDesc("逐字输出回复（推荐开启）")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.stream)
					.onChange(async (value) => {
						this.plugin.settings.stream = value;
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("携带当前笔记上下文")
			.setDesc("提问时自动附带当前打开笔记的内容")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeActiveNote)
					.onChange(async (value) => {
						this.plugin.settings.includeActiveNote = value;
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("Temperature")
			.setDesc("生成随机性（0 - 2）")
			.addSlider((slider) =>
				slider
					.setLimits(0, 2, 0.1)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveAll();
					})
			);

		new Setting(containerEl)
			.setName("笔记上下文最大字符数")
			.setDesc("超出部分将被截断")
			.addText((text) =>
				text
					.setPlaceholder("8000")
					.setValue(String(this.plugin.settings.maxNoteChars))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						if (!isNaN(n) && n > 0) {
							this.plugin.settings.maxNoteChars = n;
							await this.plugin.saveAll();
						}
					})
			);

		containerEl.createEl("p", {
			cls: "qoder-settings-notice",
			text: "说明：本插件为仿 Qoder 的独立实现，界面与交互参照开源项目 Continue（Apache 2.0）。BYOK 模式需要你自己提供大模型 API，密钥仅存储在本机 Obsidian 配置中。",
		});
	}

	hide(): void {
		super.hide();
		this.plugin.updateStatusBar();
		this.plugin.refreshView();
	}
}
