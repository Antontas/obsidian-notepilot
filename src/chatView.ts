// NotePilot —— 侧边栏视图（登录 / 历史会话 / 聊天）
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
import type NotePilotPlugin from "./main";
import { ChatMessage } from "./sessions";
import {
	formatDate,
	sessionToMarkdown,
} from "./sessions";
import { PROVIDER_MODELS, PROVIDER_PRESETS, SUGGESTIONS } from "./settings";
import type { Provider } from "./settings";
import { chatCompletion, fetchModels, verifyApiKey, LlmRequestMessage } from "./llm";
import { loadRules } from "./rules";
import { agentToolPrompt, applyEdit, parseEditBlocks, ParsedEdit } from "./fileTools";
import { lineDiff } from "./diff";

export const VIEW_TYPE_NOTEPILOT = "notepilot-chat-view";

export class NotePilotView extends ItemView {
	plugin: NotePilotPlugin;
	private sidebarOpen = false;
	private messagesEl!: HTMLElement;
	private chatContentEl: HTMLElement | null = null;
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

	constructor(leaf: WorkspaceLeaf, plugin: NotePilotPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_NOTEPILOT;
	}

	getDisplayText(): string {
		return "ObsidianAI";
	}

	getIcon(): string {
		return "sparkles";
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
		root.addClass("oa-view");
		if (!this.plugin.isLoggedIn()) {
			this.renderLogin(root);
			return;
		}
		// 活动栏（登录后始终可见）
		this.renderActivityBar(root);
		// 主区域 = 可选侧边栏 + 聊天内容
		const main = root.createDiv({ cls: "oa-main" });
		if (this.sidebarOpen) {
			this.renderSidebar(main);
		}
		this.renderChat(main);
	}

	// ============ 登录页 ============

