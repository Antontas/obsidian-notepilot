// Qoder Clone —— 侧边栏视图（登录 / 历史会话 / 聊天）
// 界面与交互参照 Continue（Apache 2.0）独立实现

import {
	ItemView,
	MarkdownRenderer,
	MarkdownView,
	Notice,
	setIcon,
	TFile,
	WorkspaceLeaf,
} from "obsidian";
import type QoderChatPlugin from "./main";
import { ChatMessage } from "./sessions";
import {
	formatDate,
	sessionToMarkdown,
} from "./sessions";
import { PROVIDER_MODELS, PROVIDER_PRESETS, SUGGESTIONS } from "./settings";
import type { Provider } from "./settings";
import { chatCompletion, verifyApiKey, LlmRequestMessage } from "./llm";
import { loadRules } from "./rules";
import { agentToolPrompt, applyEdit, parseEditBlocks, ParsedEdit } from "./fileTools";
import { lineDiff } from "./diff";

export const VIEW_TYPE_QODER_CHAT = "qoder-chat-view";

type PanelState = "chat" | "history";

export class QoderChatView extends ItemView {
	plugin: QoderChatPlugin;
	private state: PanelState = "chat";
	private messagesEl!: HTMLElement;
	private inputEl!: HTMLTextAreaElement;
	private sendBtn!: HTMLButtonElement;
	private stopBtn!: HTMLButtonElement;
	private chipsEl!: HTMLElement;
	private popupEl: HTMLElement | null = null;
	private popupItems: TFile[] = [];
	private popupIndex = 0;
	private attachedFiles: string[] = [];
	private quotedText: string | null = null;
	private externalFiles: { name: string; content: string }[] = [];
	private abortController: AbortController | null = null;
	private generating = false;

	constructor(leaf: WorkspaceLeaf, plugin: QoderChatPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_QODER_CHAT;
	}

	getDisplayText(): string {
		return "Qoder Clone";
	}

	getIcon(): string {
		return "bot";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		this.stop();
	}

	refresh(): void {
		this.render();
	}

