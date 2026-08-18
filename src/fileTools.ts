// 文件修改工具 —— AI 产出 notepilot-edit 编辑块，用户审批后应用到库内文件
// 审批机制参照 Cline 的 human-in-the-loop 模式

import { App, TFile } from "obsidian";

export interface EditBlock {
	action: "create" | "write" | "replace";
	path: string;
	content?: string;
	search?: string;
	replace?: string;
}

export interface ParsedEdit {
	raw: string;
	edit: EditBlock | null;
	error: string | null;
}

const EDIT_ACTIONS: ReadonlyArray<EditBlock["action"]> = [
	"create",
	"write",
	"replace",
];

function validateEdit(obj: EditBlock): void {
	if (!obj.path || !obj.action) {
		throw new Error("缺少 path 或 action 字段");
	}
	if (
		obj.action === "replace" &&
		(obj.search === undefined || obj.replace === undefined)
	) {
		throw new Error("replace 需要 search 与 replace 字段");
	}
	if (
		(obj.action === "create" || obj.action === "write") &&
		obj.content === undefined
	) {
		throw new Error(`${obj.action} 需要 content 字段`);
	}
}

/**
 * 从回复文本中解析所有编辑块。
 * 兼容模型可能产出的三种写法：
 * 1. ```notepilot-edit 围栏（标准）
 * 2. 普通围栏，块内首行写了 notepilot-edit
 * 3. 普通 json 围栏，内容形状符合 EditBlock（仅形状匹配才认定，避免误伤普通 JSON 示例）
 */
export function parseEditBlocks(text: string): ParsedEdit[] {
	const out: ParsedEdit[] = [];
	const re = /```([^\n`]*)\n([\s\S]*?)```/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		const lang = m[1].trim().toLowerCase();
		let body = m[2].trim();
		// 标准围栏 notepilot-edit；向后兼容旧品牌 qoder-edit / qoder_edit
		let isEditFence =
			lang === "notepilot-edit" || lang === "qoder-edit" || lang === "qoder_edit";

		// 语言名被写在块内首行的情况（新旧品牌均兼容）
		const firstLine = body.split("\n", 1)[0].trim();
		if (!isEditFence && /^(notepilot|qoder)[-_ ]?edit$/i.test(firstLine)) {
			body = body.slice(firstLine.length).trim();
			isEditFence = true;
		}

		if (!isEditFence && !body.startsWith("{")) continue;

		try {
			const obj = JSON.parse(body) as EditBlock;
			// 非标准围栏：形状不像编辑指令时静默跳过，避免误伤普通 JSON 示例
			if (!isEditFence) {
				const shapeOk =
					typeof obj.path === "string" &&
					(EDIT_ACTIONS as readonly string[]).includes(obj.action);
				if (!shapeOk) continue;
			}
			validateEdit(obj);
			out.push({ raw: body, edit: obj, error: null });
		} catch (e) {
			// 只有显式 notepilot-edit 围栏解析失败才报错展示
			if (isEditFence) {
				out.push({ raw: body, edit: null, error: (e as Error).message });
			}
		}
	}
	return out;
}

/** 逐级创建缺失的父目录 */
async function ensureFolder(app: App, path: string): Promise<void> {
	const parts = path.split("/");
	parts.pop(); // 去掉文件名
	let cur = "";
	for (const p of parts) {
		if (!p) continue;
		cur = cur ? `${cur}/${p}` : p;
		if (!app.vault.getAbstractFileByPath(cur)) {
			await app.vault.createFolder(cur);
		}
	}
}

/** 应用一条编辑指令，返回结果描述 */
export async function applyEdit(app: App, edit: EditBlock): Promise<string> {
	const path = edit.path.replace(/^\/+/, "");

	if (edit.action === "create") {
		if (app.vault.getAbstractFileByPath(path)) {
			throw new Error(`文件已存在：${path}`);
		}
		await ensureFolder(app, path);
		await app.vault.create(path, edit.content ?? "");
		return `已创建 ${path}`;
	}

	const file = app.vault.getAbstractFileByPath(path);
	if (!(file instanceof TFile)) {
		throw new Error(`未找到文件：${path}`);
	}

	if (edit.action === "write") {
		await app.vault.modify(file, edit.content ?? "");
		return `已覆写 ${path}`;
	}

	// replace：原子化搜索替换（仅第一处匹配）
	const search = edit.search ?? "";
	if (!search) throw new Error("search 内容为空");
	await app.vault.process(file, (data) => {
		const idx = data.indexOf(search);
		if (idx === -1) {
			throw new Error("未找到与 search 匹配的原文");
		}
		return (
			data.slice(0, idx) +
			(edit.replace ?? "") +
			data.slice(idx + search.length)
		);
	});
	return `已修改 ${path}`;
}

/** Agent 模式系统提示：文件修改工具说明 + 库内文件清单 */
export function agentToolPrompt(app: App): string {
	const files = app.vault
		.getMarkdownFiles()
		.filter((f) => !f.path.startsWith(".obsidian/"))
		.slice(0, 300)
		.map((f) => f.path);

	return [
		"你当前处于 Agent 模式，具备修改本地文件的能力。当用户要求创建、修改或更新笔记时，请在文字回复之后输出一个或多个编辑块。",
		"编辑块格式必须严格为：三个反引号 + notepilot-edit 作为围栏语言，块内为单行或多行的严格 JSON。示例：",
		"```notepilot-edit",
		'{"action":"replace","path":"笔记.md","search":"被替换的原文","replace":"新内容"}',
		"```",
		"三种 action：",
		'- 替换文件中的部分内容：{"action":"replace","path":"笔记.md","search":"被替换的原文（必须与文件内容完全一致）","replace":"新内容"}',
		'- 创建新文件：{"action":"create","path":"目录/新文件.md","content":"完整内容"}',
		'- 覆写整个文件：{"action":"write","path":"笔记.md","content":"完整内容"}',
		"规则：围栏语言必须是 notepilot-edit，不得改用 json 或其他语言；path 为相对库根目录的路径；JSON 必须合法且正确转义换行与引号；所有修改都会先展示给用户审批后才生效，因此可放心输出；能使用 replace 时优先使用 replace。",
		files.length > 0
			? `当前库内的 Markdown 文件列表：\n${files.join("\n")}`
			: "当前库内暂无 Markdown 文件。",
	].join("\n");
}