	private renderLogin(root: HTMLElement): void {
		const wrap = root.createDiv({ cls: "oa-login" });
		const card = wrap.createDiv({ cls: "oa-login__card" });

		const logo = card.createDiv({ cls: "oa-login__logo" });
		setIcon(logo, "sparkles");
		card.createEl("div", { cls: "oa-login__brand", text: "ObsidianAI" });
		card.createEl("h2", { cls: "oa-login__title", text: "登录 ObsidianAI" });
		card.createEl("p", {
			cls: "oa-login__desc",
			text: "选择服务商并输入 API Key 登录，密钥仅保存在本机 Obsidian 配置中。",
		});

		// 服务商选择
		const providerSelect = card.createEl("select", {
			cls: "oa-login__field",
		});
		for (const [p, preset] of Object.entries(PROVIDER_PRESETS)) {
			const opt = providerSelect.createEl("option", {
				value: p,
				text: preset.label,
			});
			if (p === this.plugin.settings.provider) opt.selected = true;
		}

		const keyInput = card.createEl("input", {
			cls: "oa-login__field",
			type: "password",
			attr: { placeholder: "输入 API Key（sk-...）" },
		});

		const adv = card.createDiv({ cls: "oa-login__advanced" });
		adv.createEl("label", { text: "Base URL" });
		const urlInput = adv.createEl("input", {
			cls: "oa-login__field",
			type: "text",
			value: this.plugin.settings.baseUrl,
		});

		const statusEl = card.createDiv({ cls: "oa-login__status" });

		const loginBtn = card.createEl("button", {
			cls: "oa-login__btn",
			text: "登 录",
			attr: { "aria-label": "登录" },
		});

		const link = card.createEl("a", {
			cls: "oa-login__link",
			text: "获取 API Key",
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
			// 切换服务商后清空已拉取的模型列表
			this.plugin.availableModels = null;
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
				link.setText(`前往 ${preset.label} 获取 API Key`);
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
			loginBtn.setAttribute("aria-busy", "true");
			statusEl.setText("正在验证凭证...");
			this.plugin.settings.provider = provider;
			// Ollama 本地服务与自定义服务可无需密钥
			this.plugin.settings.apiKey =
				key || (provider === "ollama" ? "ollama" : "custom");
			const url = urlInput.value.trim();
			if (url) this.plugin.settings.baseUrl = url;
			const result = await verifyApiKey(this.plugin.settings);
			loginBtn.disabled = false;
			loginBtn.setAttribute("aria-busy", "false");
			if (result.ok) {
				new Notice("ObsidianAI 登录成功");
				await this.plugin.saveAll();
				// 登录成功后自动拉取该服务的可用模型列表（静默，失败不提示）
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

	private renderActivityBar(root: HTMLElement): void {
		const bar = root.createDiv({ cls: "oa-actbar" });

		// 顶部图标
		const chatBtn = bar.createEl("button", {
			cls: "oa-actbar__btn oa-actbar__btn--active",
			attr: { title: "聊天" },
		});
		setIcon(chatBtn, "message-square");

		const historyBtn = bar.createEl("button", {
			cls: `oa-actbar__btn${this.sidebarOpen ? " oa-actbar__btn--active" : ""}`,
			attr: { title: "历史会话" },
		});
		setIcon(historyBtn, "clock");
		historyBtn.addEventListener("click", () => {
			this.sidebarOpen = !this.sidebarOpen;
			this.render();
		});

		const newBtn = bar.createEl("button", {
			cls: "oa-actbar__btn",
			attr: { title: "新建对话" },
		});
		setIcon(newBtn, "plus-square");
		newBtn.addEventListener("click", () => {
			this.plugin.newSession();
			this.attachedFiles = [];
			this.render();
		});

		// 底部图标
		bar.createDiv({ cls: "oa-actbar__spacer" });

		const settingsBtn = bar.createEl("button", {
			cls: "oa-actbar__btn",
			attr: { title: "设置" },
		});
		setIcon(settingsBtn, "settings");
		settingsBtn.addEventListener("click", () => {
			(this.app as any).setting?.open();
		});

		const logoutBtn = bar.createEl("button", {
			cls: "oa-actbar__btn oa-actbar__btn--danger",
			attr: { title: "退出登录" },
		});
		setIcon(logoutBtn, "log-out");
		logoutBtn.addEventListener("click", () => this.logout());
	}

	// ============ 历史会话侧边栏（JetBrains 项目树风格） ============

	private renderSidebar(main: HTMLElement): void {
		const sidebar = main.createDiv({ cls: "oa-sidebar" });

		// 侧边栏头部
		const header = sidebar.createDiv({ cls: "oa-sidebar__header" });
		header.createDiv({ cls: "oa-sidebar__title", text: "会话" });
		const closeBtn = header.createEl("button", {
			cls: "oa-sidebar__action",
			attr: { title: "关闭侧边栏" },
		});
		setIcon(closeBtn, "x");
		closeBtn.addEventListener("click", () => {
			this.sidebarOpen = false;
			this.render();
		});

		// 会话列表
		const list = sidebar.createDiv({ cls: "oa-sidebar__list" });
		const sessions = [...this.plugin.sessions].sort(
			(a, b) => b.updatedAt - a.updatedAt
		);
		if (sessions.length === 0) {
			list.createDiv({ cls: "oa-empty", text: "暂无会话" });
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
				text: s.title,
			});
			const count = s.messages.filter((m) => m.role !== "error").length;
			titleRow.createSpan({ cls: "oa-sidebar__count", text: String(count) });
			body.createDiv({
				cls: "oa-sidebar__date",
				text: formatDate(s.updatedAt),
			});

			// hover 操作按钮：重命名 / 导出 Markdown / 删除
			const actions = row.createDiv({ cls: "oa-sidebar__actions" });
			const editBtn = actions.createEl("button", {
				cls: "oa-sidebar__action",
				attr: { title: "重命名" },
			});
			setIcon(editBtn, "pencil");
			editBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.startRename(row, titleEl, s.id);
			});

			const exportBtn = actions.createEl("button", {
				cls: "oa-sidebar__action",
				attr: { title: "导出为 Markdown" },
			});
			setIcon(exportBtn, "download");
			exportBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				await this.exportSession(s.id);
			});