	private render(): void {
		const root = this.containerEl.children[1] as HTMLElement;
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

	private renderLogin(root: HTMLElement): void {
		const wrap = root.createDiv({ cls: "qoder-login-wrap" });
		const card = wrap.createDiv({ cls: "qoder-login-card" });

		const logo = card.createDiv({ cls: "qoder-logo" });
		setIcon(logo, "bot");
		card.createEl("div", { cls: "qoder-logo-text", text: "Qoder" });
		card.createEl("h2", { cls: "qoder-login-title", text: "登录 Qoder Clone" });
		card.createEl("p", {
			cls: "qoder-login-desc",
			text: "选择服务商并输入 API Key 登录，密钥仅保存在本机 Obsidian 配置中。",
		});

		// 服务商选择
		const providerSelect = card.createEl("select", {
			cls: "qoder-login-input",
		});
		for (const [p, preset] of Object.entries(PROVIDER_PRESETS)) {
			const opt = providerSelect.createEl("option", {
				value: p,
				text: preset.label,
			});
			if (p === this.plugin.settings.provider) opt.selected = true;
		}

		const keyInput = card.createEl("input", {
			cls: "qoder-login-input",
			type: "password",
			attr: { placeholder: "输入 API Key（sk-...）" },
		});

		const adv = card.createDiv({ cls: "qoder-login-adv" });
		adv.createEl("label", { text: "Base URL" });
		const urlInput = adv.createEl("input", {
			cls: "qoder-login-input",
			type: "text",
			value: this.plugin.settings.baseUrl,
		});

		const statusEl = card.createDiv({ cls: "qoder-login-status" });

		const loginBtn = card.createEl("button", {
			cls: "qoder-login-btn",
			text: "登 录",
		});

		const link = card.createEl("a", {
			cls: "qoder-login-link",
			text: "获取 API Key →",
		});

		// 各服务商的 Key 占位提示（未列出的用默认文案）
		const keyPlaceholders: Partial<Record<Provider, string>> = {
			ollama: "本地服务无需密钥，可留空",
			custom: "API Key（自定义服务可留空）",
			anthropic: "输入 Anthropic API Key（sk-ant-...）",
			gemini: "输入 Google AI Studio API Key（AIza...）",
		};

		// 切换服务商：同步 Base URL、默认模型、占位提示与获取链接
		const applyProvider = (p: Provider) => {
			const preset = PROVIDER_PRESETS[p];
			this.plugin.settings.provider = p;
			// 自定义服务商不覆盖用户已填的地址与模型
			if (preset.baseUrl) {
				this.plugin.settings.baseUrl = preset.baseUrl;
				urlInput.value = preset.baseUrl;
			}
			if (preset.model) this.plugin.settings.model = preset.model;
			keyInput.setAttribute(
				"placeholder",
				keyPlaceholders[p] ?? `输入 ${preset.label} API Key（sk-...）`
			);
			if (preset.keyUrl) {
				link.style.display = "";
				link.setText(`前往 ${preset.label} 获取 API Key →`);
			} else {
				link.style.display = "none";
			}
		};
		applyProvider(this.plugin.settings.provider);
		providerSelect.addEventListener("change", () => {
			applyProvider(providerSelect.value as Provider);
		});

		link.addEventListener("click", (e) => {
			e.preventDefault();
			const preset = PROVIDER_PRESETS[this.plugin.settings.provider];
			void window.open(preset.keyUrl, "_blank");
		});

		const doLogin = async () => {
			const provider = providerSelect.value as Provider;
			const key = keyInput.value.trim();
			if (!key && provider !== "ollama" && provider !== "custom") {
				statusEl.setText("请输入 API Key");
				return;
			}
			loginBtn.disabled = true;
			statusEl.setText("正在验证凭证…");
			this.plugin.settings.provider = provider;
			// Ollama 本地服务与自定义服务可无需密钥
			this.plugin.settings.apiKey =
				key || (provider === "ollama" ? "ollama" : "custom");
			const url = urlInput.value.trim();
			if (url) this.plugin.settings.baseUrl = url;
			const result = await verifyApiKey(this.plugin.settings);
			loginBtn.disabled = false;
			if (result.ok) {
				new Notice("Qoder Clone 登录成功");
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

	private renderHistory(root: HTMLElement): void {
		const header = root.createDiv({ cls: "qoder-header" });
		const backBtn = header.createEl("button", {
			cls: "qoder-icon-btn",
			attr: { title: "返回聊天" },
		});
		setIcon(backBtn, "arrow-left");
		backBtn.addEventListener("click", () => {
			this.state = "chat";
			this.render();
		});
		header.createDiv({ cls: "qoder-header-title", text: "历史会话" });
		header.createDiv({ cls: "qoder-toolbar-spacer" });

		const newBtn = header.createEl("button", {
			cls: "qoder-icon-btn",
			attr: { title: "新对话" },
		});
		setIcon(newBtn, "square-plus");
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
			list.createDiv({ cls: "qoder-chat-empty", text: "暂无会话" });
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
				text: s.title,
			});
			const count = s.messages.filter((m) => m.role !== "error").length;
			titleRow.createSpan({ cls: "qoder-history-count", text: String(count) });
			body.createDiv({
				cls: "qoder-history-date",
				text: formatDate(s.updatedAt),
			});

			// hover 操作按钮：重命名 / 导出 Markdown / 删除
			const actions = row.createDiv({ cls: "qoder-history-actions" });
			const editBtn = actions.createEl("button", {
				cls: "qoder-icon-btn",
				attr: { title: "重命名" },
			});
			setIcon(editBtn, "pencil");
			editBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.startRename(row, titleEl, s.id);
			});

			const exportBtn = actions.createEl("button", {
				cls: "qoder-icon-btn",
				attr: { title: "导出为 Markdown" },
			});
			setIcon(exportBtn, "download");
			exportBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				await this.exportSession(s.id);
			});

			const delBtn = actions.createEl("button", {
				cls: "qoder-icon-btn qoder-icon-btn-danger",
				attr: { title: "删除" },
			});
			setIcon(delBtn, "trash-2");
			delBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				if (window.confirm(`删除会话「${s.title}」？`)) {
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

	private startRename(row: HTMLElement, titleEl: HTMLElement, id: string): void {
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
		void row;
	}

	private async exportSession(id: string): Promise<void> {
		const session = this.plugin.sessions.find((x) => x.id === id);
		if (!session) return;
		const safe = session.title.replace(/[\\/:*?"<>|#^\[\]]/g, "").slice(0, 40);
		let path = `Qoder Clone ${safe}.md`;
		let n = 1;
		while (this.app.vault.getAbstractFileByPath(path)) {
			path = `Qoder Clone ${safe} ${n++}.md`;
		}
		const file = await this.app.vault.create(path, sessionToMarkdown(session));
		new Notice(`已导出：${path}`);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file);
	}

	// ============ 聊天页 ============

	private renderChat(root: HTMLElement): void {
		const header = root.createDiv({ cls: "qoder-header" });
		const title = header.createDiv({ cls: "qoder-header-title" });
		setIcon(title, "bot");
		title.createSpan({ text: "Qoder Clone" });
		header.createDiv({ cls: "qoder-toolbar-spacer" });

		const historyBtn = header.createEl("button", {
			cls: "qoder-icon-btn",
			attr: { title: "历史会话" },
		});
		setIcon(historyBtn, "history");
		historyBtn.addEventListener("click", () => {
			this.state = "history";
			this.render();
		});

		const newBtn = header.createEl("button", {
			cls: "qoder-icon-btn",
			attr: { title: "新对话" },
		});
		setIcon(newBtn, "square-plus");
		newBtn.addEventListener("click", () => {
			this.plugin.newSession();
			this.attachedFiles = [];
			this.render();
		});

		const logoutBtn = header.createEl("button", {
			cls: "qoder-icon-btn",
			attr: { title: "退出登录" },
		});
		setIcon(logoutBtn, "log-out");
		logoutBtn.addEventListener("click", () => this.logout());

		// 消息区
		this.messagesEl = root.createDiv({ cls: "qoder-chat-messages" });
		this.renderMessages();

		// 自动识别划词：渲染聊天界面时消费暂存的选区文本
		if (this.quotedText === null && this.plugin.pendingQuotedText) {
			this.quotedText = this.plugin.pendingQuotedText;
			this.plugin.pendingQuotedText = null;
		}

		// 附加文件 chips
		this.chipsEl = root.createDiv({ cls: "qoder-chips" });
		this.renderChips();

		// 输入盒
		const inputBox = root.createDiv({ cls: "qoder-input-box" });
		this.inputEl = inputBox.createEl("textarea", {
			cls: "qoder-chat-input",
			attr: {
				placeholder: "提问…（@ 引用笔记，拖入文件附加，Enter 发送）",
				rows: "2",
			},
		});

		// 拖拽文件到输入盒：库内笔记 / 外部文本文件 → 附件上下文
		this.registerDomEvent(inputBox, "dragover", (evt) => {
			evt.preventDefault();
			if (evt.dataTransfer) evt.dataTransfer.dropEffect = "copy";
			inputBox.addClass("qoder-dragover");
		});
		this.registerDomEvent(inputBox, "dragleave", () => {
			inputBox.removeClass("qoder-dragover");
		});
		this.registerDomEvent(inputBox, "drop", (evt) => {
			inputBox.removeClass("qoder-dragover");
			void this.onDropFiles(evt);
		});

		const toolbar = inputBox.createDiv({ cls: "qoder-input-toolbar" });
		const modelSelect = toolbar.createEl("select", {
			cls: "qoder-model-select",
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
				text: "📄 当前笔记",
			});
			badge.setAttribute("title", "提问时将附带当前笔记内容");
		}

		// Agent 模式开关：开启后 AI 可提出文件修改建议（需审批）
		const agentBtn = toolbar.createEl("button", {
			cls: "qoder-mode-btn",
			text: "⚡ Agent",
		});
		agentBtn.setAttribute("title", "Agent 模式：AI 可建议创建/修改库内文件（需你审批）");
		const syncAgentBtn = () =>
			agentBtn.toggleClass("qoder-mode-on", this.plugin.settings.agentMode);
		syncAgentBtn();
		agentBtn.addEventListener("click", () => {
			this.plugin.settings.agentMode = !this.plugin.settings.agentMode;
			void this.plugin.saveAll();
			syncAgentBtn();
			new Notice(
				this.plugin.settings.agentMode
					? "Agent 模式已开启：AI 可提出文件修改建议"
					: "Agent 模式已关闭"
			);
		});

		toolbar.createDiv({ cls: "qoder-toolbar-spacer" });

		this.stopBtn = toolbar.createEl("button", {
			cls: "qoder-chat-stop",
			text: "停止",
		});
		this.stopBtn.style.display = "none";
		this.stopBtn.addEventListener("click", () => this.stop());

		this.sendBtn = toolbar.createEl("button", { cls: "qoder-chat-send" });
		setIcon(this.sendBtn, "arrow-up");
		this.sendBtn.setAttribute("aria-label", "发送");
		this.sendBtn.addEventListener("click", () => void this.send());

		this.inputEl.addEventListener("keydown", (e) => this.onInputKeydown(e));
		this.inputEl.addEventListener("input", () => this.onInput());

		if (this.generating) this.setBusy(true);
	}

	private renderMessages(): void {
		this.messagesEl.empty();
		const session = this.plugin.currentSession();
		if (session.messages.length === 0) {
			this.renderWelcome();
			return;
		}
		for (const msg of session.messages) {
			// 代码块操作与审批卡片统一在 appendMessageEl 的渲染回调中添加，避免重复渲染
			this.appendMessageEl(msg);
		}
		this.scrollToBottom();
	}

	private renderWelcome(): void {
		const w = this.messagesEl.createDiv({ cls: "qoder-welcome" });
		w.createDiv({ cls: "qoder-welcome-hi", text: "你好 👋" });
		w.createDiv({
			cls: "qoder-welcome-sub",
			text: "我是 Qoder Clone，可以帮你总结、润色、改写笔记与问答。输入 @ 可引用库内笔记。",
		});
		const grid = w.createDiv({ cls: "qoder-suggestions" });
		for (const s of SUGGESTIONS) {
			const btn = grid.createEl("button", {
				cls: "qoder-suggestion-btn",
				text: s.title,
			});
			btn.addEventListener("click", () => void this.sendText(s.prompt));
		}
	}

	private appendMessageEl(msg: ChatMessage): HTMLElement {
		const cls =
			msg.role === "user"
				? "qoder-msg qoder-msg-user"
				: msg.role === "error"
				? "qoder-msg qoder-msg-system-err"
				: "qoder-msg qoder-msg-assistant";
		const el = this.messagesEl.createDiv({ cls });
		if (msg.role === "user" || msg.role === "error") {
			el.setText(msg.content);
		} else {
			MarkdownRenderer.render(this.app, msg.content, el, "", this)
						.then(() => {
						this.addCodeActions(el);
						this.renderEditCards(el, msg.content);
					})
				.catch(() => el.setText(msg.content));
		}
		return el;
	}

	/** 为代码块添加 复制 / 插入笔记 按钮（参照 Continue 代码块操作） */
	private addCodeActions(el: HTMLElement): void {
		el.querySelectorAll("pre").forEach((pre) => {
			if (pre.querySelector(".qoder-code-actions")) return;
			const bar = document.createElement("div");
			bar.addClass("qoder-code-actions");
			const copyBtn = bar.createEl("button", { text: "复制" });
			copyBtn.addEventListener("click", () => {
				const code = pre.querySelector("code");
				void navigator.clipboard
					.writeText(code?.innerText ?? "")
					.then(() => new Notice("已复制代码"));
			});
			const insertBtn = bar.createEl("button", { text: "插入笔记" });
			insertBtn.addEventListener("click", () => {
				const code = pre.querySelector("code");
				this.insertIntoNote(code?.innerText ?? "");
			});
			pre.appendChild(bar);
		});
	}

	private insertIntoNote(text: string): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view?.editor;
		if (!editor) {
			new Notice("请先打开一个笔记");
			return;
		}
		const cursor = editor.getCursor();
		editor.replaceRange(text + "\n", cursor);
		new Notice("已插入到当前笔记");
	}

	// ============ 文件修改审批卡片（Agent 模式） ============

	/** 移除已被识别为编辑块的原始代码块，避免 JSON 与审批卡片同时展示 */
	private stripRenderedEditBlocks(
		container: HTMLElement,
		parsed: ParsedEdit[]
	): void {
		const raws = new Set(
			parsed.filter((p) => p.edit !== null).map((p) => p.raw)
		);
		container.querySelectorAll("pre").forEach((pre) => {
			let t = (
				pre.querySelector("code")?.textContent ??
				pre.textContent ??
				""
			).trim();
			const firstLine = t.split("\n", 1)[0].trim();
			if (/^qoder[-_ ]?edit$/i.test(firstLine)) {
				t = t.slice(firstLine.length).trim();
			}
			if (raws.has(t)) pre.remove();
		});
	}

	private renderEditCards(container: HTMLElement, text: string): void {
		const parsed = parseEditBlocks(text);
		if (parsed.length > 0) {
			this.stripRenderedEditBlocks(container, parsed);
		}
		// 防重：同一条消息只渲染一次审批卡片
		if (parsed.length === 0 || container.querySelector(".qoder-edit-cards")) {
			return;
		}

		const wrap = container.createDiv({ cls: "qoder-edit-cards" });
		wrap.createDiv({
			cls: "qoder-edit-cards-title",
			text: `📝 检测到 ${parsed.length} 项文件修改建议，确认后生效`,
		});

		for (const p of parsed) {
			const card = wrap.createDiv({ cls: "qoder-edit-card" });

			if (!p.edit) {
				card.createDiv({
					cls: "qoder-edit-path",
					text: `⚠️ 编辑块解析失败：${p.error ?? "未知错误"}`,
				});
				card.createEl("pre", { cls: "qoder-edit-raw", text: p.raw });
				continue;
			}

			const edit = p.edit;
			const head = card.createDiv({ cls: "qoder-edit-head" });
			head.createSpan({
				cls: `qoder-edit-action qoder-edit-action-${edit.action}`,
				text:
					edit.action === "replace"
						? "替换"
						: edit.action === "create"
						? "新建"
						: "覆写",
			});
			head.createSpan({ cls: "qoder-edit-path", text: edit.path });

			// Diff 预览
			const diffEl = card.createDiv({ cls: "qoder-edit-diff" });
			const addDiffLine = (type: "add" | "del" | "same", lineText: string) => {
				const row = diffEl.createDiv({
					cls: `qoder-diff-line qoder-diff-${type}`,
				});
				row.createSpan({
					cls: "qoder-diff-mark",
					text: type === "add" ? "+" : type === "del" ? "−" : " ",
				});
				row.createSpan({ text: lineText || " " });
			};

			if (edit.action === "replace") {
				for (const line of lineDiff(edit.search ?? "", edit.replace ?? "")) {
					addDiffLine(line.type, line.text);
				}
			} else {
				const allLines = (edit.content ?? "").split("\n");
				for (const l of allLines.slice(0, 12)) addDiffLine("add", l);
				if (allLines.length > 12) {
					diffEl.createDiv({
						cls: "qoder-diff-line",
						text: `…（共 ${allLines.length} 行）`,
					});
				}
			}

			// 操作按钮
			const btnRow = card.createDiv({ cls: "qoder-edit-btns" });
			const status = btnRow.createSpan({ cls: "qoder-edit-status" });
			const reject = btnRow.createEl("button", { text: "拒绝" });
			const apply = btnRow.createEl("button", {
				text: "应用",
				cls: "mod-cta",
			});

			reject.addEventListener("click", () => {
				reject.disabled = true;
				apply.disabled = true;
				status.setText("已拒绝");
			});
			apply.addEventListener("click", () => {
				void (async () => {
					apply.disabled = true;
					try {
						const msg = await applyEdit(this.app, edit);
						status.setText(`✅ ${msg}`);
						reject.disabled = true;
						new Notice(msg);
					} catch (e) {
						status.setText(`❌ ${(e as Error).message}`);
						apply.disabled = false;
					}
				})();
			});
		}
	}

	private scrollToBottom(): void {
		this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
	}

	private setBusy(busy: boolean): void {
		this.generating = busy;
		this.sendBtn.disabled = busy;
		this.sendBtn.style.display = busy ? "none" : "";
		this.stopBtn.style.display = busy ? "" : "none";
		this.inputEl.disabled = busy;
	}

	private stop(): void {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
			this.setBusy(false);
		}
	}

	private logout(): void {
		if (!window.confirm("确定退出登录？将清除已保存的凭证。")) return;
		this.stop();
		this.plugin.settings.apiKey = "";
		void this.plugin.saveAll();
		this.plugin.updateStatusBar();
		this.render();
		new Notice("已退出登录");
	}

	private async sendText(text: string): Promise<void> {
		this.inputEl.value = text;
		await this.send();
	}

	// ============ @ 引用（参照 Continue 的 @file 上下文） ============

	private onInput(): void {
		const value = this.inputEl.value;
		const caret = this.inputEl.selectionStart ?? value.length;
		const before = value.slice(0, caret);
		const match = before.match(/@([^\s@]*)$/);
		if (match) {
			this.showAtPopup(match[1]);
		} else {
			this.hideAtPopup();
		}
	}

	private onInputKeydown(e: KeyboardEvent): void {
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

	private showAtPopup(query: string): void {
		const files = this.app.vault
			.getMarkdownFiles()
			.filter((f) => !f.path.startsWith(".obsidian/"))
			.filter((f) =>
				query
					? (f.basename + f.path).toLowerCase().includes(query.toLowerCase())
					: true
			)
			.slice(0, 20);
		this.popupItems = files;
		this.popupIndex = 0;

		if (!this.popupEl) {
			const root = this.containerEl.children[1] as HTMLElement;
			this.popupEl = root.createDiv({ cls: "qoder-at-popup" });
		}
		this.popupEl.empty();
		if (files.length === 0) {
			this.popupEl.createDiv({
				cls: "qoder-at-item qoder-at-empty",
				text: "没有匹配的笔记",
			});
			return;
		}
		files.forEach((f, idx) => {
			const item = this.popupEl!.createDiv({ cls: "qoder-at-item" });
			item.createSpan({ cls: "qoder-at-name", text: f.basename });
			item.createSpan({ cls: "qoder-at-path", text: f.path });
			if (idx === this.popupIndex) item.addClass("qoder-at-active");
			item.addEventListener("mousedown", (e) => {
				e.preventDefault();
				this.selectAtFile(f);
			});
		});
	}

	private highlightPopup(): void {
		if (!this.popupEl) return;
		this.popupEl.querySelectorAll(".qoder-at-item").forEach((el, idx) => {
			el.toggleClass("qoder-at-active", idx === this.popupIndex);
		});
	}

	private hideAtPopup(): void {
		this.popupEl?.remove();
		this.popupEl = null;
	}

	private selectAtFile(file: TFile): void {
		// 从输入框中移除 @query 片段，插入 @文件名
		const value = this.inputEl.value;
		const caret = this.inputEl.selectionStart ?? value.length;
		const before = value.slice(0, caret);
		const match = before.match(/@([^\s@]*)$/);
		if (match && match.index !== undefined) {
			const insert = `@${file.basename} `;
			this.inputEl.value =
				before.slice(0, match.index) + insert + value.slice(caret);
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

	private renderChips(): void {
		if (!this.chipsEl) return;
		this.chipsEl.empty();
		const hasAny =
			this.attachedFiles.length > 0 ||
			this.quotedText !== null ||
			this.externalFiles.length > 0;
		if (!hasAny) {
			this.chipsEl.style.display = "none";
			return;
		}
		this.chipsEl.style.display = "";

		if (this.quotedText !== null) {
			const q = this.quotedText;
			const chip = this.chipsEl.createDiv({ cls: "qoder-chip" });
			chip.createSpan({ text: `📋 划词选中（${q.length} 字）` });
			chip.setAttribute("title", q.slice(0, 200));
			const x = chip.createSpan({ cls: "qoder-chip-x", text: "×" });
			x.addEventListener("click", () => {
				this.quotedText = null;
				this.renderChips();
			});
		}

		for (const ef of this.externalFiles) {
			const chip = this.chipsEl.createDiv({ cls: "qoder-chip" });
			chip.createSpan({ text: `📎 ${ef.name}` });
			const x = chip.createSpan({ cls: "qoder-chip-x", text: "×" });
			x.addEventListener("click", () => {
				this.externalFiles = this.externalFiles.filter((f) => f !== ef);
				this.renderChips();
			});
		}

		for (const path of this.attachedFiles) {
			const chip = this.chipsEl.createDiv({ cls: "qoder-chip" });
			const name = path.split("/").pop()?.replace(/\.md$/, "") ?? path;
			chip.createSpan({ text: `📄 ${name}` });
			const x = chip.createSpan({ cls: "qoder-chip-x", text: "×" });
			x.addEventListener("click", () => {
				this.attachedFiles = this.attachedFiles.filter((p) => p !== path);
				this.renderChips();
			});
		}
	}

	// ============ 划词提问与拖拽附加 ============

	/** 划词提问：引用选中文本作为提问上下文（silent 用于自动识别场景，不提示、不抢焦点） */
	attachQuotedText(text: string, silent = false): void {
		this.quotedText = text;
		this.plugin.pendingQuotedText = null;
		this.renderChips();
		if (!silent) {
			if (this.inputEl) this.inputEl.focus();
			new Notice("已引用选中文本，输入问题后发送");
		}
	}

	private async onDropFiles(evt: DragEvent): Promise<void> {
		evt.preventDefault();
		evt.stopPropagation();
		const dt = evt.dataTransfer;
		if (!dt) return;

		// 外部操作系统文件
		if (dt.files.length > 0) {
			for (const f of Array.from(dt.files)) {
				await this.attachExternalFile(f);
			}
			return;
		}

		// 库内笔记拖入（文件树拖拽携带 obsidian:// URI 或纯路径）
		const plain = dt.getData("text/plain").trim();
		if (!plain) return;
		const file = this.resolveDraggedFile(plain);
		if (file instanceof TFile) {
			this.attachVaultFile(file);
		} else {
			new Notice(`无法识别拖入的内容：${plain.slice(0, 80)}`);
		}
	}

	/** 解析拖入文本：obsidian://open URI / 纯路径 / 笔记名 → TFile */
	private resolveDraggedFile(plain: string): TFile | null {
		if (plain.startsWith("obsidian://")) {
			try {
				const url = new URL(plain);
				const file = url.searchParams.get("file");
				if (file) return this.resolvePlainPath(file);
			} catch {
				// URI 解析失败：截取 file= 参数兜底
				const idx = plain.indexOf("file=");
				if (idx !== -1) {
					const raw = plain.slice(idx + 5).split("&")[0];
					let decoded = raw;
					try {
						decoded = decodeURIComponent(raw);
					} catch {
						// 保持原样
					}
					return this.resolvePlainPath(decoded);
				}
			}
			return null;
		}
		return this.resolvePlainPath(plain);
	}

	/** 依次尝试多种路径解释（+ 可能为路径分隔符或空格），并用笔记名兜底 */
	private resolvePlainPath(plain: string): TFile | null {
		const candidates = [
			plain,
			plain.replace(/\+/g, "/"),
			plain.replace(/\+/g, " "),
		];
		for (const c of candidates) {
			const abs = this.app.vault.getAbstractFileByPath(c);
			if (abs instanceof TFile) return abs;
			const f = this.app.metadataCache.getFirstLinkpathDest(c, "");
			if (f instanceof TFile) return f;
		}
		// 按文件名（含扩展名）全局兜底
		for (const c of candidates) {
			const name = c.split("/").pop() ?? "";
			if (!name || name === c) continue;
			const f = this.app.metadataCache.getFirstLinkpathDest(name, "");
			if (f instanceof TFile) return f;
		}
		return null;
	}

	private attachVaultFile(file: TFile): void {
		if (file.extension === "md") {
			if (!this.attachedFiles.includes(file.path)) {
				this.attachedFiles.push(file.path);
			}
			this.renderChips();
			new Notice(`已附加笔记：${file.basename}`);
			return;
		}
		// 库内非 md 文本文件：读取内容作为外部附件
		void this.app.vault
			.cachedRead(file)
			.then((content) => this.pushExternal(file.name, content))
			.catch(() => new Notice(`读取失败：${file.path}`));
	}

	private async attachExternalFile(f: File): Promise<void> {
		if (f.size > 1024 * 1024) {
			new Notice(`文件过大（>1MB）：${f.name}`);
			return;
		}
		const textLike =
			f.type.startsWith("text/") ||
			f.type === "application/json" ||
			/\.(md|txt|markdown|json|csv|tsv|js|ts|css|html|xml|ya?ml)$/i.test(
				f.name
			);
		if (!textLike) {
			new Notice(`仅支持附加文本文件：${f.name}`);
			return;
		}
		this.pushExternal(f.name, await f.text());
	}

	private pushExternal(name: string, content: string): void {
		if (!this.externalFiles.some((f) => f.name === name)) {
			this.externalFiles.push({ name, content });
		}
		this.renderChips();
		new Notice(`已附加文件：${name}`);
	}

	// ============ 发送 ============

	async send(): Promise<void> {
		let text = this.inputEl.value.trim();
		if (!text || this.abortController) return;

		const settings = this.plugin.settings;
		if (!settings.apiKey) {
			new Notice("请先登录");
			return;
		}

		// 去掉文本中的 @文件名 标记（内容将以上下文块注入）
		for (const path of this.attachedFiles) {
			const name = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
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
		const userMsg: ChatMessage = { role: "user", content: text };
		session.messages.push(userMsg);

		const assistantMsg: ChatMessage = { role: "assistant", content: "" };
		session.messages.push(assistantMsg);

		this.renderMessages();
		const assistantEl = this.messagesEl.lastElementChild as HTMLElement;
		assistantEl.empty();
		assistantEl.createSpan({ cls: "qoder-thinking", text: "思考中…" });
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
					MarkdownRenderer.render(
						this.app,
						acc,
						assistantEl,
						"",
						this
					)
						.then(() => this.addCodeActions(assistantEl))
						.catch(() => assistantEl.setText(acc));
					this.scrollToBottom();
				},
				onError: (message) => {
					assistantMsg.role = "error";
					assistantMsg.content = message;
					assistantEl.className = "qoder-msg qoder-msg-system-err";
					assistantEl.setText(message);
					new Notice(message);
				},
			},
			() => {
				this.abortController = null;
				this.setBusy(false);
				if (!assistantMsg.content) {
					assistantEl.empty();
					assistantEl.setText("(无内容)");
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
	private async buildRequestMessages(
		attached: string[],
		quoted: string | null,
		external: { name: string; content: string }[]
	): Promise<LlmRequestMessage[]> {
		const settings = this.plugin.settings;
		const session = this.plugin.currentSession();
		const out: LlmRequestMessage[] = [];
		out.push({ role: "system", content: settings.systemPrompt });

		if (settings.rulesEnabled) {
			const rules = await loadRules(this.app);
			if (rules) {
				out.push({
					role: "system",
					content: `以下是必须遵守的规则：\n${rules}`,
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
					content: `当前笔记「${note.title}」内容如下，回答时可参考：\n${note.body}`,
				});
			}
		}

		// @ 引用的笔记：按 Continue 的格式以代码块注入
		for (const path of attached) {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (file instanceof TFile) {
				try {
					const content = await this.app.vault.read(file);
					out.push({
						role: "system",
						content: "```" + path + "\n" + content + "\n```",
					});
				} catch {
					// 跳过读取失败的文件
				}
			}
		}

		// 划词提问：选中文本作为独立上下文
		if (quoted) {
			out.push({
				role: "system",
				content: `用户划词选中了以下文本，请围绕该文本回答问题：\n"""\n${quoted}\n"""`,
			});
		}

		// 拖拽附加的文件：以代码块注入
		for (const ef of external) {
			out.push({
				role: "system",
				content: "```" + ef.name + "\n" + ef.content + "\n```",
			});
		}

		for (const m of session.messages) {
			if ((m.role === "user" || m.role === "assistant") && m.content) {
				out.push({ role: m.role, content: m.content });
			}
		}
		return out;
	}

	private async getActiveNoteContext(): Promise<{
		title: string;
		body: string;
	} | null> {
		const file = this.app.workspace.getActiveFile();
		if (!file || file.extension !== "md") return null;
		try {
			let content = await this.app.vault.read(file);
			const max = this.plugin.settings.maxNoteChars;
			if (content.length > max) {
				content = content.slice(0, max) + "\n…(内容过长已截断)";
			}
			return { title: file.basename, body: content };
		} catch {
			return null;
		}
	}
}