			const delBtn = actions.createEl("button", {
				cls: "oa-sidebar__action oa-sidebar__action--danger",
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
				this.sidebarOpen = false;
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
		void row;
	}

	private async exportSession(id: string): Promise<void> {
		const session = this.plugin.sessions.find((x) => x.id === id);
		if (!session) return;
		const safe = session.title.replace(/[\\/:*?"<>|#^\[\]]/g, "").slice(0, 40);
		let path = `ObsidianAI ${safe}.md`;
		let n = 1;
		while (this.app.vault.getAbstractFileByPath(path)) {
			path = `ObsidianAI ${safe} ${n++}.md`;
		}
		const file = await this.app.vault.create(path, sessionToMarkdown(session));
		new Notice(`已导出：${path}`);
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file);
	}

	// ============ 聊天页（JetBrains 工具窗口风格） ============

	private renderChat(main: HTMLElement): void {
		const content = main.createDiv({ cls: "oa-content" });
		this.chatContentEl = content;

		// 标题栏
		const titlebar = content.createDiv({ cls: "oa-titlebar" });
		const title = titlebar.createDiv({ cls: "oa-titlebar__title" });
		setIcon(title, "sparkles");
		title.createSpan({ text: "NotePilot" });
		titlebar.createDiv({ cls: "oa-titlebar__spacer" });

		// Agent 模式开关
		const agentBtn = titlebar.createEl("button", {
			cls: "oa-mode-btn",
		});
		setIcon(agentBtn, "bot");
		agentBtn.createSpan({ text: " Agent" });
		agentBtn.setAttribute("title", "Agent 模式：AI 可建议创建/修改库内文件（需你审批）");
		const syncAgentBtn = () =>
			agentBtn.toggleClass("oa-mode-btn--active", this.plugin.settings.agentMode);
		syncAgentBtn();
		agentBtn.addEventListener("click", () => {
			this.plugin.settings.agentMode = !this.plugin.settings.agentMode;
			void this.plugin.saveAll();
			syncAgentBtn();
			this.renderStatusBar?.(content);
			new Notice(
				this.plugin.settings.agentMode
					? "Agent 模式已开启：AI 可提出文件修改建议"
					: "Agent 模式已关闭"
			);
		});

		// Agent 与用户信息之间的分隔
		titlebar.createDiv({ cls: "oa-titlebar__spacer" });

		// 用户信息（右上角）
		const userEl = titlebar.createDiv({ cls: "oa-titlebar__user" });
		const avatar = userEl.createDiv({ cls: "oa-titlebar__avatar" });
		avatar.createSpan({ text: this.plugin.settings.apiKey ? this.plugin.settings.apiKey.charAt(0).toUpperCase() : "?" });
		const username = this.plugin.settings.provider === "openai" ? "OpenAI" : this.plugin.settings.provider;
		userEl.createSpan({ text: username });
		setIcon(userEl, "chevron-down");

		// 会话标签页
		this.renderTabs(content);

		// 消息区
		this.messagesEl = content.createDiv({ cls: "oa-chat__messages" });
		this.renderMessages();

		// 自动识别划词：渲染聊天界面时消费暂存的选区文本
		if (this.quotedText === null && this.plugin.pendingQuotedText) {
			this.quotedText = this.plugin.pendingQuotedText;
			this.plugin.pendingQuotedText = null;
		}

		// 附加文件 chips
		this.chipsEl = content.createDiv({ cls: "oa-chips" });
		this.renderChips();

		// 输入盒
		const inputBox = content.createDiv({ cls: "oa-input__box" });

		// 添加上下文按钮
		const ctxBtn = inputBox.createDiv({ cls: "oa-input__ctx-btn" });
		setIcon(ctxBtn, "plus");
		ctxBtn.createSpan({ text: " 添加上下文" });
		ctxBtn.addEventListener("click", () => {
			// 触发 @ 弹窗用于添加笔记引用
			this.inputEl.focus();
			this.inputEl.value += "@";
			this.onInput();
		});

		this.inputEl = inputBox.createEl("textarea", {
			cls: "oa-input__textarea",
			attr: {
				placeholder: "提问...（@ 引用笔记，拖入文件附加，Enter 发送）",
				rows: "2",
			},
		});

		// 拖拽文件到输入盒：库内笔记 / 外部文本文件 → 附件上下文
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
			cls: "oa-input__model",
		});
		// 优先用从 API 拉取到的模型列表，否则用预置列表
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

		// 从 API 拉取可用模型列表
		const refreshModelsBtn = toolbar.createEl("button", {
			cls: "oa-titlebar__btn",
			attr: { title: "从 API 拉取可用模型列表" },
		});
		setIcon(refreshModelsBtn, "refresh-cw");
		refreshModelsBtn.addEventListener("click", () => {
			void this.refreshModels(modelSelect, refreshModelsBtn);
		});

		if (this.plugin.settings.includeActiveNote) {
			const badge = toolbar.createDiv({
				cls: "oa-input__badge",
			});
			setIcon(badge, "file-text");
			badge.createSpan({ text: " 当前笔记" });
			badge.setAttribute("title", "提问时将附带当前笔记内容");
		}

		toolbar.createDiv({ cls: "oa-input__toolbar-spacer" });

		this.stopBtn = toolbar.createEl("button", {
			cls: "oa-input__stop",
			attr: { "aria-label": "停止生成" },
		});
		setIcon(this.stopBtn, "square");
		this.stopBtn.style.display = "none";
		this.stopBtn.addEventListener("click", () => this.stop());

		this.sendBtn = toolbar.createEl("button", { cls: "oa-input__send" });
		setIcon(this.sendBtn, "arrow-up");
		this.sendBtn.setAttribute("aria-label", "发送消息");
		this.sendBtn.addEventListener("click", () => void this.send());

		this.inputEl.addEventListener("keydown", (e) => this.onInputKeydown(e));
		this.inputEl.addEventListener("input", () => this.onInput());

		// 状态栏
		this.renderStatusBar(content);

		if (this.generating) this.setBusy(true);
	}

	// ============ 会话标签页 ============

	private renderTabs(content: HTMLElement): void {
		const tabs = content.createDiv({ cls: "oa-tabs" });
		const sessions = [...this.plugin.sessions].sort((a, b) => b.updatedAt - a.updatedAt);
		for (const s of sessions) {
			const tab = tabs.createDiv({ cls: `oa-tab${s.id === this.plugin.currentSessionId ? " oa-tab--active" : ""}` });
			tab.createSpan({ text: s.title });
			const closeBtn = tab.createEl("button", { cls: "oa-tab__close" });
			closeBtn.textContent = "\u00d7";
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
		// 新建标签页按钮
		const addBtn = tabs.createDiv({ cls: "oa-tabs__add" });
		setIcon(addBtn, "plus");
		addBtn.addEventListener("click", () => {
			this.plugin.newSession();
			this.attachedFiles = [];
			this.render();
		});
	}

	// ============ 状态栏 ============

	private renderStatusBar(content: HTMLElement): void {
		content.querySelectorAll(".oa-statusbar").forEach((el) => el.remove());
		const bar = content.createDiv({ cls: "oa-statusbar" });

		// 左：模型名称
		const modelItem = bar.createSpan({ cls: "oa-statusbar__item" });
		setIcon(modelItem, "cpu");
		modelItem.createSpan({ text: this.plugin.settings.model });

		// 分隔符
		bar.createSpan({ cls: "oa-statusbar__sep" });

		// 中：Agent 模式
		if (this.plugin.settings.agentMode) {
			const agentItem = bar.createSpan({ cls: "oa-statusbar__item oa-statusbar__item--accent" });
			setIcon(agentItem, "bot");
			agentItem.createSpan({ text: "Agent" });
			bar.createSpan({ cls: "oa-statusbar__sep" });
		}

		// 右：当前笔记状态
		if (this.plugin.settings.includeActiveNote) {
			const noteItem = bar.createSpan({ cls: "oa-statusbar__item" });
			setIcon(noteItem, "file-text");
			noteItem.createSpan({ text: "笔记上下文" });
		}

		// 最右：服务商
		const providerLabel = PROVIDER_PRESETS[this.plugin.settings.provider].label;
		bar.createSpan({ cls: "oa-statusbar__item oa-statusbar__item--right", text: providerLabel });
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
		const w = this.messagesEl.createDiv({ cls: "oa-welcome" });
		const icon = w.createDiv({ cls: "oa-welcome__icon" });
		setIcon(icon, "sparkles");
		w.createDiv({ cls: "oa-welcome__title", text: "NotePilot" });
		w.createDiv({
			cls: "oa-welcome__sub",
			text: "我可以帮你总结、润色、改写笔记与问答。",
		});
		// 快捷键列表
		const shortcuts = w.createDiv({ cls: "oa-welcome__shortcuts" });
		const items = [
			{ key: "Shift + Enter", desc: "换行" },
			{ key: "Ctrl + Shift + L", desc: "打开/关闭面板" },
			{ key: "@", desc: "引用笔记" },
			{ key: "Alt + N", desc: "新建会话" },
			{ key: "Alt + M", desc: "切换模式" },
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

	private appendMessageEl(msg: ChatMessage): HTMLElement {
		const cls =
			msg.role === "user"
				? "oa-msg oa-msg--user"
				: msg.role === "error"
				? "oa-msg oa-msg--error"
				: "oa-msg oa-msg--assistant";
		const el = this.messagesEl.createDiv({ cls });

		// 消息头部（头像 + 名字）
		if (msg.role === "user" || msg.role === "assistant") {
			const header = el.createDiv({ cls: "oa-msg-header" });
			const avatarDiv = header.createDiv({ cls: msg.role === "user" ? "oa-msg-header__avatar oa-msg-header__avatar--accent" : "oa-msg-header__avatar" });
			setIcon(avatarDiv, msg.role === "user" ? "user" : "sparkles");
			header.createSpan({ cls: "oa-msg-header__name", text: msg.role === "user" ? "You" : "NotePilot" });
		}

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
			if (pre.querySelector(".oa-code-actions")) return;
			const bar = document.createElement("div");
			bar.addClass("oa-code-actions");
			const copyBtn = bar.createEl("button", { cls: "oa-code-actions__btn", text: "复制" });
			copyBtn.addEventListener("click", () => {
				const code = pre.querySelector("code");
				void navigator.clipboard
					.writeText(code?.innerText ?? "")
					.then(() => new Notice("已复制代码"));
			});
			const insertBtn = bar.createEl("button", { cls: "oa-code-actions__btn", text: "插入笔记" });
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
			if (/^(notepilot|qoder)[-_ ]?edit$/i.test(firstLine)) {
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
		if (parsed.length === 0 || container.querySelector(".oa-edit-cards")) {
			return;
		}

		const wrap = container.createDiv({ cls: "oa-edit-cards" });
		const titleEl = wrap.createDiv({
			cls: "oa-edit-cards__title",
		});
		setIcon(titleEl, "pencil");
		titleEl.createSpan({ text: ` 检测到 ${parsed.length} 项文件修改建议，确认后生效` });

		for (const p of parsed) {
			const card = wrap.createDiv({ cls: "oa-edit-card" });

			if (!p.edit) {
				card.createDiv({
					cls: "oa-edit-card__path",
					text: `编辑块解析失败：${p.error ?? "未知错误"}`,
				});
				card.createEl("pre", { cls: "oa-edit-card__raw", text: p.raw });
				continue;
			}

			const edit = p.edit;
			const head = card.createDiv({ cls: "oa-edit-card__head" });
			head.createSpan({
				cls: `oa-edit-card__action oa-edit-card__action--${edit.action}`,
				text:
					edit.action === "replace"
						? "替换"
						: edit.action === "create"
						? "新建"
						: "覆写",
			});
			head.createSpan({ cls: "oa-edit-card__path", text: edit.path });

			// Diff 预览
			const diffEl = card.createDiv({ cls: "oa-edit-card__diff" });
			const addDiffLine = (type: "add" | "del" | "same", lineText: string) => {
				const row = diffEl.createDiv({
					cls: `oa-diff__line oa-diff__line--${type}`,
				});
				row.createSpan({
					cls: "oa-diff__mark",
					text: type === "add" ? "+" : type === "del" ? "\u2212" : " ",
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
						cls: "oa-diff__line",
						text: `...（共 ${allLines.length} 行）`,
					});
				}
			}

			// 操作按钮
			const btnRow = card.createDiv({ cls: "oa-edit-card__btns" });
			const status = btnRow.createSpan({ cls: "oa-edit-card__status" });
			const reject = btnRow.createEl("button", {
				text: "拒绝",
				cls: "oa-btn--secondary",
			});
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
						status.setText(msg);
						reject.disabled = true;
						new Notice(msg);
					} catch (e) {
						status.setText(`错误: ${(e as Error).message}`);
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
		this.sendBtn.setAttribute("aria-busy", String(busy));
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
			const target = this.chatContentEl ?? (this.containerEl.children[1] as HTMLElement);
			this.popupEl = target.createDiv({ cls: "oa-popup" });
		}
		this.popupEl.empty();
		if (files.length === 0) {
			this.popupEl.createDiv({
				cls: "oa-popup__item oa-popup__empty",
				text: "没有匹配的笔记",
			});
			return;
		}
		files.forEach((f, idx) => {
			const item = this.popupEl!.createDiv({ cls: "oa-popup__item" });
			item.createSpan({ cls: "oa-popup__name", text: f.basename });
			item.createSpan({ cls: "oa-popup__path", text: f.path });
			if (idx === this.popupIndex) item.addClass("oa-popup__item--active");
			item.addEventListener("mousedown", (e) => {
				e.preventDefault();
				this.selectAtFile(f);
			});
		});
	}

	private highlightPopup(): void {
		if (!this.popupEl) return;
		this.popupEl.querySelectorAll(".oa-popup__item").forEach((el, idx) => {
			el.toggleClass("oa-popup__item--active", idx === this.popupIndex);
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
			const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
			setIcon(chip, "quote");
			chip.createSpan({ text: ` 划词选中（${q.length} 字）` });
			chip.setAttribute("title", q.slice(0, 200));
			const x = chip.createSpan({ cls: "oa-chip__remove", text: "\u00d7" });
			x.addEventListener("click", () => {
				this.quotedText = null;
				this.renderChips();
			});
		}
		
		for (const ef of this.externalFiles) {
			const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
			setIcon(chip, "paperclip");
			chip.createSpan({ text: ` ${ef.name}` });
			const x = chip.createSpan({ cls: "oa-chip__remove", text: "\u00d7" });
			x.addEventListener("click", () => {
				this.externalFiles = this.externalFiles.filter((f) => f !== ef);
				this.renderChips();
			});
		}
		
		for (const path of this.attachedFiles) {
			const chip = this.chipsEl.createDiv({ cls: "oa-chip" });
			const name = path.split("/").pop()?.replace(/\.md$/, "") ?? path;
			setIcon(chip, "file-text");
			chip.createSpan({ text: ` ${name}` });
			const x = chip.createSpan({ cls: "oa-chip__remove", text: "\u00d7" });
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

	/** 从 API 拉取当前服务商的可用模型列表并刷新模型下拉框 */
	private async refreshModels(
		modelSelect: HTMLSelectElement,
		refreshBtn: HTMLButtonElement
	): Promise<void> {
		refreshBtn.disabled = true;
		const result = await fetchModels(this.plugin.settings);
		refreshBtn.disabled = false;
		if (!result.ok) {
			new Notice(`拉取模型列表失败：${result.message}`);
			return;
		}
		this.plugin.availableModels = result.models;
		const current = this.plugin.settings.model;
		const options = result.models.includes(current)
			? result.models
			: [current, ...result.models];
		modelSelect.empty();
		for (const m of options) {
			const opt = modelSelect.createEl("option", { value: m, text: m });
			if (m === current) opt.selected = true;
		}
		new Notice(`已获取 ${result.models.length} 个可用模型`);
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
		assistantEl.createSpan({ cls: "oa-msg--thinking", text: "思考中..." });
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
					assistantEl.className = "oa-msg oa-msg--error";
					assistantEl.setText(message);
					new Notice(message);
				},
			},
			() => {
				this.abortController = null;
				this.setBusy(false);
				if (!assistantMsg.content) {
					assistantEl.empty();
					assistantEl.setText("（无内容）");
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
